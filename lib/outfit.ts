import { z } from "zod";
import { findCatalogProduct } from "./products";
import { getWardrobeMetadata, reconcileGarmentOwnership } from "./wardrobe";

export type ProductReference = {
  id: string;
  source: "local-catalog" | "retailer";
  name: string;
  image: string;
  url?: string;
  retailer?: string;
  price?: { amount: number; currency: string; verified: boolean };
};

export type OutfitPiece = {
  name: string;
  owned: boolean;
  note: string;
  product?: ProductReference;
  userImageUrl?: string;
  wardrobeItemId?: string;
};

export type WardrobeContextItem = {
  id: string;
  name: string;
  category: string;
  colour?: string;
  material?: string;
  sample?: boolean;
};

export type OutfitContext = {
  occasion: string;
  budget: string;
  styles: string[];
  /** String entries keep older saved contexts readable; new requests send metadata objects. */
  wardrobe: Array<string | WardrobeContextItem>;
  request: string;
  weather?: string;
  sampleWardrobe?: WardrobeContextItem[];
};

export type OutfitVersion = {
  id: string;
  createdAt: number;
  source: "verdict" | "elevated";
  direction?: string;
  context: OutfitContext;
  verdict: "Wear" | "Change One Piece" | "Elevate" | "Skip";
  title: string;
  summary: string;
  reasons: string[];
  pieces: OutfitPiece[];
  version: number;
  priceType: "illustrative" | "verified";
};

export const outfitSchema = z.object({
  id: z.string().min(1),
  createdAt: z.number(),
  source: z.enum(["verdict", "elevated"]),
  direction: z.string().optional(),
  context: z.object({
    occasion: z.string(),
    budget: z.string(),
    styles: z.array(z.string()),
    wardrobe: z.array(z.union([
      z.string(),
      z.object({ id: z.string(), name: z.string(), category: z.string(), colour: z.string().optional(), material: z.string().optional() }),
    ])),
    request: z.string(),
    weather: z.string().optional(),
    sampleWardrobe: z.array(z.object({ id: z.string(), name: z.string(), category: z.string(), colour: z.string().optional(), material: z.string().optional(), sample: z.boolean().optional() })).optional(),
  }),
  verdict: z.enum(["Wear", "Change One Piece", "Elevate", "Skip"]),
  title: z.string(),
  summary: z.string(),
  reasons: z.array(z.string()),
  pieces: z.array(z.object({
    name: z.string(),
    owned: z.boolean(),
    note: z.string(),
    product: z.object({
      id: z.string(),
      source: z.enum(["local-catalog", "retailer"]),
      name: z.string(),
      image: z.string(),
      url: z.string().optional(),
      retailer: z.string().optional(),
      price: z.object({ amount: z.number(), currency: z.string(), verified: z.boolean() }).optional(),
    }).optional(),
    userImageUrl: z.string().optional(),
    wardrobeItemId: z.string().optional(),
  })),
  version: z.number().int().positive(),
  priceType: z.enum(["illustrative", "verified"]),
});

export const defaultOutfitContext: OutfitContext = {
  occasion: "",
  budget: "£150–£300",
  styles: ["Tailored / elegant", "Quiet luxury", "Smart casual"],
  wardrobe: [],
  request: "Give me one strong look",
};

export function normaliseOutfitVisuals(outfit: OutfitVersion): OutfitVersion {
  const wardrobe = getWardrobeMetadata();
  return {
    ...outfit,
    pieces: outfit.pieces.map((piece) => {
      const ownership = reconcileGarmentOwnership(piece.name, piece.wardrobeItemId, wardrobe);
      const safePiece = piece.userImageUrl?.startsWith("blob:") ? { ...piece, userImageUrl: undefined } : piece;
      const reconciled = {
        ...safePiece,
        owned: ownership.owned,
        ...(ownership.wardrobeItemId ? { wardrobeItemId: ownership.wardrobeItemId } : { wardrobeItemId: undefined }),
      };
      if (reconciled.product?.source !== "local-catalog") return reconciled;
      const trustedProduct = findCatalogProduct(reconciled.name);
      return trustedProduct
        ? { ...reconciled, product: trustedProduct }
        : { ...reconciled, product: undefined };
    }),
  };
}

export function replaceOutfitPiece(
  original: OutfitPiece[],
  selectedName: string,
  generated: OutfitPiece[],
): OutfitPiece[] {
  const selected = original.find((piece) => piece.name === selectedName);
  if (!selected) return original;
  const replacement = generated.find((piece) =>
    piece.name !== selected.name &&
    // Keep the request scoped to the same garment slot where possible.
    piece.name.toLowerCase().split(/\s+/).some((word) => selected.name.toLowerCase().includes(word)),
  ) ?? generated.find((piece) => piece.name !== selected.name);
  if (!replacement) return original;
  return original.map((piece) => piece.name === selectedName ? replacement : piece);
}

const SAVED_KEY = "stylebender-saved-outfits";
const CURRENT_KEY = "stylebender-current-outfit";

export function readOutfits(): OutfitVersion[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry) => {
      const result = outfitSchema.safeParse(entry);
      return result.success ? [normaliseOutfitVisuals(result.data)] : [];
    });
  } catch {
    return [];
  }
}

export function saveOutfit(outfit: OutfitVersion) {
  const validated = normaliseOutfitVisuals(outfitSchema.parse(outfit));
  localStorage.setItem(SAVED_KEY, JSON.stringify([validated, ...readOutfits().filter((item) => item.id !== validated.id)].slice(0, 20)));
  window.dispatchEvent(new CustomEvent("stylebender-outfits-updated"));
}

export function removeOutfit(id: string) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(readOutfits().filter((item) => item.id !== id)));
  window.dispatchEvent(new CustomEvent("stylebender-outfits-updated"));
}

export function readCurrentOutfit(): OutfitVersion | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? normaliseOutfitVisuals(outfitSchema.parse(JSON.parse(raw))) : null;
  } catch {
    return null;
  }
}

export function setCurrentOutfit(outfit: OutfitVersion) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(normaliseOutfitVisuals(outfitSchema.parse(outfit))));
}
export function clearCurrentOutfit() {
  localStorage.removeItem(CURRENT_KEY);
}
