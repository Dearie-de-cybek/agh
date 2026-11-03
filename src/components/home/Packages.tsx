import { PACKAGES } from "../../lib/content";
import { useReveal } from "../../lib/hooks";
import { AppsArt, CreditsArt, PartnersArt, PodsArt, RackArt } from "../loom/Art";
import { ArrowRight } from "./Icons";

type Item = (typeof PACKAGES.items)[number];

const Num = ({ n }: { n: number }) => (
  <span className="pk__num" aria-hidden="true">
    0{n}
  </span>
);

export function Packages() {
  const ref = useReveal<HTMLElement>();
  const [pods, gpu, apps, partners, credits] = PACKAGES.items as [Item, Item, Item, Item, Item];
  return (
    <section id="featured-packages" className="sec packages" ref={ref} aria-labelledby="packages-title">
      <div className="wrap">
        <header className="sec__head reveal">
          <p className="eyebrow">{PACKAGES.eyebrow}</p>
          <h2 id="packages-title" className="display sec__title">
            {PACKAGES.title}
          </h2>
          <p className="sec__lede">{PACKAGES.body}</p>
        </header>
      </div>

      {/* 01 — full-bleed dark slab, art right */}
      <article className="pk pk--pods reveal">
        <div className="wrap pk__in">
          <div className="pk__text">
            <Num n={1} />
            <h3 className="display pk__title">{pods.title}</h3>
            <p>{pods.body}</p>
            <a className="btn btn--light" href={pods.href}>
              {pods.cta} <ArrowRight />
            </a>
          </div>
          <PodsArt className="pk__art" />
        </div>
      </article>

      {/* 02 — photographic: real GPU hall + rack elevation */}
      <article className="pk pk--gpu reveal">
        <div className="wrap pk__in">
          <div className="pk__media">
            <img src="/brand/datacenter.webp" width="1408" height="768" loading="lazy" alt="Rows of GPU server racks lit by violet light." />
            <RackArt className="pk__rack" />
          </div>
          <div className="pk__text">
            <Num n={2} />
            <h3 className="display pk__title">{gpu.title}</h3>
            <p>{gpu.body}</p>
            <a className="link-arrow" href={gpu.href}>
              {gpu.cta} <ArrowRight />
            </a>
          </div>
        </div>
      </article>

      {/* 03 + 04 — staggered pair on different grounds */}
      <div className="wrap pk-pair">
        <article className="pk pk--apps reveal">
          <AppsArt className="pk__art" />
          <div className="pk__text">
            <Num n={3} />
            <h3 className="display pk__title">{apps.title}</h3>
            <p>{apps.body}</p>
            <a className="btn btn--light" href={apps.href}>
              {apps.cta} <ArrowRight />
            </a>
          </div>
        </article>

        <article className="pk pk--partners reveal" style={{ ["--d" as string]: 2 }}>
          <div className="pk__text">
            <Num n={4} />
            <h3 className="display pk__title">{partners.title}</h3>
            <p>{partners.body}</p>
            <a className="link-arrow" href={partners.href}>
              {partners.cta} <ArrowRight />
            </a>
          </div>
          <PartnersArt className="pk__art" />
        </article>
      </div>

      {/* 05 — a long band: one source, many builders */}
      <article className="pk pk--credits reveal">
        <div className="wrap pk__in">
          <div className="pk__text">
            <Num n={5} />
            <h3 className="display pk__title">{credits.title}</h3>
            <p>{credits.body}</p>
            <a className="link-arrow" href={credits.href}>
              {credits.cta} <ArrowRight />
            </a>
          </div>
          <CreditsArt className="pk__art" />
        </div>
      </article>
    </section>
  );
}
