# Stylebender MVP 1.0 scope and release checklist

Status: frozen product scope supplied for MVP development. This document is the release contract; post-MVP ideas must not enter the MVP implementation unless they fix a release blocker or complete one of the three journeys.

## Fixed product scope

Stylebender is a responsive, mobile-first UK menswear stylist for men seeking practical, premium-inspired styling. It uses Google Gemini only for live generation, keeps wardrobe photographs local by default, and helps a user choose, refine, complete, save and reuse one occasion-led outfit. It is not a general chatbot, retailer, marketplace or social product.

Required screens: Discover, Your Look / Style Verdict, My Wardrobe, Saved Looks, Style Profile and Sign-in. Achieve and Elevate are contextual actions.

Non-goals: real virtual try-on, live retailer prices or checkout, affiliate shopping, community/social styling, cloud photo sync, partner matching, advanced Yoruba-specific experiences, complex news/editorial feeds and voice AI.

## Three release journeys

1. Quick Style Me: select or describe an occasion, authenticate only when live generation needs it, receive one complete rationale-backed outfit, change/elevate/inspect missing pieces, and save it.
2. Wardrobe First: add a garment locally, confirm metadata, select an occasion, generate with owned garments where appropriate, distinguish owned/missing pieces, and save.
3. Returning User: reopen Saved Looks, open an earlier outfit, see its original explanation and garments, reuse/change/elevate it, and save a new version without overwriting the original.

## Evidence-based release checklist

### P0 — release blockers

- [x] Occasion selection no longer defaults silently to Date Night. Empty selection disables both Style Me entry points; custom occasions remain selectable. Evidence: `app/page.tsx` `startStyling` and disabled CTA paths.
- [x] One Style Me action starts the Verdict journey and auto-starts generation. The idle Verdict state no longer presents a second Generate button; retry remains available only after an error. Evidence: `app/page.tsx`, `components/verdict-panel.tsx`.
- [x] Verify live Gemini connectivity with the configured paid credential. A controlled live request returned HTTP 200 on 2026-10-14; the key and response body were withheld. The app still needs an authenticated browser run to verify the full `/api/stylist` journey, coherent pieces, and browser/network secret boundary.
- [ ] Verify Google sign-in restoration and saved-look persistence across redirect and reload. The client now restores the canonical `Style Me` state and consumes pending generation once; a real configured-provider browser run remains required for Google OAuth proof.
- [ ] Add budget-aware usage safeguards. Current request count is capped, but there is no budget/cost policy, durable usage accounting, or explicit user-facing budget state. Define the permitted monthly/request budget, enforce it server-side, and show actionable limit/failure states without exposing provider details.

### P1 — core journey completion

- [ ] Quick Style Me E2E: guest → occasion/custom occasion → sign-in → original task restored → one live look → rationale → change/elevate/inspect → save.
- [ ] Wardrobe First E2E: upload locally → edit metadata → choose occasion → generation uses owned items → owned/missing labels and local image are truthful → save/reload.
- [ ] Returning User E2E: saved list → open original → change/elevate → save new version → original remains available → delete works.
- [ ] Confirm failures are recoverable: signed out, missing Gemini key, invalid provider response, timeout, quota/rate limit, malformed local data and storage quota errors.
- [ ] Confirm local wardrobe media remains in IndexedDB/local storage and is not sent to Gemini without an explicit provider-processing consent path.

### P1 — release hygiene

- [x] Remove or hide incomplete post-MVP surfaces from primary navigation. Primary mobile navigation is Discover, Style Me, Wardrobe and Saved; Profile is behind the header avatar. Try On and Style IQ remain out of primary navigation.
- [ ] Fix test command separation: `yarn test` currently collects Playwright files and fails before tests run. Unit tests must exclude `tests/e2e/**`; Playwright must run via `yarn test:e2e`.
- [ ] Run typecheck, production build, unit tests and Playwright at mobile, tablet and desktop widths.
- [ ] Complete accessibility checks for disabled/selected occasion states, loading/error recovery, keyboard navigation and meaningful labels.

## Current verification snapshot

- PASS: `yarn typecheck`.
- PASS: `yarn test` after separating the Playwright exclusion; no unit test files are currently present.
- PASS: `yarn build`.
- PASS: focused mocked generation-regression Playwright coverage verifies one request across tab switches, zero requests when reopening a saved look, and one request during pending-auth restoration without stale `Verdict` state.
- PARTIAL: mobile shell screenshots exist in `docs/screenshots/mobile/`, and an earlier focused run passed the 320px, 375px, 390px and 430px shell checks. The latest post-fix run exposed test-harness issues around duplicate desktop/mobile locator matches and wardrobe-tab hydration; this remains open until the suite is rerun cleanly after those assertions are stabilized. Keyboard appearance and device safe-area behavior remain unverified in an emulated native browser.
- NOT PASS: full legacy `yarn test:e2e` suite contains pre-freeze Verdict/Generate selectors and parallel Next dev-cache races; it is not a valid release signal until those tests are migrated to the frozen Style Me flow and run with a stable server configuration.
- PASS: controlled live Gemini request returned HTTP 200; key and response withheld.
- NOT VERIFIED: Google sign-in restoration and real authenticated saved persistence through the external Google consent flow, authenticated full-route Gemini generation with the paid credential, durable budget/cost accounting, and unfamiliar-user usability target (4/5). Provider credential names are present in `.env`, but no browser OAuth/paid integration run is claimed by the mocked test suite. The API still has in-memory per-user request caps and output-token caps, but no durable billing budget.

MVP 1.0 cannot be declared complete until every P0 and P1 item above is verified, all automated checks pass, and the three journeys work end-to-end without presenting unfinished functionality as complete.
