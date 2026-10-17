import { expect, test } from '@playwright/test';
import type { OutfitVersion } from '../../lib/outfit';

const sampleOutfit: OutfitVersion = {
  id: 'mobile-shell-look',
  createdAt: Date.now(),
  source: 'verdict',
  context: { occasion: 'Date Night', budget: '£150–£300', styles: [], wardrobe: [], request: 'Give me one strong look' },
  verdict: 'Wear',
  title: 'The evening tonal contrast',
  summary: 'A refined tonal look for a considered evening.',
  reasons: ['Tonal contrast creates depth without clutter.', 'Texture keeps the tailoring relaxed.'],
  pieces: [
    { name: 'Navy blazer', owned: false, note: 'Structured silhouette', product: { id: 'mobile-1', source: 'local-catalog', name: 'Navy blazer', image: '/demo-wardrobe/navy-blazer.png' } },
    { name: 'Ivory Oxford shirt', owned: false, note: 'Soft contrast', product: { id: 'mobile-2', source: 'local-catalog', name: 'Ivory Oxford shirt', image: '/demo-wardrobe/ivory-oxford.png' } },
    { name: 'Stone chinos', owned: false, note: 'Clean break', product: { id: 'mobile-3', source: 'local-catalog', name: 'Stone chinos', image: '/demo-wardrobe/stone-chinos.png' } },
    { name: 'Dark brown penny loafers', owned: false, note: 'Completes the look', product: { id: 'mobile-4', source: 'local-catalog', name: 'Dark brown penny loafers', image: '/demo-wardrobe/brown-loafers.png' } },
  ],
  version: 1,
  priceType: 'illustrative',
};

for (const viewport of [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1440, height: 900 }]) {
  test(`direct occasion styling is accessible at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/?view=Discover');
    await expect(page.getByRole('heading', { name: /What are you dressing for|A look for every occasion/i })).toBeVisible();
    // Both responsive variants exist in the DOM. Select the actively displayed form.
    const input = page.locator(viewport.width < 1024 ? '#mobile-occasion' : '#desktop-occasion');
    await expect(input).toBeVisible();
    await input.fill('A relaxed dinner in Manchester');
    await expect(page.getByRole('button', { name: /Style my look/i })).toBeVisible();
    const xOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(xOverflow).toBeLessThanOrEqual(1);
    await page.screenshot({ path: `test-results/responsive/home-${viewport.width}.png`, fullPage: true });
  });
}

for (const viewport of [{ width: 768, height: 1024 }, { width: 1024, height: 768 }, { width: 1440, height: 900 }]) {
  test(`My Look, Wardrobe and Saved remain usable at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/?view=Discover');
    await page.evaluate((outfit) => {
      localStorage.setItem('stylebender-current-outfit', JSON.stringify(outfit));
      localStorage.setItem('stylebender-saved-outfits', JSON.stringify([outfit]));
    }, sampleOutfit);

    await page.goto('/?view=Style%20Me&occasion=Date%20Night');
    const lookHeading = page.getByRole('heading', { name: 'Style Me' });
    await expect(lookHeading).toBeVisible();
    await expect(lookHeading).toHaveText('My Look');
    await expect(page.getByText('The evening tonal contrast')).toBeVisible();
    await expect(page.getByRole('button', { name: /Change a piece/i })).toBeVisible();
    await page.screenshot({ path: `test-results/responsive/my-look-${viewport.width}.png`, fullPage: true });

    await page.goto('/?view=Wardrobe');
    await expect(page.getByRole('heading', { name: /^Wardrobe$/ })).toBeVisible();
    await page.screenshot({ path: `test-results/responsive/wardrobe-${viewport.width}.png`, fullPage: true });

    await page.goto('/?view=Saved');
    await expect(page.getByRole('heading', { name: /^Saved$/ })).toBeVisible();
    await expect(page.getByText('The evening tonal contrast')).toBeVisible();
    await page.screenshot({ path: `test-results/responsive/saved-${viewport.width}.png`, fullPage: true });
  });
}
