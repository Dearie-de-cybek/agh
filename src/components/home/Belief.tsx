import { BELIEF } from "../../lib/content";
import { useReveal } from "../../lib/hooks";
import { AfricaTiles, StripBand } from "../loom/Art";

export function Belief() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="sec belief" ref={ref} aria-labelledby="belief-title" data-testid="section-belief">
      <StripBand className="belief__strip" fg="#9a6cf4" variant="stair" height={20} />
      <div className="warp" aria-hidden="true" />
      <div className="wrap">
        <div className="belief__grid">
          <div className="belief__copy">
            <p className="eyebrow reveal">{BELIEF.eyebrow}</p>
            <h2 id="belief-title" className="display sec__title reveal" style={{ ["--d" as string]: 1 }}>
              {BELIEF.title}
            </h2>
            <p className="belief__lead reveal" style={{ ["--d" as string]: 2 }}>
              {BELIEF.paras[0]}
            </p>
            <p className="belief__p reveal" style={{ ["--d" as string]: 3 }}>
              {BELIEF.paras[1]}
            </p>
          </div>

          <figure className="belief__map reveal" style={{ ["--d" as string]: 2 }}>
            <AfricaTiles className="belief__svg" nigeria="N-ATLaS · Nigeria" uganda="Sunflower · Uganda" />
            <figcaption className="mono">
              Every tile is a nation that can own its compute. Lit tiles: the origin of the two language models in the free trial today. Illustrative.
            </figcaption>
          </figure>
        </div>

        <p className="belief__close display reveal">{BELIEF.closing}</p>

        <ol className="owns" aria-label="What AGH aims to provide">
          {BELIEF.provides.map((p, i) => (
            <li key={p} className="reveal" style={{ ["--d" as string]: i }}>
              <span className="owns__hex" aria-hidden="true">
                <svg viewBox="0 0 40 46">
                  <path d="M20 2 37 12v22L20 44 3 34V12z" />
                </svg>
                <b className="mono">0{i + 1}</b>
              </span>
              <span className="owns__t">{p}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
