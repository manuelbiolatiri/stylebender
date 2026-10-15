"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Check, CheckCircle2, Circle, HelpCircle, PackageCheck, Shirt } from "lucide-react";
import { normaliseOutfitVisuals, readCurrentOutfit, type OutfitPiece } from "@/lib/outfit";
import { resolvePieceVisual } from "@/lib/wardrobe";

export function AchievePanel({ onAddToWardrobe }: { onAddToWardrobe: () => void }) {
  const [pieces, setPieces] = useState<OutfitPiece[]>([]);
  const [visuals, setVisuals] = useState<Record<string, { url: string; isUser: boolean }>>({});

  useEffect(() => {
    const current = readCurrentOutfit();
    if (current?.pieces) {
      setPieces(normaliseOutfitVisuals(current).pieces);
    }
  }, []);

  useEffect(() => {
    if (!pieces.length) return;
    let active = true;
    async function loadVisuals() {
      const mapping: Record<string, { url: string; isUser: boolean }> = {};
      for (const piece of pieces) {
        const visual = await resolvePieceVisual(piece.name);
        if (visual) {
          mapping[piece.name] = { url: visual.url, isUser: visual.isUser };
        } else if (piece.product?.image) {
          mapping[piece.name] = { url: piece.product.image, isUser: false };
        }
      }
      if (active) setVisuals(mapping);
    }
    loadVisuals();
    return () => {
      active = false;
    };
  }, [pieces]);

  const ownedPieces = pieces.filter((p) => p.owned);
  const missingPieces = pieces.filter((p) => !p.owned);

  return (
    <div className="mt-6 md:mt-8 max-w-4xl pb-24 md:pb-0">
      <div className="bg-paper border border-line md:p-8">
        <div className="relative h-36 sm:h-52 md:h-64 overflow-hidden md:-mx-8 md:-mt-8 md:mb-8">
          <Image
            src="/menswear-outfit-flatlay.jpg"
            alt="Editorial flatlay of the recommended outfit"
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/30 to-transparent" />
          <span className="absolute bottom-4 left-6 eyebrow text-ivory">Achieve / Wardrobe Reconciliation</span>
        </div>

        <div className="px-5 py-6 md:px-0 md:py-0">
          <p className="eyebrow text-bronze">Recreate the verdict</p>
          <h2 className="serif text-3xl md:text-5xl mt-2">Achieve this look.</h2>
          <p className="text-muted mt-3 max-w-xl leading-6 text-sm md:text-base">
            Check off what you already own from your collection, and see what you need to complete the outfit.
            Catalog references are for styling inspiration—no retailer prices or inventory are claimed.
          </p>

          {pieces.length === 0 ? (
            <div className="mt-8 border border-line p-8 text-center bg-ivory/30">
              <Shirt className="mx-auto text-bronze" size={28} />
              <p className="serif text-xl mt-3">No active outfit verdict</p>
              <p className="text-muted text-xs mt-1">Return to your verdict to style and load an outfit.</p>
            </div>
          ) : (
            <div className="mt-8 space-y-8">
              {/* Owned Section */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-line">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-800" />
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-forest">
                      Ready to wear ({ownedPieces.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-muted">In your wardrobe</span>
                </div>

                {ownedPieces.length === 0 ? (
                  <p className="text-xs text-muted py-4 italic">No pieces marked as owned yet.</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {ownedPieces.map((piece) => {
                      const vis = visuals[piece.name];
                      const imgSrc = vis?.url ?? piece.product?.image;

                      return (
                        <div
                          key={piece.name}
                          className="w-full text-left flex items-center gap-3 border border-emerald-900/20 bg-emerald-50/30 p-3 transition-colors hover:border-bronze cursor-pointer"
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-forest/5 border border-line">
                            {imgSrc ? (
                              <img src={imgSrc} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="h-full w-full flex items-center justify-center bg-forest/10"><Shirt size={16} /></span>
                            )}
                            {vis?.isUser && (
                              <span className="absolute bottom-0 inset-x-0 bg-forest/80 text-[8px] text-ivory text-center py-0.2">
                                Yours
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-forest truncate">{piece.name}</span>
                            <span className="block text-xs text-muted mt-0.5">
                              {vis?.isUser ? "From your local wardrobe" : "Matched to your profile"}
                            </span>
                            {piece.note && <span className="block text-[11px] text-bronze mt-0.5 truncate">{piece.note}</span>}
                          </div>
                          <span className="w-6 h-6 rounded-full bg-forest border border-forest text-ivory flex items-center justify-center shrink-0">
                            <Check size={14} />
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Missing Section */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-line">
                  <div className="flex items-center gap-2">
                    <Circle size={15} className="text-bronze" />
                    <h3 className="text-xs uppercase tracking-wider font-semibold text-forest">
                      Pieces to acquire ({missingPieces.length})
                    </h3>
                  </div>
                  <span className="text-[11px] text-muted">Styling references</span>
                </div>

                {missingPieces.length === 0 ? (
                  <div className="mt-3 p-4 bg-emerald-50 text-emerald-900 text-xs border border-emerald-200 flex items-center gap-2">
                    <PackageCheck size={16} />
                    <span>You own every piece required for this look! You are ready to step out.</span>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {missingPieces.map((piece) => {
                      const vis = visuals[piece.name];
                      const imgSrc = vis?.url ?? piece.product?.image;

                      return (
                        <div
                          key={piece.name}
                          onClick={onAddToWardrobe}
                          className="w-full text-left flex items-center gap-3 border border-line bg-ivory/20 p-3 transition-colors hover:border-bronze cursor-pointer"
                        >
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden bg-forest/5 border border-line">
                            {imgSrc ? (
                              <img src={imgSrc} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <span className="h-full w-full flex items-center justify-center bg-forest/10"><Shirt size={16} /></span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-forest truncate">{piece.name}</span>
                            <span className="block text-xs text-muted mt-0.5">
                            Not in your wardrobe yet · add it with a local photo
                            </span>
                            {piece.note && <span className="block text-[11px] text-bronze mt-0.5 truncate">{piece.note}</span>}
                          </div>
                          <span className="text-xs border border-line px-2.5 py-1 text-muted hover:text-forest shrink-0">
                            Add to wardrobe
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {pieces.length > 0 && (
            <div className="mt-8 bg-forest text-ivory p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-xs text-ivory/60">Readiness Status</p>
                <p className="serif text-2xl lg:text-3xl mt-1">
                  {missingPieces.length === 0
                    ? "Complete look · Ready to wear"
                    : `${ownedPieces.length} of ${pieces.length} pieces owned (${missingPieces.length} to acquire)`}
                </p>
              </div>
              <span className="text-xs text-ivory/60 sm:text-right">
                Curated references only · No live prices invented
              </span>
            </div>
          )}
        </div>
      </div>

      {pieces.length > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-10 md:hidden">
          <div className="bg-forest text-ivory p-3.5 shadow-xl flex items-center justify-between gap-3 border border-ivory/20">
            <span className="text-xs font-medium">
              {missingPieces.length === 0 ? "Your look is complete." : `${missingPieces.length} piece${missingPieces.length === 1 ? "" : "s"} to acquire`}
            </span>
            <span className="text-xs text-bronze font-mono">
              {ownedPieces.length}/{pieces.length} owned
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
