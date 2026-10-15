import { expect, test } from '@playwright/test';

const currentLook = {
  id: 'sample-shopping-look', createdAt: 1, source: 'verdict',
  context: { occasion: 'Date Night', budget: '£150–£300', styles: [], wardrobe: [], request: 'Give me one strong look' },
  verdict: 'Wear', title: 'A considered look', summary: 'A mocked look.', reasons: ['Works'],
  pieces: [{ name: 'Navy tailored blazer', owned: false, note: 'Layered' }], version: 1, priceType: 'illustrative',
};

test.describe('authentication, sample wardrobes and shopping boundaries', () => {
  test('shows Credentials-only authentication and hides unsupported registration', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByRole('heading', { name: 'Welcome back.' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Google/i })).toHaveCount(0);
    await expect(page.getByLabel('Password')).toHaveCount(0);
    await page.goto('/sign-up');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('selects a weather sample without replacing the real wardrobe context', async ({ page }) => {
    await page.goto('/?view=Wardrobe');
    await expect(page.getByRole('heading', { name: 'Wardrobe' })).toBeVisible();
    await page.getByRole('tab', { name: 'Explore' }).click();
    await page.getByLabel('Sample weather condition').selectOption('Rainy');
    await expect(page.getByText('Compact black umbrella')).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({ path: 'docs/screenshots/mobile/weather-sample-rainy-390x844.png', fullPage: true });
    await page.reload();
    await expect(page.getByLabel('Sample weather condition')).toHaveValue('Rainy');
  });

  test('keeps Shop this look contextual and honest when no retailer feed is verified', async ({ page }) => {
    let requests = 0;
    await page.route('**/api/stylist', async (route) => { requests += 1; await route.abort(); });
    await page.goto('/?view=Style%20Me&occasion=Date%20Night');
    await page.evaluate((look) => localStorage.setItem('stylebender-current-outfit', JSON.stringify(look)), currentLook);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'A considered look' })).toBeVisible();
    await page.getByRole('button', { name: 'Shop this look' }).click();
    await expect(page.getByText(/Verified UK listings are not connected/i)).toBeVisible();
    await expect(page.getByText('No verified listing available').first()).toBeVisible();
    expect(requests).toBe(0);
  });
});
