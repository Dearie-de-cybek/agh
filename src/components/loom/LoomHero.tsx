import { lazy, Suspense, useCallback, useEffect, useState } from "react";

// three.js is ~150 kB gzip: it loads after first paint, never blocks the headline.
const LoomScene = lazy(() => import("./LoomScene"));

function webgl(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Hero brand object. A pre-rendered frame of the same scene is the instant
 * paint (and the fallback for reduced-motion, Save-Data and no-WebGL); the live
 * WebGL scene fades in over it once it is ready.
 */
export function LoomHero() {
  const [mount, setMount] = useState(false);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduce || saveData || !webgl()) return;
    const go = () => setMount(true);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(go, { timeout: 1800 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(go, 400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className={`loomhero${ready ? " is-live" : ""}`}>
      <img
        className="loomhero__poster"
        src="/brand/loom-poster.webp"
        width="1200"
        height="1100"
        alt="The Computational Loom: a strip-weaving loom whose woven cloth opens into a diamond of compute modules."
        fetchPriority="high"
      />
      {mount && (
        <Suspense fallback={null}>
          <LoomScene onReady={onReady} />
        </Suspense>
      )}
    </div>
  );
}
