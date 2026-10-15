import { expect, test } from '@playwright/test';
import type { OutfitVersion } from '../../lib/outfit';

const screenshotDir = 'docs/screenshots/mobile';
const mobileViewports = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
];

const sampleOutfit: OutfitVersion = {
  id: 'mobile-shell-look',
  createdAt: Date.now(),
  source: 'verdict',
  context: { occasion: 'Date Night', budget: '£150–£300', styles: ['Tailored / elegant'], wardrobe: [], request: 'Give me one strong look' },
  verdict: 'Wear',
  title: 'The evening tonal contrast',
  summary: 'A refined tonal look for a considered evening.',
  reasons: ['Tonal contrast creates depth without clutter.', 'Texture keeps the tailoring relaxed.'],
  pieces: [
    { name: 'Navy blazer', owned: false, note: 'Structured silhouette', product: { id: 'mobile-1', source: 'local-catalog', name: 'Navy blazer', image: '/demo-wardrobe/navy-blazer.png' } },
    { name: 'Ivory Oxford shirt', owned: true, note: 'Soft contrast', product: { id: 'mobile-2', source: 'local-catalog', name: 'Ivory Oxford shirt', image: '/demo-wardrobe/ivory-oxford.png' } },
    { name: 'Stone chinos', owned: false, note: 'Clean break', product: { id: 'mobile-3', source: 'local-catalog', name: 'Stone chinos', image: '/demo-wardrobe/stone-chinos.png' } },
  ],
  version: 1,
  priceType: 'illustrative',
};

test.describe('Stylebender mobile app shell', () => {
  for (const viewport of mobileViewports) {
    test(`keeps the native shell usable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto('/?view=Discover');
      await page.waitForTimeout(1800);
      await expect(page.getByRole('heading', { name: /What are you dressing for/i })).toBeVisible();

      const primary = page.getByRole('navigation', { name: 'Primary' });
      await expect(primary).toBeVisible();
      await expect(primary.getByRole('button', { name: 'Discover' })).toHaveAttribute('aria-current', 'page');

      const shellMetrics = await page.evaluate(() => ({
        bodyOverflowY: getComputedStyle(document.body).overflowY,
        htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
        bodyScrollWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
      }));
      expect(shellMetrics.bodyOverflowY).toBe('hidden');
      expect(shellMetrics.htmlOverflowY).toBe('hidden');
      expect(shellMetrics.bodyScrollWidth).toBeLessThanOrEqual(shellMetrics.viewportWidth + 1);

      for (const tab of ['Style Me', 'Wardrobe', 'Saved']) {
        await primary.getByRole('button', { name: tab, exact: true }).click({ force: true });
        await page.waitForTimeout(100);
        await expect(primary.getByRole('button', { name: tab, exact: true })).toHaveAttribute('aria-current', 'page');
      }

      await page.screenshot({ path: `${screenshotDir}/shell-${viewport.width}x${viewport.height}.png`, fullPage: false });
    });
  }

  test('captures all four tabs and a long wardrobe scroll state at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?view=Discover');
    await page.waitForTimeout(1800);
    await expect(page.getByRole('heading', { name: /What are you dressing for/i })).toBeVisible();

    await page.screenshot({ path: `${screenshotDir}/discover-390x844.png`, fullPage: false });

    await page.evaluate((outfit) => {
      localStorage.setItem('stylebender-current-outfit', JSON.stringify(outfit));
      localStorage.setItem('stylebender-saved-outfits', JSON.stringify([outfit]));
    }, sampleOutfit);

    await page.goto('/?view=Style%20Me&occasion=Date%20Night');
    await expect(page.getByRole('heading', { name: /Style Me/i })).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/style-me-390x844.png`, fullPage: false });

    const primary = page.getByRole('navigation', { name: 'Primary' });
    await primary.getByRole('button', { name: 'Wardrobe', exact: true }).click();
    await expect(primary.getByRole('button', { name: 'Wardrobe', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { name: /Wardrobe/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Explore' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText('Navy hopsack blazer')).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/wardrobe-390x844.png`, fullPage: false });

    const scrollMetrics = await page.evaluate(() => {
      const region = document.querySelector('.mobile-screen-scroll');
      return { scrollHeight: region?.scrollHeight ?? 0, clientHeight: region?.clientHeight ?? 0 };
    });
    expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);
    await page.locator('.mobile-screen-scroll').evaluate((element) => { element.scrollTop = element.scrollHeight; });
    await expect(primary).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/wardrobe-long-scroll-390x844.png`, fullPage: false });

    await primary.getByRole('button', { name: 'Saved', exact: true }).click();
    await expect(primary.getByRole('button', { name: 'Saved', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { name: /The evening tonal contrast/i })).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/saved-390x844.png`, fullPage: false });
  });
});
