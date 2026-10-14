# Stylebender

Stylebender is a premium UK menswear stylist built with Next.js, TypeScript, Tailwind, Auth.js, GSAP, and a Gemini-only AI boundary.

## Run locally

```bash
yarn install
yarn dev
```

Copy `.env.example` to `.env` and configure `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, and `GEMINI_API_KEY` as needed. Google callback URL for local development:

`http://localhost:4000/api/auth/callback/google`

The landing page and auth views are public. Product routes are protected by Auth.js middleware. `AUTH_ALLOWED_EMAILS` controls the Google email allowlist.

## Product truth states

Local/demo content is labelled in the architecture and implementation docs. No live shopping, current trend/news, physical-fit guarantee, or fabricated AI try-on result is presented as real. Wardrobe images are intended to stay local unless the user explicitly consents to provider processing.

See [docs/PRODUCT_BLUEPRINT.md](docs/PRODUCT_BLUEPRINT.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [docs/PRIVACY_AND_AI_LIMITATIONS.md](docs/PRIVACY_AND_AI_LIMITATIONS.md).

## Checks

```bash
yarn typecheck
yarn build
```

Audio AI chat remains the V2 extension point.
