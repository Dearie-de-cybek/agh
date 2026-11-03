import { useEffect, useMemo, useRef, useState } from "react";
import {
  blendedPrice,
  streamTrialChat,
  type ChatMessage,
  type LoadState,
  type ModelInfo,
  type TrialStatus,
} from "../../lib/api";
import { AUTH } from "../../lib/content";
import { DEMO_LIMIT, streamDemoReply } from "../../lib/demo";
import { HexMark, Send } from "./Icons";
import { Turnstile } from "./Turnstile";

const FALLBACK_PROMPTS = [
  "Translate 'Welcome to the future of African AI' into Swahili",
  "Summarize the key challenges facing agriculture in West Africa",
  "Write a short poem about Lagos in the rain",
];

type Msg = ChatMessage & { error?: string };

/** "N-ATLaS 8B (Nigeria)" → { title: "N-ATLaS 8B", origin: "Nigeria" } */
function splitName(name: string) {
  const m = name.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  return m ? { title: m[1], origin: m[2] } : { title: name, origin: null };
}

type Props = {
  models: ModelInfo[] | null;
  state: LoadState;
  detail: string | null;
  retryModels: () => void;
  status: TrialStatus | null;
  refresh: () => void;
};

/** The real free-trial chat: same endpoints, quota and CAPTCHA as the live site. */
export function TrialChat({ models, state, detail, retryModels, status, refresh }: Props) {
  const [modelId, setModelId] = useState("");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [demoLeft, setDemoLeft] = useState(DEMO_LIMIT);
  const threadRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // default to the cheapest available model, as the live site does
  useEffect(() => {
    if (!modelId && models?.length) {
      setModelId([...models].sort((a, b) => blendedPrice(a) - blendedPrice(b))[0].id);
    }
  }, [models, modelId]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  // auto-grow the composer
  useEffect(() => {
    const t = areaRef.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = `${Math.min(t.scrollHeight, 132)}px`;
  }, [input]);

  const model = models?.find((m) => m.id === modelId);
  const demo = state === "demo";
  const limit = demo ? DEMO_LIMIT : (status?.limit ?? 5);
  const remaining = demo ? demoLeft : (status?.remaining ?? null);
  const exhausted = remaining !== null && remaining <= 0;
  const captcha = !demo && !!status?.requiresCaptcha;
  const ready = (state === "ready" || demo) && !!model;
  const prompts = useMemo(() => (model?.starterPrompts?.length ? model.starterPrompts : FALLBACK_PROMPTS), [model]);
  const lastUser = [...msgs].reverse().find((m) => m.role === "user")?.content;

  async function send(text?: string, replay = false) {
    const q = (text ?? input).trim();
    if (!q || busy || !modelId || exhausted) return;
    if (captcha && !token) {
      setNotice("Please complete the security check below to send your question.");
      return;
    }
    setNotice(null);
    if (!replay) setInput("");
    // retrying a failed turn drops the failed answer and re-asks the same question
    const base = replay ? msgs.slice(0, msgs.length - 2) : msgs;
    const next: Msg[] = [...base, { role: "user", content: q }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setBusy(true);
    if (demo) {
      await streamDemoReply(splitName(model?.name ?? "the model").title, q, (t) => setMsgs([...next, { role: "assistant", content: t }]));
      setDemoLeft((n) => Math.max(0, n - 1));
      setBusy(false);
      return;
    }
    const res = await streamTrialChat({
      model: modelId,
      messages: next.filter((m) => !m.error).map(({ role, content }) => ({ role, content })),
      turnstileToken: token,
      onDelta: (t) => setMsgs([...next, { role: "assistant", content: t }]),
    });
    setToken(null);
    setResetKey((k) => k + 1);
    if (!res.ok) {
      if (res.kind === "quota") setMsgs(next); // the quota panel below takes over
      else setMsgs([...next, { role: "assistant", content: "", error: res.error }]);
    }
    setBusy(false);
    refresh();
  }

  const empty = msgs.length === 0;
  const who = model ? splitName(model.name).title : "AGH AI";

  return (
    <section className="chat" aria-label="Free AI trial" data-testid="card-trial-chat">
      {/* header: identity + quota */}
      <header className="chat__head">
        <div className="chat__id">
          <span className="chat__logo" aria-hidden="true">
            <HexMark filled />
          </span>
          <div>
            <h3>Try AGH AI</h3>
            <p>Free · no account needed</p>
          </div>
        </div>
        <div className="quota" role="img" aria-label={remaining === null ? "Free questions" : `${remaining} of ${limit} free questions left`} data-testid="badge-trial-remaining">
          <span className="quota__bars" aria-hidden="true">
            {Array.from({ length: limit }, (_, i) => (
              <i key={i} className={remaining !== null && i < remaining ? "on" : ""} />
            ))}
          </span>
          <span className="quota__txt">
            {remaining === null ? "Free questions" : exhausted ? "No free questions left" : `${remaining} of ${limit} free questions left`}
          </span>
        </div>
      </header>

      {demo && (
        <div className="demo" role="status">
          <b>Demo preview</b>
          <span>
            The live model service can’t be reached from here{detail ? ` (${detail})` : ""}, so these are sample models and scripted replies — not real AI output.
          </span>
          <button
            type="button"
            onClick={() => {
              setMsgs([]);
              setModelId("");
              setDemoLeft(DEMO_LIMIT);
              retryModels();
            }}
          >
            Retry live service
          </button>
        </div>
      )}

      {/* model picker */}
      <div className="picker" role="radiogroup" aria-label="Choose a model">
        {state === "loading" &&
          [0, 1].map((i) => (
            <div key={i} className="pick pick--skeleton" aria-hidden="true">
              <i />
              <i />
            </div>
          ))}
        {models?.map((m) => {
          const { title, origin } = splitName(m.name);
          const on = m.id === modelId;
          return (
            <button key={m.id} type="button" role="radio" aria-checked={on} className={`pick${on ? " is-on" : ""}`} disabled={busy} onClick={() => setModelId(m.id)}>
              <span className="pick__top">
                <b>{title}</b>
                {origin && <em>{origin}</em>}
              </span>
              <span className="pick__price">${blendedPrice(m).toFixed(2)} per million tokens</span>
            </button>
          );
        })}
      </div>

      {/* model facts */}
      {ready && (!!model.specialties?.length || model.notIdealFor) && (
        <div className="facts">
          {!!model.specialties?.length && (
            <p className="chips">
              <span>Best for</span>
              {model.specialties.map((s) => (
                <b key={s} className="chip">
                  {s}
                </b>
              ))}
            </p>
          )}
          {model.notIdealFor && (
            <p className="facts__not">
              <span>Not ideal for</span> {model.notIdealFor.replace(/^Not ideal for:\s*/i, "")}
            </p>
          )}
        </div>
      )}

      {/* thread */}
      <div className="thread" ref={threadRef} role="log" aria-live="polite" aria-label="Conversation" data-testid="list-trial-messages">
        {state === "loading" && (
          <div className="state" aria-busy="true">
            <span className="state__spin" aria-hidden="true" />
            <p>Loading models…</p>
          </div>
        )}

        {state === "empty" && (
          <div className="state">
            <p className="state__title">No models are live right now</p>
            <p>Browse everything AGH hosts in AI Models.</p>
            <a className="link-arrow" href="/ai-models">
              Open AI Models
            </a>
          </div>
        )}

        {ready && empty && (
          <div className="welcome">
            <h4>What would you like to ask?</h4>
            <p>Try a prompt in an African language, or write your own.</p>
            <ul>
              {prompts.map((p, i) => (
                <li key={p}>
                  <button type="button" disabled={busy || exhausted} onClick={() => send(p)}>
                    <span className="welcome__n">{i + 1}</span>
                    <span className="welcome__t">{p}</span>
                    <Send />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {ready &&
          !empty &&
          msgs.map((m, i) => {
            const last = i === msgs.length - 1;
            if (m.role === "user") {
              return (
                <div key={i} className="turn turn--user">
                  <p>{m.content}</p>
                </div>
              );
            }
            return (
              <div key={i} className={`turn turn--ai${m.error ? " is-error" : ""}`}>
                <span className="turn__av" aria-hidden="true">
                  <HexMark filled />
                </span>
                <div className="turn__body">
                  <span className="turn__who">{who}</span>
                  {m.error ? (
                    <>
                      <p>{m.error}</p>
                      {lastUser && last && (
                        <button type="button" className="turn__retry" onClick={() => send(lastUser, true)} disabled={busy}>
                          Try this question again
                        </button>
                      )}
                    </>
                  ) : m.content ? (
                    <p className={busy && last ? "is-streaming" : ""}>{m.content}</p>
                  ) : (
                    <span className="typing" role="status" aria-label={`${who} is thinking`}>
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {notice && (
        <p className="chat__notice" role="alert">
          {notice}
        </p>
      )}

      {captcha && !exhausted && ready && <Turnstile onVerify={setToken} onExpire={() => setToken(null)} resetKey={resetKey} />}

      {/* composer / quota-exhausted */}
      {exhausted ? (
        <div className="done">
          <p>
            <b>You’ve used all {limit} free questions.</b> Keep going with every model we host.
          </p>
          <div className="done__actions">
            <a className="btn btn--primary" href="/ai-models">
              Explore AI Models
            </a>
            <a className="link-arrow" href={AUTH.signUp}>
              Create an account
            </a>
          </div>
        </div>
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
          <textarea
            id="trial-input"
            ref={areaRef}
            rows={1}
            value={input}
            maxLength={2000}
            disabled={!ready || busy}
            placeholder={state === "loading" ? "Loading models…" : ready ? `Message ${who}…` : "Models unavailable"}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                send();
              }
            }}
          />
          <button type="submit" className="composer__send" disabled={!ready || busy || !input.trim()} aria-label="Send question">
            <Send />
          </button>
        </form>
      )}
      <p className="chat__foot">Every answer is served from GPUs AGH operates.</p>
    </section>
  );
}
