"use client";
import { useEffect, useState } from "react";
import { Camera, ImagePlus, RotateCcw, Trash2 } from "lucide-react";
import {
  deleteWardrobeItem,
  deleteWardrobeItems,
  getWardrobeItems,
  getWardrobeMedia,
  saveWardrobeItem,
  type WardrobeItem,
} from "@/lib/wardrobe";
import { demoWardrobe, importDemoWardrobe } from "@/lib/demo-wardrobe";

const categories = [
  "Tops",
  "Shirts",
  "Trousers",
  "Knitwear",
  "Outerwear",
  "Shoes",
  "Accessories",
  "Yoruba attire",
];
type Preview = WardrobeItem & { url: string };

export function WardrobePanel() {
  const [items, setItems] = useState<Preview[]>([]);
  const [category, setCategory] = useState("Tops");
  const [busy, setBusy] = useState(false);
  async function refresh() {
    const records = await getWardrobeItems();
    const next: Preview[] = [];
    for (const item of records) {
      const blob = await getWardrobeMedia(item.id);
      if (blob) next.push({ ...item, url: URL.createObjectURL(blob) });
    }
    setItems(next);
  }
  useEffect(() => {
    refresh();
    return () => items.forEach((item) => URL.revokeObjectURL(item.url));
  }, []);
  async function onFile(file?: File) {
    if (!file || !file.type.startsWith("image/") || file.size > 8 * 1024 * 1024)
      return;
    setBusy(true);
    const item = {
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^.]+$/, ""),
      category,
      createdAt: Date.now(),
    };
    await saveWardrobeItem(item, file);
    await refresh();
    setBusy(false);
  }
  async function remove(id: string) {
    await deleteWardrobeItem(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }
  async function loadDemo() {
    setBusy(true);
    await importDemoWardrobe();
    await refresh();
    setBusy(false);
  }
  async function resetDemo() {
    setBusy(true);
    const demoIds = (await getWardrobeItems()).filter((item) => item.source === "demo" || item.id.startsWith("demo-")).map((item) => item.id);
    await deleteWardrobeItems(demoIds);
    await refresh();
    setBusy(false);
  }
  return (
    <div className="mt-10 max-w-5xl">
      <div className="bg-paper border border-line p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <p className="uppercase tracking-[.25em] text-[10px] text-bronze">
              Private by default
            </p>
            <h2 className="serif text-3xl mt-3">Build your wardrobe</h2>
            <p className="text-muted text-sm mt-3 max-w-md leading-6">
              Photos are stored in this browser only. Nothing is sent to an AI
              provider when you add a piece.
            </p>
          </div>
          <label className="bg-forest text-ivory px-5 py-3 text-xs cursor-pointer w-fit">
            {busy ? (
              "Saving…"
            ) : (
              <>
                <ImagePlus className="inline mr-2" size={15} />
                Add a piece
                <input
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={(event) => onFile(event.target.files?.[0])}
                />
              </>
            )}
          </label>
        </div>
        {process.env.NODE_ENV !== "production" && <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
          <button onClick={loadDemo} disabled={busy} className="border border-bronze text-bronze px-4 py-2 text-xs"><RotateCcw className="inline mr-2" size={14} />Load Sample Wardrobe</button>
          <button onClick={resetDemo} disabled={busy} className="border border-line text-muted px-4 py-2 text-xs">Reset Sample Wardrobe</button>
          <span className="text-[11px] text-muted self-center">Development fixture · {demoWardrobe.length} coordinated pieces</span>
        </div>}
        <div className="flex gap-2 flex-wrap mt-7">
          {categories.map((name) => (
            <button
              key={name}
              onClick={() => setCategory(name)}
              className={
                "px-3 py-2 text-xs border " +
                (category === name
                  ? "bg-forest text-ivory border-forest"
                  : "border-line text-muted")
              }
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      {items.length === 0 ? (
        <div className="border border-dashed border-line p-12 text-center mt-4">
          <Camera className="mx-auto text-bronze" size={25} />
          <p className="serif text-2xl mt-4">Nothing in here yet.</p>
          <p className="text-muted text-sm mt-2">
            Start with a favourite shirt, shoe, or full outfit.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {items.map((item) => (
            <article key={item.id} className="bg-paper border border-line">
              <img
                src={item.url}
                alt={item.name}
                className="w-full aspect-[4/5] object-cover"
              />
              <div className="p-3">
                <p className="text-xs truncate">{item.name}</p>
                <p className="text-[10px] text-muted mt-1">{item.category}</p>
                {item.source === "demo" && <p className="text-[10px] text-bronze mt-1">Demo data</p>}
                <button
                  onClick={() => remove(item.id)}
                  aria-label={"Remove " + item.name}
                  className="text-muted mt-3"
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
