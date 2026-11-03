import { useEffect, useRef, useState } from "react";
import { AUTH, NAV_MAIN } from "../../lib/content";
import { Chevron, External, HexMark, Menu } from "./Icons";

const slug = (s: string) => s.replace(/\W+/g, "-").toLowerCase();

export function SiteHeader() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const barRef = useRef<HTMLElement>(null);

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

  // lock page scroll behind the mobile sheet
  useEffect(() => {
    document.documentElement.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobile]);

  const hover = () => matchMedia("(hover:hover) and (min-width: 1181px)").matches;

  return (
    <header className="site-header" ref={barRef}>
      <div className="wrap bar">
        <a href="/" className="brand" aria-label="AGH Cloud — powered by Udu Technologies, home">
          <img src="/brand/agh-lockup.webp" width="640" height="231" fetchPriority="high" alt="AGH Cloud — powered by Udu Technologies" />
        </a>

        <nav id="site-nav" className={`nav${mobile ? " is-open" : ""}`} aria-label="Primary">
          <ul className="nav__groups">
            {NAV_MAIN.map((g, gi) => {
              const isOpen = open === g.label;
              const id = `menu-${slug(g.label)}`;
              return (
                <li key={g.label} onMouseEnter={() => hover() && setOpen(g.label)} onMouseLeave={() => hover() && setOpen(null)}>
                  <button type="button" className="nav__top" aria-expanded={isOpen} aria-controls={id} onClick={() => setOpen(isOpen ? null : g.label)}>
                    {g.label}
                    <Chevron />
                  </button>
                  <div className={`menu${gi >= NAV_MAIN.length - 2 ? " menu--end" : ""}${g.items.length > 5 ? " menu--wide" : ""}`} id={id} hidden={!isOpen}>
                    <a className="menu__lead" href={g.href}>
                      <HexMark />
                      <span className="display">{g.leadTitle}</span>
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

          <div className="nav__actions">
            <a href={AUTH.cloud} className="nav__cloud">
              <HexMark />
              Cloud Management
            </a>
            <a href={AUTH.signIn} className="nav__signin">
              Sign In
            </a>
            <a href={AUTH.signUp} className="btn btn--primary">
              Sign Up
            </a>
          </div>
        </nav>

        <button type="button" className="burger" aria-label="Toggle Menu" aria-expanded={mobile} aria-controls="site-nav" onClick={() => setMobile((v) => !v)}>
          <Menu open={mobile} />
        </button>
      </div>
    </header>
  );
}
