# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-shell.spec.ts >> Stylebender mobile app shell >> keeps the native shell usable at 375x667
- Location: tests/e2e/mobile-shell.spec.ts:32:9

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 668
Received:    4949
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - img "Stylebender" [ref=e5]
      - text: STYLEBENDER
    - generic [ref=e6]:
      - button "Discover" [ref=e7]
      - button "Style Me" [ref=e11]
      - button "Wardrobe" [ref=e14]
      - button "Saved" [ref=e17]
    - generic [ref=e20]:
      - link "Sign in" [ref=e21] [cursor=pointer]:
        - /url: /sign-in
      - button "Profile" [ref=e22]
  - banner [ref=e26]:
    - button "Stylebender home" [ref=e27]: STYLEBENDER
    - button "Open Profile" [ref=e28]
  - navigation "Primary" [ref=e32]:
    - button "Discover" [ref=e33]
    - button "Style Me" [ref=e37]
    - button "Wardrobe" [ref=e40]
    - button "Saved" [ref=e43]
  - generic [ref=e46]:
    - main [ref=e47]:
      - generic [ref=e48]:
        - img "Model in a forest green tailored jacket" [ref=e49]
        - generic [ref=e50]:
          - generic [ref=e51]: STYLEBENDER
          - paragraph [ref=e52]: The London edit · 2026
          - heading "Discover your style. Make it yours." [level=1] [ref=e53]: Discover your style.Make it yours.
          - paragraph [ref=e54]: AI personal stylist for luxury-inspired menswear. Tell Stylebender what you’re dressing for to get an instant, considered outfit recommendation.
          - generic [ref=e55]:
            - paragraph [ref=e56]: Select an occasion or enter your own
            - generic [ref=e57]:
              - button [ref=e58]:
                - generic [ref=e59]: Church
                - paragraph [ref=e63]: Polished, expressive and considered
              - button [ref=e64]:
                - generic [ref=e65]: Office Day
                - paragraph [ref=e69]: Sharp layers for the working week
              - button [ref=e70]:
                - generic [ref=e71]: Date Night
                - paragraph [ref=e75]: A little more intent, never overdone
            - button "Or enter a custom occasion (e.g. Gallery opening, Wedding in Como)" [ref=e77]
          - generic [ref=e79]:
            - button "Get one strong look · Style me for an occasion" [disabled] [ref=e80]: Style me for an occasion
            - text: Tap Church, Office Day, Date Night or enter your own
      - generic [ref=e83]:
        - generic [ref=e84]:
          - img "Forest tailoring and charcoal trousers laid out together" [ref=e85]
          - generic [ref=e86]:
            - paragraph [ref=e87]: Your next move
            - heading "Style me for an occasion" [level=2] [ref=e88]: Style me foran occasion
            - button "Style me" [disabled] [ref=e89]
        - generic [ref=e92]:
          - generic [ref=e93]:
            - generic [ref=e94]: The daily edit
            - heading "The quiet flex" [level=2] [ref=e97]
            - paragraph [ref=e98]: Texture does the talking. Pair a brushed knit with clean tailoring for depth without noise.
          - button "Explore Style IQ" [ref=e99]
      - generic [ref=e104]:
        - generic [ref=e105]:
          - paragraph [ref=e106]: Made personal
          - heading "Your Style DNA" [level=2] [ref=e107]
        - button "Review assumptions" [ref=e108]
    - contentinfo [ref=e109]: Stylebender · Considered menswear stylingPrivacy first · Private local wardrobe
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import type { OutfitVersion } from '../../lib/outfit';
  3  | 
  4  | const screenshotDir = 'docs/screenshots/mobile';
  5  | const mobileViewports = [
  6  |   { width: 320, height: 568 },
  7  |   { width: 375, height: 667 },
  8  |   { width: 390, height: 844 },
  9  |   { width: 430, height: 932 },
  10 | ];
  11 | 
  12 | const sampleOutfit: OutfitVersion = {
  13 |   id: 'mobile-shell-look',
  14 |   createdAt: Date.now(),
  15 |   source: 'verdict',
  16 |   context: { occasion: 'Date Night', budget: '£150–£300', styles: ['Tailored / elegant'], wardrobe: [], request: 'Give me one strong look' },
  17 |   verdict: 'Wear',
  18 |   title: 'The evening tonal contrast',
  19 |   summary: 'A refined tonal look for a considered evening.',
  20 |   reasons: ['Tonal contrast creates depth without clutter.', 'Texture keeps the tailoring relaxed.'],
  21 |   pieces: [
  22 |     { name: 'Navy blazer', owned: false, note: 'Structured silhouette', product: { id: 'mobile-1', source: 'local-catalog', name: 'Navy blazer', image: '/demo-wardrobe/navy-blazer.png' } },
  23 |     { name: 'Ivory Oxford shirt', owned: true, note: 'Soft contrast', product: { id: 'mobile-2', source: 'local-catalog', name: 'Ivory Oxford shirt', image: '/demo-wardrobe/ivory-oxford.png' } },
  24 |     { name: 'Stone chinos', owned: false, note: 'Clean break', product: { id: 'mobile-3', source: 'local-catalog', name: 'Stone chinos', image: '/demo-wardrobe/stone-chinos.png' } },
  25 |   ],
  26 |   version: 1,
  27 |   priceType: 'illustrative',
  28 | };
  29 | 
  30 | test.describe('Stylebender mobile app shell', () => {
  31 |   for (const viewport of mobileViewports) {
  32 |     test(`keeps the native shell usable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
  33 |       await page.setViewportSize(viewport);
  34 |       await page.goto('/?view=Discover');
  35 |       await page.waitForTimeout(1800);
  36 |       await expect(page.getByRole('heading', { name: /Discover your style/i })).toBeVisible();
  37 | 
  38 |       const primary = page.getByRole('navigation', { name: 'Primary' });
  39 |       await expect(primary).toBeVisible();
  40 |       await expect(primary.getByRole('button', { name: 'Discover' })).toHaveAttribute('aria-current', 'page');
  41 | 
  42 |       const shellMetrics = await page.evaluate(() => ({
  43 |         bodyScrollHeight: document.body.scrollHeight,
  44 |         viewportHeight: window.innerHeight,
  45 |         bodyScrollWidth: document.body.scrollWidth,
  46 |         viewportWidth: window.innerWidth,
  47 |       }));
> 48 |       expect(shellMetrics.bodyScrollHeight).toBeLessThanOrEqual(shellMetrics.viewportHeight + 1);
     |                                             ^ Error: expect(received).toBeLessThanOrEqual(expected)
  49 |       expect(shellMetrics.bodyScrollWidth).toBeLessThanOrEqual(shellMetrics.viewportWidth + 1);
  50 | 
  51 |       for (const tab of ['Style Me', 'Wardrobe', 'Saved', 'Discover']) {
  52 |         await primary.getByRole('button', { name: tab, exact: true }).click();
  53 |         await expect(primary.getByRole('button', { name: tab, exact: true })).toHaveAttribute('aria-current', 'page');
  54 |       }
  55 | 
  56 |       await page.screenshot({ path: `${screenshotDir}/shell-${viewport.width}x${viewport.height}.png`, fullPage: false });
  57 |     });
  58 |   }
  59 | 
  60 |   test('captures all four tabs and a long wardrobe scroll state at 390px', async ({ page }) => {
  61 |     await page.setViewportSize({ width: 390, height: 844 });
  62 |     await page.goto('/?view=Discover');
  63 |     await page.waitForTimeout(1800);
  64 |     await expect(page.getByRole('heading', { name: /Discover your style/i })).toBeVisible();
  65 | 
  66 |     await page.screenshot({ path: `${screenshotDir}/discover-390x844.png`, fullPage: false });
  67 | 
  68 |     await page.evaluate((outfit) => {
  69 |       localStorage.setItem('stylebender-current-outfit', JSON.stringify(outfit));
  70 |       localStorage.setItem('stylebender-saved-outfits', JSON.stringify([outfit]));
  71 |     }, sampleOutfit);
  72 | 
  73 |     await page.goto('/?view=Style%20Me&occasion=Date%20Night');
  74 |     await expect(page.getByRole('heading', { name: /Style Me/i })).toBeVisible();
  75 |     await page.screenshot({ path: `${screenshotDir}/style-me-390x844.png`, fullPage: false });
  76 | 
  77 |     const primary = page.getByRole('navigation', { name: 'Primary' });
  78 |     await primary.getByRole('button', { name: 'Wardrobe', exact: true }).click();
  79 |     await expect(page.getByRole('heading', { name: /Build your wardrobe/i })).toBeVisible();
  80 |     await page.getByRole('button', { name: /Load Sample Wardrobe/i }).click();
  81 |     await expect(page.getByText('Navy hopsack blazer')).toBeVisible();
  82 |     await page.screenshot({ path: `${screenshotDir}/wardrobe-390x844.png`, fullPage: false });
  83 | 
  84 |     const scrollMetrics = await page.evaluate(() => {
  85 |       const region = document.querySelector('.mobile-screen-scroll');
  86 |       return { scrollHeight: region?.scrollHeight ?? 0, clientHeight: region?.clientHeight ?? 0 };
  87 |     });
  88 |     expect(scrollMetrics.scrollHeight).toBeGreaterThan(scrollMetrics.clientHeight);
  89 |     await page.locator('.mobile-screen-scroll').evaluate((element) => { element.scrollTop = element.scrollHeight; });
  90 |     await expect(primary).toBeVisible();
  91 |     await page.screenshot({ path: `${screenshotDir}/wardrobe-long-scroll-390x844.png`, fullPage: false });
  92 | 
  93 |     await primary.getByRole('button', { name: 'Saved', exact: true }).click();
  94 |     await expect(primary.getByRole('button', { name: 'Saved', exact: true })).toHaveAttribute('aria-current', 'page');
  95 |     await expect(page.getByRole('heading', { name: /The evening tonal contrast/i })).toBeVisible();
  96 |     await page.screenshot({ path: `${screenshotDir}/saved-390x844.png`, fullPage: false });
  97 |   });
  98 | });
  99 | 
```