import { test } from '@playwright/test';

const outputDir = '/Users/emmanuelbiolatiri/.gemini/antigravity-ide/brain/c5ae676b-4c88-434c-8b37-f2912cd3cb5d/screenshots';

const sampleOutfit = {
  id: 'screenshot-outfit-01',
  createdAt: Date.now(),
  source: 'verdict',
  context: {
    occasion: 'Date Night',
    budget: '£150–£300',
    styles: ['Tailored / elegant', 'Quiet luxury'],
    wardrobe: ['Navy hopsack blazer'],
    request: 'Recommend one strong outfit',
  },
  verdict: 'Wear',
  title: 'The evening tonal contrast',
  summary: 'A refined tailoring combination balancing deep navy wool with clean stone trousers and ivory shirting.',
  reasons: [
    'Tonal contrast between navy and stone creates visual depth without clutter.',
    'A soft Oxford collar provides structure while feeling relaxed and approachable.',
    'Dark brown penny loafers ground the palette with understated sophistication.',
  ],
  pieces: [
    { name: 'Navy hopsack blazer', owned: true, note: 'Structured silhouette, unlined shoulders', product: { id: 'p1', source: 'local-catalog', name: 'Navy hopsack blazer', image: '/demo-wardrobe/navy-blazer.png' } },
    { name: 'Ivory Oxford shirt', owned: true, note: 'Button-down collar, unbuttoned top two buttons', product: { id: 'p2', source: 'local-catalog', name: 'Ivory Oxford shirt', image: '/demo-wardrobe/ivory-oxford.png' } },
    { name: 'Stone cotton chinos', owned: false, note: 'Slight taper with clean no-break hem', product: { id: 'p3', source: 'local-catalog', name: 'Stone cotton chinos', image: '/demo-wardrobe/stone-chinos.png' } },
    { name: 'Dark brown penny loafers', owned: false, note: 'Polished calfskin, wear sockless or tonal socks', product: { id: 'p4', source: 'local-catalog', name: 'Dark brown penny loafers', image: '/demo-wardrobe/brown-loafers.png' } },
  ],
  version: 1,
  priceType: 'illustrative',
};

const viewports = [
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1024', width: 1024, height: 900 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

test.describe('Capture Visual QA Screenshots', () => {
  for (const vp of viewports) {
    test(`Capture Discover view at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${outputDir}/discover-${vp.name}.png`, fullPage: false });
    });

    test(`Capture Verdict view at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.evaluate((outfit) => {
        localStorage.setItem('stylebender-current-outfit', JSON.stringify(outfit));
      }, sampleOutfit);
      await page.goto('/?view=Verdict&occasion=Date+Night');
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${outputDir}/verdict-${vp.name}.png`, fullPage: false });
    });

    test(`Capture Wardrobe view at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.getByRole('button', { name: /Wardrobe/i }).first().click();
      if (process.env.NODE_ENV !== 'production') {
        const loadDemoBtn = page.getByRole('button', { name: /Load Sample Wardrobe/i });
        if (await loadDemoBtn.isVisible()) {
          await loadDemoBtn.click();
          await page.waitForTimeout(1000);
        }
      }
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${outputDir}/wardrobe-${vp.name}.png`, fullPage: false });
    });

    test(`Capture Elevate view at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.evaluate((outfit) => {
        localStorage.setItem('stylebender-current-outfit', JSON.stringify(outfit));
      }, sampleOutfit);
      await page.goto('/?view=Elevate');
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${outputDir}/elevate-${vp.name}.png`, fullPage: false });
    });

    test(`Capture Achieve view at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/');
      await page.evaluate((outfit) => {
        localStorage.setItem('stylebender-current-outfit', JSON.stringify(outfit));
      }, sampleOutfit);
      await page.goto('/?view=Achieve');
      await page.waitForTimeout(600);
      await page.screenshot({ path: `${outputDir}/achieve-${vp.name}.png`, fullPage: false });
    });
  }
});
