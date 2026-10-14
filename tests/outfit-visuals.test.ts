import { describe, expect, it } from "vitest";
import { normaliseOutfitVisuals, type OutfitVersion } from "../lib/outfit";

const base: OutfitVersion = {
  id: "visual-test",
  createdAt: 1,
  source: "verdict",
  context: { occasion: "Date Night", budget: "£150–£300", styles: [], wardrobe: [], request: "Recommend one strong outfit" },
  verdict: "Wear",
  title: "Test look",
  summary: "Test",
  reasons: [],
  pieces: [
    { name: "Chocolate-brown blazer", owned: false, note: "", product: { id: "old", source: "local-catalog", name: "Old editorial image", image: "/stylebender-hero-campaign.jpg" } },
    { name: "Navy tailored blazer", owned: false, note: "", product: { id: "old-2", source: "local-catalog", name: "Old editorial image", image: "/stylebender-hero-campaign.jpg" } },
  ],
  version: 1,
  priceType: "illustrative",
};

describe("persisted outfit visuals", () => {
  it("removes untrusted old catalogue imagery and replaces confident matches", () => {
    const result = normaliseOutfitVisuals(base);
    expect(result.pieces[0].product).toBeUndefined();
    expect(result.pieces[1].product?.image).toBe("/demo-wardrobe/navy-blazer.png");
  });
});
