# Shared mobile UI primitives

Use these as a small vocabulary when fixing UI. Reuse existing project components where they already provide the same contract; do not create a component only to rename a one-off element.

| Primitive | Responsibility | Minimum contract |
|---|---|---|
| `MobileShell` | Header, scroll region, fixed bottom navigation | safe-area padding, URL-driven active view, no desktop behavior change |
| `MobileSection` | Consistent page gutter and vertical rhythm | 16–20px horizontal padding; semantic heading slot |
| `PrimaryAction` | One dominant task CTA | 48–52px height, clear disabled/focus states, rectangular/soft radius |
| `IconAction` | Icon-only header/card action | 44×44px hit area and accessible name |
| `FilterGroup` | Weather/category compact filters | `aria-pressed`, selected styling beyond colour, pill shape allowed |
| `GarmentGrid` | Two-column wardrobe or three-column look composition | stable aspect ratio, correct asset resolver, long-name wrapping |
| `OwnershipBadge` | Honest owned/sample/missing state | text label plus semantic state; never imply sample is owned |
| `Disclosure` | Collapsed rationale or secondary detail | keyboard operable, `aria-expanded`, preserves content access |
| `ConfirmAction` | Destructive saved-look deletion | explicit confirmation and recoverable cancel path |

Token baseline from the mobile design: forest `#14251E`, ivory `#F6F4ED`, paper `#FFFCF6`, bronze `#B68754`, ink `#202923`, muted `#777B70`, line `#E6E3D9`; body 15–16px, metadata 12–14px, display 30–36px, radius 12–16px.

If the codebase does not yet expose a named primitive, implement the smallest reusable component or semantic class needed by the scoped fix and document its use in the final report. Avoid global pill rules and positional child selectors.
