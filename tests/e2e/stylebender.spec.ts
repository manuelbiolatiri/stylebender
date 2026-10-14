import { expect, test } from '@playwright/test';

test.describe('Stylebender guest shell', () => {
  test('landing page presents the main occasions', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Discover your style/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Church/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Office Day/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Date Night/i })).toBeVisible();
  });

  test('occasion selection updates the next styling move', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Date Night/i }).click();
    await expect(page.getByRole('heading', { name: /Style me for Date Night/i })).toBeVisible();
  });

  test('verdict actions open achieve and elevate flows', async ({ page }) => {
    await page.route('**/api/stylist', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ready', data: { verdict: 'Wear', title: 'The considered layer', summary: 'A considered look.', reasons: ['Texture creates depth'], pieces: [{ name: 'Forest overshirt', owned: true, note: 'Wear open' }] } }) });
    });
    await page.goto('/');
    await page.getByRole('button', { name: /Get one strong look/i }).click();
    await page.getByRole('button', { name: /Generate with Gemini/i }).click();
    await page.getByRole('button', { name: /Achieve this look/i }).click();
    await expect(page.getByRole('heading', { name: /Achieve this look/i })).toBeVisible();
    await page.goto('/');
    await page.getByRole('button', { name: /Get one strong look/i }).click();
    await page.getByRole('button', { name: /^Elevate$/i }).last().click();
    await expect(page.getByRole('heading', { name: /Elevate my look/i })).toBeVisible();
  });

  test('profile preferences persist locally', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Profile/i }).first().click();
    await page.getByRole('button', { name: /Streetwear/i }).click();
    await page.getByRole('button', { name: /Save my profile/i }).click();
    await page.reload();
    await page.getByRole('button', { name: /Profile/i }).first().click();
    await expect(page.getByRole('button', { name: /Streetwear/i })).toHaveClass(/bg-forest/);
  });

  test('Style IQ records progress', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Explore Style IQ/i }).click();
    await page.getByRole('button', { name: /Forest overshirt/i }).click();
    await expect(page.getByText(/Texture and tonal contrast/i)).toBeVisible();
  });

  test('auth views remain reachable', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
    await page.goto('/sign-up');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  });

  test('sends the selected occasion and saves a generated look', async ({ page }) => {
    let requestBody: Record<string, unknown> | null = null;
    await page.route('**/api/stylist', async (route) => {
      requestBody = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'ready', data: { verdict: 'Wear', title: 'The evening layer', summary: 'A considered date-night look.', reasons: ['Texture creates depth'], pieces: [{ name: 'Forest overshirt', owned: true, note: 'Wear open' }] } }) });
    });
    await page.goto('/');
    await page.getByRole('button', { name: /Date Night/i }).click();
    await page.getByRole('button', { name: /Get one strong look/i }).click();
    await page.getByRole('button', { name: /Generate with Gemini/i }).click();
    await expect.poll(() => requestBody?.occasion).toBe('Date Night');
    await page.getByRole('button', { name: /^Save$/i }).click();
    await page.getByRole('button', { name: /^Saved$/i }).first().click();
    await expect(page.getByRole('heading', { name: /The evening layer/i })).toBeVisible();
  });

  test('handles Gemini unavailable without saving a demo verdict', async ({ page }) => {
    await page.route('**/api/stylist', async (route) => {
      await route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ status: 'unavailable', error: 'Gemini is not configured' }) });
    });
    await page.goto('/');
    await page.getByRole('button', { name: /Get one strong look/i }).click();
    await page.getByRole('button', { name: /Generate with Gemini/i }).click();
    await expect(page.getByText(/Gemini is not configured/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^Save$/i })).toBeDisabled();
  });

  test('requires authentication for live styling API access', async ({ page }) => {
    const response = await page.request.post('/api/stylist', { data: { occasion: 'Church', styles: [], wardrobe: [] } });
    expect(response.status()).toBe(401);
    await expect(response).not.toBeNull();
  });

  test('persists a wardrobe garment after reload', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Wardrobe/i }).first().click();
    const onePixelPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
    await page.locator('input[type="file"]').setInputFiles({ name: 'forest-overshirt.png', mimeType: 'image/png', buffer: onePixelPng });
    await expect(page.getByText('forest-overshirt')).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: /Wardrobe/i }).first().click();
    await expect(page.getByText('forest-overshirt')).toBeVisible();
  });

  for (const width of [390, 768, 1440]) {
    test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    });
  }
});
