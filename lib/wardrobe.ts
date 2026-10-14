import { openDB, type DBSchema } from "idb";
import { inferGarmentCategory } from "@/lib/products";

export type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  createdAt: number;
  source?: "user" | "demo";
  colour?: string;
  material?: string;
  styles?: string[];
  occasions?: string[];
};
interface WardrobeDB extends DBSchema {
  items: { key: string; value: WardrobeItem };
  media: { key: string; value: Blob };
}

const database = () =>
  openDB<WardrobeDB>("stylebender-local", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("items"))
        db.createObjectStore("items", { keyPath: "id" });
      if (!db.objectStoreNames.contains("media")) db.createObjectStore("media");
    },
  });
export async function saveWardrobeItem(item: WardrobeItem, media: Blob) {
  const db = await database();
  const tx = db.transaction(["items", "media"], "readwrite");
  await tx.objectStore("items").put(item);
  await tx.objectStore("media").put(media, item.id);
  await tx.done;
  if (typeof window !== "undefined") {
    const current = JSON.parse(localStorage.getItem("stylebender-wardrobe-meta") ?? "[]") as WardrobeItem[];
    localStorage.setItem("stylebender-wardrobe-meta", JSON.stringify([...current.filter((entry) => entry.id !== item.id), item]));
    window.dispatchEvent(new CustomEvent("stylebender-wardrobe-updated"));
  }
}
export async function updateWardrobeItem(item: WardrobeItem, newMedia?: Blob) {
  const db = await database();
  const stores: Array<"items" | "media"> = newMedia ? ["items", "media"] : ["items"];
  const tx = db.transaction(stores, "readwrite");
  await tx.objectStore("items").put(item);
  if (newMedia) {
    await tx.objectStore("media").put(newMedia, item.id);
  }
  await tx.done;
  if (typeof window !== "undefined") {
    const current = JSON.parse(localStorage.getItem("stylebender-wardrobe-meta") ?? "[]") as WardrobeItem[];
    localStorage.setItem("stylebender-wardrobe-meta", JSON.stringify([...current.filter((entry) => entry.id !== item.id), item]));
    window.dispatchEvent(new CustomEvent("stylebender-wardrobe-updated"));
  }
}
export async function getWardrobeItems() {
  return (await database()).getAll("items");
}
export async function getWardrobeMedia(id: string) {
  return (await database()).get("media", id);
}
export async function getWardrobeMediaUrl(id: string): Promise<string | null> {
  const blob = await getWardrobeMedia(id);
  return blob ? URL.createObjectURL(blob) : null;
}
export function findWardrobeMatch(garmentName: string, items?: WardrobeItem[]): WardrobeItem | undefined {
  const list = items ?? getWardrobeMetadata();
  const clean = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
  const target = clean(garmentName);
  const targetWords = target.split(/\s+/).filter((w) => w.length > 2);
  const targetCategory = inferGarmentCategory(garmentName);
  return list.find((item) => {
    const candidate = clean(item.name);
    const candidateCategory = inferGarmentCategory(`${item.category} ${item.name}`);
    if (targetCategory !== "other" && candidateCategory !== "other" && targetCategory !== candidateCategory) return false;
    if (candidate === target) return true;
    if (target.includes(candidate) || candidate.includes(target)) return true;
    const matchCount = targetWords.filter((w) => candidate.includes(w)).length;
    return matchCount >= Math.max(2, Math.ceil(targetWords.length * 0.6));
  });
}
export async function resolvePieceVisual(garmentName: string): Promise<{ url: string; isUser: boolean; item?: WardrobeItem } | null> {
  const match = findWardrobeMatch(garmentName);
  if (match) {
    const url = await getWardrobeMediaUrl(match.id);
    if (url) return { url, isUser: true, item: match };
  }
  return null;
}
export async function deleteWardrobeItem(id: string) {
  const db = await database();
  const tx = db.transaction(["items", "media"], "readwrite");
  await tx.objectStore("items").delete(id);
  await tx.objectStore("media").delete(id);
  await tx.done;
  if (typeof window !== "undefined") {
    const current = JSON.parse(localStorage.getItem("stylebender-wardrobe-meta") ?? "[]") as WardrobeItem[];
    localStorage.setItem("stylebender-wardrobe-meta", JSON.stringify(current.filter((item) => item.id !== id)));
    window.dispatchEvent(new CustomEvent("stylebender-wardrobe-updated"));
  }
}

export async function deleteWardrobeItems(ids: string[]) {
  const db = await database();
  const tx = db.transaction(["items", "media"], "readwrite");
  for (const id of ids) {
    await tx.objectStore("items").delete(id);
    await tx.objectStore("media").delete(id);
  }
  await tx.done;
  if (typeof window !== "undefined") {
    const remove = new Set(ids);
    const current = getWardrobeMetadata().filter((item) => !remove.has(item.id));
    localStorage.setItem("stylebender-wardrobe-meta", JSON.stringify(current));
    window.dispatchEvent(new CustomEvent("stylebender-wardrobe-updated"));
  }
}

export function getWardrobeMetadata(): WardrobeItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("stylebender-wardrobe-meta") ?? "[]") as WardrobeItem[];
  } catch {
    return [];
  }
}
