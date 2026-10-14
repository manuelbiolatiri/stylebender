import { describe, expect, it } from "vitest";
import { findCatalogProduct, inferGarmentCategory } from "../lib/products";

describe("catalogue garment matching", () => {
  it("requires garment category and meaningful colour identity", () => {
    expect(findCatalogProduct("Charcoal tailored trousers")?.image).toBe("/demo-wardrobe/charcoal-trousers.png");
    expect(findCatalogProduct("Chocolate-brown blazer")).toBeUndefined();
    expect(findCatalogProduct("Navy trousers")).toBeUndefined();
  });

  it("classifies garments for safe wardrobe matching", () => {
    expect(inferGarmentCategory("Navy hopsack blazer")).toBe("outerwear");
    expect(inferGarmentCategory("Charcoal trousers")).toBe("trousers");
    expect(inferGarmentCategory("Dark brown penny loafers")).toBe("shoes");
  });
});
