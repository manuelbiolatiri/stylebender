export type OutfitPiece = {
  name: string;
  owned: boolean;
  note: string;
};

export type OutfitContext = {
  occasion: string;
  budget: string;
  styles: string[];
  wardrobe: string[];
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
  pieces: z.array(z.object({ name: z.string(), owned: z.boolean(), note: z.string() })),
  version: z.number().int().positive(),
  priceType: z.enum(["illustrative", "verified"]),
});

export const defaultOutfitContext: OutfitContext = {
  occasion: "Church",
  budget: "£150–£300",
  styles: ["Tailored / elegant", "Quiet luxury", "Smart casual"],
  wardrobe: [],
  request: "Give me one strong look",
};

const SAVED_KEY = "stylebender-saved-outfits";
const CURRENT_KEY = "stylebender-current-outfit";

export function readOutfits(): OutfitVersion[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
    return z.array(outfitSchema).parse(parsed);
  } catch {
    return [];
  }
}

export function saveOutfit(outfit: OutfitVersion) {
  const validated = outfitSchema.parse(outfit);
  localStorage.setItem(SAVED_KEY, JSON.stringify([validated, ...readOutfits().filter((item) => item.id !== validated.id)].slice(0, 20)));
}

export function removeOutfit(id: string) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(readOutfits().filter((item) => item.id !== id)));
}

export function readCurrentOutfit(): OutfitVersion | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? outfitSchema.parse(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function setCurrentOutfit(outfit: OutfitVersion) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(outfitSchema.parse(outfit)));
}
import { z } from "zod";


export function clearCurrentOutfit() {
  localStorage.removeItem(CURRENT_KEY);
}
