import { useId } from "react";
import { crossings, hexVerts, pathOf } from "./geometry";

type Props = {
  /** circumradius of each hexagonal strand */
  r?: number;
  colorA: string;
  colorB: string;
  /** background colour, used to cut the "gap" where a strand passes under */
  gap: string;
  width?: number;
  className?: string;
  /** extra concentric pairs, each scaled by this factor */
  rings?: number;
  animate?: boolean;
};

/**
 * Two hexagonal strands, rotated 30° against each other, woven over/under at
 * their twelve crossings — the AGH "loom" knot. The hexagon is the logo's
 * shape; the interlace is strip-cloth weaving. Used large and cropped.
 */
export function Interlace({ r = 200, colorA, colorB, gap, width = 14, className, rings = 1, animate = true }: Props) {
  const uid = useId().replace(/:/g, "");
  const size = r * 1.25;
  const sets = Array.from({ length: rings }, (_, i) => r * (1 - i * 0.34));
  return (
    <svg
      className={className}
      viewBox={`${-size} ${-size} ${size * 2} ${size * 2}`}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {sets.map((rad, ri) => {
        const A = hexVerts(0, 0, rad, 30);
        const B = hexVerts(0, 0, rad, 0);
        const X = crossings(A, B);
        const dA = pathOf(A);
        const dB = pathOf(B);
        const w = width * (1 - ri * 0.28);
        return (
          <g key={ri}>
            <path d={dA} fill="none" stroke={colorA} strokeWidth={w} strokeLinejoin="round" />
            <path d={dB} fill="none" stroke={gap} strokeWidth={w + 8} strokeLinejoin="round" />
            <path d={dB} fill="none" stroke={colorB} strokeWidth={w} strokeLinejoin="round" />
            {X.map((p, i) => {
              const id = `${uid}-${ri}-${i}`;
              const over = i % 2 === 0 ? dA : dB; // alternate: A over, B over, …
              const col = i % 2 === 0 ? colorA : colorB;
              return (
                <g key={i}>
                  <clipPath id={id}>
                    <circle cx={p[0]} cy={p[1]} r={w * 2.2 + 4} />
                  </clipPath>
                  <g clipPath={`url(#${id})`}>
                    <path d={over} fill="none" stroke={gap} strokeWidth={w + 8} strokeLinejoin="round" />
                    <path d={over} fill="none" stroke={col} strokeWidth={w} strokeLinejoin="round" />
                  </g>
                </g>
              );
            })}
            {animate && (
              <path
                d={dA}
                pathLength={100}
                fill="none"
                stroke="#fff"
                strokeOpacity="0.85"
                strokeWidth={w * 0.28}
                strokeLinecap="round"
                className="loom-pulse"
                style={{ animationDelay: `${ri * -2.4}s` }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
