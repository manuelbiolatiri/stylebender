import { expect, test } from '@playwright/test';

const generatedLook = {
  status: 'ready',
  data: {
    verdict: 'Wear',
    title: 'One considered look',
    summary: 'A complete mocked recommendation.',
    reasons: ['Balanced proportion'],
    pieces: [{ name: 'Navy blazer', owned: false, note: 'Structured layer' }],
  },
};

const savedLook = {
  id: 'regression-saved-look',
  createdAt: Date.now(),
  source: 'verdict',
  context: {
    occasion: 'Office Day',
    budget: '£150–£300',
    styles: ['Tailored / elegant'],
    wardrobe: [],
    request: 'Give me one strong look',
  },
  verdict: 'Wear',
  title: 'The saved office look',
  summary: 'Original saved explanation.',
  reasons: ['Clean structure'],
  pieces: [{ name: 'Navy blazer', owned: false, note: 'Structured layer' }],
  version: 1,
  priceType: 'illustrative',
};

test.describe('generation request regressions', () => {
  test('sends each selected occasion and generates a fresh explicit request', async ({ page }) => {
    const occasions: string[] = [];
    await page.route('**/api/stylist', async (route) => {
      const body = JSON.parse(route.request().postData() ?? '{}') as { occasion?: string };
      occasions.push(body.occasion ?? '');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ...generatedLook, data: { ...generatedLook.data, title: `${body.occasion} look` } }),
      });
    });

    await page.goto('/?view=Discover');
    await page.getByRole('button', { name: /Church Polished/i }).click();
    await page.getByRole('button', { name: /Style me for Church/i }).click();
    await expect(page.getByRole('heading', { name: /Church look/i })).toBeVisible();

    await page.getByRole('button', { name: 'Discover', exact: true }).first().click();
    await page.getByRole('button', { name: /Office Day Sharp/i }).click();
    await page.getByRole('button', { name: /Style me for Office Day/i }).click();
    await expect(page.getByRole('heading', { name: /Office Day look/i })).toBeVisible();

    // An explicit request for the same occasion must still generate a new response,
    // rather than restoring the previous current outfit.
    await page.getByRole('button', { name: 'Discover', exact: true }).first().click();
    await page.getByRole('button', { name: /Style me for Office Day/i }).click();
    await expect(page.getByRole('heading', { name: /Office Day look/i })).toBeVisible();
    expect(occasions).toEqual(['Church', 'Office Day', 'Office Day']);
  });

  test('does not regenerate when switching away from and back to Style Me', async ({ page }) => {
    let requestCount = 0;
    await page.route('**/api/stylist', async (route) => {
      requestCount += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(generatedLook) });
    });

    await page.goto('/?view=Discover');
    await page.getByRole('button', { name: /Date Night/i }).click();
    await page.getByRole('button', { name: /Style me for Date Night/i }).click();
    await expect(page.getByRole('heading', { name: /One considered look/i })).toBeVisible();
    expect(requestCount).toBe(1);

    await page.getByRole('button', { name: 'Wardrobe', exact: true }).click();
    await page.getByRole('button', { name: 'Style Me', exact: true }).click();
    await expect(page.getByRole('heading', { name: /One considered look/i })).toBeVisible();
    expect(requestCount).toBe(1);
  });

  test('reopening a saved look restores it without a Gemini request', async ({ page }) => {
    let requestCount = 0;
    await page.route('**/api/stylist', async (route) => {
      requestCount += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(generatedLook) });
    });

    await page.goto('/?view=Discover');
    await page.evaluate((look) => localStorage.setItem('stylebender-saved-outfits', JSON.stringify([look])), savedLook);
    await page.reload();
    await page.getByRole('button', { name: 'Saved', exact: true }).click();
    await page.getByRole('button', { name: /Reopen/i }).click();

    await expect(page.getByRole('heading', { name: /The saved office look/i })).toBeVisible();
    expect(requestCount).toBe(0);
  });

  test('restores authenticated pending Style Me context once without stale Verdict state', async ({ page }) => {
    let requestCount = 0;
    await page.route('**/api/stylist', async (route) => {
      requestCount += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(generatedLook) });
    });

    await page.goto('/?view=Style%20Me&occasion=Church');
    await page.evaluate(() => {
      sessionStorage.setItem('stylebender-pending-context', JSON.stringify({
        occasion: 'Church',
        budget: '£150–£300',
        styles: ['Tailored / elegant'],
        wardrobe: [],
        request: 'Give me one strong look',
        autoGenerate: true,
      }));
    });
    await page.reload();

    await expect(page.getByRole('heading', { name: /One considered look/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /^Style Me$/i })).toBeVisible();
    await expect(page).toHaveURL(/view=Style%20Me|view=Style\+Me/);
    expect(requestCount).toBe(1);

    await page.getByRole('button', { name: 'Discover', exact: true }).click();
    await page.goBack();
    await expect(page.getByRole('heading', { name: /One considered look/i })).toBeVisible();
    expect(requestCount).toBe(1);
  });
});
