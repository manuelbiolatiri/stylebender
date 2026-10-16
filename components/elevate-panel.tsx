"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, Loader2, Sparkles, Wand2 } from "lucide-react";
import {
  readCurrentOutfit,
  readOutfits,
  saveOutfit,
  setCurrentOutfit,
  type OutfitPiece,
  type OutfitVersion,
} from "@/lib/outfit";
import { findCatalogProduct } from "@/lib/products";
import { getWardrobeMetadata, reconcileGarmentOwnership, resolvePieceVisual } from "@/lib/wardrobe";

const directions = [
  "More polished",
  "More date-ready",
  "More creative",
  "Surprise me",
];

export function ElevatePanel({ onReturnToLook }: { onReturnToLook: () => void }) {
  const [direction, setDirection] = useState(directions[0]);
  const [baseLook, setBaseLook] = useState<OutfitVersion | null>(null);
  const [elevatedLook, setElevatedLook] = useState<OutfitVersion | null>(null);
  const [versions, setVersions] = useState<OutfitVersion[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [adopted, setAdopted] = useState(false);
  const [visuals, setVisuals] = useState<Record<string, { url: string; isUser: boolean }>>({});

  useEffect(() => {
    const current = readCurrentOutfit();
    setBaseLook(current);
    const elevated = readOutfits().filter((item) => item.source === "elevated");
    setVersions(elevated);
    // Avoid comparing an adopted look against itself on entry.
  }, []);

  // Resolve garment photos for all pieces shown
  useEffect(() => {
    const piecesToResolve: OutfitPiece[] = [
      ...(baseLook?.pieces ?? []),
      ...(elevatedLook?.pieces ?? []),
    ];
    if (!piecesToResolve.length) return;

    let active = true;
    async function loadImages() {
      const mapping: Record<string, { url: string; isUser: boolean }> = {};
      for (const piece of piecesToResolve) {
        if (mapping[piece.name]) continue;
        const visual = await resolvePieceVisual(piece.name, piece.wardrobeItemId);
        if (visual) {
          mapping[piece.name] = { url: visual.url, isUser: visual.isUser };
        } else if (piece.product?.image) {
          mapping[piece.name] = { url: piece.product.image, isUser: false };
        }
      }
      if (active) setVisuals((prev) => ({ ...prev, ...mapping }));
    }
    loadImages();
    return () => {
      active = false;
    };
  }, [baseLook, elevatedLook]);

  async function create() {
    const current = baseLook ?? readCurrentOutfit();
    if (!current) return;
    setStatus("loading");
    setErrorMessage(null);
    setAdopted(false);
    setElevatedLook(null);

    try {
      const response = await fetch("/api/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...current.context,
          request: `Create an elevated version study of this outfit for ${current.context.occasion}. Direction: ${direction}. Keep the occasion and primary aesthetic, but upgrade or substitute at least one piece to make it noticeably more ${direction.toLowerCase()}. Current garments: ${current.pieces.map((p) => p.name).join(", ")}.`,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Failed to elevate look.");

      const nextItem: OutfitVersion = {
        ...payload.data,
        pieces: payload.data.pieces.map(
          (piece: { name: string; owned: boolean; note: string }) => {
            const ownership = reconcileGarmentOwnership(piece.name, undefined, getWardrobeMetadata());
            return {
            ...piece,
            owned: ownership.owned,
            ...(ownership.wardrobeItemId ? { wardrobeItemId: ownership.wardrobeItemId } : {}),
            ...(!ownership.owned && findCatalogProduct(piece.name) ? { product: findCatalogProduct(piece.name) } : {}),
            };
          },
        ),
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        source: "elevated",
        direction,
        context: current.context,
        version: current.version + 1,
        priceType: "illustrative",
      };

      setElevatedLook(nextItem);
      // Do not add previews to saved history before adoption.
      setStatus("idle");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Gemini could not create this version.");
      setStatus("error");
    }
  }

  function adoptElevated() {
    if (!elevatedLook) return;
    saveOutfit(elevatedLook);
    setCurrentOutfit(elevatedLook);
    setVersions(readOutfits().filter((item) => item.source === "elevated"));
    setAdopted(true);
  }

  return (
    <div className="mt-8 max-w-5xl">
      {/* Top Banner / Direction Selector */}
      <div className="bg-paper border border-line p-6 lg:p-8">
        <div className="relative h-44 sm:h-52 md:h-64 -mx-6 -mt-6 lg:-mx-8 lg:-mt-8 mb-8 overflow-hidden">
          <Image
            src="/style-evolution-diptych.jpg"
            alt="Two considered outfit directions"
            fill
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest/85 via-forest/40 to-transparent" />
          <span className="absolute bottom-4 left-6 eyebrow text-ivory flex items-center gap-2">
            <Sparkles size={14} className="text-bronze" />
            Elevate / Version Study
          </span>
        </div>

        <p className="uppercase tracking-[.25em] text-[10px] text-bronze font-medium">
          Refine your direction
        </p>
        <h2 className="serif text-3xl md:text-4xl mt-2">Elevate my look.</h2>
        <p className="text-muted mt-3 leading-6 text-sm md:text-base max-w-xl">
          Preview another direction for your current outfit, then compare both options.
          Your current look stays unchanged unless you choose to adopt the alternative.
        </p>

        <div className="grid grid-cols-2 gap-2 mt-6" role="group" aria-label="Choose a styling direction">
          {directions.map((item) => (
            <button key={item} type="button" aria-pressed={direction === item} onClick={() => setDirection(item)}
              className={"w-full min-h-[60px] flex items-center justify-center rounded-xl border px-2 py-3 text-center text-sm leading-5 transition-colors " +
                (direction === item ? "bg-forest text-ivory border-forest font-medium" : "bg-paper border-line text-forest hover:border-forest")}>
              {item}
            </button>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button
            onClick={create}
            disabled={status === "loading" || !baseLook}
            className="bg-forest text-ivory px-6 py-3 text-xs font-medium hover:bg-forest/90 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
          >
            {status === "loading" ? (
              <>
                <Loader2 className="animate-spin" size={14} />
                Preparing preview…
              </>
            ) : (
              <>
                <Wand2 size={14} />
                Preview {direction.toLowerCase()} look
              </>
            )}
          </button>
          <span className="text-xs text-muted">{baseLook ? "Preview only. Nothing is applied or saved yet." : "Create or open a look in My Look first."}</span>
        </div>

        {status === "error" && (
          <p className="text-xs text-red-900 mt-4 bg-red-50 p-3 border border-red-200">
            {errorMessage ?? "Gemini could not create this version. Nothing was saved."}
          </p>
        )}
      </div>

      {/* Before & After Diptych Comparison */}
      {(baseLook || elevatedLook) && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="serif text-2xl">Compare your options</h3>
            {elevatedLook && (
              <span className="text-xs text-bronze uppercase tracking-widest font-mono">
                Study: {elevatedLook.direction ?? direction}
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Card: Before (Base Look) */}
            <div className="bg-paper border border-line p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-line">
                  <span className="uppercase tracking-[.2em] text-[10px] text-muted font-medium">
                    {adopted ? "Original · Previous look" : "Original · Your current look"}
                  </span>
                  <span className="text-xs text-muted">{baseLook?.context.occasion ?? "Verdict"}</span>
                </div>

                <h4 className="serif text-2xl mt-4">{baseLook?.title ?? "Original Look"}</h4>
                <p className="text-muted text-xs leading-5 mt-2">{baseLook?.summary ?? "Initial outfit base."}</p>

                <div className="mt-5 space-y-2.5">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-bronze">Garment Selection</p>
                  {baseLook?.pieces.map((piece) => {
                    const vis = visuals[piece.name];
                    const src = vis?.url ?? piece.product?.image;
                    return (
                      <div key={piece.name} className="flex items-center gap-3 border border-line/70 p-2 bg-ivory/30">
                        {src ? (
                          <img src={src} alt={piece.name} className="w-10 h-10 object-cover shrink-0 border border-line" />
                        ) : (
                          <div className="w-10 h-10 bg-forest/10 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{piece.name}</p>
                          <p className="text-[10px] text-muted truncate">{piece.owned ? "Owned piece" : "Reference"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-line text-xs text-muted">
                {baseLook?.reasons?.[0] ? `“${baseLook.reasons[0]}”` : "Original styling baseline."}
              </div>
            </div>

            {/* Right Card: After (Elevated Look) */}
            <div className="bg-forest text-ivory border border-forest p-6 flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-ivory/20">
                  <span className="uppercase tracking-[.2em] text-[10px] text-bronze font-medium">
                    {adopted ? "Adopted" : "Optional preview"} · {elevatedLook?.direction ?? direction}
                  </span>
                  <span className="text-xs text-ivory/70">{adopted ? `v${elevatedLook?.version ?? ""}` : "Not applied"}</span>
                </div>

                {elevatedLook ? (
                  <>
                    <h4 className="serif text-2xl mt-4 text-ivory">{elevatedLook.title}</h4>
                    <p className="text-ivory/75 text-xs leading-5 mt-2">{elevatedLook.summary}</p>
                    <p className="mt-3 text-xs text-ivory/80 leading-5">{adopted ? "Saved and now your current look." : "This is only a preview. Your original look remains unchanged."}</p>

                    <div className="mt-5 space-y-2.5">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-bronze">Alternative garments</p>
                      {elevatedLook.pieces.map((piece) => {
                        const vis = visuals[piece.name];
                        const src = vis?.url ?? piece.product?.image;
                        const isNewPiece = !baseLook?.pieces.some((bp) => bp.name.toLowerCase() === piece.name.toLowerCase());

                        return (
                          <div
                            key={piece.name}
                            className={`flex items-center gap-3 p-2 border transition-colors ${
                              isNewPiece
                                ? "bg-ivory/15 border-bronze text-ivory"
                                : "bg-forest/50 border-ivory/15 text-ivory/85"
                            }`}
                          >
                            {src ? (
                              <img src={src} alt={piece.name} className="w-10 h-10 object-cover shrink-0 border border-ivory/20" />
                            ) : (
                              <div className="w-10 h-10 bg-ivory/10 shrink-0" />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-medium truncate">{piece.name}</p>
                                {isNewPiece && (
                                  <span className="bg-bronze text-forest text-[9px] font-bold px-1.5 py-0.2 rounded-xs uppercase">
                                    Changed
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-ivory/60 truncate">{piece.note || (piece.owned ? "Owned" : "Reference")}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="py-16 text-center text-ivory/60 text-xs">
                    Choose a direction above and click &ldquo;Preview {direction.toLowerCase()} look&rdquo; to view the elevated comparison.
                  </div>
                )}
              </div>

              {elevatedLook && (
                <div className="mt-6 pt-4 border-t border-ivory/20 space-y-3">
                  {adopted ? (
                    <>
                      <p role="status" className="text-xs text-ivory flex items-center gap-2"><Check size={16} className="text-bronze" /> Your new look has been saved.</p>
                      <button type="button" onClick={onReturnToLook} className="min-h-11 w-full sm:w-auto bg-ivory text-forest px-5 py-3 text-sm font-medium inline-flex items-center justify-center gap-2">View in My Look <ArrowRight size={16} /></button>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-ivory/80 leading-5">Adopting replaces your current My Look and saves this version. Or keep your original unchanged.</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button type="button" onClick={onReturnToLook} className="min-h-[48px] w-full rounded-lg border border-ivory/60 px-2 py-3 text-xs sm:text-sm font-medium text-ivory hover:bg-ivory/10">Keep original</button>
                        <button type="button" onClick={adoptElevated} className="min-h-[48px] w-full rounded-lg bg-ivory px-2 py-3 text-xs sm:text-sm font-medium text-forest hover:bg-ivory/90">Adopt this look</button>
                      </div>
                    </>
                  )}
                  {elevatedLook.reasons?.[0] && <p className="text-xs leading-5 text-ivory/65">{elevatedLook.reasons[0]}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Version History */}
      {versions.length > 0 && (
        <div className="mt-8 bg-paper border border-line p-6">
          <p className="uppercase tracking-[.25em] text-[10px] text-bronze font-medium">
            Previously adopted alternatives ({versions.length})
          </p>
          <div className="divide-y divide-line mt-3">
            {versions.map((ver) => (
              <div
                key={ver.id}
                className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-ivory/40 px-2 transition-colors cursor-pointer"
                onClick={() => { setElevatedLook(ver); setAdopted(readCurrentOutfit()?.id === ver.id); }}
                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setElevatedLook(ver); setAdopted(readCurrentOutfit()?.id === ver.id); } }}
                role="button"
                tabIndex={0}
              >
                <div>
                  <span className="font-medium text-forest">{ver.title}</span>
                  {ver.direction && <span className="text-bronze ml-2 font-mono">[{ver.direction}]</span>}
                </div>
                <span className="text-muted text-[11px]">
                  {new Date(ver.createdAt).toLocaleDateString("en-GB")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
