# Stylebender architecture

V1 is a Next.js App Router client-first shell. Small preferences and saved IDs use localStorage; wardrobe media is stored in IndexedDB. Owner-only email/password authentication is handled server-side with Auth.js Credentials, scrypt password hashes, JWT sessions and failed-attempt throttling. Gemini is the only generative AI provider. No private photos are uploaded by the current demo.

`POST /api/stylist` is the first Gemini gateway. It validates occasion, budget, confirmed style signals, actual wardrobe metadata, selected weather sample metadata and request text with Zod, keeps the API key server-side, requests JSON, and returns explicit unavailable/error states when Gemini is not configured or fails. Photo and try-on routes must remain separate and consent-gated.

## Routes

`/` is the discover experience with contextual occasion selection. Client states cover Wardrobe, Saved, Profile, Style IQ and the verdict journey while the product is being expanded.

## Release readiness

Set `AUTH_SECRET`, `AUTH_ADMIN_EMAIL`, `AUTH_ADMIN_PASSWORD_HASH`, and provider keys server-side only before enabling AI. No retailer integration is connected: `getVerifiedRetailerListings` intentionally returns no listings until a permitted UK feed or approved integration is configured and verified. Build with `yarn build`; deployment is intentionally not performed.
