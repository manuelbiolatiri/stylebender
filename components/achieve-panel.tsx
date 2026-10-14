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
  const total = pieces.filter((piece) => !owned.includes(piece.name)).length * 75;
  return (
    <div className="mt-10 max-w-4xl">
      <div className="bg-paper border border-line p-6 lg:p-8">
        <div className="relative h-52 md:h-64 -mx-6 -mt-6 lg:-mx-8 lg:-mt-8 mb-8 overflow-hidden">
          <Image src="/menswear-outfit-flatlay.jpg" alt="Editorial flatlay of the recommended outfit" fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/70 to-transparent" />
          <span className="absolute bottom-4 left-5 eyebrow text-ivory">Achieve / the considered layer</span>
        </div>
        <p className="uppercase tracking-[.25em] text-[10px] text-bronze">
          Recreate the verdict
        </p>
        <h2 className="serif text-4xl mt-3">Achieve this look.</h2>
        <p className="text-muted mt-4 max-w-xl leading-6">
          Select what you already own. This is an illustrative styling estimate,
          not live retailer pricing.
        </p>
        <div className="mt-8 space-y-3">
          {pieces.map((piece) => {
            const name = piece.name;
            return (
            <button
              key={name}
              onClick={() => toggle(name)}
              className="w-full text-left flex items-center justify-between border-b border-line py-4"
            >
              <span>
                <span className="text-sm">{name}</span>
                <span className="block text-xs text-muted mt-1">
                  {owned.includes(name)
                    ? "In your wardrobe · £0 incremental"
                    : "Illustrative alternative · price not verified"}
                </span>
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
        <div className="mt-8 bg-forest text-ivory p-5 flex justify-between items-center">
          <div>
            <p className="text-xs text-ivory/60">Estimated incremental spend</p>
            <p className="serif text-3xl mt-1">£{total}</p>
          </div>
          <span className="text-xs text-ivory/60">
            Owned pieces count as £0
          </span>
        </div>
      </div>
    </div>
  );
}
