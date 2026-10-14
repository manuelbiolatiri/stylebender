"use client";
import { useState } from "react";
import Image from "next/image";
import { useEffect } from "react";
import { readCurrentOutfit, type OutfitPiece } from "@/lib/outfit";
export function AchievePanel() {
  const [pieces, setPieces] = useState<OutfitPiece[]>([]);
  useEffect(() => setPieces(readCurrentOutfit()?.pieces ?? []), []);
  const [owned, setOwned] = useState<string[]>([]);
  useEffect(() => setOwned(pieces.filter((piece) => piece.owned).map((piece) => piece.name)), [pieces]);
  const toggle = (name: string) =>
    setOwned((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );
  const missingCount = pieces.filter((piece) => !owned.includes(piece.name)).length;
  return (
    <div className="mt-6 md:mt-10 max-w-4xl pb-28 md:pb-0">
      <div className="bg-paper border border-line md:p-8">
        <div className="relative h-36 sm:h-52 md:h-64 overflow-hidden md:-mx-8 md:-mt-8 md:mb-8">
          <Image src="/menswear-outfit-flatlay.jpg" alt="Editorial flatlay of the recommended outfit" fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/70 to-transparent" />
          <span className="absolute bottom-4 left-5 eyebrow text-ivory">Achieve / your look</span>
        </div>
        <div className="px-5 py-6 md:px-0 md:py-0">
        <p className="eyebrow text-bronze">Recreate the verdict</p>
        <h2 className="serif text-4xl md:text-5xl mt-3">Achieve this look.</h2>
        <p className="text-muted mt-4 max-w-xl leading-6 text-sm md:text-base">
          Select what you already own. This is an illustrative styling estimate,
          not live retailer pricing.
        </p>
        <div className="mt-7 space-y-2">
          {pieces.map((piece) => {
            const name = piece.name;
            return (
            <button
              key={name}
              onClick={() => toggle(name)}
              aria-pressed={owned.includes(name)}
              className="w-full text-left flex items-center gap-3 border border-line bg-ivory/40 p-3 md:p-4 transition-colors hover:border-bronze"
            >
              {piece.product ? <Image src={piece.product.image} alt="" width={58} height={58} className="h-14 w-14 shrink-0 object-cover" /> : <span className="h-14 w-14 shrink-0 bg-forest/10" />}
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-5">{name}</span>
                <span className="block text-xs text-muted mt-1">
                  {owned.includes(name)
                    ? "In your wardrobe · ready to wear"
                    : "Missing · catalog reference only"}
                </span>
                <span className="block text-[11px] text-bronze mt-1 truncate">{piece.note}</span>
              </span>
              <span
                className={
                  "w-5 h-5 rounded-full border flex items-center justify-center " +
                  (owned.includes(name)
                    ? "bg-forest border-forest text-ivory"
                    : "border-line")
                }
              >
                {owned.includes(name) && "✓"}
              </span>
            </button>
            );
          })}
        </div>
        {pieces.length === 0 && <p className="mt-8 border border-line p-5 text-sm text-muted">Return to your verdict to load a recommended outfit.</p>}
        <div className="mt-8 bg-forest text-ivory p-5 flex justify-between items-center gap-4">
          <div>
            <p className="text-xs text-ivory/60">Missing garments</p>
            <p className="serif text-3xl mt-1">{missingCount}</p>
          </div>
          <span className="text-xs text-ivory/60">
            No retailer prices are verified here
          </span>
        </div>
        </div>
      </div>
      <div className="fixed bottom-20 left-4 right-4 z-10 md:hidden">
        <div className="bg-forest text-ivory p-3 shadow-xl flex items-center justify-between gap-3">
          <span className="text-xs">{missingCount === 0 ? "Your look is ready." : `${missingCount} piece${missingCount === 1 ? "" : "s"} to find`}</span>
          <span className="text-[11px] text-bronze">{owned.length}/{pieces.length} owned</span>
        </div>
      </div>
    </div>
  );
}
