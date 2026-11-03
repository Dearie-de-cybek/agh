import { HERO } from "../../lib/content";
import { LoomHero } from "../loom/LoomHero";
import { StripBand } from "../loom/Art";
import { ArrowRight } from "./Icons";

export function Hero() {
  const words = HERO.title.split(" "); // Sovereign / AI / starts / here.
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero__grain" aria-hidden="true" />
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="eyebrow hero__tag">{HERO.tag}</p>
          <h1 id="hero-title" className="display hero__title">
            <span>{words[0]}</span> <span className="hero__ai">{words[1]}</span> <span>{words.slice(2).join(" ")}</span>
          </h1>
          <p className="hero__body">{HERO.body}</p>
          <div className="hero__cta">
            <a className="btn btn--primary" href={HERO.primary.href}>
              {HERO.primary.label} <ArrowRight />
            </a>
            <a className="btn btn--ghost" href={HERO.secondary.href}>
              {HERO.secondary.label}
            </a>
          </div>
        </div>

        <figure className="hero__stage">
          <LoomHero />
          <figcaption className="hero__cap" aria-hidden="true">
            Fig. 01 — The computational loom
          </figcaption>
        </figure>
      </div>

      <div className="wrap">
        <ul className="statement" aria-label="Our promise">
          {HERO.statement.map((s, i) => (
            <li key={s}>
              <span className="mono statement__n">0{i + 1}</span>
              <span className="display statement__t">{s}</span>
            </li>
          ))}
        </ul>
      </div>

      <StripBand className="hero__strip" fg="#9a6cf4" variant="chevron" height={20} />
    </section>
  );
}
