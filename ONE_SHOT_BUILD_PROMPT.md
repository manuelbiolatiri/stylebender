# STYLEBENDER — ONE-SHOT STAGED BUILD PROMPT

You are an autonomous senior product engineer, UI/UX designer, frontend architect, AI integrations engineer and meticulous QA engineer. Build a beautiful, usable, **production-minded mobile-first Next.js PWA** named **Stylebender**, a personal AI menswear stylist for UK life. Execute the project **in stages**, with a maximum of **three self-review → UI-test → fix cycles PER stage**. Do not stop after producing mockups or a scaffold. Deliver running functionality, tests, accessible responsive UI and honest integration states. If blocked by absent credentials, implement and test the safe local/demo flow, clearly mark the gated integration, and continue with unaffected work. Never fake production success.

## 0. Inspect these files FIRST; preserve design continuity

This working directory contains a starter kit:

- `references/prototype/index.html` and `references/prototype/assets/*`: existing clickable Stylebender Stage 0 UX baseline. Study the screens, flows, interaction copy and desktop/mobile conventions. Reimplement cleanly as components; **do not iframe, copy/paste the monolithic prototype, or preserve its hardcoded demo behaviours**.
- `references/reference-ui.png`: high-fidelity multi-screen editorial design moodboard.
- `references/original-spiral-editorial.png`: spiral fashion artwork.
- `docs/01-product-and-ux-spec.md`, `docs/02-user-flows-and-wireframes.md`, `docs/03-decisions-and-v2-backlog.md`: previous product intent. Any occurrence of the old name FORM is obsolete: **Stylebender overrides it**.
- `brand/stylebender-wordmark.svg`, `brand/stylebender-symbol.svg`, `brand/favicon.svg`, `brand/pwa-192.png`, `brand/pwa-512.png`, `brand/pwa-maskable-512.png`, `brand/apple-touch-icon.png`, `brand/favicon.ico`, `brand/tokens.css`: initial **editable draft** identity and design tokens. Use them, refine small-size legibility if needed, preserve the spirit.
- `assets/editorial/*`: ready-to-use high-resolution/optimised editorial fashion images.
- `assets/video/hero-motion-from-still.mp4`: a subtle animated pan of a STILL photograph. Do not present it as real filmed model/video footage; poster image must work without video.
- `assets/ASSET_MANIFEST.json`: seed-asset provenance and usage constraints.

Before editing, inspect the existing repository, branch, dependencies and uncommitted changes. **Never discard or overwrite existing user work**. If starting in an empty repo, initialise the app. If a repo already exists, work in a feature branch if possible. Do not push publicly, deploy, incur paid API costs or publish personal uploads without explicit authorisation.

## 1. Product mission and user assumptions

**Promise:** Luxury fashion inspiration, made achievable for ordinary men. Help users **discover, decide, achieve, elevate, virtually try on and save** looks. Emphasise creative styling, real wardrobes, sound taste, and achievable budgets over endless AI chat.

Assume an initial UK personal profile (clearly marked provisional until confirmed):

- Men's fashion, all four UK seasons, sensible layering and weather adaptation.
- Styles: tailored/elegant, creative/statement, relaxed/oversized, classic/preppy, quiet luxury, smart casual, streetwear. Multi-select, never force one identity.
- Typical **whole-outfit target £150–£300**; owned clothing counts as £0 incremental cost. Price examples must say illustrative unless verified live.
- Top occasions: **Church, Office Day, Date Night**. Also support business meetings, networking, parties, evenings, strolls and others as selectable alternatives.
- Wardrobe consists of device-uploaded individual clothing items **and** full outfits.
- Virtual try-on prioritises **real user photographs**, respecting face, proportions, body, skin tone and the original garment reference; generated imagery is NOT proof of real-world physical fit.
- Decisions: **ONE strong style verdict with a short explanation**, not endless options. Use concise labels such as **Wear / Change / Skip**, with honest reason and next step.
- Personalisation: Infer style suggestions carefully from user-confirmed preferences, favourites, outfit evaluations, wardrobe and history. Clearly distinguish inferred from confirmed, provide correction and reset.

## 2. Product navigation and critical journeys

Navigation: **Discover, Wardrobe, Try On, Saved**, with **Style IQ / Daily Style Edit** discoverable in the main content and Profile in the top-right. On desktop, a compact forest-green sidebar is acceptable; on mobile use a thumb-friendly bottom nav and sticky primary actions. Never create an oversized menu or an empty chatbot landing page.

Implement polished screens/routes for:

1. **Welcome/Auth:** Stylebender editorial hero; `Continue with Google`, optionally `Continue with email` only if genuinely configured, and `Explore as guest`. Google OAuth via a maintained compatible auth solution (e.g. Auth.js), server secrets only. Account creation alone must NOT automatically sync private photos. If credentials missing, show a truthful disabled/setup state, with working Guest mode.
2. **Discover/Home:** prominent **“What are you dressing for?”** with Church / Office / Date Night; appropriate UK season/date context and opt-in location-based weather only when actual data is available; restrained editorial look cards; influencer inspiration; Style IQ bite; style tip/fact. Do not hallucinate current weather or trend headlines.
3. **Light onboarding + Style DNA:** multi-select style preferences, outfit budget, occasions, optional body/fit notes, preference confirmation. Default inferred assumptions appear as a **reviewable draft**, not proven truth. User can edit, skip, confirm, revoke and export.
4. **Style Me:** pick occasion, season or date, optional dress code, budget, existing pieces and desired vibe. Keep the main request short. Generate **one primary verdict** that the user can refine.
5. **Style Verdict:** image-led recommended outfit; **Wear / Change / Skip**; no more than three concise explanations; what the user owns, key adjustment(s), seasonal practicality, budget confidence and four actions: **Achieve This Look / Elevate My Look / Try On / Save**.
6. **Achieve This Look:** actionable steps, wardrobe-owned vs missing garments, visual pieces, fit/cut/material/colour notes, affordable substitutes, calculated _incremental_ budget and total. Use verified retailer prices/links ONLY if a permitted, working source exists. Otherwise clearly label curated example products and illustrative prices. Do not falsely claim availability or make counterfeit branded goods.
7. **Elevate My Look:** refine for a different purpose/occasion, more polish, colour upgrade, creative alternative or a clearly labelled “Surprise me” based on confirmed style signals. Preserve a before/after explanation, version history and the ability to undo.
8. **Wardrobe:** capture or upload tops, bottoms, outerwear, footwear or full outfits, multiple images, optional captions/tags; local visual grid, filters, edit/remove, evaluate current outfit for occasion, suggest combinations. Render local image uploads from IndexedDB and persist after refresh; no fake image analysis if no model is connected.
9. **Try On:** guided front/side photo instructions and upload/camera input with explicit consent for external processing. Garment photo/selection and real-person source image; clear source vs generated separation; progress, cancel/error/retry where supported, before/after slider; save only with confirmation. If provider is unavailable, show a useful upload preview and explicit `AI try-on not connected` status, never pass editorial art as a completed personal try-on. Optional on-device pose landmarks MAY give approximate proportions, but no automatic claim to know garment size or physical fit. Video input is optional and only implemented if honest/feasible; any frame extraction is labelled as such.
10. **Saved:** persistent favourite looks, versions, verdicts, own outfits and generated try-ons, filters by occasion/season; ability to delete.
11. **Style IQ:** short grown-up fashion-colour quizzes, practical colour pairings, proportions and layering facts, immediate explanations and lightweight locally persisted progress. No childish points spam.
12. **Daily Style Edit:** evergreen fashion facts and styling tips can ship as source-labelled curated content; **live news/trends require real sources, publication dates and links**. When not connected, label as editorial example or omit current-news claims.
13. **Profile/Privacy/Settings:** confirm/correct provisional style DNA, preferences, budget, reduced-motion settings, consent history, local storage usage where accessible, data export/import, remove a photo, clear ALL local data, explicit provider image processing disclosure, and accessible help/privacy placeholders clearly marked as needing legal review.

Core happy paths to test:
A. Guest → Church → one verdict → Achieve → Save → reload → still saved.
B. Add clothing photos/full outfit → Office → critique → Elevate → Save → reload → images still visible.
C. Explore fashion reference/influencer → recreate within budget → select available pieces → Try On consent → real job if configured, otherwise honest unavailable state.
D. Style IQ quiz → correct explanation → persistent progress.
E. Profile → edit inferred style signals → confirm → recommendations adapt.
F. Google OAuth: login/logout, error callback and post-login return, if configured; guest remains usable otherwise.

## 3. Design system, UX patterns and actual assets

Follow the supplied reference. **Editorial luxury + minimal utility**, not generic SaaS. Primary colour palette (starting tokens): forest `#14251E`, light forest `#21392E`, warm ivory `#F6F4ED`, paper `#FFFCF6`, ink `#202923`, muted `#777B70`, restrained bronze `#B68754`, border `#E6E3D9`. Use serif editorial display (e.g. Instrument Serif or another licence-compatible hosted font) + legible modern sans (e.g. Inter / DM Sans). Headings confident, body concise. Spacious image-led compositions, 4:5 portrait cards, 16:9 banners, subtle rounded corners, gentle hover and restrained motion. Use semantic design tokens rather than scattered hardcoded colours. No overdone glassmorphism, animated gimmicks, generic neon gradients or enormous blank sections.

Use the supplied original **Stylebender S.** favicon/monogram and wordmark for first pass; export a usable SVG logo in light/dark forms, 16/32/48 favicon, 180 Apple touch icon, 192/512 PWA icons and maskable variant, correct manifest `theme_color` and app name. Do not substitute a random emoji logo. Create OG/social sharing image and appropriate page metadata. The wordmark and icon are a _draft_, not trademark-cleared or final. Flag **Stylebender name/trademark and domain clearance** for founder review before public launch.

Populate the launch with included high-fidelity concept fashion images, **not remote placeholder URLs**. Optimise with `next/image`, appropriate alt text, aspect ratios, image lazy-loading, high-res fallbacks, and source attribution/provenance in the asset manifest. Do NOT call these real influencer photos, user try-on outputs or verified product photographs. Do not use official fashion brand marks unless authorised. Add garment thumbnails through the included concept assets or legitimately reusable sources with provenance. Video: wire the provided subtle 4-second **image-based motion** clip into one tasteful section only if it improves the experience; muted/loop/playsInline, poster fallback, `prefers-reduced-motion` disables autoplay. For **real model video**, use only licensed or explicitly generated legitimate video; otherwise leave the still image and an asset TODO, do not invent footage. Maintain aesthetic cohesion across assets.

Mobile viewport targets: **360/390/430px**, tablet **768px**, desktop **1280/1440px**. Respect safe areas, accessible text size, tap targets, keyboard focus, `aria` labels, readable contrast, reduced motion and screen-reader announcements. Keep visual layout stable during loading and avoid oversized animations. All buttons need real effects.

## 4. Technical architecture and constraints

- Next.js **App Router**, stable supported version, **TypeScript strict**, Tailwind CSS, accessible components (shadcn/ui or Radix selectively), Lucide icons, lightweight motion only when justified. No unnecessary framework sprawl.
- PWA manifest, installable icons and deliberately safe offline shell; sensible service worker caching, **no automatic caching of sensitive third-party responses/private photos**. Real offline support for local wardrobe/saved content where practical.
- **Local-first:** `localStorage` for small JSON metadata/preferences/saved IDs, **IndexedDB** (via `idb` or similar) for photos, video blobs and generated previews. Versioned schemas/migrations, export/import with clear privacy messaging, object URL cleanup, quota-error handling and deletion. No base64 photos in localStorage. No account/cloud sync in V1 unless explicitly approved. Sign-in means identity, NOT automatic cloud media syncing.
- Server-only API endpoints / adapters for `StylistProvider`, `VisionProvider`, `TryOnProvider`, `NewsProvider`, `ProductProvider`. At minimum create real, properly validated adapter interfaces for **OpenAI and Gemini** for styling/vision, and a documented try-on provider such as **FASHN** or a legitimately accessible Google Virtual Try-On service. Select supported current model IDs by checking provider docs. Prefer configurable env vars; provider/model swapping should require little UI change.
- If credentials are supplied and network permitted, **actually integrate and verify** supported provider calls. If not, expose clear demo/unavailable state with deterministic test fixtures. No silent mock responses displayed as real AI. Never commit keys or send them to browser; include `.env.example` and setup guide.
- Implement safe image ingestion, MIME/type validation and bounded file sizes, optional client resizing, structured schema validation with Zod, per-user usage controls, throttling/rate limits around costly operations, actionable provider failure messages and basic cost/token/job observability and configurable per-user daily budget/rate caps without logging private photos. Use async generation/job polling only if the provider API warrants it.
- Obtain **explicit per-operation consent** before sending actual body/face photos to a third-party model. Disclose provider, data types, purpose, and retention limitations; don't promise deletion from providers you don't control. If remote upload is required for API access, make it temporary, private, protected and delete when possible. Never analyse/upload in the background just because files were added to a wardrobe.
- Do not make claims about body measurements, guaranteed sizing, exact fit, physical attractiveness or body improvements. Keep body analysis optional and uncertain; user-confirmed measurements have precedence. Model outputs must respect the user photo and identify any visual distortion as possible.
- No scraping Instagram, retailer sites or Pinterest against their terms. For influencer discovery start from legally available public sources/permissioned APIs and pasted links; store attribution, links and dates. Shopping results need provenance; do not fabricate live inventory, price or shopping links.
- Keep dependencies maintainable, design components reusable, server/client separation clear, images accessible, no fake security badges or invented company/legal addresses.

## 5. Execution in stages, autonomous review and test policy

Complete stages in order. **At most THREE cycles of (build → self-review → run UI checks → fix) per stage**, recording pass/fail and outstanding defects in `docs/IMPLEMENTATION_LOG.md`. Do not recurse indefinitely or silently declare success. If failing after 3 cycles, record exact blocker + reproduction steps and progress only if safe.

**Stage 0 — Audit and acceptance map.** Read all supplied files, map current prototype screens to production routes/components, list missing capabilities, create architecture/decision record, visual tokens and acceptance checklist. Never pretend a prototype's demo interactions are live.

**Stage 1 — Polished production shell and branding.** Scaffold/build Next.js PWA, responsive navigation, authentication/guest routes and UX states, theme, fonts, icons, favicon, manifest, image pipeline, exact hero assets and metadata. Screenshot-test mobile and desktop.

**Stage 2 — Core local-first product.** Deliver editable onboarding/Style DNA, wardrobe with uploads, IndexedDB persistence, outfit data model, Discover, occasion flow, Style Verdict, Achieve, Elevate, Saved and functional demo recommendation logic. Test refresh, storage export/import and delete.

**Stage 3 — AI and real-photo try-on gateway.** Implement provider adapters, authenticated API protection and permission gates, model config, error/progress states, styling response schema, image capture, and try-on integration where credentials/docs allow. Test with mocks and real provider only when safe keys/permissions are provided. Do not spend money by running uncontrolled benchmarks.

**Stage 4 — Discovery and learning.** Influencer inspiration/link handling, affordable outfit matching, verified vs illustrative shopping state, Style IQ, Daily Style Edit and source/date discipline. Personalisation updates with explicit correction/confirmation.

**Stage 5 — Quality and release readiness.** Playwright E2E and screenshot checks at 390, 768, 1440; unit tests for ranking, budgets, persistence/migrations and provider schemas; keyboard/accessibility checks; Lighthouse/PWA checks where executable; typecheck, lint, tests and build. Fix prioritised defects within three cycles. Capture representative screenshots, explain remaining provider setup and cost/privacy risks.

Run tests after EVERY stage, not only at the end. Use a real browser/Playwright when supported and inspect screenshots for clipping, typography, mobile nav, correct cropping, colour contrast and layout fidelity. Test unhappy paths such as denied photo consent, absent provider key, bad image, quota exceeded, network failure, signed-out user, offline use and empty wardrobe.

## 6. Deliverables and definition of done

Leave behind:

- A working Next.js codebase with clear component/feature structure and no dead inert buttons.
- `README.md` with local run instructions, feature flags, env setup, app flow map and data storage explanation.
- `.env.example`, `docs/ARCHITECTURE.md`, `docs/UX_ACCEPTANCE.md`, `docs/IMPLEMENTATION_LOG.md`, `docs/ASSET_PROVENANCE.md`, `docs/PRIVACY_AND_AI_LIMITATIONS.md`, and short V2 backlog unchanged. Include a **Vercel deployment readiness** section (environment variables, build command, PWA behaviour, OAuth callback configuration and Cloudflare DNS notes), but do not deploy until approved.
- Public assets: logo/wordmark/favicon/maskable icons, high-fidelity editorial images, optional video with poster fallback and accurate provenance.
- Passing `npm run lint`, `npm run typecheck`, `npm run test` (as defined), `npm run build`, and working E2E UI smoke tests where environment supports them; report any unavailable step rather than claiming it passed.
- Clearly differentiated **real, demo, blocked-by-credentials and V2** features. Show the test evidence and screenshots.
- A concise end-of-stage update containing completed screens, integration state, test results, screenshots (when available), assumptions, outstanding defects and next stage. Final summary has explicit instructions to provide Google OAuth and AI provider keys locally when needed.

**DO NOT include V2 as V1 scope:** luxury changing-room backgrounds/music, accessory styling, date-partner look matching, Yoruba attire speciality, speculative physical-fit prediction. V2 backlog may remain documented but not implemented.

**Product principle:** This should feel like an excellent personal stylist, not an AI API dashboard. A user should understand their next fashion decision within seconds. Ship a visually coherent, honest and functional MVP rather than an enormous catalogue of non-working buttons.

Begin by inspecting the starter kit and current repository. Then execute the stages and self-review them, without asking broad planning questions already answered here.
