export type P = [number, number];
export const SQ3 = Math.sqrt(3);

/** Regular hexagon vertices. `rot` 30 ⇒ pointy-top, 0 ⇒ flat-top. */
export function hexVerts(cx: number, cy: number, r: number, rot = 30): P[] {
  return Array.from({ length: 6 }, (_, k) => {
    const a = ((rot + 60 * k) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as P;
  });
}

export const pts = (ps: P[]) => ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

export const pathOf = (ps: P[], close = true) =>
  ps.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + (close ? " Z" : "");

function segIntersect(a: P, b: P, c: P, d: P): P | null {
  const r: P = [b[0] - a[0], b[1] - a[1]];
  const s: P = [d[0] - c[0], d[1] - c[1]];
  const den = r[0] * s[1] - r[1] * s[0];
  if (Math.abs(den) < 1e-9) return null;
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den;
  const u = ((c[0] - a[0]) * r[1] - (c[1] - a[1]) * r[0]) / den;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;
  return [a[0] + t * r[0], a[1] + t * r[1]];
}

/** Crossing points of two closed polygons, ordered by angle around (cx, cy). */
export function crossings(A: P[], B: P[], cx = 0, cy = 0): P[] {
  const out: P[] = [];
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < B.length; j++) {
      const p = segIntersect(A[i], A[(i + 1) % A.length], B[j], B[(j + 1) % B.length]);
      if (p && !out.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.5)) out.push(p);
    }
  }
  return out.sort((p, q) => Math.atan2(p[1] - cy, p[0] - cx) - Math.atan2(q[1] - cy, q[0] - cx));
}

/** Linear mix of two #rrggbb colours. */
export function mix(a: string, b: string, t: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
