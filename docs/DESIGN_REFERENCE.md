# Stylebender design reference freeze

Status: proposed visual and interaction direction for approval. This document refines the frozen MVP scope in `docs/MVP_SCOPE.md`; it does not add product scope.

## Reference basis

The comparison uses the public positioning and documented flows available on 14 October 2026:

- [Alta Daily](https://www.styledbyalta.com/) — closet-led AI styling, occasion-based outfit help, digital closet, visual garment treatment, virtual dressing-room language and saved/favourite planning cues.
- [Whering: how it works](https://whering.co.uk/how-it-works) — add garments, start styling, create outfits/lookbooks and organise a visual wardrobe.
- [Whering: planner FAQ](https://whering.co.uk/faq/plan-outfit-in-planner) — image-led outfit selection, saved outfits and optional planning are separate actions.

These are pattern references only. Stylebender must not copy layouts, artwork, logos, naming, illustrations or proprietary visual assets.

## Fixed experience principles

1. **Start with the occasion, end with one confident look.** The primary action is decisive and editorial, not an open-ended chat.
2. **Show the outfit visually before explaining it.** Garment images, ownership labels and replacement controls should be scannable before the rationale.
3. **Use the closet as context, not admin.** Wardrobe capture is local, lightweight and in service of getting dressed.
4. **Every generated look is reversible.** Change one piece, elevate, inspect missing pieces, save a new version; never silently overwrite the original.
5. **Keep the trust boundary visible.** Owned items are local wardrobe items; missing items are styling references, not live inventory, prices or checkout.

## Target experience for the six MVP screens

### 1. Discover

The landing screen should feel like a premium editorial cover with one clear job: choose or describe an occasion and start styling.

- Keep the current forest/ivory hero, menswear campaign image and three occasion cards.
- Make the selected occasion persist visibly and make the primary CTA the only dominant action.
- Keep custom occasion entry, but present it as a quiet secondary path.
- Surface a small “using your wardrobe” cue when local garments exist; do not make profile setup mandatory.
- Treat daily tips and Style DNA as below-the-fold reassurance, not competing destinations.

Alta pattern adopted: occasion-led, confidence-oriented entry into a personal stylist. Whering pattern adopted: the wardrobe is useful context from the first styling action.

Distinctly Stylebender: British menswear occasions, restrained editorial voice, forest/bronze visual system and a single considered recommendation rather than a feed or endless shuffle.

### 2. Your Look / Style Verdict

This is the product’s central result screen: one complete outfit, one visual composition and a short rationale.

- Lead with a visual outfit composition or garment collage; keep the verdict/title and occasion attached to it.
- Show every garment as an image-led row/card with clear `Yours` or `Styling reference` status.
- Put the rationale beside or immediately below the outfit, limited to the strongest three reasons.
- Keep the action order: **Wear this**, **Change one piece**, **Elevate**, **Save look**. Make “Change one piece” open an inline piece selector rather than feeling like a new journey.
- Keep loading, auth-required and provider failure states in the same screen with a clear recovery action.
- Saving must create a version; returning to a saved look must preserve its original explanation.

Alta pattern adopted: AI recommendation presented as a confident outfit result, visual garment treatment and individual garment replacement. Whering pattern adopted: outfit pieces are inspectable and composable, with ownership grounded in the digital wardrobe.

Distinctly Stylebender: the verdict language (`Wear`, `Change One Piece`, `Elevate`, `Skip`), concise menswear rationale and explicit distinction between owned garments and non-retailer references.

### 3. My Wardrobe

This is a visual inventory for styling, not a database back office.

- Use a dense image grid with category chips and a persistent, obvious **Add garment** action.
- Keep local upload, metadata confirmation/editing and delete. The first upload should ask only for the minimum useful metadata.
- Make each tile show garment image, short name and category; reveal details on tap.
- Empty state should explain local-first storage and offer either add a garment or load the sample wardrobe.
- From a garment, provide the contextual next action: style an occasion with this piece. Do not introduce a full outfit-builder surface before MVP.

Alta pattern adopted: fast closet capture and studio-like visual presentation. Whering pattern adopted: image-led browsing, category organisation and the idea that wardrobe items are building blocks for outfits.

Distinctly Stylebender: local browser storage by default, men’s categories including Yoruba attire, and no community closet, retailer database or shopping feed.

### 4. Saved Looks

Saved Looks is the returning-user recovery surface for the third MVP journey.

- Show saved looks as visual cards with occasion, title, date/version and a compact owned/missing summary.
- Open a saved look into the same Verdict presentation, with its original rationale intact.
- Make **Use as a starting point** explicit; changes save as a new version and never overwrite the source.
- Keep delete available but secondary and recoverable where practical.
- Empty state should point to Discover and explain that saved looks are reusable references.

Alta pattern adopted: saved/favourite looks as a practical confidence archive. Whering pattern adopted: outfit collections/lookbooks as visual rather than text-first objects.

Distinctly Stylebender: occasion-led version history and reuse/change/elevate behavior, without social sharing, moodboards or calendar planning in MVP.

### 5. Style Profile

Profile should quietly improve recommendations without becoming onboarding friction.

- Collect only style preferences, budget band and preferred occasions currently used by the stylist.
- Explain that preferences are editable assumptions, not a test or immutable style identity.
- Keep profile completion optional for the first generated look.
- Show privacy/local-wardrobe reassurance near wardrobe-related settings.
- Use one clear save/confirm action and preserve the current profile after reload.

Alta pattern adopted: personalisation framed as “your style” rather than configuration. Whering pattern adopted: organisation around how the user actually dresses.

Distinctly Stylebender: a compact UK menswear profile with no social graph, public closet, analytics dashboard or style quiz expansion.

### 6. Sign-in

Sign-in is a conversion bridge only when live generation or persistence requires it.

- Explain the immediate value: sign in to generate and save this look.
- Restore the chosen occasion and pending request after redirect.
- Keep the screen calm and editorial: one Google action, privacy reassurance and a return path.
- Never make a user repeat the occasion, wardrobe selection or prompt after authentication.
- Auth errors must return the user to the interrupted action with a useful message.

Alta pattern adopted: low-friction entry to a personal stylist. Whering pattern adopted: get the user into the wardrobe/outfit loop quickly.

Distinctly Stylebender: authentication is a practical boundary around live AI and saved looks, not a social identity or account-growth surface.

## Design system freeze

### Visual language

- **Colours:** forest green for primary action and confidence, ivory/paper for breathing room, bronze for emphasis and status, charcoal/muted ink for body copy. Preserve the existing palette.
- **Typography:** editorial serif for outcome headlines; compact sans-serif for controls, metadata and explanatory copy. Keep uppercase eyebrow labels sparse.
- **Photography:** premium editorial menswear, warm natural light, clean garment visibility and culturally respectful representation. Prefer existing approved assets and local wardrobe images.
- **Surfaces:** restrained borders, soft shadow, occasional grain and large image crops. Avoid excessive cards, gradients or decorative badges.
- **Shape and spacing:** generous desktop margins; compact but touch-safe mobile controls; one visual focal point per screen.
- **Motion:** short, purposeful transitions for selection, generation and saved confirmation. No autoplay interaction that delays the first action.

### Mobile navigation principles

- Keep the frozen four-item bottom navigation: **Discover, Style Me, Wardrobe, Saved**. Profile is opened from the persistent header avatar.
- Do not add Verdict as a primary label; it is the internal result state represented by Style Me. Achieve and Elevate remain contextual actions. Try On and Style IQ remain out of primary navigation.
- Preserve the fixed bottom bar, safe-area padding and touch targets of at least 44px.
- The active state must be obvious through label, icon and restrained forest tint; do not rely on colour alone.
- Contextual screens need a clear back path to their parent task and must not strand the user in a modal-like route.
- On desktop, retain the compact top navigation and make the active section equally legible.

## Specific improvements to the current implementation, ranked

### P0 — usability and release confidence

1. **Make the Verdict result visual-first.** The current result has a strong editorial hero, but the outfit pieces and their images should be the first scannable content on mobile. This is the core promise of Alta-inspired recommendations.
2. **Clarify contextual navigation.** `Verdict`, `Achieve`, `Elevate`, `Try On` and `Style IQ` can be reached as app states even though only four primary nav items are exposed. Keep only Verdict/Achieve/Elevate as in-journey actions for MVP; hide or demote unfinished Try On and Style IQ so they cannot imply complete capabilities.
3. **Make ownership truth immediate.** Every verdict garment needs an image, `Yours`/`Styling reference` label and a short note before the user reaches Achieve. Avoid language that can be read as product availability.
4. **Preserve task context across auth and reload.** Validate the real Google redirect, saved-look persistence and original-rationale restoration before release; this is already called out in `MVP_SCOPE.md` and is more important than visual polish.
5. **Strengthen saved-look cards.** Ensure Saved Looks visibly communicates occasion, version and the action to reuse as a new version rather than simply reopening an opaque card.

### P1 — high-value refinement

6. **Turn Wardrobe into a stronger image grid.** Keep the current local-first behavior but prioritise garment photography, category filtering and one-tap add/edit over long explanatory copy.
7. **Reduce Discover competition.** Keep “The daily edit” and “Your Style DNA” below the main journey, with Style IQ unavailable or clearly labelled as future/secondary until complete.
8. **Consolidate replacement flow.** Present piece replacement inline in Verdict, then return to the same composition with a visible version/change cue.
9. **Improve empty and failure states.** Give every screen one next action: add a garment, choose an occasion, retry generation, sign in, or return to Discover.
10. **Audit mobile density.** Test long garment names, custom occasions, 3–5 piece outfits, error text and the fixed bottom bar at narrow widths; no key CTA should sit behind the navigation bar.

### P2 — polish after core validation

11. Add subtle transition states for selected occasion, generation and save confirmation.
12. Standardise image aspect ratios and fallback treatment across wardrobe, verdict and saved cards.
13. Add lightweight version labels and timestamps where they help returning users distinguish looks.

## Explicitly out of MVP

Do not add virtual try-on or avatar generation, retailer prices/checkout/affiliate links, community or public closets, social sharing, moodboards, wishlists, weather-driven daily outfits, calendar/planner scheduling, packing lists, style analytics/cost-per-wear, voice AI, cloud photo sync, advanced Yoruba-specific flows, complex editorial/news feeds, or a general-purpose chatbot.

These ideas appear in the references, but they conflict with the frozen release contract or would dilute the three required journeys. They may be reconsidered only after the MVP is verified end to end.

## Approval gate

The approved direction is: **editorial occasion entry → one visual, wardrobe-aware verdict → inline replacement/elevation → save and reuse by version**, supported by a simple image-led local wardrobe and four-item mobile navigation. Further UI work should optimise this loop and should not broaden it.
