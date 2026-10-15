import { describe, expect, it } from "vitest";
import { buildStylistPrompt } from "../lib/stylist-prompt";
import { validateStylistResponse, type StylistResponse } from "../lib/stylist-response";

const liveEnabled = process.env.RUN_LIVE_STYLIST_EVAL === "true";
const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const cases = [
  "A relaxed Friday office",
  "A formal summer wedding in Bath",
  "A rainy gallery opening",
  "A Sunday church service",
  "A smart-casual dinner date",
];

describe.skipIf(!liveEnabled)("optional live stylist qualitative evaluation", () => {
  it.each(cases)("returns a complete response for %s", async (occasion) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("RUN_LIVE_STYLIST_EVAL=true requires GEMINI_API_KEY");
    const prompt = buildStylistPrompt({ occasion, budget: "£150–£300", styles: [], wardrobe: [], request: "Recommend one strong outfit" });
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 1200 } }),
    });
    expect(response.ok).toBe(true);
    const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    expect(text).toBeTruthy();
    const result = JSON.parse(text!) as StylistResponse;
    expect(validateStylistResponse(result)).toBeNull();
  }, 60_000);
});
