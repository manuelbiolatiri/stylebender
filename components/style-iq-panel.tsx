"use client";
import { useState } from "react";
import Image from "next/image";
export function StyleIQPanel() {
  const [answer, setAnswer] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  function choose(value: string) {
    setAnswer(value);
    setDone(true);
    localStorage.setItem("stylebender-iq-progress", "1");
  }
  return (
    <div className="mt-10 max-w-3xl bg-paper border border-line p-6 lg:p-8">
      <div className="relative h-44 overflow-hidden -mx-6 -mt-6 lg:-mx-8 lg:-mt-8 mb-8">
        <Image src="/menswear-color-theory.jpg" alt="Folded menswear colour palette" fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
      </div>
      <p className="uppercase tracking-[.25em] text-[10px] text-bronze">
        Style IQ / 01
      </p>
      <h2 className="serif text-4xl mt-3">
        Which pairing feels more considered?
      </h2>
      <p className="text-muted mt-4 leading-6">
        A simple rule: contrast texture before you add more colour.
      </p>
      <div className="grid md:grid-cols-2 gap-3 mt-8">
        {[
          "Forest overshirt · ivory Oxford · charcoal trouser",
          "Black hoodie · black trouser · black trainer",
        ].map((option) => (
          <button
            key={option}
            onClick={() => choose(option)}
            className={
              "text-left border p-5 text-sm leading-6 " +
              (answer === option
                ? "border-forest bg-forest text-ivory"
                : "border-line")
            }
          >
            {option}
          </button>
        ))}
      </div>
      {done && (
        <p className="mt-7 text-sm text-muted">
          {answer?.startsWith("Forest")
            ? "Exactly. Texture and tonal contrast create depth without noise."
            : "A monochrome base can work, but vary texture and proportion to keep it intentional."}
        </p>
      )}
    </div>
  );
}
