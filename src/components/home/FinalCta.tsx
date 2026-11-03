import { CTA } from "../../lib/content";
import { useReveal } from "../../lib/hooks";
import { Interlace } from "../loom/Interlace";
import { StripBand } from "../loom/Art";
import { ArrowRight } from "./Icons";

export function FinalCta() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="cta" ref={ref} aria-labelledby="cta-title" data-testid="section-cta">
      <StripBand className="cta__strip" fg="#090a0c" variant="diamond" height={22} />
      <Interlace className="cta__knot" r={230} rings={2} colorA="#ffffff" colorB="#090a0c" gap="#793bed" width={13} animate={false} />
      <div className="wrap cta__in">
        <h2 id="cta-title" className="display cta__title reveal">
          {CTA.title.split(" AI ").flatMap((part, i, a) => (i < a.length - 1 ? [part, <span key={i} className="cta__ai"> AI </span>] : [part]))}
        </h2>
        <p className="cta__body reveal" style={{ ["--d" as string]: 1 }}>
          {CTA.body}
        </p>
        <div className="cta__btns reveal" style={{ ["--d" as string]: 2 }}>
          <a className="btn btn--light" href={CTA.primary.href}>
            {CTA.primary.label} <ArrowRight />
          </a>
          <a className="btn btn--ink" href={CTA.secondary.href}>
            {CTA.secondary.label}
          </a>
        </div>
      </div>
    </section>
  );
}
