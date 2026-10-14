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
      const image = document.querySelector<HTMLElement>(".hero-image");
      if (image) gsap.to(image, { yPercent: 5, scale: 1.06, duration: 8, ease: "sine.inOut", repeat: -1, yoyo: true });
    }, ref);
    return () => ctx.revert();
  }, []);
  return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-[1]">
    <div className="hero-reveal absolute -right-20 top-16 h-64 w-64 rounded-full border border-bronze/30" />
    <div className="hero-reveal absolute right-20 top-32 h-32 w-32 rounded-full border border-ivory/20" />
  </div>;
}
