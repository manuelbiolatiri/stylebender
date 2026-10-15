# Stylebender Mobile V2 quality pass

Reviewed against commit `6305f16` on 15 October 2026. Scope was limited to visual consistency, mobile interaction quality, garment-image integrity and recommendation coherence. Home layout, authentication and product scope remain unchanged.

## Findings

| Severity | Finding | Location | Resolution |
|---|---|---|---|
| P0 | `navy-blazer.png` showed a beige trouser and white sneaker collage | `public/demo-wardrobe/navy-blazer.png`, `lib/sample-wardrobes.ts`, `lib/products.ts` | Replaced the bitmap with a manually reviewed navy hopsack blazer and added a manifest trust gate |
| P0 | A persisted or model-supplied catalogue image could be displayed without semantic verification | `lib/outfit.ts`, `components/verdict-panel.tsx`, `components/saved-panel.tsx` | Resolve catalogue imagery only through `lib/garment-assets.ts`; unknown/mismatched images become the existing neutral garment placeholder |
| P1 | Mobile My Look repeated action hierarchies: Wear / Change / Elevate / Skip plus footer Elevate / Try On / Shop / Save | `components/verdict-panel.tsx`, `app/globals.css` | Mobile now has one composition, Change a piece as primary, Elevate and Save as secondary, and a concise expandable rationale; desktop controls remain available |
| P1 | Replacement matching could fall back to an unrelated generated piece | `lib/outfit.ts` | Replacement first matches the selected garment category/role, then uses the older conservative fallback |
| P1 | Mobile Wardrobe styling depended on positional child selectors | `components/wardrobe-panel.tsx`, `app/globals.css` | Added explicit classes for tabs, upload, filters, Explore surface and gallery |
| P1 | Home always claimed it was using the user wardrobe | `app/page.tsx` | Context label now distinguishes owned wardrobe, sample references, combined context and no context |
| P1 | Default style preferences and default Mild weather were sent as if user-confirmed | `lib/outfit.ts`, `app/page.tsx`, `lib/sample-wardrobes.ts` | Unconfirmed profile styles are omitted; sample weather enters stylist context only after explicit selection |
| P1 | API accepted incomplete/duplicate outfit responses | `app/api/stylist/route.ts`, `lib/stylist-response.ts` | Require 3–6 unique pieces and complete upper/lower/footwear roles, with a recoverable error response |

## Actual changes

- Added `lib/garment-assets.ts` as the reviewed image source of truth.
- Added `docs/GARMENT_ASSET_MANIFEST.md` with a human-reviewed inventory of every local garment image.
- Added `tests/garment-assets.test.ts` to verify referenced images exist and are manifest-covered.
- Added deterministic recommendation validation and role-preserving replacement logic.
- Added mocked recommendation regression coverage across five occasions and three wardrobe states.
- Added an opt-in live qualitative evaluator; it is skipped unless `RUN_LIVE_STYLIST_EVAL=true` and never runs as part of the default suite.
- Refreshed the 390px mobile screenshots after the corrected garment asset and action hierarchy changes.

## Verification

- `yarn typecheck` — pass
- `yarn test` — 17 pass; 5 explicitly skipped live-evaluation cases
- `yarn playwright test tests/e2e/mobile-shell.spec.ts --project=chromium` — 5 pass at 320, 375, 390 and 430px, including the four-screen journey
- `yarn build` — pass
- Full legacy Playwright suite — 52 pass, 11 failures caused by pre-V2 assertions for removed preset Home cards, the old Generate-with-Gemini intermediate state, old headings and old Wardrobe intro controls

## Remaining risks

- Bitmap semantic correctness still requires human review when new assets are added; the manifest prevents silent use of unknown files but cannot infer garment identity from pixels.
- The live qualitative evaluator is intentionally opt-in and should be run manually before a release decision; it makes paid Gemini calls.
- The deterministic completeness check is conservative. Traditional outfits are exempted from the upper/lower role requirement, but still need footwear unless the response is deliberately extended with a validated traditional-dress exception.
- Existing legacy browser tests should be migrated to the approved V2 Home and Wardrobe flows in a separate test-maintenance change; the product UI should not regain the removed controls merely to satisfy them.
