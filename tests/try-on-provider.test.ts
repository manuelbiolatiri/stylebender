import { describe, expect, it } from "vitest";
import { providerErrorMessage, VIRTUAL_TRYON_PARAMETERS } from "../lib/try-on-provider";

describe("Google virtual try-on request configuration", () => {
  it("uses the provider-supported single-output configuration", () => {
    expect(VIRTUAL_TRYON_PARAMETERS.sampleCount).toBe(1);
    expect(Object.keys(VIRTUAL_TRYON_PARAMETERS)).toEqual(["sampleCount"]);
  });

  it("returns useful safe HTTP diagnostics without exposing provider response bodies", () => {
    expect(providerErrorMessage(400)).toContain("HTTP 400");
    expect(providerErrorMessage(403)).toContain("billing");
    expect(providerErrorMessage(404)).toContain("region");
    expect(providerErrorMessage(429)).toContain("quota");
    expect(providerErrorMessage(502)).toContain("HTTP 502");
  });
});
