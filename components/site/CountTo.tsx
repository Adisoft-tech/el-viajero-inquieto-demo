"use client";

import { useEffect, useRef } from "react";

/** Equivale a animateCounters(): cuenta de 0 al objetivo con easing en 900 ms. */
export function CountTo({ to, decimals = 0, prefix = "" }: { to: number; decimals?: number; prefix?: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = performance.now();
    const dur = 900;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (to * eased).toFixed(decimals);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, decimals, prefix]);
  return <b ref={ref}>0</b>;
}
