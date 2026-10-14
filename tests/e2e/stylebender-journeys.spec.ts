import { expect, test } from '@playwright/test';

const onePixelPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

test.describe('Stylebender MVP Usability & Journeys', () => {
  test('Journey 1: New visitor -> occasion selection -> sign-in preservation -> outfit recommendation', async ({
    page,
  }) => {
    // 1. Visit landing page
    await page.goto('/');

    // First viewport clearly communicates value proposition
    await expect(page.getByRole('heading', { name: /Discover your style/i })).toBeVisible();
    await expect(
      page.getByText(/AI personal stylist for luxury-inspired menswear/i),
    ).toBeVisible();

    // Church is not preselected - primary CTA prompts to select or styles selected
    // Select custom occasion
    const customOccasionToggle = page.getByRole('button', { name: /enter a custom occasion/i });
    await expect(customOccasionToggle).toBeVisible();
    await customOccasionToggle.click();

    const customInput = page.getByRole('textbox', { name: /Custom occasion/i });
    await customInput.fill('Art Gallery Opening');
    await page.getByRole('button', { name: /^Select$/i }).click();

    // Primary CTA updates with custom occasion
    const styleCTA = page.getByRole('button', { name: /Style me for Art Gallery Opening/i });
    await expect(styleCTA).toBeVisible();

    // 2. Mock 401 auth_required on first styling request
    let attempt = 0;
    await page.route('**/api/stylist', async (route) => {
      attempt += 1;
      if (attempt === 1) {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'auth_required', error: 'Authentication required' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'ready',
            data: {
              verdict: 'Wear',
              title: 'Curated gallery tailoring',
              summary: 'A sophisticated combination for an art gallery evening.',
              reasons: ['Subtle tonal layering', 'Clean silhouette'],
              pieces: [
                { name: 'Navy hopsack blazer', owned: false, note: 'Structured silhouette' },
                { name: 'Charcoal wool trousers', owned: false, note: 'Tapered drape' },
              ],
            },
          }),
        });
      }
    });

    // Click CTA to navigate to Verdict and trigger styling
    await styleCTA.click();

    // User is on Verdict panel
    await expect(page.getByRole('heading', { name: /Verdict/i })).toBeVisible();
    const generateBtn = page.getByRole('button', { name: /Generate with Gemini/i });
    await generateBtn.click();

    // Redirected to sign-in page, preserving context
    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();

    // Simulate returning with restored pending context
    await page.evaluate(() => {
      sessionStorage.setItem(
        'stylebender-pending-context',
        JSON.stringify({
          occasion: 'Art Gallery Opening',
          budget: '£150–£300',
          styles: ['Tailored / elegant'],
          wardrobe: [],
          request: 'Recommend one strong outfit',
          autoGenerate: true,
        }),
      );
    });

    await page.goto('/?view=Verdict&occasion=Art+Gallery+Opening');

    // Automatically resumes styling upon return and displays recommendation
    await expect(page.getByRole('heading', { name: /Curated gallery tailoring/i })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText(/Subtle tonal layering/i)).toBeVisible();
    await expect(page.getByText('Navy hopsack blazer')).toBeVisible();
  });

  test('Journey 2: New visitor -> upload wardrobe -> rename/edit -> receive personalised outfit with user photo', async ({
    page,
  }) => {
    await page.goto('/');

    // Navigate to Wardrobe
    await page.getByRole('button', { name: /Wardrobe/i }).first().click();
    await expect(page.getByRole('heading', { name: /Build your wardrobe/i })).toBeVisible();

    // Upload a new piece
    await page.locator('input[type="file"]').setInputFiles({
      name: 'olive-field-jacket.png',
      mimeType: 'image/png',
      buffer: onePixelPng,
    });

    // Upload success feedback displayed
    await expect(page.getByText(/Garment added to your wardrobe/i)).toBeVisible();
    await expect(page.getByText('olive-field-jacket')).toBeVisible();

    // Edit and rename garment details
    await page.getByRole('button', { name: /Edit olive-field-jacket/i }).click();
    await expect(page.getByRole('heading', { name: /Edit garment/i })).toBeVisible();

    const nameInput = page.getByRole('textbox', { name: /Garment name/i });
    await nameInput.fill('Olive field overshirt');

    const colourInput = page.getByRole('textbox', { name: /Colour/i });
    await colourInput.fill('Olive green');

    const materialInput = page.getByRole('textbox', { name: /Material/i });
    await materialInput.fill('Brushed cotton twill');

    await page.getByRole('button', { name: /Save changes/i }).click();

    // Renamed garment visible in wardrobe with details
    await expect(page.getByText('Olive field overshirt')).toBeVisible();
    await expect(page.getByText(/Olive green · Brushed cotton twill/i)).toBeVisible();

    // Verify category browsing filter separates from upload
    await page.getByRole('button', { name: /^Shoes$/i }).click();
    await expect(page.getByText('Olive field overshirt')).toHaveCount(0);
    await expect(page.getByText(/No garments in category “Shoes”/i)).toBeVisible();
    await page.getByRole('button', { name: /^All$/i }).click();
    await expect(page.getByText('Olive field overshirt')).toBeVisible();

    // Style an outfit with this owned piece
    await page.route('**/api/stylist', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ready',
          data: {
            verdict: 'Wear',
            title: 'The utilitarian weekend',
            summary: 'A refined casual look anchored by your olive overshirt.',
            reasons: ['Tonal harmony', 'Relaxed proportion'],
            pieces: [
              { name: 'Olive field overshirt', owned: true, note: 'Wear open over a white tee' },
              { name: 'Stone cotton chinos', owned: false, note: 'Clean break at the ankle' },
            ],
          },
        }),
      });
    });

    await page.getByRole('button', { name: /Discover/i }).first().click();
    await page.getByRole('button', { name: /Date Night/i }).click();
    await page.getByRole('button', { name: /Get one strong look/i }).click();
    await page.getByRole('button', { name: /Generate with Gemini/i }).click();

    // Outfit recommendation recognizes user wardrobe item and shows user photo badge
    await expect(page.getByRole('heading', { name: /The utilitarian weekend/i })).toBeVisible();
    await expect(page.getByText('Olive field overshirt')).toBeVisible();
    await expect(page.getByText(/Your photo/i).first()).toBeVisible();
  });

  test('Journey 3: Existing user -> reopen saved look -> Change One Piece -> save updated look', async ({
    page,
  }) => {
    // Seed a saved outfit in localStorage
    await page.goto('/');
    await page.evaluate(() => {
      const initialOutfit = {
        id: 'saved-look-001',
        createdAt: Date.now() - 3600000,
        source: 'verdict',
        context: {
          occasion: 'Office Day',
          budget: '£150–£300',
          styles: ['Smart casual'],
          wardrobe: [],
          request: 'Recommend one strong outfit',
        },
        verdict: 'Wear',
        title: 'The tailored Friday',
        summary: 'A sharp combination for the office.',
        reasons: ['Structured yet comfortable'],
        pieces: [
          { name: 'Navy hopsack blazer', owned: false, note: 'Tailored fit' },
          { name: 'White Oxford shirt', owned: false, note: 'Crisp button-down' },
          { name: 'Charcoal wool trousers', owned: false, note: 'Tailored drape' },
        ],
        version: 1,
        priceType: 'illustrative',
      };
      localStorage.setItem('stylebender-saved-outfits', JSON.stringify([initialOutfit]));
    });

    await page.reload();

    // Navigate to Saved panel
    await page.getByRole('button', { name: /^Saved$/i }).first().click();
    await expect(page.getByRole('heading', { name: /The tailored Friday/i })).toBeVisible();

    // Reopen the saved look
    await page.getByRole('button', { name: /Reopen/i }).click();

    // Reopened in Verdict panel with exact details
    await expect(page.getByRole('heading', { name: /The tailored Friday/i })).toBeVisible();
    await expect(page.getByText('White Oxford shirt')).toBeVisible();

    // Use "Change One Piece"
    let swapRequestPayload: Record<string, unknown> | null = null;
    await page.route('**/api/stylist', async (route) => {
      swapRequestPayload = JSON.parse(route.request().postData() ?? '{}');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ready',
          data: {
            verdict: 'Wear',
            title: 'The softened Friday',
            summary: 'An upgraded version with a merino knit replacing the white shirt.',
            reasons: ['Merino knit adds tactile luxury'],
            pieces: [
              { name: 'Navy hopsack blazer', owned: false, note: 'Tailored fit' },
              { name: 'Charcoal merino crewneck', owned: false, note: 'Soft layer under blazer' },
              { name: 'Charcoal wool trousers', owned: false, note: 'Tailored drape' },
            ],
          },
        }),
      });
    });

    await page.getByRole('button', { name: /Change One Piece/i }).click();
    await expect(page.getByText(/Select which piece to change/i)).toBeVisible();

    // Select "White Oxford shirt" to swap
    await page.locator('label').filter({ hasText: 'White Oxford shirt' }).click();
    await page.getByRole('button', { name: /Swap "White Oxford shirt"/i }).click();

    // Verify swap request prompt asked for piece change
    await expect.poll(() => swapRequestPayload?.request as string).toContain('White Oxford shirt');

    // New version rendered with swapped piece
    await expect(page.getByRole('heading', { name: /The softened Friday/i })).toBeVisible();
    await expect(page.getByText('Charcoal merino crewneck')).toBeVisible();

    // Save updated look
    await page.getByRole('button', { name: /^Save$/i }).click();

    // Open Saved tab to verify updated version exists
    await page.getByRole('button', { name: /^Saved$/i }).first().click();
    await expect(page.getByRole('heading', { name: /The softened Friday/i })).toBeVisible();
  });

  test('Journey 4: Gemini unavailable -> informative error -> successful retry', async ({
    page,
  }) => {
    let callCount = 0;
    await page.route('**/api/stylist', async (route) => {
      callCount += 1;
      if (callCount === 1) {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'unavailable',
            error: 'Gemini is temporarily busy. Please try again in a moment.',
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'ready',
            data: {
              verdict: 'Wear',
              title: 'Resilient styling verdict',
              summary: 'Successfully generated after server recovery.',
              reasons: ['Balanced tones'],
              pieces: [{ name: 'Navy hopsack blazer', owned: false, note: 'Classic fit' }],
            },
          }),
        });
      }
    });

    await page.goto('/');
    await page.getByRole('button', { name: /Get one strong look/i }).click();
    await page.getByRole('button', { name: /Generate with Gemini/i }).click();

    // Informative error message displayed and Save button disabled
    await expect(
      page.getByText(/Gemini is temporarily busy. Please try again in a moment/i),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /^Save$/i })).toBeDisabled();

    // Click Retry
    await page.getByRole('button', { name: /Retry Gemini/i }).click();

    // Recovers successfully
    await expect(page.getByRole('heading', { name: /Resilient styling verdict/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Save$/i })).toBeEnabled();
  });

  test('Elevate before-and-after comparison displays both versions and upgraded pieces', async ({
    page,
  }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const base = {
        id: 'base-001',
        createdAt: Date.now(),
        source: 'verdict',
        context: {
          occasion: 'Date Night',
          budget: '£150–£300',
          styles: ['Quiet luxury'],
          wardrobe: [],
          request: 'Recommend one strong outfit',
        },
        verdict: 'Wear',
        title: 'The subtle evening',
        summary: 'Understated baseline styling.',
        reasons: ['Tonal texture'],
        pieces: [
          { name: 'Charcoal merino crewneck', owned: false, note: 'Base layer' },
          { name: 'Charcoal wool trousers', owned: false, note: 'Trousers' },
        ],
        version: 1,
        priceType: 'illustrative',
      };
      localStorage.setItem('stylebender-current-outfit', JSON.stringify(base));
    });

    await page.route('**/api/stylist', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'ready',
          data: {
            verdict: 'Elevate',
            title: 'The velvet contrast',
            summary: 'Elevated with a rich burgundy velvet dinner jacket.',
            reasons: ['Velvet creates luxurious evening depth'],
            pieces: [
              { name: 'Burgundy velvet dinner jacket', owned: false, note: 'Statement layer' },
              { name: 'Charcoal wool trousers', owned: false, note: 'Grounded base' },
            ],
          },
        }),
      });
    });

    await page.goto('/?view=Elevate');

    // Before card is visible
    await expect(page.getByText('Before · Base Look')).toBeVisible();
    await expect(page.getByText('The subtle evening')).toBeVisible();

    // Create elevated version
    await page.getByRole('button', { name: /Create more polished version/i }).click();

    // After card displays elevated title and Upgraded tag
    await expect(page.getByRole('heading', { name: 'The velvet contrast' })).toBeVisible();
    await expect(page.getByText('Upgraded', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Adopt this look/i })).toBeVisible();
  });

  test('Achieve panel reconciles owned vs missing garments without invented prices', async ({
    page,
  }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const look = {
        id: 'achieve-test-01',
        createdAt: Date.now(),
        source: 'verdict',
        context: {
          occasion: 'Church',
          budget: '£150–£300',
          styles: ['Tailored'],
          wardrobe: [],
          request: 'One look',
        },
        verdict: 'Wear',
        title: 'Sunday morning elegance',
        summary: 'Considered tailoring.',
        reasons: ['Polished lines'],
        pieces: [
          { name: 'Ivory Oxford shirt', owned: true, note: 'Crisp finish' },
          { name: 'Navy hopsack blazer', owned: false, note: 'Structured silhouette' },
        ],
        version: 1,
        priceType: 'illustrative',
      };
      localStorage.setItem('stylebender-current-outfit', JSON.stringify(look));
    });

    await page.goto('/?view=Achieve');

    // Shows separate sections for Ready to wear (owned) and Pieces to acquire (missing)
    await expect(page.getByText(/Ready to wear \(1\)/i)).toBeVisible();
    await expect(page.getByText(/Pieces to acquire \(1\)/i)).toBeVisible();

    // Confirms honest presentation: no fake prices
    await expect(page.getByText(/No live prices invented/i)).toBeVisible();

    // Toggling missing piece moves it to owned
    await page.getByText('Navy hopsack blazer').click();
    await expect(page.getByText(/Ready to wear \(2\)/i)).toBeVisible();
    await expect(page.getByText(/You own every piece required for this look/i)).toBeVisible();
  });

  // Responsive & Overflow checks for 390px, 768px, 1024px, 1440px
  for (const width of [390, 768, 1024, 1440]) {
    test(`renders without horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBeTruthy();

      // Check Verdict view
      await page.goto('/?view=Verdict');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBeTruthy();

      // Check Wardrobe view
      await page.goto('/?view=Wardrobe');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBeTruthy();

      // Check Achieve view
      await page.goto('/?view=Achieve');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBeTruthy();
    });
  }
});
