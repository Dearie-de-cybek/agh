import { useId, useMemo } from "react";
import { SQ3, crossings, hexVerts, mix, pathOf, pts, type P } from "./geometry";

/**
 * Hero sculpture — drawn entirely in SVG (no WebGL, no raster).
 *
 * A stepped lattice of hexagonal prisms (the AGH mark's hexagon, read as GPU
 * pods) sits inside a loom frame: two hexagonal strands woven over/under at
 * twelve crossings, held on six posts. Pulses of light run along the strands.
 * Pointer parallax moves three depth layers; reduced-motion freezes it.
 */

const S = 27; // prism circumradius in the ground plane
const N = 4; // lattice radius → 61 prisms
const FRAME_R = 222;
const FRAME_Z = 200;

const proj = (x: number, y: number, z: number): P => [(x - y) * 0.7071, (x + y) * 0.35355 - z];

type Cell = { q: number; r: number; x: number; y: number; h: number; ring: number; i: number };

function buildCells(): Cell[] {
  const cells: Cell[] = [];
  for (let q = -N; q <= N; q++) {
    for (let r = -N; r <= N; r++) {
      const s = -q - r;
      if (Math.abs(s) > N) continue;
      const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
      const wobble = ((((q * 5 + r * 3) % 4) + 4) % 4) * 9;
      const h = 14 + (N - ring) * 19 + wobble;
      cells.push({ q, r, x: S * SQ3 * (q + r / 2), y: S * 1.5 * r, h, ring, i: 0 });
    }
  }
  // painter's order: far → near
  cells.sort((a, b) => a.x + a.y - (b.x + b.y));
  cells.forEach((c, i) => (c.i = i));
  return cells;
}

const TOP_LOW = "#322c86";
const TOP_HIGH = "#a679ff";

function Prism({ c }: { c: Cell }) {
  const t = Math.min(1, (c.h - 14) / 100);
  const top = mix(TOP_LOW, TOP_HIGH, t);
  const left = mix("#17144a", "#4426a8", t);
  const right = mix("#201b5e", "#6a3ad8", t);
  const v = hexVerts(c.x, c.y, S * 0.93, 30);
  const topPts = v.map(([x, y]) => proj(x, y, c.h));
  const sides: { p: P[]; fill: string }[] = [];
  for (let k = 0; k < 6; k++) {
    const na = ((60 + 60 * k) * Math.PI) / 180;
    const nx = Math.cos(na);
    const ny = Math.sin(na);
    if (nx + ny <= 0.001) continue; // faces away from the viewer
    const a = v[k];
    const b = v[(k + 1) % 6];
    sides.push({
      p: [proj(a[0], a[1], c.h), proj(b[0], b[1], c.h), proj(b[0], b[1], 0), proj(a[0], a[1], 0)],
      fill: nx - ny > 0 ? right : left,
    });
  }
  return (
    <g className="hs-prism" style={{ ["--i" as string]: c.ring * 6 + (c.i % 6) }}>
      {sides.map((s, i) => (
        <polygon key={i} points={pts(s.p)} fill={s.fill} stroke="#0b0a22" strokeWidth="0.8" strokeLinejoin="round" />
      ))}
      <polygon points={pts(topPts)} fill={top} stroke="#0b0a22" strokeWidth="0.8" strokeLinejoin="round" />
      {c.ring <= 1 && (
        <polygon points={pts(topPts.map(([x, y]) => [x * 0.6 + proj(c.x, c.y, c.h)[0] * 0.4, y * 0.6 + proj(c.x, c.y, c.h)[1] * 0.4] as P))} fill="none" stroke="#d9c9fb" strokeOpacity="0.55" strokeWidth="1" />
      )}
    </g>
  );
}

export function HexSculpture({ className }: { className?: string }) {
  const uid = useId().replace(/:/g, "");
  const cells = useMemo(buildCells, []);

  const frame = useMemo(() => {
    const A = hexVerts(0, 0, FRAME_R, 30);
    const B = hexVerts(0, 0, FRAME_R, 0);
    const X = crossings(A, B);
    const top = (ps: P[]) => ps.map(([x, y]) => proj(x, y, FRAME_Z));
    const base = (ps: P[]) => ps.map(([x, y]) => proj(x, y, 0));
    return {
      topA: pathOf(top(A)),
      topB: pathOf(top(B)),
      baseA: pathOf(base(A)),
      baseB: pathOf(base(B)),
      topX: X.map(([x, y]) => proj(x, y, FRAME_Z)),
      baseX: X.map(([x, y]) => proj(x, y, 0)),
      posts: A.map(([x, y]) => ({ t: proj(x, y, FRAME_Z), b: proj(x, y, 0) })),
      // threads that tie the strand to the pods (loom warp)
      warp: [0, 2, 4].map((k) => {
        const a = A[k];
        return { from: proj(a[0], a[1], FRAME_Z), to: proj(a[0] * 0.42, a[1] * 0.42, 100) };
      }),
    };
  }, []);

  const weave = (d: string, other: string, X: P[], id: string, ga: string, gb: string) => (
    <>
      <path d={d} fill="none" stroke={ga} strokeWidth="6" strokeLinejoin="round" />
      <path d={other} fill="none" stroke="#0b0a22" strokeWidth="13" strokeLinejoin="round" />
      <path d={other} fill="none" stroke={gb} strokeWidth="6" strokeLinejoin="round" />
      {X.map((p, i) => {
        const over = i % 2 === 0 ? d : other;
        const col = i % 2 === 0 ? ga : gb;
        return (
          <g key={i}>
            <clipPath id={`${uid}-${id}-${i}`}>
              <circle cx={p[0]} cy={p[1]} r="9" />
            </clipPath>
            <g clipPath={`url(#${uid}-${id}-${i})`}>
              <path d={over} fill="none" stroke="#0b0a22" strokeWidth="13" strokeLinejoin="round" />
              <path d={over} fill="none" stroke={col} strokeWidth="6" strokeLinejoin="round" />
            </g>
          </g>
        );
      })}
    </>
  );

  return (
    <svg
      className={className}
      viewBox="-300 -350 600 540"
      role="img"
      aria-label="Abstract sculpture: a lattice of hexagonal compute pods inside a loom frame of two interwoven strands."
    >
      <defs>
        <radialGradient id={`${uid}-floor`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#793bed" stopOpacity="0.5" />
          <stop offset="1" stopColor="#793bed" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* floor glow */}
      <ellipse cx="0" cy="8" rx="290" ry="130" fill={`url(#${uid}-floor)`} />

      {/* depth layer 1 — ground strands */}
      <g className="hs-layer hs-layer--base">{weave(frame.baseA, frame.baseB, frame.baseX, "b", "#5a22b8", "#9a6cf4")}</g>

      {/* depth layer 2 — pods */}
      <g className="hs-layer hs-layer--mid">
        {cells.map((c) => (
          <Prism key={`${c.q}.${c.r}`} c={c} />
        ))}
      </g>

      {/* posts + warp threads */}
      <g className="hs-layer hs-layer--mid" stroke="#b99bf8" strokeOpacity="0.55" strokeWidth="1.2">
        {frame.posts.map((p, i) => (
          <line key={i} x1={p.b[0]} y1={p.b[1]} x2={p.t[0]} y2={p.t[1]} />
        ))}
        {frame.warp.map((w, i) => (
          <line key={`w${i}`} x1={w.from[0]} y1={w.from[1]} x2={w.to[0]} y2={w.to[1]} strokeDasharray="2 5" />
        ))}
      </g>

      {/* depth layer 3 — top strands, the nearest plane */}
      <g className="hs-layer hs-layer--top">
        {weave(frame.topA, frame.topB, frame.topX, "t", "#793bed", "#d9c9fb")}
        <path d={frame.topA} pathLength={100} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" className="loom-pulse" />
        <path d={frame.topB} pathLength={100} fill="none" stroke="#793bed" strokeWidth="1.8" strokeLinecap="round" className="loom-pulse" style={{ animationDelay: "-3s" }} />
        {frame.posts.map((p, i) => (
          <g key={i}>
            <circle cx={p.t[0]} cy={p.t[1]} r="8" fill="#0b0a22" />
            <circle cx={p.t[0]} cy={p.t[1]} r="5" fill="#b8860b" />
            <circle cx={p.t[0]} cy={p.t[1]} r="1.8" fill="#0b0a22" />
          </g>
        ))}
      </g>
    </svg>
  );
}
