# Stylebender: transferable brand patterns (research snapshot)

Date: 16 October 2026
Status: **Public-source research and proposed evaluation criteria, not a UI test, design approval or permission to change MVP scope.**

## Contract precedence

1. `docs/MVP_SCOPE.md` defines the MVP and prohibited features.
2. `docs/MOBILE_DESIGN_V2.md` defines the newer mobile direction.
3. `docs/RECOMMENDATION_QUALITY.md` defines model-output quality and ownership truth.
4. This note and earlier `docs/DESIGN_REFERENCE.md` are **inspiration only**. Earlier reference suggestions about occasion cards or Google sign-in conflict with the latest contracts and must not override them. Keep **email-only Credentials auth** and the open occasion textarea.

## Public brand reference set

These observations are based on **publicly documented website features**, not a hands-on inspection of each product's signed-in mobile app. Do not invent current app screenshots, interaction timings or unverified details.

| Product & official source | Observed public feature/positioning | Principle to transfer | What Stylebender must not import |
| --- | --- | --- | --- |
| [Alta](https://www.styledbyalta.com/) | Occasion-led AI styling based on clothes people own; closet imagery, outfit planning, virtual try-on messaging | Lead with the outcome: one clear occasion request and a visually coherent outfit | Virtual avatar/try-on, social features, speculative feature expansion, Alta's brand/graphics |
| [Whering](https://whering.co.uk/how-it-works) | Add wardrobe items, style combinations and create outfit collections/lookbooks | Image-first wardrobe, visible relationship between owned pieces and composed looks | Public wardrobes, social sharing, community feeds, travel planner, brand artwork |
| [MR PORTER What to Wear](https://www.mrporter.com/en-us/hub/what-to-wear/) | Menswear styling organised by occasion, including date night, work and weddings | Confidence, sophisticated editorial hierarchy and occasion-specific explanations | Shop/checkout, product prices, copied headlines, campaigns, trademarks and product imagery |

Only Stylebender's own imagery, copy and approved forest/ivory/bronze visual language should appear in the resulting UI.

## Translation to the current MVP

| Surface | Principle to adopt | Concrete Stylebender application | Acceptance evidence |
| --- | --- | --- | --- |
| **Home** | Alta: occasion-to-outfit directness | Make the existing **open multiline occasion input** and one `Style my look` action dominant. Do not restore preset occasion cards/pills or password fields. | Fresh mobile screenshots show text area and CTA without competition; empty/valid submission and keyboard clearance tested |
| **My Look** | Alta + Whering: visual outfit clarity | Outfit composition first; each garment has correct imagery and `Yours`/`Missing` status. `Change a piece` prominent, `Elevate`/`Save` secondary. | Ownership/image fixture checks plus screenshots, change-one-piece tests, rationale available |
| **Wardrobe** | Whering: garments are visible building blocks | Two-column product-image grid, clear `Add garment`, compact categories, `Sample` vs truly owned labelled unmistakably. | Deterministic wardrobe fixture, category filters and ownership tests |
| **Saved** | Whering: outcomes can be revisited | Visual saved look with occasion, garment context and preserved version; reopening must not rewrite original rationale. | Saved/reopened look test and screenshots |
| **Recommendation quality** | MR PORTER: coherent, occasion-appropriate styling | Prioritise occasion formality, fabric/colour/footwear coherence and truthful explanation over novelty or retail inventory. | Run `yarn test` deterministic recommendation tests, assess rubric in `docs/RECOMMENDATION_QUALITY.md`; do not trigger live Gemini |

## First proposed scope (not yet implemented)

**Review mobile Home and My Look first**, because they connect the main input to the promised outfit.

1. Capture current Home and My Look at **320, 375, 390, 430 CSS px**, plus one desktop viewport, with stable fixtures.
2. Compare against the latest approved mobile direction using the `stylebender-quality` skill, not competitor screenshots as the definition of “correct”.
3. Fix **at most three highest-value P0/P1 issues** if found and in scope. Do not expand to Wardrobe or Saved unless the shared journey is actually broken.
4. Run focused TypeScript, unit, build and Playwright checks. Document PASS / FAIL / NOT RUN from *new* runs only.

**Known QA caveat:** `tests/e2e/generate-screenshots.spec.ts` contains a machine-specific absolute output directory. It should be replaced with a portable `test-results/...` destination **before using it for new captures**. Do not report the existing screenshots as new proof.

## Difference from the references

Stylebender is specifically a **private, UK menswear, occasion-led stylist** with local wardrobe semantics, owned-vs-missing garment truth, a single considered look and version-safe reuse. These characteristics should become more obvious, not be erased by imitation.

## Outcome record

This document does not claim that Stylebender screens were rendered or that tests passed on this date. It records reference research and a scoped design/QA plan only.

## Desktop reference application, 17 October 2026

The desktop iteration originally failed the reference → adapt → verify loop: an oversized
fashion-campaign headline buried the styling form below the fold. This does not reflect
Alta's occasion-first proposition or Whering's utility-first product approach.

For the next desktop-only iteration (PR branch `feat/alta-informed-desktop-home`):
- **Alta**: make occasion entry, a single clear action and wardrobe context immediately visible.
  Source: https://www.styledbyalta.com/ (public site; no claims about signed-in app UI).
- **Whering**: treat the product's wardrobe/output as its core function, rather than selling
  atmosphere alone. Source: https://whering.co.uk/how-it-works
- **MR PORTER**: retain refined typography and menswear photography in a bounded editorial
  panel, rather than a full-bleed photograph eclipsing the product action.
  Source: https://www.mrporter.com/en-gb/hub/what-to-wear/

The resulting desktop home is an original split composition: ivory occasion workspace,
forest CTA and a separate editorial image, using Stylebender brand tokens and imagery.
Tablet and mobile designs remain as previously approved. The desktop 1440×900 browser
test must prove `Style my look` is visible **without scrolling**. Screenshots must be
manually compared before treating visual quality as approved.
