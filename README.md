# Stylebender

Stylebender is a premium UK menswear stylist built with Next.js, TypeScript, Tailwind, Auth.js, GSAP, and a Gemini-only AI boundary.

## Run locally

```bash
yarn install
yarn dev
```

Copy `.env.example` to `.env` and configure `AUTH_SECRET` and `GEMINI_API_KEY` as needed. The owner-only test email is hardcoded as `admin@stylebender.test`. This owner-only test flow is email-only; failed unknown-email attempts are rate-limited.

The landing page and sign-in view are public. Product routes are protected by Auth.js middleware. There is one owner-only Credentials account; sign-up, password reset and Google OAuth are intentionally unavailable in this MVP amendment.

## Product truth states

Local/demo content is labelled in the architecture and implementation docs. Weather sample wardrobes are styling context only and never count as owned until an individual item is explicitly added to the local wardrobe. Shop this Look currently shows an honest unavailable state because no retailer feed has been approved or verified; it does not invent links, prices or availability.

See [docs/PRODUCT_BLUEPRINT.md](docs/PRODUCT_BLUEPRINT.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [docs/PRIVACY_AND_AI_LIMITATIONS.md](docs/PRIVACY_AND_AI_LIMITATIONS.md).

## Checks

```bash
yarn typecheck
yarn build
```

Audio AI chat remains the V2 extension point.
