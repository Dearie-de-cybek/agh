import { TRUSTED } from "../../lib/content";
import { useReveal } from "../../lib/hooks";

export function Trusted() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="trusted" ref={ref} aria-labelledby="trusted-title" data-testid="section-trusted">
      <div className="wrap">
        <h2 id="trusted-title" className="eyebrow reveal">
          {TRUSTED.title}
        </h2>
        <ul className="trusted__row">
          {TRUSTED.orgs.map((o, i) => (
            <li key={o.name}>
              <span className="reveal" style={{ ["--d" as string]: i }}>
                {o.logo ? <img src={o.logo} alt={o.name} loading="lazy" height="32" /> : <span className="trusted__name display">{o.name}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
