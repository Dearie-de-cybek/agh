import { useEffect, useRef, useState } from "react";
import { TURNSTILE_SITEKEY } from "../../lib/api";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id: string) => void;
      remove: (id: string) => void;
    };
  }
}

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";
let loader: Promise<void> | null = null;
function load(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.defer = true;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.head.appendChild(s);
  });
  return loader;
}

/** Cloudflare Turnstile, same site key and behaviour as the live trial. */
export function Turnstile({ onVerify, onExpire, resetKey }: { onVerify: (t: string) => void; onExpire: () => void; resetKey: number }) {
  const box = useRef<HTMLDivElement>(null);
  const id = useRef<string | null>(null);
  const last = useRef(resetKey);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let dead = false;
    load()
      .then(() => {
        if (dead || !box.current || !window.turnstile) return;
        id.current = window.turnstile.render(box.current, {
          sitekey: TURNSTILE_SITEKEY,
          theme: "dark",
          callback: (t: string) => {
            setErr(null);
            onVerify(t);
          },
          "expired-callback": () => onExpire(),
          "error-callback": (code?: string) => {
            setErr(String(code ?? "unknown"));
            onExpire();
            return true;
          },
        });
      })
      .catch(() => setErr("load"));
    return () => {
      dead = true;
      if (id.current && window.turnstile) {
        try {
          window.turnstile.remove(id.current);
        } catch {
          /* already gone */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resetKey !== last.current && id.current && window.turnstile) {
      last.current = resetKey;
      try {
        window.turnstile.reset(id.current);
      } catch {
        /* ignore */
      }
    }
  }, [resetKey]);

  return (
    <div className="turnstile">
      <div ref={box} hidden={!!err} />
      {err && (
        <p className="turnstile__err" role="alert">
          {err.startsWith("1102")
            ? "Security check unavailable on this domain — the CAPTCHA key is only registered for aghcloud.ai."
            : `Security check failed to load (code ${err}). Please refresh and try again.`}
        </p>
      )}
    </div>
  );
}
