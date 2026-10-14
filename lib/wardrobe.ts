import { openDB, type DBSchema } from "idb";

export type WardrobeItem = {
  id: string;
  name: string;
  category: string;
  createdAt: number;
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
  }
}
export async function getWardrobeItems() {
  return (await database()).getAll("items");
}
export async function getWardrobeMedia(id: string) {
  return (await database()).get("media", id);
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
