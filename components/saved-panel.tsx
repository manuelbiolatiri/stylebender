"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { readOutfits, removeOutfit, setCurrentOutfit, type OutfitVersion } from "@/lib/outfit";

export function SavedPanel({ onOpen }: { onOpen: (section: string) => void }) {
  const [items, setItems] = useState<OutfitVersion[]>([]);
  const [filter, setFilter] = useState("All");
  useEffect(() => setItems(readOutfits()), []);
  const occasions = useMemo(() => ["All", ...new Set(items.map((item) => item.context.occasion))], [items]);
  const visible = filter === "All" ? items : items.filter((item) => item.context.occasion === filter);
  function reopen(item: OutfitVersion) {
    setCurrentOutfit(item);
    onOpen("Verdict");
  }
  return (
    <div className="mt-10 max-w-5xl">
      <div className="flex flex-wrap gap-2 mb-6">
        {occasions.map((occasion) => <button key={occasion} onClick={() => setFilter(occasion)} className={`px-3 py-2 text-xs border ${filter === occasion ? "bg-forest text-ivory border-forest" : "border-line text-muted"}`}>{occasion}</button>)}
      </div>
      {visible.length === 0 ? <div className="bg-paper border border-line p-10"><p className="serif text-3xl">No saved looks yet.</p><p className="text-muted mt-3">Generate a live Gemini verdict, then save it here.</p></div> : <div className="grid md:grid-cols-2 gap-4">{visible.map((item) => <article key={item.id} className="bg-paper border border-line p-6"><p className="eyebrow text-bronze">{item.context.occasion} · version {item.version}</p><h2 className="serif text-3xl mt-3">{item.title}</h2><p className="text-muted text-sm leading-6 mt-3">{item.summary}</p><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => reopen(item)} className="bg-forest text-ivory px-4 py-2 text-xs">Reopen <ArrowUpRight className="inline ml-1" size={14} /></button><button onClick={() => { removeOutfit(item.id); setItems(readOutfits()); }} aria-label={`Remove ${item.title}`} className="border border-line px-3 py-2 text-muted"><Trash2 size={15} /></button></div></article>)}</div>}
    </div>
  );
}
