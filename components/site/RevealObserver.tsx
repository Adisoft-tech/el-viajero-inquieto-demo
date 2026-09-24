"use client";

import { useEffect } from "react";

/** Equivale a setupRevealObserver(): agrega .in-view a los .reveal cuando entran al viewport.
 *  Un MutationObserver detecta los .reveal que aparecen al navegar o filtrar. */
export function RevealObserver() {
  useEffect(() => {
    const reduce = !("IntersectionObserver" in window);
    const io = reduce ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in-view"); io!.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    const seen = new WeakSet<Element>();
    const scan = () => {
      document.querySelectorAll(".reveal:not(.in-view)").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (io) io.observe(el); else el.classList.add("in-view");
      });
    };
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { mo.disconnect(); io?.disconnect(); };
  }, []);
  return null;
}
