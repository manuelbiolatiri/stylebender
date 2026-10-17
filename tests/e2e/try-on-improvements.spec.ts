import { expect, test, type Page } from "@playwright/test";

const pixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9rfcAAAAASUVORK5CYII=", "base64");
async function fixture(page: Page, width = 24, height = 24) {
  const data = await page.evaluate(({ width, height }) => {
    const canvas = document.createElement("canvas");
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#3460a1"; ctx.fillRect(0, 0, width, height);
    return canvas.toDataURL("image/png").split(",")[1];
  }, { width, height });
  return { name: "reference.png", mimeType: "image/png", buffer: Buffer.from(data, "base64") };
}
async function stubTryOn(page: Page) {
  let calls = 0;
  await page.route("**/api/try-on", async (route) => {
    calls++;
    await route.fulfill({ status: 200, contentType: "image/png", body: pixel });
  });
  return () => calls;
}

test("tall shopping screenshot can be cropped locally without calling a paid API", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const getCalls = await stubTryOn(page);
  await page.goto("/?view=Try%20On");
  await page.getByLabel("Upload garment photo").setInputFiles(await fixture(page, 120, 300));
  await expect(page.getByText("Crop your garment")).toBeVisible();
  await expect(page.getByRole("button", { name: "Generate virtual try-on" })).toBeDisabled();
  await page.getByRole("slider", { name: "Trim top" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText("1%", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Use this crop" }).click();
  await expect(page.getByAltText("Garment photo selected for try-on")).toBeVisible();
  expect(getCalls()).toBe(0);
});

test("swipe comparison and text-only Gemini styling check from My Look", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(() => localStorage.setItem("stylebender-current-outfit", JSON.stringify({
    id: "local-current-1", createdAt: Date.now(), source: "verdict",
    context: { occasion: "Smart-casual date", budget: "£150–£300", styles: [], wardrobe: [], request: "One look" },
    verdict: "Wear", title: "Date night", summary: "A modern relaxed look", reasons: ["Tonal"],
    pieces: [
      { name: "Ivory Oxford shirt", owned: false, note: "Shirt", product: { id: "local-ivory-shirt", source: "local-catalog", name: "Ivory Oxford shirt", image: "/demo-wardrobe/ivory-oxford.png" } },
      { name: "Charcoal tailored trousers", owned: false, note: "Trousers" },
      { name: "Dark brown penny loafers", owned: false, note: "Shoes" },
    ], version: 1, priceType: "illustrative",
  })));
  const getCalls = await stubTryOn(page);
  let assessmentBody: Record<string, unknown> | undefined;
  await page.route("**/api/try-on-assess", async (route) => {
    assessmentBody = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
      assessment: { verdict: "works", headline: "Relaxed but refined", explanation: "The Oxford shirt balances the trousers and loafers.", practicalTip: "Keep the shirt untucked only if the hem is short." },
    }) });
  });
  await page.goto("/?view=Try%20On");
  await page.getByRole("combobox", { name: "Choose a garment from My Look" }).selectOption("Ivory Oxford shirt");
  await expect(page.getByAltText("Garment photo selected for try-on")).toBeVisible();
  await page.getByLabel("Upload your photo").setInputFiles(await fixture(page));
  await expect(page.getByRole("button", { name: "Generate virtual try-on" })).toBeDisabled();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Generate virtual try-on" }).click();
  await expect(page.getByRole("heading", { name: "Your virtual preview" })).toBeVisible();
  await expect(page.getByAltText("Before: original person photo")).toBeVisible();
  await expect(page.getByAltText("After: AI-generated garment try-on")).toBeVisible();
  const slider = page.getByRole("slider", { name: "Before and after comparison" });
  await expect(slider).toHaveValue("50");
  await slider.focus();
  await page.keyboard.press("End");
  await expect(slider).toHaveValue("100");
  expect(getCalls()).toBe(1);

  await page.getByRole("button", { name: "Get styling assessment (Gemini)" }).click();
  await expect(page.getByText("Relaxed but refined")).toBeVisible();
  expect(assessmentBody?.occasion).toBe("Smart-casual date");
  expect(assessmentBody?.selectedGarment).toBe("Ivory Oxford shirt");
  expect(assessmentBody).not.toHaveProperty("photo");
  expect(assessmentBody).not.toHaveProperty("image");
});

test("Wardrobe garment entry opens try-on with its locally stored image", async ({ page }) => {
  await page.goto("/?view=Wardrobe");
  await page.evaluate(async () => {
    const open = indexedDB.open("stylebender-local", 1);
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      open.onupgradeneeded = () => {
        const database = open.result;
        if (!database.objectStoreNames.contains("items")) database.createObjectStore("items", { keyPath: "id" });
        if (!database.objectStoreNames.contains("media")) database.createObjectStore("media");
      };
      open.onsuccess = () => resolve(open.result);
      open.onerror = () => reject(open.error);
    });
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 24;
    canvas.getContext("2d")!.fillRect(0, 0, 24, 24);
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((v) => resolve(v!), "image/png"));
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(["items", "media"], "readwrite");
      tx.objectStore("items").put({ id: "my-shirt-123", name: "My olive overshirt", category: "Outerwear", createdAt: Date.now(), source: "user" });
      tx.objectStore("media").put(blob, "my-shirt-123");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    localStorage.setItem("stylebender-wardrobe-meta", JSON.stringify([{ id: "my-shirt-123", name: "My olive overshirt", category: "Outerwear", createdAt: Date.now(), source: "user" }]));
    db.close();
  });
  await page.reload();
  await expect(page.getByRole("button", { name: "Try on My olive overshirt" })).toBeVisible();
  await page.getByRole("button", { name: "Try on My olive overshirt" }).click();
  await expect(page.getByRole("heading", { name: "Try On" })).toBeVisible();
  await expect(page.getByAltText("Garment photo selected for try-on")).toBeVisible();
  await expect(page.getByLabel("What garment is it?")).toHaveValue("My olive overshirt");
});

for (const width of [320, 375, 390, 430]) {
  test(`try-on crop and comparison remain within the mobile scroll region at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const getCalls = await stubTryOn(page);
    await page.goto("/?view=Try%20On");
    await page.getByLabel("Upload garment photo").setInputFiles(await fixture(page));
    await page.getByLabel("Upload your photo").setInputFiles(await fixture(page));
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Generate virtual try-on" }).click();
    await expect(page.getByRole("slider", { name: "Before and after comparison" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const scroll = page.locator(".mobile-screen-scroll");
    await scroll.evaluate((element) => { element.scrollTop = element.scrollHeight; });
    const clearBox = await page.getByRole("button", { name: "Clear preview" }).boundingBox();
    const navBox = await page.locator(".mobile-bottom-nav").boundingBox();
    expect(clearBox).not.toBeNull();
    expect(navBox).not.toBeNull();
    expect((clearBox?.y ?? 0) + (clearBox?.height ?? 0)).toBeLessThanOrEqual((navBox?.y ?? 0) + 1);
    expect(getCalls()).toBe(1);
  });
}
