import { expect, test } from "@playwright/test";

test("photo selection remains local until a deliberate generation request", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let calls = 0;
  await page.route("**/api/try-on", async (route) => {
    calls++;
    await route.fulfill({
      status: 200,
      contentType: "image/png",
      body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9rfcAAAAASUVORK5CYII=", "base64"),
    });
  });
  await page.goto("/?view=Try%20On");

  const imageBuffer = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 12; canvas.height = 12;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#645548";
    ctx.fillRect(0, 0, 12, 12);
    return canvas.toDataURL("image/png").split(",")[1];
  });
  const fixture = { name: "reference.png", mimeType: "image/png", buffer: Buffer.from(imageBuffer, "base64") };
  await page.getByLabel("Upload your photo").setInputFiles(fixture);
  await expect(page.getByAltText("Your photo selected for try-on")).toBeVisible();
  await page.getByLabel("Upload garment photo").setInputFiles(fixture);
  await expect(page.getByAltText("Garment photo selected for try-on")).toBeVisible();
  expect(calls).toBe(0);

  const button = page.getByRole("button", { name: "Generate virtual try-on" });
  await expect(button).toBeDisabled();
  await page.getByRole("checkbox").check();
  await expect(button).toBeEnabled();
  expect(calls).toBe(0);
  await button.click();
  await expect(page.getByRole("heading", { name: "Your virtual preview" })).toBeVisible();
  expect(calls).toBe(1);
});

test("failed paid endpoint displays error without pretending a preview exists", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 844 });
  await page.route("**/api/try-on", async route => {
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Live virtual try-on is not enabled." }) });
  });
  await page.goto("/?view=Try%20On");
  const b64 = await page.evaluate(() => {
    const c = document.createElement("canvas"); c.width = c.height = 20;
    c.getContext("2d")!.fillRect(0, 0, 20, 20);
    return c.toDataURL("image/png").split(",")[1];
  });
  const file = { name: "test.png", mimeType: "image/png", buffer: Buffer.from(b64, "base64") };
  await page.getByLabel("Upload your photo").setInputFiles(file);
  await page.getByLabel("Upload garment photo").setInputFiles(file);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Generate virtual try-on" }).click();
  await expect(page.getByRole("alert")).toContainText("not enabled");
  await expect(page.getByRole("heading", { name: "Your virtual preview" })).toHaveCount(0);
});

for (const width of [320, 375, 390, 430]) {
  test(`try-on layout does not overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/?view=Try%20On");
    await expect(page.getByRole("button", { name: "Back to My Look" })).toBeVisible();
    await expect(page.getByText("See it on you.")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
