import { afterEach, describe, expect, it, vi } from "vitest";
// The gate runs before authentication; mock it to isolate the paid-call switch.
// Avoid importing NextAuth's server runtime in a Vitest unit environment.
vi.mock("@/auth", () => ({ auth: vi.fn() }));

import { POST } from "../app/api/try-on/route";

describe("virtual try-on paid-provider switch", () => {
  afterEach(() => {
    delete process.env.TRYON_ENABLED;
    delete process.env.TRYON_PAID_CALLS_APPROVED;
    vi.restoreAllMocks();
  });

  it("never calls Google or another provider when the feature is disabled", async () => {
    process.env.TRYON_ENABLED = "false";
    process.env.TRYON_PAID_CALLS_APPROVED = "false";
    const mock = vi.spyOn(globalThis, "fetch");
    const response = await POST(new Request("http://localhost:2000/api/try-on", { method: "POST" }));
    expect(response.status).toBe(503);
    expect(mock).not.toHaveBeenCalled();
    expect((await response.json()).error).toContain("not enabled");
  });
  it("requires a separate owner-approved paid-call switch", async () => {
    process.env.TRYON_ENABLED = "true";
    delete process.env.TRYON_PAID_CALLS_APPROVED;
    const mock = vi.spyOn(globalThis, "fetch");
    const response = await POST(new Request("http://localhost:2000/api/try-on", { method: "POST" }));
    expect(response.status).toBe(503);
    expect(mock).not.toHaveBeenCalled();
  });
});
