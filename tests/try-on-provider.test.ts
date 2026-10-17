import { describe, expect, it } from "vitest";
import { providerErrorMessage, VIRTUAL_TRYON_PARAMETERS } from "../lib/try-on-provider";

describe("Google virtual try-on request configuration", () => {
  it("uses the documented adult-generation enum and a single output", () => {
    expect(VIRTUAL_TRYON_PARAMETERS.personGeneration).toBe("allow-adult");
    expect(VIRTUAL_TRYON_PARAMETERS.sampleCount).toBe(1);
    expect(VIRTUAL_TRYON_PARAMETERS.outputOptions.mimeType).toBe("image/jpeg");
  });

  it("returns useful safe HTTP diagnostics without exposing provider response bodies", () => {
    expect(providerErrorMessage(400)).toContain("HTTP 400");
    expect(providerErrorMessage(403)).toContain("billing");
    expect(providerErrorMessage(404)).toContain("region");
    expect(providerErrorMessage(429)).toContain("quota");
    expect(providerErrorMessage(502)).toContain("HTTP 502");
  });
});
