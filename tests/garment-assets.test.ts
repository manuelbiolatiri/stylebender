import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { demoWardrobe } from "../lib/demo-wardrobe";
import { localCatalog } from "../lib/products";
import { garmentAssetManifest, getReviewedGarmentImage, isReviewedGarmentImage } from "../lib/garment-assets";
import { sampleWardrobes } from "../lib/sample-wardrobes";

describe("manually reviewed garment asset manifest", () => {
  it("contains a real workspace image for every reviewed entry", () => {
    for (const asset of garmentAssetManifest) {
      expect(existsSync(join(process.cwd(), "public", asset.image.slice(1))), asset.image).toBe(true);
      expect(asset.reviewed).toBe(true);
    }
  });

  it("covers every image referenced by demo, sample, and local catalogue data", () => {
    const referenced = [
      ...demoWardrobe.map((item) => item.image),
      ...localCatalog.map((item) => item.image),
      ...Object.values(sampleWardrobes).flatMap((items) => items.flatMap((item) => item.image ? [item.image] : [])),
    ];
    for (const image of new Set(referenced)) {
      expect(garmentAssetManifest.some((asset) => asset.image === image), image).toBe(true);
    }
  });

  it("repairs a known candidate mismatch instead of trusting the supplied image", () => {
    const wrong = "/demo-wardrobe/navy-blazer.png";
    expect(isReviewedGarmentImage(wrong, "Navy hopsack blazer")).toBe(true);
    expect(getReviewedGarmentImage("Navy hopsack blazer", wrong)).toBe(wrong);
    expect(getReviewedGarmentImage("Navy hopsack blazer", "/demo-wardrobe/white-sneakers.png")).toBe(wrong);
    expect(getReviewedGarmentImage("Uncatalogued purple jacket", "/demo-wardrobe/white-sneakers.png")).toBeUndefined();
  });
});
