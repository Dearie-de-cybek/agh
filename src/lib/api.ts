/**
 * Thin client for the three real endpoints the live homepage already uses:
 *   GET  /api/inference/models  → public model catalogue + pricing
 *   GET  /api/trial/status      → { limit, used, remaining, requiresCaptcha }
 *   POST /api/trial/chat        → SSE stream (OpenAI-style chat.completion deltas)
 */
import { useCallback, useEffect, useState } from "react";

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

export function useModels() {
  const [models, setModels] = useState<ModelInfo[] | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/inference/models", { credentials: "include", signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: ModelInfo[]) => setModels(d.filter((m) => m.available)))
      .catch((e) => {
        if (e?.name !== "AbortError") setFailed(true);
      });
    return () => ac.abort();
  }, []);
  return { models, failed };
}

export function useTrialStatus() {
  const [status, setStatus] = useState<TrialStatus | null>(null);
  const refresh = useCallback(() => {
    fetch("/api/trial/status", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: TrialStatus) => setStatus(d))
      .catch(() => {});
  }, []);
  useEffect(refresh, [refresh]);
  return { status, refresh };
}

/** Streams a trial answer; calls onDelta with the accumulated text. */
export async function streamTrialChat(opts: {
  model: string;
  messages: ChatMessage[];
  turnstileToken?: string | null;
  onDelta: (text: string) => void;
}): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
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
      return { ok: false, error: j?.error?.message || "Something went wrong. Please try again." };
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
    return text ? { ok: true, text } : { ok: false, error: "The model didn't return an answer. Please try again." };
  } catch {
    return { ok: false, error: "Connection problem — please try again." };
  }
}
