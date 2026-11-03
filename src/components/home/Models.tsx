import { blendedPrice, useModels, useTrialStatus, type ModelInfo } from "../../lib/api";
import { MODELS } from "../../lib/content";
import { useInView, useReveal } from "../../lib/hooks";
import { HexMark } from "./Icons";
import { TrialChat } from "./TrialChat";

/** Honest price chart: AGH's own stated frontier figure vs. live per-model prices from the API. */
function PriceChart({ models, sample }: { models: ModelInfo[] | null; sample: boolean }) {
  const [ref, seen] = useInView<HTMLDivElement>(0.3);
  const rows = [...(models ?? [])].sort((a, b) => blendedPrice(a) - blendedPrice(b));
  const max = MODELS.frontierPerMillion;
  const fmt = (n: number) => `$${n.toFixed(2)}`;
  return (
    <div className="price" ref={ref}>
      <p className="mono price__cap">USD per million tokens · input + output{sample ? " · sample prices" : ""}</p>
      <ul>
        <li className="price__row price__row--ref">
          <span className="price__name">Frontier models, typical</span>
          <span className="price__track" aria-hidden="true">
            <span className="price__bar" style={{ width: seen ? "100%" : "0%" }} />
          </span>
          <span className="price__val mono">≈ {fmt(max)}</span>
        </li>
        {rows.map((m) => {
          const v = blendedPrice(m);
          return (
            <li className="price__row" key={m.id}>
              <span className="price__name">{m.name}</span>
              <span className="price__track" aria-hidden="true">
                <span className="price__bar" style={{ width: seen ? `${Math.max(3, (v / max) * 100)}%` : "0%" }} />
              </span>
              <span className="price__val mono">{fmt(v)}</span>
            </li>
          );
        })}
        {!models && <li className="price__row price__row--skeleton mono">Loading live prices…</li>}
      </ul>
    </div>
  );
}

export function Models() {
  const ref = useReveal<HTMLElement>();
  const { status, refresh } = useTrialStatus();
  const { models, state, detail, retry } = useModels();
  const limit = status?.limit ?? 5;
  // lowest live price, as the existing homepage computes it; its stated $0.60 until the API answers
  const start = models?.length ? Math.min(...models.filter((m) => !m.isFree).map(blendedPrice)).toFixed(2) : "0.60";
  return (
    <section id="ai-trial" className="sec models-sec" ref={ref} aria-labelledby="models-title" data-testid="section-culture-tuned">
      <div className="warp" aria-hidden="true" />
      <div className="wrap">
        <header className="sec__head reveal">
          <p className="eyebrow">{MODELS.eyebrow}</p>
          <h2 id="models-title" className="display sec__title">
            {MODELS.title}
          </h2>
          <p className="sec__lede">{MODELS.body(limit)}</p>
        </header>

        <div className="models-grid">
          <div className="claims">
            <ol className="ledger">
              {MODELS.claims.map((c, i) => {
                // "5–10x cheaper than frontier models" → big figure + descriptor, one heading
                const m = c.title.match(/^([\d–-]+x)\s+(.*)$/);
                return (
                  <li key={c.key} className="claim reveal" style={{ ["--d" as string]: i }}>
                    <h3 className="claim__title">
                      {m ? (
                        <>
                          <span className="claim__metric display">{m[1]}</span> <span className="claim__label">{m[2]}</span>
                        </>
                      ) : (
                        <>
                          <span className="claim__metric claim__metric--icon" aria-hidden="true">
                            <HexMark filled />
                          </span>{" "}
                          <span className="claim__label">{c.title}</span>
                        </>
                      )}
                    </h3>
                    <p className="claim__body">
                      {c.body}
                      {c.key === "cheaper" && <> Ours start at ${start} per million — same conversations, a fraction of the bill.</>}
                    </p>
                  </li>
                );
              })}
            </ol>
            <div className="reveal" style={{ ["--d" as string]: 3 }}>
              <PriceChart models={models} sample={state === "demo"} />
            </div>
          </div>

          <div className="reveal" style={{ ["--d" as string]: 1 }}>
            <TrialChat models={models} state={state} detail={detail} retryModels={retry} status={status} refresh={refresh} />
          </div>
        </div>
      </div>
    </section>
  );
}
