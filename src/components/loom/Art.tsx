import { useId } from "react";
import { SQ3, hexVerts, pts, type P } from "./geometry";

/* ------------------------------------------------------------------ */
/*  Shared vocabulary                                                  */
/* ------------------------------------------------------------------ */

export type StripVariant = "chevron" | "diamond" | "stair";

/**
 * Woven divider. Three motifs taken from narrow-loom strip cloth — chevron,
 * diamond chain, stair — drawn as one repeating 24px module so they read as a
 * continuous woven band. Variants are rotated between sections so no two
 * adjacent dividers match.
 */
export function StripBand({
  fg = "currentColor",
  height = 22,
  variant = "diamond",
  className,
}: {
  fg?: string;
  height?: number;
  variant?: StripVariant;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const tile = {
    chevron: { w: 24, node: (
      <>
        <path d="M0 8 L12 0 L24 8" fill="none" stroke={fg} strokeWidth="2" />
        <path d="M0 15 L12 7 L24 15" fill="none" stroke={fg} strokeWidth="2" opacity="0.65" />
        <path d="M0 22 L12 14 L24 22" fill="none" stroke={fg} strokeWidth="2" opacity="0.35" />
      </>
    ) },
    diamond: { w: 24, node: (
      <>
        <path d="M12 1 L23 12 L12 23 L1 12 Z" fill="none" stroke={fg} strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 8 L16 12 L12 16 L8 12 Z" fill={fg} />
      </>
    ) },
    stair: { w: 24, node: (
      <>
        <path d="M0 22 H6 V15 H12 V8 H18 V1 H24" fill="none" stroke={fg} strokeWidth="2" strokeLinejoin="miter" />
        <path d="M0 22 H6 V15 H12 V8 H18 V1 H24 V22 Z" fill={fg} opacity="0.22" />
      </>
    ) },
  }[variant];
  return (
    <svg className={className} width="100%" height={height} aria-hidden="true" focusable="false">
      <defs>
        <pattern id={id} width={tile.w} height={24} patternUnits="userSpaceOnUse" patternTransform={`scale(${height / 24})`}>
          {tile.node}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  01 — Secure AI Agent Pods                                          */
/* ------------------------------------------------------------------ */
export function PodsArt({ className }: { className?: string }) {
  const R = 74;
  const gap = 10;
  const step = R * SQ3 + gap;
  // centre pod + six neighbours (flat-top hexes laid out pointy-ring)
  const ring: P[] = Array.from({ length: 6 }, (_, k) => {
    const a = ((90 + 60 * k) * Math.PI) / 180;
    return [Math.cos(a) * step, Math.sin(a) * step] as P;
  });
  const labels = ["AGENT", "BROWSER", "WORKLOAD"];
  return (
    <svg className={className} viewBox="-290 -250 580 500" role="img" aria-label="Seven sealed hexagonal pods; the centre pod holds an agent, with a browser and a workload in neighbouring pods, each isolated by a gap.">
      <circle r="236" fill="none" stroke="#b99bf8" strokeOpacity="0.35" strokeDasharray="3 9" />
      {[[0, 0] as P, ...ring].map(([x, y], i) => {
        const outer = hexVerts(x, y, R, 0);
        const inner = hexVerts(x, y, R - 12, 0);
        const centre = i === 0;
        return (
          <g key={i} className="art-pod" style={{ ["--i" as string]: i }}>
            <polygon points={pts(outer)} fill={centre ? "#793bed" : "#14123a"} stroke={centre ? "#d9c9fb" : "#9a6cf4"} strokeWidth="2" strokeLinejoin="round" />
            <polygon points={pts(inner)} fill="none" stroke={centre ? "#fff" : "#b99bf8"} strokeOpacity={centre ? 0.9 : 0.5} strokeWidth="1.2" strokeDasharray={centre ? "0" : "4 5"} />
            {i <= 3 && (
              <text x={x} y={y + 5} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" letterSpacing="1.5" fill={centre ? "#fff" : "#d9c9fb"}>
                {i === 0 ? labels[0] : labels[i - 1]}
              </text>
            )}
            {i > 3 && <circle cx={x} cy={y} r="3" fill="#b99bf8" opacity="0.6" />}
          </g>
        );
      })}
      {/* tick marks at the perimeter: nothing crosses without a gate */}
      {ring.slice(0, 6).map(([x, y], i) => {
        const a = Math.atan2(y, x);
        const px = Math.cos(a) * 218;
        const py = Math.sin(a) * 218;
        return <line key={i} x1={px} y1={py} x2={Math.cos(a) * 234} y2={Math.sin(a) * 234} stroke="#b8860b" strokeWidth="3" strokeLinecap="round" />;
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  02 — Private GPU Infrastructure (rack elevation)                   */
/* ------------------------------------------------------------------ */
export function RackArt({ className }: { className?: string }) {
  const slots = 11;
  const hot = 4;
  return (
    <svg className={className} viewBox="0 0 260 460" role="img" aria-label="Line drawing of a server rack with eleven stacked units, one highlighted.">
      <rect x="20" y="10" width="220" height="440" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <line x1="34" y1="10" x2="34" y2="450" stroke="currentColor" strokeOpacity="0.4" />
      <line x1="226" y1="10" x2="226" y2="450" stroke="currentColor" strokeOpacity="0.4" />
      {Array.from({ length: slots }, (_, i) => {
        const y = 24 + i * 38;
        const on = i === hot;
        return (
          <g key={i}>
            <rect x="42" y={y} width="176" height="30" fill={on ? "var(--violet-500)" : "none"} stroke="currentColor" strokeWidth="1.4" />
            {Array.from({ length: 14 }, (_, k) => (
              <line key={k} x1={92 + k * 6.2} y1={y + 8} x2={92 + k * 6.2} y2={y + 22} stroke="currentColor" strokeOpacity={on ? 0.9 : 0.4} strokeWidth="1.4" />
            ))}
            <circle cx="54" cy={y + 15} r="3.2" fill={on ? "#fff" : "currentColor"} opacity={on ? 1 : 0.5} />
            <circle cx="68" cy={y + 15} r="3.2" fill={on ? "#b8860b" : "none"} stroke={on ? "none" : "currentColor"} strokeOpacity="0.5" />
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  03 — AI App Store & Creative Suite (narrow-loom strips)            */
/* ------------------------------------------------------------------ */
export function AppsArt({ className }: { className?: string }) {
  const strips = 6;
  const W = 64; // strip width = one cell
  const H = 192; // three cells tall
  const set = [
    { bg: "#793bed", fg: "#d9c9fb" },
    { bg: "#14123a", fg: "#9a6cf4" },
    { bg: "#d9c9fb", fg: "#5a22b8" },
    { bg: "#5a22b8", fg: "#f4f4f5" },
    { bg: "#f4f4f5", fg: "#793bed" },
    { bg: "#9a6cf4", fg: "#14123a" },
  ];
  const cell = (kind: number, x: number, y: number, fg: string) => {
    const c = W / 2;
    switch (kind) {
      case 0: // chevron stack
        return [14, 30, 46].map((o) => <path key={o} d={`M${x + 8} ${y + o} L${x + c} ${y + o - 12} L${x + W - 8} ${y + o}`} fill="none" stroke={fg} strokeWidth="5" strokeLinejoin="miter" />);
      case 1: // nested diamond
        return (
          <>
            <path d={`M${x + c} ${y + 6} L${x + W - 6} ${y + c} L${x + c} ${y + W - 6} L${x + 6} ${y + c} Z`} fill="none" stroke={fg} strokeWidth="5" />
            <path d={`M${x + c} ${y + 24} L${x + 40} ${y + c} L${x + c} ${y + 40} L${x + 24} ${y + c} Z`} fill={fg} />
          </>
        );
      case 2: // stair
        return <path d={`M${x + 6} ${y + 58} V${y + 44} H${x + 22} V${y + 30} H${x + 38} V${y + 16} H${x + 58} V${y + 58} Z`} fill={fg} />;
      case 3: // zigzag
        return <path d={`M${x + 12} ${y + 6} L${x + 52} ${y + 22} L${x + 12} ${y + 38} L${x + 52} ${y + 54}`} fill="none" stroke={fg} strokeWidth="6" strokeLinejoin="miter" />;
      default: // dot lattice
        return [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => <rect key={`${i}${j}`} x={x + 10 + i * 18} y={y + 10 + j * 18} width="10" height="10" transform={`rotate(45 ${x + 15 + i * 18} ${y + 15 + j * 18})`} fill={fg} opacity={(i + j) % 2 ? 1 : 0.5} />));
    }
  };
  return (
    <svg className={className} viewBox={`0 0 ${strips * W} ${H}`} role="img" aria-label="Six narrow woven strips, each carrying a different geometric motif, stitched side by side — a catalogue of deployable apps.">
      {Array.from({ length: strips }, (_, s) => (
        <g key={s} className="art-tile" style={{ ["--i" as string]: s }}>
          <rect x={s * W} y={0} width={W} height={H} fill={set[s].bg} />
          {[0, 1, 2].map((r) => (
            <g key={r}>{cell((s + (s % 2 ? r : 0)) % 5, s * W, r * W, set[s].fg)}</g>
          ))}
          <line x1={s * W} y1="0" x2={s * W} y2={H} stroke="#090a0c" strokeOpacity="0.35" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  04 — Solution Partner Network (circuit-trace topology)             */
/* ------------------------------------------------------------------ */
export function PartnersArt({ className }: { className?: string }) {
  const centre: P = [200, 160];
  const sats: { p: P; d: string }[] = [
    { p: [62, 54], d: "M62 54 L62 100 L150 160 L200 160" },
    { p: [338, 54], d: "M338 54 L338 100 L250 160 L200 160" },
    { p: [38, 160], d: "M38 160 L200 160" },
    { p: [362, 160], d: "M362 160 L200 160" },
    { p: [62, 266], d: "M62 266 L62 220 L150 160 L200 160" },
    { p: [338, 266], d: "M338 266 L338 220 L250 160 L200 160" },
  ];
  return (
    <svg className={className} viewBox="0 0 400 320" role="img" aria-label="A central hexagon linked by circuit-style traces to six certified partner nodes.">
      {sats.map((s, i) => (
        <g key={i} className="art-trace" style={{ ["--i" as string]: i }}>
          <path d={s.d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
          <polygon points={pts(hexVerts(s.p[0], s.p[1], 19, 0))} fill="var(--bg, #fff)" stroke="currentColor" strokeWidth="2" />
          <path d={`M${s.p[0] - 7} ${s.p[1]} l5 5 l9 -10`} fill="none" stroke="var(--violet-500)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      <polygon points={pts(hexVerts(centre[0], centre[1], 46, 0))} fill="var(--violet-500)" />
      <polygon points={pts(hexVerts(centre[0], centre[1], 36, 0))} fill="none" stroke="#fff" strokeWidth="1.4" />
      <text x={centre[0]} y={centre[1] + 6} textAnchor="middle" fontFamily="var(--font-display)" fontWeight="800" fontSize="22" fill="#fff" letterSpacing="-0.5">
        AGH
      </text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  05 — AI Credit Programs (one source, many builders)                */
/* ------------------------------------------------------------------ */
export function CreditsArt({ className }: { className?: string }) {
  const n = 13;
  const ys = Array.from({ length: n }, (_, i) => 24 + i * 22);
  const mid = 24 + 6 * 22;
  return (
    <svg className={className} viewBox="0 0 760 320" preserveAspectRatio="xMidYMid meet" role="img" aria-label="One source hexagon distributing credits along thirteen traces to individual builder nodes.">
      <polygon points={pts(hexVerts(78, mid, 52, 0))} fill="var(--violet-500)" />
      <polygon points={pts(hexVerts(78, mid, 40, 0))} fill="none" stroke="#fff" strokeWidth="1.4" />
      <text x="78" y={mid + 6} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="15" fill="#fff" letterSpacing="1">
        GPU
      </text>
      {ys.map((y, i) => {
        const bend = 250 + (Math.abs(i - 6) % 4) * 26;
        const d = `M130 ${mid} L${bend} ${mid} L${bend + Math.abs(y - mid) * 0.9 + 20} ${y} L690 ${y}`;
        return (
          <g key={i} className="art-credit" style={{ ["--i" as string]: i }}>
            <path d={d} fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.5" strokeLinejoin="round" />
            <path d={d} pathLength={100} fill="none" stroke="var(--violet-500)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="loom-pulse loom-pulse--short" style={{ animationDelay: `${-(i * 0.43).toFixed(2)}s` }} />
            <circle cx="698" cy={y} r="5.5" fill="var(--bg, #fff)" stroke="currentColor" strokeWidth="1.8" />
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Africa as a hex tile-grid cartogram                                */
/* ------------------------------------------------------------------ */

// X = tile, N = Nigeria (N-ATLaS), U = Uganda (Sunflower). Pointy-top, odd rows shifted right.
const AFRICA = [
  "....XXXXXX.......",
  "...XXXXXXXXXXX...",
  "..XXXXXXXXXXXXX..",
  ".XXXXXXXXXXXXXXX.",
  "XXXXXXXXXXXXXXXX.",
  "XXXXXXXXXXXXXXXXX",
  ".XXXXXNXXXXXXXXXX",
  "...XXXXXXXXXUXX..",
  ".....XXXXXXXXXX..",
  ".....XXXXXXXXX...",
  "......XXXXXXXX...",
  "......XXXXXXX..X.",
  ".......XXXXXX..X.",
  "........XXXXX....",
  "........XXXX.....",
  ".........XX......",
];

export function AfricaTiles({ className, nigeria, uganda }: { className?: string; nigeria: string; uganda: string }) {
  const s = 24;
  const w = SQ3 * s;
  const tiles: { x: number; y: number; kind: string; row: number; col: number }[] = [];
  AFRICA.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch === ".") return;
      tiles.push({ x: c * w + (r % 2 ? w / 2 : 0), y: r * 1.5 * s, kind: ch, row: r, col: c });
    }),
  );
  const N = tiles.find((t) => t.kind === "N")!;
  const U = tiles.find((t) => t.kind === "U")!;
  const W = 17 * w + w / 2;
  const H = 15 * 1.5 * s + s;
  const arc = `M${N.x} ${N.y} C ${N.x + 60} ${N.y - 70}, ${U.x - 60} ${U.y - 70}, ${U.x} ${U.y}`;
  return (
    <svg className={className} viewBox={`${-w} ${-s - 40} ${W + w + 110} ${H + 70}`} role="img" aria-label={`Africa drawn as a grid of hexagonal tiles. Two tiles are lit: ${nigeria} in Nigeria and ${uganda} in Uganda.`}>
      {tiles.map((t, i) => {
        const lit = t.kind !== "X";
        return (
          <polygon
            key={i}
            className={lit ? "tile tile--lit" : "tile"}
            style={{ ["--i" as string]: t.row * 3 + (t.col % 5) }}
            points={pts(hexVerts(t.x, t.y, s * 0.9, 30))}
          />
        );
      })}
      <path d={arc} fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth="1.6" strokeDasharray="2 6" strokeLinecap="round" />
      <path d={arc} pathLength={100} fill="none" stroke="#d9c9fb" strokeWidth="2.4" strokeLinecap="round" className="loom-pulse loom-pulse--short" />
      {[
        { t: N, label: nigeria, dx: -30, dy: -44, anchor: "end" as const },
        { t: U, label: uganda, dx: 34, dy: 46, anchor: "start" as const },
      ].map(({ t, label, dx, dy, anchor }) => (
        <g key={label}>
          <circle cx={t.x} cy={t.y} r="4" fill="#fff" />
          <circle cx={t.x} cy={t.y} r="10" fill="none" stroke="#fff" strokeOpacity="0.5" className="tile-ping" />
          <line x1={t.x} y1={t.y} x2={t.x + dx} y2={t.y + dy} stroke="#fff" strokeOpacity="0.7" />
          <text x={t.x + dx + (anchor === "end" ? -6 : 6)} y={t.y + dy + (dy > 0 ? 12 : -4)} textAnchor={anchor} fontFamily="var(--font-mono)" fontSize="12" letterSpacing="1" fill="#fff">
            {label.toUpperCase()}
          </text>
        </g>
      ))}
    </svg>
  );
}
