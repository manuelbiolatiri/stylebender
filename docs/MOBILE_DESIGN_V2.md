# Stylebender Mobile UI/UX Redesign V2

Status: proposed design phase only — no production components changed.

Viewport used for review: 390 × 844 CSS pixels, with iPhone safe-area padding and the browser toolbar excluded from the working canvas.

## Direction

Stylebender should feel like a private menswear atelier in a pocket: quiet, editorial and decisive. The product loop is deliberately short:

`Describe the occasion → see one coherent look → change one piece if needed → save or return to the wardrobe.`

The visual system keeps the existing brand colours — forest `#14251E`, ivory `#F6F4ED`, bronze `#B68754` — but removes the visual noise that currently competes with the first action. Clothing imagery is the hero. Copy is short, specific and useful.

## Mobile design tokens

| Token | Value | Use |
|---|---:|---|
| Forest | `#14251E` | Header, primary actions, result surfaces |
| Ivory | `#F6F4ED` | App background |
| Paper | `#FFFCF6` | Cards, input surfaces, lookbook tiles |
| Bronze | `#B68754` | Eyebrows, status, selected detail |
| Ink | `#202923` | Body copy |
| Muted | `#777B70` | Secondary copy |
| Line | `#E6E3D9` | Dividers and borders |
| Gutter | `16–20px` | Screen edge padding |
| Touch target | `44px minimum` | Buttons, tabs, icon actions |
| Primary CTA | `48–52px high` | One dominant action per screen |
| Radius | `12–16px` | Cards and surfaces; pills only for compact filters |
| Body | `15–16px` | Comfortable mobile reading |
| Metadata | `12–14px` | Labels, ownership and versions |
| Display | `30–36px` | Editorial screen headings |

Global mobile rule: buttons and inputs must not inherit a universal pill shape. Use rectangular or softly rounded controls for primary actions and cards; reserve pill shapes for weather/category filters and compact status tags.

## App shell

- Fixed forest header, 58px high, with the Stylebender mark on the left and a circular avatar on the right.
- The avatar shows the first two uppercase letters of the logged-in email, falling back to the account icon when signed out.
- Only the content region scrolls. Header and bottom navigation stay fixed.
- Fixed bottom navigation: `Home`, `My Look`, `Wardrobe`, `Saved`.
- Bottom navigation uses `env(safe-area-inset-bottom)` plus 12px visual breathing room.
- Content scroll padding ends above the nav bar so CTAs and the last garment never sit underneath it.
- Browser Back and existing URL state remain unchanged; display labels are the only nav change.

## Screen hierarchy

### 1. Home

Purpose: let the user describe what they are dressing for and start immediately.

Order in the first viewport:

1. Small eyebrow: `YOUR NEXT LOOK`.
2. Heading: `What are you dressing for?`
3. Supporting copy: `Describe the occasion. We'll put together a look.`
4. Open multiline textarea with the example placeholder `A dinner date in Manchester on a chilly evening...`.
5. One full-width `Style my look` CTA, disabled until the textarea contains non-whitespace text.

No Church / Office / Date Night cards, no secondary occasion toggle and no marketing image in the mobile first viewport. The textarea is always open and focused only when the user asks for it. On focus, the content region scrolls the textarea and CTA into view so the keyboard cannot cover them.

Persistence: write the occasion to the existing local-storage key on change/submit and pass the same context into the existing Gemini flow. The desktop hero and its current occasion cards remain unchanged.

### 2. My Look

Purpose: make the generated outfit understandable at a glance.

Order:

1. Occasion eyebrow and short outfit title.
2. Compact garment composition using a consistent 3-column image grid.
3. Each piece has a readable short name and a visible ownership state: `Yours` or `Missing`.
4. Primary refinement: `Change a piece`.
5. Secondary actions: `Elevate` and `Save`.
6. Collapsed `Why this works` disclosure containing the existing styling rationale.

Missing pieces use the existing product/catalogue reference only when it is a meaningful match; they never appear as owned or as retail inventory. The incomplete `Try On` action is removed from the prominent mobile result. Existing versioning, saved-look persistence and outfit regeneration remain the data contract.

### 3. Wardrobe

Purpose: browse or add garments with the least possible administration.

The existing internal tabs remain `Explore` and `My Wardrobe`.

Explore starts with compact weather filters: `Hot`, `Mild`, `Cold`, `Rainy`, followed by a two-column image gallery. Sample garments show a small `Sample` label and are never presented as owned until the user explicitly adds them.

My Wardrobe leads with `Add garment`, compact category filters and the owned two-column grid. Editing happens in a focused garment detail sheet/modal instead of adding controls to every tile. Uploaded photos, IndexedDB/local storage and current metadata fields remain unchanged.

### 4. Saved

Purpose: reopen a personal lookbook entry with confidence.

Each card is image-first and consistent with My Look: garment composition, short title, occasion/version metadata, then a single `Open look` action. Delete is a small secondary action and always asks for confirmation. Empty state points back to Home rather than introducing another setup step.

## Accessibility and small-screen risks

- Use `aria-label`, `aria-current` and `aria-pressed` for nav, filter and selection state; never use bronze/forest colour alone.
- Maintain 4.5:1 contrast for body text and 3:1 for large display text and controls.
- Keep all icon-only controls at least 44 × 44px with accessible names.
- Ensure the textarea has a persistent label and a visible focus ring.
- Test 320px width, long custom occasions, long garment names, five-piece looks and provider error copy.
- Avoid fixed CTA overlays in the keyboard viewport; use `scrollIntoView({ block: "center" })` on focus/submit states.
- Use `prefers-reduced-motion` for grid transitions and saved confirmation.
- Verify that the fixed nav does not cover the final card, modal submit button or disclosure content.

## What improves versus the current UI

| Current mobile pattern | V2 decision | User benefit |
|---|---|---|
| Preset occasion cards before free text | Always-open multiline occasion input | Faster first action; no forced categorisation |
| Hero copy plus duplicate prompts | One task headline and one CTA | Lower cognitive load |
| Result mixes editorial hero, actions and duplicate garment lists | Garment composition first, rationale collapsed | The outfit is understood before the explanation |
| Wardrobe combines long education, controls and cards | Weather/category filters + image grid | Faster visual browsing |
| Saved is text/card-led | Image-first lookbook cards | Easier recognition and reopening |
| Global pill styling on all controls | Shape hierarchy by control type | More premium, less toy-like, clearer interaction semantics |

## Prototype review notes

The companion prototype is `docs/prototypes/mobile-design-v2.html`. It is intentionally static and local-only: it uses approved existing assets, realistic example data, and four switchable 390×844 artboards. It does not alter production routes or data behaviour.

Review order: Home → My Look → Wardrobe → Saved. The prototype demonstrates the proposed hierarchy, ownership labels, fixed shell, keyboard-safe input region, and lookbook composition. It is not a replacement for the existing functional app and should be approved before implementation begins.

## Approval gate

Implementation should begin only after approval of this direction. The next implementation step should be a mobile-only pass that keeps desktop markup/behaviour stable, followed by Playwright checks at 320, 375, 390 and 430px and a real keyboard/voiceover pass on iOS Safari.
