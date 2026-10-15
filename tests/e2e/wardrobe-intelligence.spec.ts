import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const response = (pieces: Array<{ name: string; owned: boolean; note: string }>) => ({
  status: 'ready',
  data: {
    verdict: 'Wear',
    title: 'A considered wardrobe look',
    summary: 'A complete occasion-led recommendation.',
    reasons: ['The proportions suit the setting.'],
    pieces,
  },
});

async function start(page: Page, wardrobe: unknown[], result: ReturnType<typeof response>) {
  await page.goto('/?view=Discover');
  await page.evaluate((items) => localStorage.setItem('stylebender-wardrobe-meta', JSON.stringify(items)), wardrobe);
  await page.reload();
  await page.route('**/api/stylist', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(result) });
  });
  await page.getByRole('button', { name: /Church Polished/i }).click();
  await page.getByRole('button', { name: /Style me for Church/i }).click();
  await expect(page.getByRole('heading', { name: /A considered wardrobe look/i })).toBeVisible();
}

test.describe('wardrobe intelligence', () => {
  test('A: empty wardrobe still produces a complete missing-piece recommendation', async ({ page }) => {
    let requestBody: Record<string, unknown> | undefined;
    await page.route('**/api/stylist', async (route) => {
      requestBody = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response([
        { name: 'Navy tailored blazer', owned: false, note: 'Structured layer' },
        { name: 'Ivory Oxford shirt', owned: false, note: 'Soft contrast' },
      ])) });
    });
    await page.goto('/?view=Discover');
    await page.evaluate(() => localStorage.setItem('stylebender-wardrobe-meta', '[]'));
    await page.reload();
    await page.getByRole('button', { name: /Church Polished/i }).click();
    await page.getByRole('button', { name: /Style me for Church/i }).click();
    await expect(page.getByRole('heading', { name: /A considered wardrobe look/i })).toBeVisible();
    expect(requestBody?.wardrobe).toEqual([]);
    expect(await page.getByText('From your wardrobe').count()).toBe(0);
  });

  test('B: complementary wardrobe metadata is sent without photographs and ownership is reconciled locally', async ({ page }) => {
    let requestBody: any;
    await page.route('**/api/stylist', async (route) => {
      requestBody = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(response([
        { name: 'Navy blazer', owned: false, note: 'Use as the structure' },
        { name: 'Ivory Oxford shirt', owned: false, note: 'Lightens the look' },
        { name: 'Chocolate-brown blazer', owned: true, note: 'Gemini ownership claim must be rejected' },
      ])) });
    });
    const wardrobe = [
      { id: 'w-blazer', name: 'Navy blazer', category: 'Outerwear', colour: 'Navy', material: 'Wool' },
      { id: 'w-shirt', name: 'Ivory Oxford shirt', category: 'Shirts', colour: 'Ivory', material: 'Cotton' },
      { id: 'w-trousers', name: 'Charcoal trousers', category: 'Trousers', colour: 'Charcoal', material: 'Wool' },
      { id: 'w-loafers', name: 'Dark brown penny loafers', category: 'Shoes', colour: 'Brown', material: 'Leather' },
      { id: 'w-overshirt', name: 'Forest overshirt', category: 'Outerwear', colour: 'Forest', material: 'Cotton' },
    ];
    await page.goto('/?view=Discover');
    await page.evaluate((items) => localStorage.setItem('stylebender-wardrobe-meta', JSON.stringify(items)), wardrobe);
    await page.reload();
    await page.getByRole('button', { name: /Church Polished/i }).click();
    await page.getByRole('button', { name: /Style me for Church/i }).click();
    await expect(page.getByRole('heading', { name: /A considered wardrobe look/i })).toBeVisible();
    expect(requestBody.wardrobe).toEqual(wardrobe);
    expect(JSON.stringify(requestBody)).not.toContain('image');
    expect(await page.getByText('From your wardrobe').count()).toBe(2);
    expect(await page.getByText('Catalog reference · not a live listing').count()).toBe(1);
  });

  test('C: unsuitable wardrobe is not forced into the generated outfit', async ({ page }) => {
    await start(page, [{ id: 'w-running', name: 'Neon running vest', category: 'Sportswear', colour: 'Neon green', material: 'Polyester' }], response([
      { name: 'Navy tailored blazer', owned: true, note: 'Gemini claim must be rejected' },
      { name: 'Ivory Oxford shirt', owned: false, note: 'Suitable missing layer' },
    ]));
    expect(await page.getByText('From your wardrobe').count()).toBe(0);
    expect(await page.getByText('Catalog reference · not a live listing').count()).toBe(2);
  });
});
