"use client";
import { useEffect, useState } from "react";
import { Camera, Check, Edit3, ImagePlus, RotateCcw, Trash2, X } from "lucide-react";
import {
  deleteWardrobeItem,
  deleteWardrobeItems,
  getWardrobeItems,
  getWardrobeMedia,
  saveWardrobeItem,
  updateWardrobeItem,
  type WardrobeItem,
} from "@/lib/wardrobe";
import { demoWardrobe, importDemoWardrobe } from "@/lib/demo-wardrobe";
import { readSelectedSampleWeather, sampleWardrobes, sampleWeatherOptions, selectSampleWeather, type SampleWeather } from "@/lib/sample-wardrobes";

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
const filterOptions = ["All", ...categories];

type Preview = WardrobeItem & { url: string };

export function WardrobePanel() {
  const [items, setItems] = useState<Preview[]>([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [uploadCategory, setUploadCategory] = useState("Tops");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [editingItem, setEditingItem] = useState<Preview | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "Tops",
    colour: "",
    material: "",
  });
  const [sampleWeather, setSampleWeather] = useState<SampleWeather>("Mild");
  const [activeTab, setActiveTab] = useState<"explore" | "mine">("explore");
  const [confirmingSample, setConfirmingSample] = useState<string | null>(null);

  async function refresh() {
    const records = await getWardrobeItems();
    const next: Preview[] = [];
    for (const item of records.filter((record) => record.source !== "demo")) {
      const blob = await getWardrobeMedia(item.id);
      if (blob) next.push({ ...item, url: URL.createObjectURL(blob) });
    }
    setItems(next);
  }

  useEffect(() => {
    setSampleWeather(readSelectedSampleWeather());
    refresh();
    return () => items.forEach((item) => URL.revokeObjectURL(item.url));
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("stylebender-wardrobe-tab");
    if (stored === "mine" || stored === "explore") setActiveTab(stored);
  }, []);

  async function addSamplePiece(item: (typeof sampleWardrobes)[SampleWeather][number]) {
    if (!item.image) {
      setFeedback({ type: "info", message: "This sample accessory has no local photograph. Add your own photo in the wardrobe to make it owned." });
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(item.image);
      if (!response.ok) throw new Error("sample image unavailable");
      await saveWardrobeItem({
        id: crypto.randomUUID(), name: item.name, category: item.category, colour: item.colour,
        material: item.material, createdAt: Date.now(), source: "user",
      }, await response.blob());
      await refresh();
      setFeedback({ type: "success", message: `${item.name} added to your wardrobe.` });
      setConfirmingSample(null);
    } catch {
      setFeedback({ type: "error", message: "Could not add this sample garment to your wardrobe." });
    } finally {
      setBusy(false);
    }
  }

  async function onFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFeedback({ type: "error", message: "Please select an image file (PNG, JPEG, WebP)." });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setFeedback({ type: "error", message: "Image is too large. Please select a photo under 8 MB." });
      return;
    }
    setBusy(true);
    setFeedback({ type: "info", message: "Adding garment to your local wardrobe…" });
    try {
      const rawName = file.name.replace(/\.[^.]+$/, "");
      const item: WardrobeItem = {
        id: crypto.randomUUID(),
        name: rawName,
        category: uploadCategory,
        createdAt: Date.now(),
        source: "user",
      };
      await saveWardrobeItem(item, file);
      await refresh();
      setFeedback({ type: "success", message: "Garment added to your wardrobe. You can rename or edit details anytime." });
    } catch {
      setFeedback({ type: "error", message: "Could not save image to local browser storage." });
    } finally {
      setBusy(false);
    }
  }

  function startEdit(item: Preview) {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      category: item.category,
      colour: item.colour ?? "",
      material: item.material ?? "",
    });
  }

  async function saveEdit() {
    if (!editingItem) return;
    const trimmed = editForm.name.trim();
    if (!trimmed) {
      setFeedback({ type: "error", message: "Garment name cannot be empty." });
      return;
    }
    setBusy(true);
    try {
      const updated: WardrobeItem = {
        ...editingItem,
        name: trimmed,
        category: editForm.category,
        colour: editForm.colour.trim() || undefined,
        material: editForm.material.trim() || undefined,
      };
      await updateWardrobeItem(updated);
      await refresh();
      setEditingItem(null);
      setFeedback({ type: "success", message: "Garment details updated successfully." });
    } catch {
      setFeedback({ type: "error", message: "Failed to update garment details." });
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string, name: string) {
    await deleteWardrobeItem(id);
    setItems((current) => current.filter((item) => item.id !== id));
    setFeedback({ type: "info", message: `Removed "${name}" from your wardrobe.` });
  }

  async function loadDemo() {
    setBusy(true);
    setFeedback({ type: "info", message: "Importing sample wardrobe pieces…" });
    try {
      await importDemoWardrobe();
      await refresh();
      setFeedback({ type: "success", message: `Loaded ${demoWardrobe.length} sample coordinated pieces.` });
    } catch {
      setFeedback({ type: "error", message: "Could not load sample wardrobe pieces." });
    } finally {
      setBusy(false);
    }
  }

  async function resetDemo() {
    setBusy(true);
    try {
      const demoIds = (await getWardrobeItems())
        .filter((item) => item.source === "demo" || item.id.startsWith("demo-"))
        .map((item) => item.id);
      await deleteWardrobeItems(demoIds);
      await refresh();
      setFeedback({ type: "info", message: "Sample wardrobe reset. Your personal uploads remain." });
    } catch {
      setFeedback({ type: "error", message: "Could not reset sample wardrobe." });
    } finally {
      setBusy(false);
    }
  }

  const visibleItems = activeFilter === "All" ? items : items.filter((item) => item.category === activeFilter);

  return (
    <div className="wardrobe-panel mt-5 lg:mt-10 max-w-5xl">
      <div className="mb-5 flex rounded-full border border-line bg-paper p-1 max-w-sm" role="tablist" aria-label="Wardrobe views">
        {(["explore", "mine"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => { setActiveTab(tab); localStorage.setItem("stylebender-wardrobe-tab", tab); }}
            className={`flex-1 rounded-full px-4 py-2.5 text-[11px] uppercase tracking-[.16em] transition-colors ${activeTab === tab ? "bg-forest text-ivory" : "text-muted hover:text-forest"}`}
          >
            {tab === "mine" ? "My Wardrobe" : "Explore"}
          </button>
        ))}
      </div>
      {activeTab === "mine" && <>
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
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex items-center gap-2 text-xs border border-line px-3 py-2 bg-ivory/50">
              <span className="text-muted">Category for upload:</span>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                aria-label="Upload category"
                className="bg-transparent text-forest font-medium focus:outline-none cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <label className="bg-forest text-ivory px-5 py-3 text-xs cursor-pointer text-center hover:bg-forest/90 transition-colors">
              {busy ? (
                "Processing…"
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
        </div>

        {feedback && (
          <div
            className={`mt-4 p-3 text-xs flex justify-between items-center ${
              feedback.type === "error"
                ? "bg-red-50 text-red-900 border border-red-200"
                : feedback.type === "success"
                ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                : "bg-forest/5 text-forest border border-forest/15"
            }`}
          >
            <span>{feedback.message}</span>
            <button
              onClick={() => setFeedback(null)}
              aria-label="Dismiss message"
              className="ml-3 text-muted hover:text-ink"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {process.env.NODE_ENV !== "production" && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
            <button
              onClick={loadDemo}
              disabled={busy}
              className="border border-bronze text-bronze px-4 py-2 text-xs hover:bg-bronze/10 transition-colors"
            >
              <RotateCcw className="inline mr-2" size={14} />
              Load Sample Wardrobe
            </button>
            <button
              onClick={resetDemo}
              disabled={busy}
              className="border border-line text-muted px-4 py-2 text-xs hover:text-forest transition-colors"
            >
              Reset Sample Wardrobe
            </button>
            <span className="text-[11px] text-muted self-center">
              Development fixture · {demoWardrobe.length} coordinated pieces
            </span>
          </div>
        )}

        <div className="mt-7">
          <p className="text-[11px] uppercase tracking-wider text-muted mb-2 font-medium">Browse by category</p>
          <div className="flex gap-2 flex-wrap">
            {filterOptions.map((name) => (
              <button
                key={name}
                onClick={() => setActiveFilter(name)}
                className={
                  "px-3 py-2 text-xs border transition-colors " +
                  (activeFilter === name
                    ? "bg-forest text-ivory border-forest"
                    : "border-line text-muted hover:text-forest")
                }
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>
      </>}

      {activeTab === "explore" && <div className="mt-4 bg-forest text-ivory p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="uppercase tracking-[.25em] text-[10px] text-bronze">Sample wardrobe</p>
            <h2 className="serif text-3xl mt-2">Dress for the conditions.</h2>
            <p className="text-ivory/70 text-sm leading-6 mt-2 max-w-xl">
              Explore a curated weather edit without changing your private wardrobe. Sample pieces guide Gemini as styling references only.
            </p>
          </div>
          <label className="text-xs text-ivory/70">
            Weather condition
            <select
              aria-label="Sample weather condition"
              value={sampleWeather}
              onChange={(event) => {
                const next = event.target.value as SampleWeather;
                setSampleWeather(next);
                selectSampleWeather(next);
              }}
              className="ml-2 bg-ivory text-forest px-3 py-2 text-xs"
            >
              {sampleWeatherOptions.map((weather) => <option key={weather}>{weather}</option>)}
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
          {sampleWardrobes[sampleWeather].map((item) => (
            <article key={item.id} className="bg-ivory/10 border border-ivory/15 p-2 min-w-0">
              <div className="aspect-square bg-ivory/10 overflow-hidden flex items-center justify-center">
                {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : <span className="text-[10px] text-ivory/50 text-center px-2">No local image</span>}
              </div>
              <p className="text-[11px] leading-4 mt-2 line-clamp-2">{item.name}</p>
              <p className="text-[9px] text-bronze mt-1">Sample · {item.category}</p>
              {confirmingSample === item.id ? (
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] text-ivory/75">Do you own this garment?</p>
                  <button type="button" onClick={() => addSamplePiece(item)} disabled={busy} className="text-[10px] border border-ivory px-2 py-1 hover:bg-ivory hover:text-forest disabled:opacity-50">Yes, add it</button>
                  <button type="button" onClick={() => setConfirmingSample(null)} className="ml-1 text-[10px] text-ivory/70 underline">Cancel</button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmingSample(item.id)} disabled={busy || !item.image} className="mt-2 text-[10px] border border-ivory/30 px-2 py-1 hover:bg-ivory hover:text-forest disabled:opacity-50">
                  {item.image ? "I own this" : "Add your own photo"}
                </button>
              )}
            </article>
          ))}
        </div>
      </div>}

      {activeTab === "mine" && editingItem && (
        <div className="mt-4 bg-paper border-2 border-forest p-6 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="uppercase tracking-[.25em] text-[10px] text-bronze">Garment details</p>
              <h3 className="serif text-2xl mt-1">Edit garment</h3>
            </div>
            <button
              onClick={() => setEditingItem(null)}
              aria-label="Cancel editing"
              className="text-muted hover:text-forest p-1"
            >
              <X size={18} />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="aspect-[4/5] bg-forest/5 border border-line overflow-hidden max-h-64">
              <img src={editingItem.url} alt={editingItem.name} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-muted mb-1 font-medium">Garment name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="e.g. Navy hopsack blazer"
                  aria-label="Garment name"
                  className="w-full border border-line bg-transparent px-3 py-2 text-sm focus:border-forest outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-muted mb-1 font-medium">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  aria-label="Category"
                  className="w-full border border-line bg-transparent px-3 py-2 text-sm focus:border-forest outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted mb-1 font-medium">Colour</label>
                  <input
                    type="text"
                    value={editForm.colour}
                    onChange={(e) => setEditForm({ ...editForm, colour: e.target.value })}
                    placeholder="e.g. Forest green"
                    aria-label="Colour"
                    className="w-full border border-line bg-transparent px-3 py-2 text-sm focus:border-forest outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted mb-1 font-medium">Material</label>
                  <input
                    type="text"
                    value={editForm.material}
                    onChange={(e) => setEditForm({ ...editForm, material: e.target.value })}
                    placeholder="e.g. Wool blend"
                    aria-label="Material"
                    className="w-full border border-line bg-transparent px-3 py-2 text-sm focus:border-forest outline-none"
                  />
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={busy}
                  className="bg-forest text-ivory px-5 py-2.5 text-xs font-medium hover:bg-forest/90 transition-colors"
                >
                  <Check className="inline mr-1" size={14} />
                  Save changes
                </button>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="border border-line px-4 py-2.5 text-xs text-muted hover:text-forest transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "mine" && (items.length === 0 ? (
        <div className="border border-dashed border-line p-12 text-center mt-4 bg-paper/50">
          <Camera className="mx-auto text-bronze" size={28} />
          <p className="serif text-2xl mt-4">Nothing in here yet.</p>
          <p className="text-muted text-sm mt-2 max-w-sm mx-auto">
            Upload photos of your favourite shirts, jackets, trousers, or shoes to receive recommendations that prioritize what you already own.
          </p>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="border border-line p-8 text-center mt-4 bg-paper">
          <p className="serif text-xl">No garments in category &ldquo;{activeFilter}&rdquo;</p>
          <p className="text-muted text-xs mt-2">
            Select &ldquo;All&rdquo; to view your full collection or add a piece under this category.
          </p>
          <button
            onClick={() => setActiveFilter("All")}
            className="mt-4 border border-line px-4 py-2 text-xs text-forest hover:border-forest"
          >
            Show all garments
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {visibleItems.map((item) => (
            <article key={item.id} className="bg-paper border border-line flex flex-col justify-between group hover:border-bronze transition-colors">
              <div>
                <div className="relative aspect-[4/5] overflow-hidden bg-forest/5">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-500"
                  />
                  {item.source === "demo" && (
                    <span className="absolute top-2 left-2 bg-paper/90 backdrop-blur-sm text-bronze text-[10px] px-2 py-0.5 border border-line">
                      Demo data
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-forest truncate" title={item.name}>{item.name}</p>
                  <p className="text-[10px] text-muted mt-1">{item.category}</p>
                  {(item.colour || item.material) && (
                    <p className="text-[10px] text-bronze mt-0.5 truncate">
                      {[item.colour, item.material].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
              </div>
              <div className="p-3 pt-0 border-t border-line/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  aria-label={"Edit " + item.name}
                  className="inline-flex items-center gap-1 text-[11px] text-muted hover:text-forest transition-colors py-1"
                >
                  <Edit3 size={13} />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => remove(item.id, item.name)}
                  aria-label={"Remove " + item.name}
                  className="text-muted hover:text-red-800 transition-colors py-1"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ))}
    </div>
  );
}
