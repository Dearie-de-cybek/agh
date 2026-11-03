import { FOOTER } from "../../lib/content";
import { StripBand } from "../loom/Art";

export function SiteFooter() {
  return (
    <footer className="foot">
      <StripBand className="foot__strip" fg="#9a6cf4" height={18} />
      <div className="wrap foot__grid">
        <div className="foot__brand">
          <img src="/brand/agh-footer.png" width="675" height="214" loading="lazy" alt={FOOTER.brand} />
          <p>{FOOTER.blurb}</p>
        </div>
        {FOOTER.columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h2 className="mono">{c.title}</h2>
            <ul>
              {c.links.map((l) => (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="wrap foot__base">
        <p>{FOOTER.legal}</p>
        <ul>
          {FOOTER.badges.map((b) => (
            <li key={b} className="mono">
              <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                <path d="M12 2 21 7v10l-9 5-9-5V7z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
              {b}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
