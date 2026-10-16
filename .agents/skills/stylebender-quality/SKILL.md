---
name: stylebender-quality
description: Run a complete, mobile-first Stylebender product-quality cycle: inspect the approved design and MVP contracts, fix a scoped set of UX/visual/recommendation issues, verify the app, capture four mobile widths, compare against references, and report evidence.
metadata:
  short-description: Mobile UX, visual, and outfit-quality cycle
---

# Stylebender quality cycle

Use this skill when the task is to improve or review the Stylebender product across mobile UX, visual polish, outfit/recommendation quality, and release evidence. It is repository-local and assumes the current working directory is the Stylebender repository.

## Non-negotiable product boundaries

- Read `docs/MOBILE_DESIGN_V2.md` and `docs/MVP_SCOPE.md` before proposing or changing scope. Treat the MVP scope as the release contract and the mobile design as the approved mobile direction.
- Preserve email-only Credentials authentication, the existing URL/state navigation, the current product scope, local wardrobe semantics, saved-look lifecycle, and desktop markup/behaviour. Mobile-only CSS or responsive wrappers are preferred when they satisfy the issue.
- Do not add Google OAuth, checkout/retailer data, social features, cloud photo sync, or other post-MVP work.
- Never run `RUN_LIVE_STYLIST_EVAL=true`, make paid Gemini calls, push, deploy, or change production credentials unless the user explicitly approves that exact action.
- Never report a check as passed from a document, old screenshot, or prior log. A PASS requires the command to have run in this cycle and its result to be recorded. If a required command cannot run, report FAIL or NOT RUN with the reason.

## Cycle

1. Establish a baseline. Read the two contracts plus relevant `docs/UX_ACCEPTANCE.md`, `docs/RECOMMENDATION_QUALITY.md`, `docs/MOBILE_V2_QUALITY_PASS.md`, and `docs/UX_AUDIT_REPORT.md`. Inspect `app/`, `components/`, `lib/`, tests, previous screenshots under `docs/screenshots/`, and `git status` before editing.
2. Inspect the running UI at the relevant route(s), including the existing mobile screenshots and desktop path. Identify defects in three buckets: UX/interaction, visual/layout/accessibility, and outfit/recommendation integrity. Prioritise P0 release blockers, then P1 journey blockers, then high-value polish. State the agreed scope in the report before implementation; if the user has not narrowed it, use the smallest set that fixes the highest-priority defects.
3. Implement only that scope with existing patterns. Prefer shared components, explicit semantic classes, and the mobile tokens/primitives in `references/mobile-primitives.md`. Avoid positional selectors, duplicated action logic, fake inventory, unverified imagery, and desktop regressions.
4. Run, in this order, `yarn typecheck`, `yarn test`, `yarn build`, and the relevant Playwright command. Use `yarn test:e2e` for the full suite; use focused specs when iterating. Do not silently change scripts or weaken assertions to make a check pass. If the repository's full suite contains known legacy failures, separate them from the focused approved-flow result.
5. Capture the approved screens at exactly 320px, 375px, 390px, and 430px CSS width. Prefer the repository's existing `tests/e2e/generate-screenshots.spec.ts` or add a scoped deterministic Playwright capture. Keep artifacts in a clearly named `docs/screenshots/...` or test-results location and record the route, viewport, state, and filename. Do not use paid live generation for screenshots; use the existing deterministic/mock/sample flow.
6. Compare each capture against the nearest approved reference, using `references/screenshot-comparison-template.md`. Check hierarchy, shell/nav, overflow, safe-area/nav clearance, touch targets, text wrapping, image identity, ownership labels, loading/error states, and desktop preservation. A screenshot comparison is not a PASS merely because the page renders.
7. Apply at most two test → fix → review iterations. Stop early when the scoped defects and evidence are clean. If a second iteration does not resolve an issue, leave it unresolved and report it rather than expanding scope.
8. Finish with a concise PASS/FAIL report containing: scope, changed files, commands and exact outcomes, four-width screenshots, comparison findings, recommendation rubric result, unresolved issues, and any unverified external/provider checks. Update project documentation only when the task explicitly calls for it; do not rewrite historical evidence.

## Required references

- For the reusable QA gates, read [references/mobile-qa-checklist.md](references/mobile-qa-checklist.md).
- For captures and visual review, read [references/screenshot-comparison-template.md](references/screenshot-comparison-template.md).
- For outfit/recommendation review, read [references/recommendation-rubric.md](references/recommendation-rubric.md).
- For component/token decisions, read [references/mobile-primitives.md](references/mobile-primitives.md).
- For future invocation and report shape, read [references/invocation.md](references/invocation.md).
