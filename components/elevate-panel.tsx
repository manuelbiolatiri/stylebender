"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Check, ChevronRight, Loader2, Sparkles, Wand2 } from "lucide-react";
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

export function ElevatePanel() {
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
    if (elevated.length > 0 && current?.source === "elevated") {
      setElevatedLook(current);
    }
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
      const nextVersions = [nextItem, ...versions].slice(0, 8);
      setVersions(nextVersions);
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
          Keep the considered base, then choose the feeling you want to push further.
          Compare the original verdict with an elevated alternative side by side.
        </p>

        <div className="flex gap-2 flex-wrap mt-6">
          {directions.map((item) => (
            <button
              key={item}
              onClick={() => setDirection(item)}
              className={
                "px-4 py-2 text-xs border transition-colors " +
                (direction === item
                  ? "bg-forest text-ivory border-forest font-medium"
                  : "border-line text-muted hover:border-forest hover:text-forest")
              }
            >
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
                Studying {direction.toLowerCase()}…
              </>
            ) : (
              <>
                <Wand2 size={14} />
                Create {direction.toLowerCase()} version
              </>
            )}
          </button>
          {!baseLook && (
            <span className="text-xs text-muted">Generate or open a verdict first to study an elevated look.</span>
          )}
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
            <h3 className="serif text-2xl">Before &amp; After Comparison</h3>
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
                    Before · Base Look
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
                    After · Elevated ({elevatedLook?.direction ?? direction})
                  </span>
                  <span className="text-xs text-ivory/70">v{elevatedLook?.version ?? (baseLook ? baseLook.version + 1 : 2)}</span>
                </div>

                {elevatedLook ? (
                  <>
                    <h4 className="serif text-2xl mt-4 text-ivory">{elevatedLook.title}</h4>
                    <p className="text-ivory/75 text-xs leading-5 mt-2">{elevatedLook.summary}</p>

                    <div className="mt-5 space-y-2.5">
                      <p className="text-[11px] font-medium uppercase tracking-wider text-bronze">Upgraded Garments</p>
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
                                    Upgraded
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
                    Choose a direction above and click &ldquo;Create {direction.toLowerCase()} version&rdquo; to view the elevated comparison.
                  </div>
                )}
              </div>

              {elevatedLook && (
                <div className="mt-6 pt-4 border-t border-ivory/20 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={adoptElevated}
                    className="bg-ivory text-forest px-4 py-2 text-xs font-medium hover:bg-ivory/90 transition-colors inline-flex items-center gap-1.5"
                  >
                    {adopted ? (
                      <>
                        <Check size={14} className="text-forest" />
                        Adopted as current look
                      </>
                    ) : (
                      <>
                        Adopt this look <ArrowRight size={13} />
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-ivory/60">
                    {elevatedLook.reasons?.[0] ? elevatedLook.reasons[0] : "Elevated styling study."}
                  </span>
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
            Version history ({versions.length})
          </p>
          <div className="divide-y divide-line mt-3">
            {versions.map((ver) => (
              <div
                key={ver.id}
                className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-ivory/40 px-2 transition-colors cursor-pointer"
                onClick={() => setElevatedLook(ver)}
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
