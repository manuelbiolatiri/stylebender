import { describe, expect, it } from "vitest";
import { buildStylistPrompt } from "../lib/stylist-prompt";

const context = (occasion: string, request = "Recommend one strong outfit") => ({
  occasion,
  budget: "£150–£300",
  styles: ["Tailored / elegant"],
  wardrobe: ["Navy blazer"],
  request,
});

describe("stylist prompt", () => {
  it("binds the complete request context to the selected occasion", () => {
    const church = buildStylistPrompt(context("Church"));
    const office = buildStylistPrompt(context("Office Day"));
    expect(church).toContain("occasion: “Church”");
    expect(office).toContain("occasion: “Office Day”");
    expect(church).not.toBe(office);
    expect(church).toContain("Navy blazer");
    expect(church).toContain("£150–£300");
  });

  it("supports explicit alternatives without encouraging random variation", () => {
    const prompt = buildStylistPrompt(context("Date Night", "Generate another fresh look"));
    expect(prompt).toContain("meaningfully different silhouette");
    expect(prompt).toContain("Do not add random variation");
  });
});
