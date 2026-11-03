import { useEffect, useRef, useState } from "react";
import { AUTH, NAV_MAIN, NAV_UTILITY } from "../../lib/content";
import { Chevron, External, Menu } from "./Icons";

export function SiteHeader() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobile(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <header className="site-header" ref={barRef}>
      <div className="utility" aria-label="Quick links">
        <div className="wrap utility__in">
          {NAV_UTILITY.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
      </div>

      <div className="wrap bar">
        <a href="/" className="brand" aria-label="AGH Cloud — powered by Udu Technologies, home">
          <img src="/brand/agh-lockup.webp" width="640" height="231" fetchPriority="high" alt="AGH Cloud — powered by Udu Technologies" />
        </a>

        <nav className={`nav${mobile ? " is-open" : ""}`} aria-label="Primary">
          <ul>
            <li>
              <a href="/" className="nav__top">
                Home
              </a>
            </li>
            {NAV_MAIN.map((g) => {
              const isOpen = open === g.label;
              return (
                <li key={g.label} onMouseEnter={() => matchMedia("(hover:hover)").matches && setOpen(g.label)} onMouseLeave={() => matchMedia("(hover:hover)").matches && setOpen(null)}>
                  <button type="button" className="nav__top" aria-expanded={isOpen} aria-controls={`m-${g.label.replace(/\s/g, "")}`} onClick={() => setOpen(isOpen ? null : g.label)}>
                    {g.label}
                    <Chevron />
                  </button>
                  <div className="menu" id={`m-${g.label.replace(/\s/g, "")}`} hidden={!isOpen}>
                    <a className="menu__lead" href={g.href}>
                      <span className="display">{g.label}</span>
                      <span>{g.blurb}</span>
                    </a>
                    <ul>
                      {g.items.map((it) => (
                        <li key={it.label}>
                          <a href={it.href} {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                            {it.label}
                            {it.badge && <b className="badge">{it.badge}</b>}
                            {it.external && <External />}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="nav__auth">
            <a href={AUTH.signIn} className="nav__top">
              Sign In
            </a>
            <a href={AUTH.signUp} className="btn btn--primary">
              Sign Up
            </a>
          </div>
        </nav>

        <button type="button" className="burger" aria-label="Toggle Menu" aria-expanded={mobile} onClick={() => setMobile((v) => !v)}>
          <Menu open={mobile} />
        </button>
      </div>
    </header>
  );
}
