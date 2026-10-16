import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

test("speaking fills the occasion field but does not generate automatically", async ({ page }) => {
  await page.addInitScript(() => {
    class FakeSpeechRecognition {
      lang = "";
      continuous = false;
      interimResults = false;
      onresult: ((event: { results: Array<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null = null;
      onerror: ((event: { error: string }) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        window.setTimeout(() => {
          this.onresult?.({ results: [{ isFinal: true, 0: { transcript: "a dinner date in Manchester on a chilly evening" } }] });
          this.onend?.();
        }, 40);
      }
      stop() { this.onend?.(); }
      abort() { /* no-op */ }
    }
    Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: FakeSpeechRecognition });
    Object.defineProperty(window, "webkitSpeechRecognition", { configurable: true, value: FakeSpeechRecognition });
  });

  let generatedRequests = 0;
  await page.route("**/api/stylist", async (route) => {
    generatedRequests++;
    await route.fulfill({ status: 500, body: "Unexpected stylist request" });
  });

  await page.goto("/?view=Discover");
  const field = page.getByRole("textbox", { name: "Describe your occasion" });
  await page.getByRole("button", { name: "Speak your occasion" }).click();
  await expect(field).toHaveValue("a dinner date in Manchester on a chilly evening");
  await expect(page.getByRole("button", { name: "Speak your occasion" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Style my look" })).toBeVisible();
  expect(generatedRequests).toBe(0);

  // Transcripts should remain editable, and typing is never replaced by a new recording.
  await field.fill("An office presentation in London");
  await expect(field).toHaveValue("An office presentation in London");
});

test("microphone permission errors leave manual typing usable", async ({ page }) => {
  await page.addInitScript(() => {
    class DeniedRecognition {
      lang = "";
      continuous = false;
      interimResults = false;
      onresult = null;
      onerror: ((event: { error: string }) => void) | null = null;
      onend: (() => void) | null = null;
      start() {
        window.setTimeout(() => {
          this.onerror?.({ error: "not-allowed" });
          this.onend?.();
        }, 20);
      }
      stop() { this.onend?.(); }
      abort() { /* no-op */ }
    }
    Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: DeniedRecognition });
    Object.defineProperty(window, "webkitSpeechRecognition", { configurable: true, value: DeniedRecognition });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Speak your occasion" }).click();
  await expect(page.getByRole("status")).toContainText("Microphone permission denied");
  const field = page.getByRole("textbox", { name: "Describe your occasion" });
  await field.fill("A Saturday gallery opening");
  await expect(field).toHaveValue("A Saturday gallery opening");
});

test("typing remains available without speech support", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "SpeechRecognition", { configurable: true, value: undefined });
    Object.defineProperty(window, "webkitSpeechRecognition", { configurable: true, value: undefined });
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Speak your occasion" })).toHaveCount(0);
  await page.getByRole("textbox", { name: "Describe your occasion" }).fill("A work conference");
  await expect(page.getByRole("button", { name: "Style my look" })).toBeVisible();
});
