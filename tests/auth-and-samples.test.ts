import { describe, expect, it } from "vitest";
import { createPasswordHash, verifyPassword } from "../lib/auth-password";
import { getSampleWardrobeContext, sampleWardrobes } from "../lib/sample-wardrobes";
import { getVerifiedRetailerListings } from "../lib/products";
import { reconcileGarmentOwnership } from "../lib/wardrobe";

describe("MVP auth, sample wardrobes and shopping boundaries", () => {
  it("verifies scrypt password hashes without accepting the wrong password", () => {
    const encoded = createPasswordHash("correct horse battery staple");
    expect(verifyPassword("correct horse battery staple", encoded)).toBe(true);
    expect(verifyPassword("wrong password", encoded)).toBe(false);
    expect(encoded).toMatch(/^scrypt\$16384\$/);
  });

  it("keeps each weather sample collection separate and substantial", () => {
    for (const weather of ["Rainy", "Cold", "Mild", "Hot"] as const) {
      expect(sampleWardrobes[weather].length).toBeGreaterThanOrEqual(8);
      expect(getSampleWardrobeContext(weather).every((item) => item.sample === true)).toBe(true);
    }
    expect(sampleWardrobes.Rainy.some((item) => item.category === "Accessories")).toBe(true);
    expect(sampleWardrobes.Cold.some((item) => item.category === "Outerwear")).toBe(true);
    expect(sampleWardrobes.Hot.some((item) => item.category === "Shoes")).toBe(true);
    expect(sampleWardrobes.Mild[0]?.source).toBe("demo");
    expect(reconcileGarmentOwnership(sampleWardrobes.Mild[0]?.name ?? "", sampleWardrobes.Mild[0]?.id, []).owned).toBe(false);
  });

  it("does not expose fabricated retailer listings", () => {
    expect(getVerifiedRetailerListings("Navy blazer")).toEqual([]);
  });
});
