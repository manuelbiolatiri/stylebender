// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
  normaliseOutfitVisuals,
  outfitSchema,
  readOutfits,
  replaceOutfitPiece,
  type OutfitVersion,
} from "../lib/outfit";
import { reconcileGarmentOwnership, type WardrobeItem } from "../lib/wardrobe";

const wardrobe: WardrobeItem[] = [
  { id: "shirt-1", name: "Ivory Oxford shirt", category: "Shirts", createdAt: 1 },
];

const outfit: OutfitVersion = {
  id: "v1",
  createdAt: 1,
  source: "verdict",
  context: {
    occasion: "Office Day",
    budget: "£150–£300",
    styles: [],
    wardrobe: [{ id: "shirt-1", name: "Ivory Oxford shirt", category: "Shirts" }],
    request: "Give me one strong look",
  },
  verdict: "Wear",
  title: "Office look",
  summary: "A look",
  reasons: [],
  pieces: [
    { name: "Ivory Oxford shirt", wardrobeItemId: "shirt-1", owned: true, note: "" },
    { name: "Navy blazer", owned: true, note: "" },
  ],
  version: 1,
  priceType: "illustrative",
};

describe("outfit lifecycle reliability", () => {
  beforeEach(() => localStorage.clear());

  it("uses stable ids first and never trusts Gemini ownership", () => {
    expect(reconcileGarmentOwnership("Anything", "shirt-1", wardrobe)).toEqual({ owned: true, wardrobeItemId: "shirt-1" });
    expect(reconcileGarmentOwnership("Ivory Oxford shirt", "deleted-id", wardrobe)).toEqual({ owned: false });
    expect(reconcileGarmentOwnership("Ivory Oxford shirt", undefined, wardrobe).owned).toBe(true);
    expect(reconcileGarmentOwnership("Unowned blue shirt", undefined, wardrobe).owned).toBe(false);
  });

  it("preserves every other garment when creating a refined version", () => {
    const next = replaceOutfitPiece(
      outfit.pieces,
      "Ivory Oxford shirt",
      [{ name: "Sky blue Oxford shirt", owned: false, note: "New shirt" }, { name: "Different trousers", owned: false, note: "" }],
    );
    expect(next.map((piece) => piece.name)).toEqual(["Sky blue Oxford shirt", "Navy blazer"]);
  });

  it("accepts metadata wardrobe arrays, drops malformed records, and revalidates ownership", () => {
    expect(outfitSchema.safeParse(outfit).success).toBe(true);
    localStorage.setItem("stylebender-wardrobe-meta", JSON.stringify(wardrobe));
    localStorage.setItem("stylebender-saved-outfits", JSON.stringify([
      outfit,
      { id: "broken", title: "not an outfit" },
    ]));
    const saved = readOutfits();
    expect(saved).toHaveLength(1);
    expect(saved[0]?.pieces[1]?.owned).toBe(false);
    expect(saved[0]?.pieces[1]?.wardrobeItemId).toBeUndefined();
  });

  it("removes temporary object URLs from persisted records", () => {
    const safe = normaliseOutfitVisuals({ ...outfit, pieces: [{ ...outfit.pieces[0], userImageUrl: "blob:http://temporary" }] });
    expect(safe.pieces[0]?.userImageUrl).toBeUndefined();
  });
});
