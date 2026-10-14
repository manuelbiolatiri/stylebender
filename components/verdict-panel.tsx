"use client";
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Check,
  ChevronRight,
  Loader2,
  RefreshCw,
  Shirt,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  defaultOutfitContext,
  readCurrentOutfit,
  readOutfits,
  removeOutfit,
  saveOutfit,
  setCurrentOutfit,
  type OutfitContext,
  type OutfitPiece,
  type OutfitVersion,
} from "@/lib/outfit";
import { findCatalogProduct } from "@/lib/products";
import { getWardrobeMetadata, resolvePieceVisual } from "@/lib/wardrobe";

export function VerdictPanel({
  onSave,
  onAction,
  context,
  autoGenerate = false,
}: {
  onSave?: () => void;
  onAction: (action: string) => void;
  context?: OutfitContext;
  autoGenerate?: boolean;
}) {
  const outfitContext = context ?? defaultOutfitContext;
  const occasion = outfitContext.occasion || "your occasion";
  const [verdict, setVerdict] = useState<"Wear" | "Change One Piece" | "Elevate" | "Skip">("Wear");
  const [result, setResult] = useState<OutfitVersion | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [swapPieceName, setSwapPieceName] = useState<string | null>(null);
  const [wearConfirmed, setWearConfirmed] = useState(false);
  const [resolvedImages, setResolvedImages] = useState<Record<string, { url: string; isUser: boolean }>>({});

  // Restore current outfit from localStorage on mount or when occasion changes
  useEffect(() => {
    const current = readCurrentOutfit();
    if (current) {
      if (!outfitContext.occasion || current.context.occasion === outfitContext.occasion) {
        setResult(current);
        setVerdict(current.verdict ?? "Wear");
        setStatus("ready");
      }
    }
  }, [outfitContext.occasion]);

  // Resolve user wardrobe photos whenever result pieces change
  useEffect(() => {
    if (!result?.pieces) return;
    let active = true;
    async function loadImages() {
      const mapping: Record<string, { url: string; isUser: boolean }> = {};
      for (const piece of result!.pieces) {
        const visual = await resolvePieceVisual(piece.name);
        if (visual) {
          mapping[piece.name] = { url: visual.url, isUser: visual.isUser };
        } else if (piece.product?.image) {
          mapping[piece.name] = { url: piece.product.image, isUser: false };
        }
      }
      if (active) setResolvedImages(mapping);
    }
    loadImages();
    return () => {
      active = false;
    };
  }, [result]);

  // Handle autoGenerate on arrival
  useEffect(() => {
    if (autoGenerate && status === "idle") {
      generate();
    }
  }, [autoGenerate, status]);

  async function generate(options?: { swapPiece?: string; freshAlternative?: boolean }) {
    setStatus("loading");
    setErrorMessage(null);
    setWearConfirmed(false);

    let requestPrompt = outfitContext.request || "Recommend one strong outfit";
    if (options?.swapPiece && result) {
      const otherPieces = result.pieces.filter((p) => p.name !== options.swapPiece);
      requestPrompt = `Keep this outfit cohesive for ${outfitContext.occasion}, but replace the piece "${options.swapPiece}" with a different alternative garment. Keep the other pieces: ${otherPieces.map((p) => p.name).join(", ")}.`;
    } else if (options?.freshAlternative) {
      requestPrompt = `Generate a completely fresh and distinct styling direction for ${outfitContext.occasion}. Do not repeat the previous silhouette.`;
    }

    const latestWardrobe = getWardrobeMetadata().map((item) => item.name);
    try {
      const response = await fetch("/api/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...outfitContext,
          wardrobe: latestWardrobe.length > 0 ? latestWardrobe : (outfitContext.wardrobe ?? []),
          request: requestPrompt,
        }),
      });

      const payload = await response.json();

      if (response.status === 401 && payload.status === "auth_required") {
        sessionStorage.setItem(
          "stylebender-pending-context",
          JSON.stringify({ ...outfitContext, autoGenerate: true }),
        );
        const callback = "/?view=Verdict";
        window.location.assign(`/sign-in?callbackUrl=${encodeURIComponent(callback)}`);
        return;
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Gemini could not complete this request.");
      }

      const piecesWithProducts = payload.data.pieces.map(
        (piece: { name: string; owned: boolean; note: string }) => ({
          ...piece,
          product: findCatalogProduct(piece.name),
        }),
      );

      const next: OutfitVersion = {
        ...payload.data,
        pieces: piecesWithProducts,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        source: "verdict",
        context: outfitContext,
        version: result && options?.swapPiece ? result.version + 1 : 1,
        priceType: "illustrative",
      };

      setCurrentOutfit(next);
      setResult(next);
      setVerdict(payload.data.verdict ?? "Wear");
      setStatus("ready");
      setSwapPieceName(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Gemini could not complete this request.");
      setStatus("error");
    }
  }

  const isSaved = result ? readOutfits().some((item) => item.id === result.id) : false;

  function toggleSave() {
    if (!result) return;
    if (isSaved) {
      removeOutfit(result.id);
    } else {
      saveOutfit(result);
    }
    if (onSave) onSave();
  }

  function handleVerdictChoice(choice: "Wear" | "Change One Piece" | "Elevate" | "Skip") {
    setVerdict(choice);
    if (choice === "Wear") {
      setWearConfirmed(true);
      if (result) {
        localStorage.setItem("stylebender-active-look", JSON.stringify(result));
      }
    } else if (choice === "Elevate") {
      onAction("Elevate");
    } else if (choice === "Change One Piece") {
      setWearConfirmed(false);
      if (result?.pieces?.length && !swapPieceName) {
        setSwapPieceName(result.pieces[0].name);
      }
    } else if (choice === "Skip") {
      setWearConfirmed(false);
    }
  }

  return (
    <div className="mt-8 grid lg:grid-cols-[1.1fr_.9fr] gap-6 max-w-5xl">
      {/* Left Column: Verdict Hero Card */}
      <div className="bg-forest text-ivory min-h-[460px] p-7 lg:p-10 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <span className="uppercase tracking-[.25em] text-[10px] text-bronze font-medium">
              Style verdict / {occasion}
            </span>
            <Sparkles size={18} className="text-bronze" />
          </div>

          <h2 className="serif text-4xl lg:text-5xl mt-8 leading-tight">
            {result?.title ?? "The considered layer."}
          </h2>

          <p className="text-ivory/70 leading-7 mt-5 max-w-md text-sm lg:text-base">
            {result?.summary ??
              "Your personalized outfit is ready to be styled. Gemini creates a cohesive look matching your occasion, wardrobe, and style preferences."}
          </p>

          {wearConfirmed && (
            <div className="mt-5 bg-ivory/10 border border-ivory/25 px-4 py-3 text-xs text-ivory flex items-center gap-2">
              <Check className="text-bronze shrink-0" size={16} />
              <span>Locked in as your look for {occasion}.</span>
            </div>
          )}

          {verdict === "Skip" && status !== "loading" && (
            <div className="mt-5 bg-ivory/10 border border-ivory/20 p-4 text-xs">
              <p className="text-ivory/80 mb-3">
                Not feeling this direction? Let Stylebender explore a fresh styling angle for {occasion}.
              </p>
              <button
                onClick={() => generate({ freshAlternative: true })}
                className="bg-ivory text-forest px-4 py-2 text-xs font-medium inline-flex items-center gap-2 hover:bg-ivory/90"
              >
                <RefreshCw size={13} />
                Generate fresh alternative
              </button>
            </div>
          )}

          {verdict === "Change One Piece" && result && (
            <div className="mt-5 bg-paper/10 border border-ivory/20 p-4 text-xs">
              <p className="font-medium text-ivory mb-2">Select which piece to change:</p>
              <div className="flex flex-col gap-1.5 mb-3">
                {result.pieces.map((piece) => (
                  <label
                    key={piece.name}
                    className={`flex items-center gap-2.5 p-2 rounded cursor-pointer transition-colors ${
                      swapPieceName === piece.name ? "bg-ivory text-forest font-medium" : "text-ivory/80 hover:bg-ivory/10"
                    }`}
                  >
                    <input
                      type="radio"
                      name="swap-piece"
                      checked={swapPieceName === piece.name}
                      onChange={() => setSwapPieceName(piece.name)}
                      className="sr-only"
                    />
                    <span className="text-xs">{piece.name}</span>
                    <span className="text-[10px] ml-auto opacity-75">{piece.owned ? "Owned" : "Catalog"}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={() => swapPieceName && generate({ swapPiece: swapPieceName })}
                disabled={!swapPieceName || status === "loading"}
                className="w-full bg-ivory text-forest py-2.5 text-xs font-medium hover:bg-ivory/90 transition-colors disabled:opacity-50"
              >
                {status === "loading" ? "Replacing piece…" : `Swap "${swapPieceName ?? "selected piece"}"`}
              </button>
            </div>
          )}
        </div>

        <div className="relative z-10 pt-6">
          <div className="flex items-center gap-3 mb-4 min-h-8">
            {status === "loading" ? (
              <span className="text-xs text-bronze inline-flex items-center">
                <Loader2 className="inline mr-2 animate-spin" size={14} />
                Curating with Gemini…
              </span>
            ) : status === "error" ? (
              <button
                onClick={() => generate()}
                aria-label="Retry Gemini"
                className="border border-bronze text-bronze px-4 py-2 text-xs hover:bg-bronze/10 transition-colors inline-flex items-center"
              >
                <>
                  <RefreshCw className="inline mr-2" size={13} />
                  Retry Gemini
                </>
              </button>
            ) : null}
          </div>

          {status === "error" && (
            <p className="text-xs text-amber-200 mb-4 bg-amber-950/40 p-3 border border-amber-800/40">
              {errorMessage ?? "Gemini is unavailable or returned an error."}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            {(["Wear", "Change One Piece", "Elevate", "Skip"] as const).map((choice) => (
              <button
                key={choice}
                onClick={() => handleVerdictChoice(choice)}
                className={
                  "px-3 py-2 text-xs border transition-colors " +
                  (verdict === choice
                    ? "bg-ivory text-forest border-ivory font-medium"
                    : "border-ivory/30 text-ivory/70 hover:border-ivory/60")
                }
              >
                {verdict === choice && <Check className="inline mr-1" size={13} />}
                {choice}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Garments & Rationale */}
      <div className="bg-paper border border-line p-7 lg:p-10 flex flex-col justify-between">
        <div>
          <p className="uppercase tracking-[.25em] text-[10px] text-bronze font-medium">
            Styling breakdown
          </p>

          <div className="space-y-4 mt-6 text-sm leading-6">
            {(
              result?.reasons ?? [
                "Tonal contrast and textures create visual depth without visual clutter.",
                "Structured tailoring grounds relaxed casual layers for an intentional silhouette.",
                "Curated reference pieces coordinate directly with your preferred aesthetic.",
              ]
            ).map((reason, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <span className="text-bronze text-xs font-mono mt-0.5">0{idx + 1}</span>
                <p className="text-muted text-sm leading-relaxed">{reason}</p>
              </div>
            ))}
          </div>

          {result && (
            <div className="border-t border-line mt-8 pt-6">
              <div className="flex justify-between items-center mb-4">
                <p className="uppercase tracking-[.25em] text-[10px] text-bronze font-medium">
                  Recommended garments
                </p>
                <span className="text-xs text-muted">
                  {result.pieces.filter((p) => p.owned).length}/{result.pieces.length} from wardrobe
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {result.pieces.map((piece) => {
                  const resolved = resolvedImages[piece.name];
                  const imgSrc = resolved?.url ?? piece.product?.image;
                  const isUserImage = resolved?.isUser;

                  return (
                    <div
                      key={piece.name}
                      className="flex gap-3 items-center border border-line p-2.5 bg-ivory/30 hover:border-bronze transition-colors"
                    >
                      <div className="relative w-14 h-14 shrink-0 overflow-hidden bg-forest/5 border border-line">
                        {imgSrc ? (
                          <img src={imgSrc} alt={piece.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-forest/40">
                            <Shirt size={20} />
                          </div>
                        )}
                        {isUserImage && (
                          <span className="absolute bottom-0 inset-x-0 bg-forest/85 text-[8px] text-ivory text-center py-0.5 font-medium">
                            Your photo
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium truncate text-forest" title={piece.name}>
                          {piece.name}
                        </p>
                        <p className="text-[10px] text-muted mt-0.5">
                          {piece.owned ? "From your wardrobe" : "Catalog reference · not a live listing"}
                        </p>
                        {piece.note && (
                          <p className="text-[10px] text-bronze mt-1 truncate" title={piece.note}>
                            {piece.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-line mt-8 pt-6 flex flex-wrap gap-2.5 items-center">
          <button
            disabled={!result}
            onClick={() => onAction("Achieve")}
            className="text-xs border border-line px-3.5 py-2.5 hover:border-forest transition-colors disabled:opacity-40"
          >
            Achieve this look <ArrowUpRight className="inline ml-1" size={14} />
          </button>

          <button
            disabled={!result}
            onClick={() => onAction("Elevate")}
            className="text-xs border border-line px-3.5 py-2.5 hover:border-forest transition-colors disabled:opacity-40"
          >
            Elevate <ArrowUpRight className="inline ml-1" size={14} />
          </button>

          <button
            onClick={() => onAction("Try On")}
            className="text-xs border border-line px-3.5 py-2.5 text-muted hover:text-forest transition-colors"
          >
            Try on (preview) <ArrowUpRight className="inline ml-1" size={14} />
          </button>

          <button
            onClick={toggleSave}
            disabled={!result || status === "error"}
            className={
              "text-xs px-4 py-2.5 font-medium transition-colors ml-auto flex items-center gap-1.5 " +
              (isSaved
                ? "bg-bronze text-ivory"
                : "bg-forest text-ivory hover:bg-forest/90 disabled:opacity-40")
            }
          >
            <Bookmark className="inline" size={14} fill={isSaved ? "currentColor" : "none"} />
            {isSaved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
