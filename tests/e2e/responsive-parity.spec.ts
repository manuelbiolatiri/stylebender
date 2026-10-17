import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1440, height: 900 }]) {
  test(`direct occasion styling is accessible at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/?view=Discover');
    await expect(page.getByRole('heading', { name: /What are you dressing for|A look for every occasion/i })).toBeVisible();
    const input = page.getByPlaceholder('A dinner date in Manchester on a chilly evening...');
    await expect(input).toBeVisible();
    await input.fill('A relaxed dinner in Manchester');
    await expect(page.getByRole('button', { name: /Style my look/i })).toBeVisible();
    const xOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(xOverflow).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `test-results/responsive/home-${viewport.width}.png`, fullPage: true });
  });
}
