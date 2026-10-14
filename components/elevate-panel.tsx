"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { readCurrentOutfit, readOutfits, saveOutfit, setCurrentOutfit, type OutfitVersion } from "@/lib/outfit";
import { findCatalogProduct } from "@/lib/products";
const directions = [
  "More polished",
  "More date-ready",
  "More creative",
  "Surprise me",
];
export function ElevatePanel() {
  const [direction, setDirection] = useState(directions[0]);
  const [versions, setVersions] = useState<OutfitVersion[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  useEffect(() => {
    setVersions(readOutfits().filter((item) => item.source === "elevated"));
  }, []);
  async function create() {
    const current = readCurrentOutfit();
    if (!current) return;
    setStatus("loading");
    try {
      const response = await fetch("/api/stylist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...current.context, request: `Create a genuinely different outfit from the current look. Direction: ${direction}. Keep the occasion and style signals, but change at least one major garment. Current garments: ${current.pieces.map((piece) => piece.name).join(", ")}.` }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error);
      const nextItem: OutfitVersion = {
        ...payload.data,
        pieces: payload.data.pieces.map((piece: { name: string; owned: boolean; note: string }) => ({ ...piece, product: findCatalogProduct(piece.name) })),
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        source: "elevated",
        direction,
        context: current.context,
        version: current.version + 1,
        priceType: "illustrative",
      };
      const next = [nextItem, ...versions].slice(0, 5);
      setVersions(next);
      saveOutfit(nextItem);
      setCurrentOutfit(nextItem);
      setStatus("idle");
    } catch { setStatus("error"); }
  }
  return (
    <div className="mt-10 max-w-4xl">
      <div className="bg-paper border border-line p-6 lg:p-8">
        <div className="relative h-52 md:h-64 -mx-6 -mt-6 lg:-mx-8 lg:-mt-8 mb-8 overflow-hidden">
          <Image src="/style-evolution-diptych.jpg" alt="Two considered outfit directions" fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/70 to-transparent" />
          <span className="absolute bottom-4 left-5 eyebrow text-ivory">Elevate / version study</span>
        </div>
        <p className="uppercase tracking-[.25em] text-[10px] text-bronze">
          Refine your direction
        </p>
        <h2 className="serif text-4xl mt-3">Elevate my look.</h2>
        <p className="text-muted mt-4 leading-6 max-w-xl">
          Keep the considered base, then choose the feeling you want to push
          further.
        </p>
        <div className="flex gap-2 flex-wrap mt-8">
          {directions.map((item) => (
            <button
              key={item}
              onClick={() => setDirection(item)}
              className={
                "px-4 py-2 text-xs border " +
                (direction === item
                  ? "bg-forest text-ivory border-forest"
                  : "border-line text-muted")
              }
            >
              {item}
            </button>
          ))}
        </div>
        <button
          onClick={create}
          className="mt-8 bg-forest text-ivory px-5 py-3 text-xs"
        >
          {status === "loading" ? "Generating with Gemini…" : "Create a different version"}
        </button>
        {status === "error" && <p className="text-sm text-red-900 mt-4">Gemini could not create this version. Nothing was saved.</p>}
      </div>
      {versions.length > 0 && (
        <div className="mt-4 bg-paper border border-line p-6">
          <p className="uppercase tracking-[.25em] text-[10px] text-bronze">
            Version history
          </p>
          {versions.map((version) => (
            <p key={version.id} className="border-b border-line py-3 text-sm">
              {version.title} · {new Date(version.createdAt).toLocaleDateString("en-GB")}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
