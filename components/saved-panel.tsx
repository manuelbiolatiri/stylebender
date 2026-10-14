"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Bookmark, Shirt, Trash2 } from "lucide-react";
import { readOutfits, removeOutfit, setCurrentOutfit, type OutfitVersion } from "@/lib/outfit";

export function SavedPanel({ onOpen }: { onOpen: (item: OutfitVersion) => void }) {
  const [items, setItems] = useState<OutfitVersion[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    setItems(readOutfits());
  }, []);

  const occasions = useMemo(
    () => ["All", ...new Set(items.map((item) => item.context.occasion).filter(Boolean))],
    [items],
  );

  const visible = filter === "All" ? items : items.filter((item) => item.context.occasion === filter);

  function reopen(item: OutfitVersion) {
    setCurrentOutfit(item);
    onOpen(item);
  }

  function handleRemove(id: string) {
    removeOutfit(id);
    setItems(readOutfits());
  }

  return (
    <div className="mt-8 max-w-5xl">
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs text-muted uppercase tracking-wider mr-2 font-medium">Filter by occasion:</span>
        {occasions.map((occasion) => (
          <button
            key={occasion}
            onClick={() => setFilter(occasion)}
            className={`px-3 py-1.5 text-xs border transition-colors ${
              filter === occasion
                ? "bg-forest text-ivory border-forest font-medium"
                : "border-line text-muted hover:text-forest"
            }`}
          >
            {occasion}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="bg-paper border border-line p-10 text-center">
          <Bookmark className="mx-auto text-bronze mb-3" size={28} />
          <h2 className="serif text-3xl">No saved looks yet.</h2>
          <p className="text-muted mt-2 text-sm max-w-sm mx-auto">
            Choose an occasion, generate a styling recommendation, and click &ldquo;Save&rdquo; to build your personal style lookbook.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {visible.map((item) => (
            <article
              key={item.id}
              className="bg-paper border border-line p-6 flex flex-col justify-between hover:border-bronze transition-colors group"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <span className="eyebrow text-bronze">{item.context.occasion || "Custom"} · v{item.version}</span>
                  <span className="text-[11px] text-muted">{new Date(item.createdAt).toLocaleDateString("en-GB")}</span>
                </div>

                <h2 className="serif text-2xl lg:text-3xl mt-4 text-forest">{item.title}</h2>
                <p className="text-muted text-xs leading-5 mt-2 line-clamp-2">{item.summary}</p>

                {item.pieces?.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-line/60">
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {item.pieces.slice(0, 4).map((piece) => (
                        <div key={`image-${piece.name}`} className="aspect-square overflow-hidden bg-forest/5 border border-line" title={piece.name}>
                          {piece.product?.image ? (
                            <img src={piece.product.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-forest/35"><Shirt size={16} /></div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] uppercase tracking-wider text-muted font-medium mb-2">Pieces ({item.pieces.length})</p>
                    <div className="flex flex-wrap gap-1.5">
                      {item.pieces.map((p) => (
                        <span
                          key={p.name}
                          className={`text-[11px] px-2 py-0.5 border ${
                            p.owned ? "bg-emerald-50 text-emerald-900 border-emerald-200" : "bg-ivory/50 text-forest/80 border-line"
                          }`}
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                <button
                  onClick={() => reopen(item)}
                  className="bg-forest text-ivory px-4 py-2 text-xs font-medium hover:bg-forest/90 transition-colors inline-flex items-center gap-1.5"
                >
                  Reopen <ArrowUpRight size={14} />
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  aria-label={`Remove ${item.title}`}
                  className="text-muted hover:text-red-800 transition-colors p-2"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
