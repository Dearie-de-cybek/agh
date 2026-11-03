/**
 * Thin client for the three real endpoints the live homepage already uses:
 *   GET  /api/inference/models  → public model catalogue + pricing
 *   GET  /api/trial/status      → { limit, used, remaining, requiresCaptcha }
 *   POST /api/trial/chat        → SSE stream (OpenAI-style chat.completion deltas)
 *
 * These are same-origin paths. aghcloud.ai sends no CORS headers, so the page
 * must be served from aghcloud.ai or from a host that proxies /api/* to it
 * (Vite dev/preview do this — see vite.config.ts). When /api isn't reachable
 * the failure is classified so the UI can say what actually went wrong.
 */
import { useCallback, useEffect, useState } from "react";
import { DEMO_MODELS } from "./demo";

export type ModelInfo = {
  id: string;
  name: string;
  description: string;
  specialties: string[] | null;
  notIdealFor: string | null;
  starterPrompts: string[] | null;
  contextLength: number;
  pricing: { inputPerMTokens: string; outputPerMTokens: string };
  isFree: boolean;
  available: boolean;
};

export type TrialStatus = {
  limit: number;
  used: number;
  remaining: number;
  requiresCaptcha: boolean;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

export const TURNSTILE_SITEKEY: string =
  (import.meta.env.VITE_TURNSTILE_SITEKEY as string | undefined) ?? "0x4AAAAAAD0CvS59ZpHf8njX";

export function blendedPrice(m: ModelInfo): number {
  return parseFloat(m.pricing.inputPerMTokens) + parseFloat(m.pricing.outputPerMTokens);
}

/** Why a request to /api failed. */
export type ApiFailure = "unreachable" | "not-proxied" | "server" | "rate-limited";

class ApiError extends Error {
  constructor(
    public kind: ApiFailure,
    public status?: number,
  ) {
    super(kind);
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { credentials: "include", headers: { Accept: "application/json" }, signal });
  } catch (e) {
    if ((e as Error)?.name === "AbortError") throw e;
    throw new ApiError("unreachable");
  }
  if (res.status === 429) throw new ApiError("rate-limited", 429);
  // A static host answers unknown paths with index.html (200, text/html).
  if (!(res.headers.get("content-type") ?? "").includes("json")) throw new ApiError("not-proxied", res.status);
  if (!res.ok) throw new ApiError("server", res.status);
  return res.json() as Promise<T>;
}

export function failureMessage(kind: ApiFailure | null): string {
  switch (kind) {
    case "not-proxied":
      return import.meta.env.DEV
        ? "This page can’t reach the AGH API: /api isn’t proxied to aghcloud.ai on this host."
        : "We couldn’t reach the model service. Please try again shortly.";
    case "rate-limited":
      return "Too many requests just now. Please wait a moment and try again.";
    case "unreachable":
      return "You appear to be offline, or the model service can’t be reached.";
    default:
      return "The model service had a problem. Please try again.";
  }
}

/** "demo" = the live service is unreachable, so labelled sample data is shown instead. */
export type LoadState = "loading" | "ready" | "empty" | "demo";

export function useModels() {
  const [models, setModels] = useState<ModelInfo[] | null>(null);
  const [state, setState] = useState<LoadState>("loading");
  const [failure, setFailure] = useState<ApiFailure | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const ac = new AbortController();
    let timer: number | undefined;
    setState("loading");
    // quiet automatic retries (transient 5xx / cold start) before surfacing an error
    const run = async (n: number) => {
      try {
        const all = await getJson<ModelInfo[]>("/api/inference/models", ac.signal);
        if (!Array.isArray(all)) throw new ApiError("server");
        const live = all.filter((m) => m.available);
        setModels(live);
        setFailure(null);
        setDetail(null);
        setState(live.length ? "ready" : "empty");
      } catch (e) {
        if ((e as Error)?.name === "AbortError") return;
        const kind = e instanceof ApiError ? e.kind : "server";
        const status = e instanceof ApiError ? e.status : undefined;
        const retryable = kind === "server" || kind === "unreachable" || kind === "rate-limited";
        if (retryable && n < 2) {
          timer = window.setTimeout(() => run(n + 1), 700 * (n + 1));
          return;
        }
        setFailure(kind);
        setDetail(status ? `HTTP ${status}` : kind);
        setModels(DEMO_MODELS);
        setState("demo");
      }
    };
    run(0);
    return () => {
      ac.abort();
      window.clearTimeout(timer);
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { models, state, failure, detail, retry };
}

export function useTrialStatus() {
  const [status, setStatus] = useState<TrialStatus | null>(null);
  const refresh = useCallback(() => {
    getJson<TrialStatus>("/api/trial/status")
      .then(setStatus)
      .catch(() => {
        /* the meter simply stays hidden; chat itself reports its own errors */
      });
  }, []);
  useEffect(refresh, [refresh]);
  return { status, refresh };
}

export type ChatResult = { ok: true; text: string } | { ok: false; error: string; kind: "quota" | "captcha" | "other" };

/** Streams a trial answer; calls onDelta with the accumulated text. */
export async function streamTrialChat(opts: {
  model: string;
  messages: ChatMessage[];
  turnstileToken?: string | null;
  onDelta: (text: string) => void;
}): Promise<ChatResult> {
  try {
    const res = await fetch("/api/trial/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        model: opts.model,
        messages: opts.messages,
        stream: true,
        ...(opts.turnstileToken ? { turnstileToken: opts.turnstileToken } : {}),
      }),
    });
    if (!res.ok || !res.body) {
      const j = await res.json().catch(() => null);
      const msg: string = j?.error?.message || "Something went wrong. Please try again.";
      const kind = res.status === 429 || /limit|free question/i.test(msg) ? "quota" : /captcha|security|turnstile/i.test(msg) ? "captcha" : "other";
      return { ok: false, error: msg, kind };
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let i: number;
      while ((i = buf.indexOf("\n\n")) >= 0) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 2);
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") continue;
        try {
          const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
          if (delta) {
            text += delta;
            opts.onDelta(text);
          }
        } catch {
          /* ignore keep-alives / partial frames */
        }
      }
    }
    return text ? { ok: true, text } : { ok: false, error: "The model didn’t return an answer. Please try again.", kind: "other" };
  } catch {
    return { ok: false, error: "Connection problem — please try again.", kind: "other" };
  }
}
