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
};

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
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]") as OutfitVersion[];
  } catch {
    return [];
  }
}

export function saveOutfit(outfit: OutfitVersion) {
  localStorage.setItem(SAVED_KEY, JSON.stringify([outfit, ...readOutfits()].slice(0, 20)));
}

export function readCurrentOutfit(): OutfitVersion | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    return raw ? (JSON.parse(raw) as OutfitVersion) : null;
  } catch {
    return null;
  }
}

export function setCurrentOutfit(outfit: OutfitVersion) {
  localStorage.setItem(CURRENT_KEY, JSON.stringify(outfit));
}
