import { describe, expect, it } from "vitest";
import { buildStylistPrompt } from "../lib/stylist-prompt";
import { validateStylistResponse, type StylistResponse } from "../lib/stylist-response";

const occasions = ["A relaxed Friday office", "A formal summer wedding in Bath", "A rainy gallery opening", "A Sunday church service", "A smart-casual dinner date"];
const wardrobeStates = [
  [],
  [{ id: "shirt-1", name: "Ivory Oxford shirt", category: "Shirts", colour: "Ivory", material: "Oxford cotton" }],
  [{ id: "blazer-1", name: "Navy hopsack blazer", category: "Outerwear", colour: "Navy", material: "Hopsack wool" }, { id: "shoe-1", name: "Dark brown penny loafers", category: "Shoes", colour: "Dark brown", material: "Leather" }],
];

const goodResponse: StylistResponse = {
  verdict: "Wear",
  title: "The considered evening",
  summary: "A balanced tailored look with a clean, tonal finish.",
  reasons: ["The proportions suit the occasion."],
  pieces: [
    { name: "Navy hopsack blazer", owned: false, note: "Adds structure." },
    { name: "Ivory Oxford shirt", owned: false, note: "Keeps the contrast light." },
    { name: "Charcoal wool trousers", owned: false, note: "Anchors the silhouette." },
    { name: "Dark brown penny loafers", owned: false, note: "Finishes the look." },
  ],
};

describe("mocked recommendation quality regression", () => {
  it("keeps all five varied occasions and three wardrobe states in the prompt contract", () => {
    for (const occasion of occasions) {
      for (const wardrobe of wardrobeStates) {
        const prompt = buildStylistPrompt({
          occasion,
          budget: "£150–£300",
          styles: [],
          wardrobe,
          request: "Recommend one strong outfit",
        });
        expect(prompt).toContain(`occasion: “${occasion}”`);
        expect(prompt).toContain("not confirmed");
        expect(prompt).toContain("sample wardrobe pieces are styling references only");
        expect(prompt).toContain("not specified — do not infer or optimise for weather");
      }
    }
  });

  it("accepts a complete outfit and rejects incomplete, duplicated, or role-incomplete output", () => {
    expect(validateStylistResponse(goodResponse)).toBeNull();
    expect(validateStylistResponse({ ...goodResponse, pieces: goodResponse.pieces.slice(0, 2) })).toContain("three to six");
    expect(validateStylistResponse({ ...goodResponse, pieces: [...goodResponse.pieces, goodResponse.pieces[0]] })).toContain("repeats");
    expect(validateStylistResponse({ ...goodResponse, pieces: goodResponse.pieces.slice(0, 2).concat({ name: "Forest overshirt", owned: false, note: "" }) })).toContain("footwear");
  });
});
