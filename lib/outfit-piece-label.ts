import type { OutfitPiece, WardrobeContextItem } from "./outfit";

function normaliseName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

/** This label describes ownership, NOT retailer stock or sample ownership. */
export function getOutfitPieceLabel(
  piece: Pick<OutfitPiece, "name" | "owned">,
  sampleWardrobe: Pick<WardrobeContextItem, "name">[] = [],
): "Yours" | "Sample · not owned" | "Missing" {
  if (piece.owned) return "Yours";
  const normalized = normaliseName(piece.name);
  return sampleWardrobe.some((sample) => normaliseName(sample.name) === normalized)
    ? "Sample · not owned"
    : "Missing";
}
