import { inferGarmentCategory } from "./products";

export type StylistResponsePiece = { name: string; owned: boolean; note: string };
export type StylistResponse = {
  verdict: "Wear" | "Change One Piece" | "Elevate" | "Skip";
  title: string;
  summary: string;
  reasons: string[];
  pieces: StylistResponsePiece[];
};

export function validateStylistResponse(response: StylistResponse) {
  const names = response.pieces.map((piece) => piece.name.trim().toLowerCase());
  if (new Set(names).size !== names.length) return "The recommendation repeats a garment.";
  if (response.pieces.length < 3 || response.pieces.length > 6) return "The recommendation must contain three to six garments.";
  if (!response.title.trim() || !response.summary.trim()) return "The recommendation is missing a title or summary.";
  if (response.reasons.length === 0 || response.reasons.length > 3) return "The recommendation needs one to three reasons.";

  const categories = new Set(response.pieces.map((piece) => inferGarmentCategory(piece.name)));
  const hasTraditionalLook = response.pieces.some((piece) => /agbada|kaftan|traditional|yoruba/i.test(piece.name));
  const hasUpper = categories.has("outerwear") || categories.has("shirt") || categories.has("knitwear") || hasTraditionalLook;
  const hasLower = categories.has("trousers") || hasTraditionalLook;
  const hasShoes = categories.has("shoes");
  if (!hasUpper || !hasLower || !hasShoes) return "The recommendation is missing an upper layer, lower half, or footwear.";
  return null;
}
