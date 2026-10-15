import { expect, test } from '@playwright/test';

const look = {
  id: 'reliability-v1', createdAt: 1, source: 'verdict',
  context: { occasion: 'Office Day', budget: '£150–£300', styles: ['Tailored / elegant'], wardrobe: [], request: 'Give me one strong look' },
  verdict: 'Wear', title: 'The original office look', summary: 'Original explanation.', reasons: ['Clean structure'],
  pieces: [{ name: 'Navy tailored blazer', owned: false, note: 'Structured layer', product: { id: 'local-navy-blazer', source: 'local-catalog', name: 'Navy tailored blazer', image: '/demo-wardrobe/navy-blazer.png' } }],
  version: 1, priceType: 'illustrative',
};

test.describe('outfit lifecycle reliability', () => {
  test('opens saved looks without Gemini and persists deletion', async ({ page }) => {
    let requests = 0;
    await page.route('**/api/stylist', async (route) => { requests += 1; await route.abort(); });
    await page.goto('/?view=Saved');
    await page.evaluate((saved) => localStorage.setItem('stylebender-saved-outfits', JSON.stringify([saved])), look);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'The original office look' })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'docs/screenshots/reliability/saved-before-reopen-390.png', fullPage: true });
    await page.getByRole('button', { name: /Reopen/i }).click();
    await expect(page.getByRole('heading', { name: 'The original office look' })).toBeVisible();
    expect(requests).toBe(0);
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Saved', exact: true }).click();
    await page.getByRole('button', { name: /Remove The original office look/i }).click();
    await expect(page.getByRole('heading', { name: 'No saved looks yet.' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: 'No saved looks yet.' })).toBeVisible();
  });

  test('uses the selected piece as the only refined change and gives Save immediate feedback', async ({ page }) => {
    await page.route('**/api/stylist', async (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ status: 'ready', data: {
        verdict: 'Wear', title: 'Refined office look', summary: 'Refined explanation.', reasons: ['A cleaner shirt'],
        pieces: [
          { name: 'Sky blue Oxford shirt', owned: true, note: 'New shirt' },
          { name: 'Navy tailored blazer', owned: false, note: 'Preserved blazer' },
        ],
      } }),
    }));
    await page.goto('/?view=Style%20Me&occasion=Office%20Day');
    await page.evaluate((saved) => localStorage.setItem('stylebender-current-outfit', JSON.stringify({ ...saved, id: 'current-v1' })), {
      ...look,
      pieces: [
        { name: 'Ivory Oxford shirt', owned: false, note: 'Original shirt' },
        { name: 'Navy tailored blazer', owned: false, note: 'Preserved blazer' },
      ],
    });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'The original office look' })).toBeVisible();
    await page.getByRole('button', { name: 'Change Ivory Oxford shirt' }).first().click();
    await page.getByRole('button', { name: /Swap "Ivory Oxford shirt"/i }).click();
    await expect(page.getByRole('heading', { name: 'Refined office look' })).toBeVisible();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByRole('main').getByRole('button', { name: 'Saved', exact: true })).toBeVisible();
    const records = await page.evaluate(() => JSON.parse(localStorage.getItem('stylebender-saved-outfits') ?? '[]'));
    expect(records).toHaveLength(1);
    expect(records[0].version).toBe(2);
    expect(records[0].pieces.map((piece: { name: string }) => piece.name)).toEqual(['Sky blue Oxford shirt', 'Navy tailored blazer']);
  });
});

test('renders lifecycle screenshot at 1440px', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?view=Saved');
  await page.evaluate((saved) => localStorage.setItem('stylebender-saved-outfits', JSON.stringify([saved])), look);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'The original office look' })).toBeVisible();
  await page.screenshot({ path: 'docs/screenshots/reliability/saved-desktop-1440.png', fullPage: true });
});
