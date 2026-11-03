import { useEffect, useMemo, useRef, useState } from "react";
import { blendedPrice, streamTrialChat, type ChatMessage, type ModelInfo, type TrialStatus } from "../../lib/api";
import { Send } from "./Icons";
import { Turnstile } from "./Turnstile";

const FALLBACK_PROMPTS = [
  "Translate 'Welcome to the future of African AI' into Swahili",
  "Summarize the key challenges facing agriculture in West Africa",
  "Write a short poem about Lagos in the rain",
];

/** The real free-trial chat: same endpoints, quota and CAPTCHA as the live site. */
type Props = { models: ModelInfo[] | null; failed: boolean; status: TrialStatus | null; refresh: () => void };

export function TrialChat({ models, failed, status, refresh }: Props) {
  const [modelId, setModelId] = useState("");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);

  // default to the cheapest available model, as the live site does
  useEffect(() => {
    if (!modelId && models?.length) {
      setModelId([...models].sort((a, b) => blendedPrice(a) - blendedPrice(b))[0].id);
    }
  }, [models, modelId]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  const model = models?.find((m) => m.id === modelId);
  const limit = status?.limit ?? 5;
  const remaining = status?.remaining ?? null;
  const exhausted = remaining !== null && remaining <= 0;
  const captcha = !!status?.requiresCaptcha;
  const prompts = useMemo(() => (model?.starterPrompts?.length ? model.starterPrompts : FALLBACK_PROMPTS), [model]);

  async function send(text?: string) {
    const q = (text ?? input).trim();
    if (!q || busy || !modelId || exhausted) return;
    if (captcha && !token) {
      setError("Please complete the security check below first.");
      return;
    }
    setError(null);
    setInput("");
    const next: ChatMessage[] = [...msgs, { role: "user", content: q }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setBusy(true);
    const res = await streamTrialChat({
      model: modelId,
      messages: next,
      turnstileToken: token,
      onDelta: (t) => setMsgs([...next, { role: "assistant", content: t }]),
    });
    setToken(null);
    setResetKey((k) => k + 1);
    if (!res.ok) {
      setMsgs(next);
      setError(res.error);
    }
    setBusy(false);
    refresh();
  }

  return (
    <div className="console" data-testid="card-trial-chat">
      <div className="console__bar">
        <span className="mono console__title">AGH · free trial</span>
        <div className="meter" role="img" aria-label={remaining === null ? "Free questions" : `${remaining} of ${limit} free questions left`}>
          <span className="meter__dots" aria-hidden="true">
            {Array.from({ length: limit }, (_, i) => (
              <i key={i} className={remaining !== null && i < remaining ? "on" : ""} />
            ))}
          </span>
          <span className="mono meter__txt" data-testid="badge-trial-remaining">
            {remaining === null ? "…" : exhausted ? "0 free questions left" : `${remaining} free question${remaining === 1 ? "" : "s"} left`}
          </span>
        </div>
      </div>

      {failed && <p className="console__note">Models couldn’t be loaded right now. You can still reach every model from <a href="/ai-models">AI Models</a>.</p>}

      <div className="models" role="tablist" aria-label="Choose a model">
        {!models && !failed && <span className="models__skeleton mono">Models loading…</span>}
        {models?.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={m.id === modelId}
            className="models__tab"
            disabled={busy}
            onClick={() => setModelId(m.id)}
          >
            {m.name}
          </button>
        ))}
      </div>

      {model && (
        <div className="console__info">
          {!!model.specialties?.length && (
            <p className="chips">
              <span className="mono">Best for</span>
              {model.specialties.map((s) => (
                <b key={s} className="chip">
                  {s}
                </b>
              ))}
            </p>
          )}
          {model.notIdealFor && (
            <p className="console__not">
              <span className="mono">Not ideal for</span> {model.notIdealFor.replace(/^Not ideal for:\s*/i, "")}
            </p>
          )}
        </div>
      )}

      <div className="log" ref={logRef} role="log" aria-live="polite" aria-label="Conversation" data-testid="list-trial-messages">
        {msgs.length === 0 ? (
          <div className="log__empty">
            <p className="mono">Try one of these to get started</p>
            <ul>
              {prompts.map((p) => (
                <li key={p}>
                  <button type="button" disabled={busy || exhausted || !modelId} onClick={() => send(p)}>
                    <span>{p}</span>
                    <Send />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          msgs.map((m, i) => (
            <div key={i} className={`msg msg--${m.role}`}>
              <span className="mono msg__who">{m.role === "user" ? "You" : model?.name ?? "AGH"}</span>
              <p>{m.content || (busy && i === msgs.length - 1 ? <span className="typing" aria-label="Thinking"><i /><i /><i /></span> : "")}</p>
            </div>
          ))
        )}
      </div>

      {error && (
        <p className="console__err" role="alert">
          {error}
        </p>
      )}

      {captcha && !exhausted && <Turnstile onVerify={setToken} onExpire={() => setToken(null)} resetKey={resetKey} />}

      {exhausted ? (
        <p className="console__done">
          You’ve used all {limit} free questions. <a href="/ai-models">Keep going in AI Models →</a>
        </p>
      ) : (
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <label className="sr-only" htmlFor="trial-input">
            Ask a question
          </label>
          <input id="trial-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything…" disabled={busy || !modelId} autoComplete="off" maxLength={2000} />
          <button type="submit" className="btn btn--primary" disabled={busy || !input.trim() || !modelId}>
            Ask <Send />
          </button>
        </form>
      )}
      <p className="console__foot mono">Served from AGH-operated GPUs</p>
    </div>
  );
}
