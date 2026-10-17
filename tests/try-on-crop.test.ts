import { describe, expect, it } from "vitest";
import { fullCrop, validCrop } from "../lib/try-on-photo";

describe("local try-on crop validation", () => {
  it("allows full-frame and ordinary screenshot crops", () => {
    expect(validCrop(fullCrop)).toBe(true);
    expect(validCrop({ top: 29, right: 4, bottom: 22, left: 4 })).toBe(true);
  });
  it("rejects invalid, inverted and tiny crops", () => {
    expect(validCrop({ top: 50, right: 0, bottom: 40, left: 0 })).toBe(false);
    expect(validCrop({ top: -5, right: 0, bottom: 0, left: 0 })).toBe(false);
    expect(validCrop({ top: Number.NaN, right: 0, bottom: 0, left: 0 })).toBe(false);
  });
});
