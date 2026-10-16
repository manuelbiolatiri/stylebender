import { expect, test, type Page } from "@playwright/test";

const base = {
  id: "elevate-baseline-01",
  createdAt: 1735000000000,
  source: "verdict",
  context: {
    occasion: "A relaxed Sunday church service",
    budget: "£150–£300",
    styles: ["Understated"],
    wardrobe: [],
    request: "Recommend one complete look",
  },
  verdict: "Wear",
  title: "Considered Sunday",
  summary: "A simple, neutral look.",
  reasons: ["Appropriate and comfortable"],
  pieces: [
    { name: "Cream Oxford shirt", owned: false, note: "Clean foundation" },
    { name: "Stone chinos", owned: false, note: "Balanced colour" },
    { name: "Brown penny loafers", owned: false, note: "Classic footwear" },
  ],
  version: 1,
  priceType: "illustrative",
};

async function seed(page: Page) {
  await page.goto("/");
  await page.evaluate((look) => {
    localStorage.setItem("stylebender-current-outfit", JSON.stringify(look));
    localStorage.removeItem("stylebender-saved-outfits");
  }, base);
}

async function mockPreview(page: Page) {
  let requests = 0;
  await page.route("**/api/stylist", async (route) => {
    requests += 1;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "ready",
        data: {
          verdict: "Wear",
          title: "Polished Sunday",
          summary: "A sharper take on the original.",
          reasons: ["Still suitable for the occasion"],
          pieces: [
            { name: "Cream Oxford shirt", owned: false, note: "Original shirt" },
            { name: "Charcoal trousers", owned: false, note: "Refined cut" },
            { name: "Brown penny loafers", owned: false, note: "Original shoes" },
          ],
        },
      }),
    });
  });
  return () => requests;
}

test("preview is optional: generating does not replace or save the original", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seed(page);
  const getRequests = await mockPreview(page);
  await page.goto("/?view=Elevate");

  await expect(page.getByRole("button", { name: "Back to My Look" })).toBeVisible();
  await expect(page.getByRole("button", { name: "More polished" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "More creative" })).toHaveAttribute("aria-pressed", "false");

  await page.getByRole("button", { name: "Preview more polished look" }).click();
  await expect(page.getByRole("heading", { name: "Polished Sunday" })).toBeVisible();
  await expect(page.getByText("Not applied")).toBeVisible();
  await expect(page.getByText(/This is only a preview/)).toBeVisible();
  await expect(page.getByText("Changed", { exact: true })).toBeVisible();
  expect(getRequests()).toBe(1);

  const stored = await page.evaluate(() => ({
    current: JSON.parse(localStorage.getItem("stylebender-current-outfit") ?? "{}"),
    saved: JSON.parse(localStorage.getItem("stylebender-saved-outfits") ?? "[]"),
  }));
  expect(stored.current.id).toBe(base.id);
  expect(stored.saved).toHaveLength(0);

  await page.getByRole("button", { name: "Keep original" }).click();
  await expect(page.getByRole("heading", { name: "My Look" })).toBeVisible();
  expect(getRequests()).toBe(1);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("stylebender-current-outfit") ?? "{}").id)).toBe(base.id);
});

test("adoption is explicit and persists the chosen alternative", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seed(page);
  const getRequests = await mockPreview(page);
  await page.goto("/?view=Elevate");
  await page.getByRole("button", { name: "Preview more polished look" }).click();
  await expect(page.getByText("Not applied")).toBeVisible();

  await page.getByRole("button", { name: "Adopt this look" }).click();
  await expect(page.getByText("Your new look has been saved.")).toBeVisible();
  await expect(page.getByRole("button", { name: "View in My Look" })).toBeVisible();
  const result = await page.evaluate(() => ({
    current: JSON.parse(localStorage.getItem("stylebender-current-outfit") ?? "{}"),
    saved: JSON.parse(localStorage.getItem("stylebender-saved-outfits") ?? "[]"),
  }));
  expect(result.current.title).toBe("Polished Sunday");
  expect(result.current.source).toBe("elevated");
  expect(result.saved[0].id).toBe(result.current.id);
  expect(getRequests()).toBe(1);

  await page.getByRole("button", { name: "View in My Look" }).click();
  await expect(page.getByRole("heading", { name: "My Look" })).toBeVisible();
});

for (const width of [320, 375, 390, 430]) {
  test(`direction buttons stay equal at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await seed(page);
    await page.goto("/?view=Elevate");
    const first = await page.getByRole("button", { name: "More polished" }).boundingBox();
    const second = await page.getByRole("button", { name: "More date-ready" }).boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(Math.abs((first?.width ?? 0) - (second?.width ?? 0))).toBeLessThan(1);
    expect(Math.abs((first?.height ?? 0) - (second?.height ?? 0))).toBeLessThan(1);
    expect(Math.abs((first?.y ?? 0) - (second?.y ?? 0))).toBeLessThan(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
