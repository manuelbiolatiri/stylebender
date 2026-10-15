import { z } from "zod";
import { findCatalogProduct } from "./products";

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
};

export type OutfitContext = {
  occasion: string;
  budget: string;
  styles: string[];
  /** String entries keep older saved contexts readable; new requests send metadata objects. */
  wardrobe: Array<string | WardrobeContextItem>;
  request: string;
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
  context: z.object({ occasion: z.string(), budget: z.string(), styles: z.array(z.string()), wardrobe: z.array(z.string()), request: z.string() }),
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
  return {
    ...outfit,
    pieces: outfit.pieces.map((piece) => {
      if (piece.product?.source !== "local-catalog") return piece;
      const trustedProduct = findCatalogProduct(piece.name);
      return trustedProduct
        ? { ...piece, product: trustedProduct }
        : { ...piece, product: undefined };
    }),
  };
}

const SAVED_KEY = "stylebender-saved-outfits";
const CURRENT_KEY = "stylebender-current-outfit";

export function readOutfits(): OutfitVersion[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
    return z.array(outfitSchema).parse(parsed).map(normaliseOutfitVisuals);
  } catch {
    return [];
  }
}

export function saveOutfit(outfit: OutfitVersion) {
  const validated = normaliseOutfitVisuals(outfitSchema.parse(outfit));
  localStorage.setItem(SAVED_KEY, JSON.stringify([validated, ...readOutfits().filter((item) => item.id !== validated.id)].slice(0, 20)));
}

export function removeOutfit(id: string) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(readOutfits().filter((item) => item.id !== id)));
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
