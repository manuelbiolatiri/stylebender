# Reusable mobile QA checklist

Record each item as PASS, FAIL, or NOT RUN, with a short evidence note.

## Contract and scope

- [ ] `docs/MOBILE_DESIGN_V2.md` and `docs/MVP_SCOPE.md` were read.
- [ ] Email-only authentication and existing URL/back state still work.
- [ ] Product scope, local wardrobe ownership, saved-look persistence, and desktop experience are preserved.
- [ ] No unapproved paid Gemini, deploy, push, or provider credential action occurred.

## Shell and interaction

- [ ] Fixed header and bottom navigation remain visible without covering content.
- [ ] `env(safe-area-inset-bottom)` and scroll padding leave the final action/card reachable.
- [ ] Primary controls are at least 44px touch targets; primary CTA is about 48–52px high.
- [ ] Active nav/filter/selection state has semantics (`aria-current`, `aria-pressed`, or equivalent), not colour alone.
- [ ] Textarea has a persistent label, visible focus ring, and keyboard-safe scroll behavior.
- [ ] Long occasions, garment names, five-piece looks, errors, empty states, and loading states do not overflow or trap the user.

## Visual system

- [ ] Mobile tokens use forest `#14251E`, ivory `#F6F4ED`, paper `#FFFCF6`, bronze `#B68754`, ink `#202923`, muted `#777B70`, and line `#E6E3D9` where applicable.
- [ ] Gutter is 16–20px; cards use 12–16px radii; pills are limited to filters/status tags.
- [ ] Type hierarchy and line lengths match the approved direction; no duplicate first-viewport prompts compete with the task.
- [ ] Images are correct, non-stretched, and loaded through the reviewed asset path.
- [ ] Motion respects `prefers-reduced-motion`; contrast is at least 4.5:1 for body text and 3:1 for large text/controls.

## Product journeys

- [ ] Home can start from a custom occasion without forced preset cards.
- [ ] My Look leads with the composition, truthful `Yours`/`Missing` state, one primary refinement, and concise rationale.
- [ ] Wardrobe keeps Explore/My Wardrobe semantics, sample-vs-owned boundaries, filters, and focused editing.
- [ ] Saved is image-first, reopens the correct version, and confirms destructive deletion.

## Evidence

- [ ] Typecheck, unit tests, build, and relevant Playwright commands were executed.
- [ ] Screenshots exist at 320, 375, 390, and 430px and are linked in the report.
- [ ] Each screenshot was compared with an approved reference and discrepancies are recorded.
- [ ] At most two test/fix/review iterations were used.
