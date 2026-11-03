# AGH Cloud homepage redesign — handover notes

## What this is
A complete redesign of the aghcloud.ai homepage (header → hero → culture-tuned models → belief → packages → trust → final CTA → footer) in the **"Loom"** visual language. Vite + React 19 + TypeScript, plain CSS tokens, no UI framework, no WebGL.

`npm install && npm run dev` → http://localhost:5173 (`/api/*` proxies to the live platform).
`npm run build` → `dist/` (JS 84 kB gzip, CSS 25 kB gzip, fonts self-hosted).

## Important: the source repo was not in this folder
`Documents/agh` was empty, so the existing app's source could not be inspected. I inspected the **live site and its production bundle** instead: rendered DOM, computed styles, every route/href in the nav, the three API endpoints the homepage uses, the Turnstile key and the brand assets. Consequences:

- This project is a **drop-in homepage layer**, not a fork of the app. To ship it inside the real repo: copy `src/pages/Home.tsx`, `src/components/{home,loom}`, `src/lib`, `src/styles`, `public/brand`, and import the three CSS files + fonts (`src/main.tsx` shows the order). Replace `<a href>` with the router's `Link` if you want client-side navigation (the live app uses wouter).
- **Not touched** (not on this page / not visible to me): auth, dashboard, other routes, the cookie-consent banner, GTM/Google Ads/consent-mode scripts and the Replit dev banner in the live `index.html`. Keep those in the real `index.html`; this repo's `index.html` only carries the SEO/OG meta.
- Live integrations reused unchanged: `GET /api/inference/models`, `GET /api/trial/status`, `POST /api/trial/chat` (SSE) with Cloudflare Turnstile (site key `0x4AAAAAAD0CvS59ZpHf8njX`, overridable via `VITE_TURNSTILE_SITEKEY`). The key is domain-bound, so on `localhost` the chat shows "Security check unavailable" — expected; it works on aghcloud.ai. I could therefore not send a real trial message from dev; the streaming code is a line-for-line port of the live component's parsing.

## Brand, extracted from the live site (not invented)
| Token | Value | Source |
|---|---|---|
| `--violet-500` | `#793bed` (hsl 261 83% 58%) | site `--primary` |
| `--ink-950` | `#090a0c` | site foreground |
| `--slate-900` | `#0f172a` | site footer |
| `--logo-purple` / `--logo-gold` | `#7a2cb3` / `#b8860b` | sampled from the AGH lockup (hexagon + gold rivets/underline) |
| night tones | `#0b0a22`… | derived from the existing hero photograph's navy |

Gold is used only as tiny "rivet" nodes (echoing the logo's four gold corner rivets) — never as a theme colour. No brown/orange/green stereotyping.

## Design language
- **Hexagon = the AGH mark.** Everything is built from it: pods, tiles, buttons (hex-chamfered, not pills), dividers.
- **Strip-cloth weaving.** `StripBand` is a narrow-loom strip module; `Interlace` is two hexagonal strands woven over/under at 12 crossings. African identity lives in geometry, composition and typography — no masks, no Ankara fills, no safari imagery (the site's existing safari-sunset stock images were deliberately not used).
- **Circuit traces** from the logo (line + ring terminator) become the partner and credit diagrams.
- **Hero sculpture** (`HexSculpture`): 61 isometric hex prisms inside a woven loom frame, pure SVG, 3-layer pointer parallax, light pulses on the strands, rise-in animation.
- **Africa tile-cartogram** (`AfricaTiles`): a hex tile-grid, not a glowing map. Only two tiles are lit — the origin of the two language models actually live today (N-ATLaS, Nigeria; Sunflower, Uganda). Labelled "Illustrative"; it makes no infrastructure-location claims.
- Section grounds alternate night / paper / night / white / paper / violet, and each of the five products has its own composition (dark slab, photo + rack elevation, mosaic, circuit topology, long distribution band).

### Typography
| Role | Font | Why |
|---|---|---|
| Display | Bricolage Grotesque (variable, wdth axis) | already on the site's CSS; characterful but very readable; OFL |
| Accent glyph | **Danfo** (Afrotype) | used for exactly three things: the word "AI" in the hero and CTA headlines and the 01–05 package numerals. At full-headline size it was illegible, so it's an accent only. OFL |
| Body | DM Sans (variable) | already on the site; OFL |
| Technical | JetBrains Mono | labels, prices, captions; OFL |

**Madimi One** was evaluated and dropped: its rounded, playful forms fight the enterprise-infrastructure tone. All fonts are self-hosted via `@fontsource` (no Google Fonts request).

## Accessibility / performance (verified)
- axe-core 4.14 (WCAG 2 A/AA + best-practice) on the full page: **0 violations**; 15 colour-contrast checks were "incomplete" because of gradient/clip backgrounds, checked by hand against the token pairs (all ≥ 4.5:1).
- Skip link, landmarks, real `<button role=tab>` model switcher, `role=log aria-live` conversation, keyboard-operable nav (Esc closes), visible focus rings, `prefers-reduced-motion` disables reveals, parallax, pulses and pings.
- No horizontal overflow at 375 / 768 / 1024 / 1440 px.
- Images: datacenter photo 1.3 MB PNG → 78 kB WebP (lazy); lockup 27 kB WebP preloaded; hero is SVG (no LCP image).

## ⚠ Existing claims that need founder verification (kept verbatim, not changed)
1. **"5–10x cheaper than frontier models" / "from $0.60 per million".** Live API prices (input+output per M tokens): N-ATLaS 8B = **$0.60**, but Sunflower 14B = **$6.00** — only ~1.7× below the stated $10 frontier figure. The price chart shows the live numbers honestly beside the claim.
2. **"Frontier models typically cost ~$10 per million tokens"** — no source on the site; shown as "≈ $10.00 … Frontier models, typical".
3. **"2–3x more correct in their specialty"** — no benchmark cited.
4. **"Mistral, DeepSeek, … hosted on our own GPUs"** — the API currently lists Mistral 7B, DeepSeek R1 14B, Llama, Qwen, Nemotron as **`available: false`**; only Sunflower 14B and N-ATLaS 8B are live. The Sunflower description in the API also says *"DISABLED until its Hugging Face license is verified for commercial hosting"* while it is marked available.
5. **"Your prompts never leave the platform"** / "sovereign GPUs" — confirm against the actual hosting setup.
6. **Trusted-by names** (Afrilab, Terra Industries, Strathmore University, Octopus, Gates Foundation, UNDP) — relationships and permission to display each name; the live site shows text only.
7. **"Powered by Renewable Energy"** footer badge.
8. Footer links that are `#` placeholders on the live site (Community Forum, Support Center, Status Page, About Us, Careers, Press, Contact) and three empty social-icon links — preserved/omitted respectively; there are no real social URLs to carry over.
9. "Africa GPU Hub" (footer/brand) vs "AGH Cloud" (header lockup) naming, and "© 2026 UduTech".
10. Sign In/Up routes `/login` and `/signup` are taken from the app's route list.

## Needs assets from you (not fabricated)
- **Approved partner logos** → fill `logo:` in `src/lib/content.ts` (`TRUSTED.orgs`); the layout already supports consistent logo sizing. Until then names are typeset text, as on the live site.
- **Real photography**: the only legitimate GPU image available is the existing hero render (used in package 02). Commission or license real AGH/partner data-centre and researcher photography and swap into `Packages.tsx`.
- **Product screenshots** for Pods / App Store / Partners / Credits to replace the diagrams with mockups — I only had the free-trial interface, which is rebuilt live in the models section.
- Language picker: the product has no language-selection API, so none was faked; African-language examples come from the model's own `starterPrompts` and `specialties`.

## Suggested content improvements (proposed, not applied)
- Hero statement and body are unchanged. Consider adding a one-line proof point under the hero once item 4 above is resolved.
- The models paragraph names models that are currently offline; consider "African language models and more" until they return.
