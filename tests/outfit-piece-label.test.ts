import { describe, expect, it } from "vitest";
import { getOutfitPieceLabel } from "../lib/outfit-piece-label";

describe("My Look ownership labels", () => {
  const samples = [{ name: "Ivory Oxford shirt" }];
  it("identifies garments confirmed in the personal wardrobe", () => {
    expect(getOutfitPieceLabel({ name: "Ivory Oxford shirt", owned: true }, samples)).toBe("Yours");
  });
  it("never implies a curated sample is owned", () => {
    expect(getOutfitPieceLabel({ name: "IVORY oxford shirt", owned: false }, samples)).toBe("Sample · not owned");
  });
  it("marks unowned non-samples missing", () => {
    expect(getOutfitPieceLabel({ name: "Dark brown penny loafers", owned: false }, samples)).toBe("Missing");
  });
});
