---
name: brand-pattern-transfer
description: Research established product/brand experiences, extract transferable UX and visual principles, adapt them into an original product without copying identity or assets, and verify the result with screenshots and usability evidence. Use when asked to take inspiration from, benchmark, emulate the quality of, or build something like a recognised brand.
metadata:
  short-description: Reference → dissect → adapt → implement → verify
---

# Brand pattern transfer

Use to make an application as usable, coherent, and polished as a strong existing product **without cloning its brand identity, artwork, text, proprietary assets, or exact distinctive layout**. This is a method for extracting repeatable principles, not a command to reproduce another company's app.

## Reference-to-release loop

1. **Choose references.** Select 2–3 relevant products, each with an explicit *reason* (e.g., onboarding clarity, image-led results, premium editorial typography). Include the user's suggested brands when relevant. Read the target project's scope, approved mobile direction, and its own design tokens first.
2. **Document evidence.** Visit official sites or the accessible product interface. Record URL, date, page/screen, viewport and what was *actually observed*. Product marketing descriptions are not evidence of the shipped mobile app. Capture private/internal screenshots only where access and terms permit. If screenshots cannot be captured, mark **NOT OBSERVED** instead of inventing details.
3. **Dissect, don't imitate.** Identify the user goal, page hierarchy, entry action, component grouping, visual rhythm, feedback, recovery/error states, accessibility, imagery strategy and reason the pattern helps. Separate evidence from interpretation.
4. **Translate.** For each observed pattern choose **ADOPT PRINCIPLE / ADAPT / REJECT**, with a concrete target implementation. Preserve target brand's palette, type voice, imagery, product contracts and existing state/data behaviour. Never automatically add competitor features.
5. **Choose a tiny experiment.** Select at most three highest-value improvements to one user journey. State what will *not* change and write measurable acceptance criteria. Avoid full redesign based on one screenshot.
6. **Implement and observe.** Make scoped edits in an isolated branch. Run app, inspect in browser; when appropriate call `web-design-guidelines`, `mobile-product-quality`, `playwright-cli`, and `vercel-react-best-practices`. Use fresh screenshots at product-approved widths, with one desktop regression check.
7. **Evaluate.** Rate the result on task completion, visual coherence, product/domain trust, and differentiation. Record facts and subjective judgement separately. Do no more than two fix/review iterations, and leave unresolved issues explicit.
8. **Report.** Link source references, decisions, changed files, fresh screenshots, tests actually executed, and remaining risks. Do not assert that a product was copied accurately when its private/mobile UI could not be observed.

## Safety, originality and honesty

- Do **not** copy logos, brand names, photographs, copyrighted marketing copy, proprietary source code, or distinctive full-screen trade dress.
- Do **not** portray the target as affiliated with the reference brand or reproduce purchase/payment flows misleadingly.
- Observe accessible public pages; do not bypass authentication, scrape private content, or ingest consumer data without permission.
- Do not run paid model calls, deploy, change credentials or publish without permission.
- Information from another brand is **inspiration**, not a change to your product's frozen scope.
- Prefer established accessibility and interface patterns over pixel-perfect cloning.

## Templates

- [Evidence dossier](references/reference-dossier.md)
- [Pattern transfer matrix](references/pattern-transfer-matrix.md)
- [Review scorecard](references/quality-scorecard.md)

Use one dossier per product and one consolidated matrix for the target project.
