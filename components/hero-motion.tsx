"use client";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
export function HeroMotion() {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (
      !ref.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-reveal",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power2.out" },
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  return <div ref={ref} aria-hidden="true" className="hidden" />;
}
