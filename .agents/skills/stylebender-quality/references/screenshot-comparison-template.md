# Screenshot comparison template

Use one row per route/state and viewport. Link the actual image and the closest approved reference; do not imply pixel parity if no reference exists.

| Route/state | Viewport | Actual screenshot | Approved reference | Result | Findings |
|---|---:|---|---|---|---|
| Home / idle | 320×568 | `...` | `...` | PASS/FAIL | hierarchy, wrapping, CTA, overflow |
| Home / idle | 375×667 | `...` | `...` | PASS/FAIL | |
| Home / idle | 390×844 | `...` | `...` | PASS/FAIL | |
| Home / idle | 430×932 | `...` | `...` | PASS/FAIL | |

Review these anchors for every captured state:

- Shell: header height, mark/avatar, fixed nav, safe-area clearance, active state.
- Layout: gutter, first-viewport hierarchy, card/grid alignment, scroll end, no horizontal overflow.
- Typography: heading scale, line breaks, label clarity, long-content wrapping.
- Controls: 44px targets, focus/disabled/pressed states, one dominant CTA, no accidental pill styling.
- Outfit integrity: correct image, garment role/name, `Yours` vs `Missing`, no invented retail availability.
- State: loading, empty, error, disclosure, save/delete feedback, reduced-motion behavior.
- Responsive risk: compare 320 and 430 for clipping, density, and controls that become unreachable.

`PASS` means no release-relevant discrepancy was found for the reviewed scope. `FAIL` names the concrete discrepancy and whether it is unresolved, fixed in iteration 1, or fixed in iteration 2. `NOT COMPARABLE` is allowed only when an approved reference is absent and must include a manual review note.
