# Stylebender architecture

V1 is a Next.js App Router client-first shell. Small preferences and saved IDs use localStorage; media is reserved for IndexedDB in the next local-first pass. Google authentication is handled server-side with Auth.js and JWT sessions. Gemini is the only planned generative AI provider; future styling and vision calls should sit behind validated server route handlers. No private photos are uploaded by the current demo.

`POST /api/stylist` is the first Gemini gateway. It validates occasion, budget, confirmed style signals, wardrobe names, and request text with Zod, keeps the API key server-side, requests JSON, and returns explicit unavailable/error states when Gemini is not configured or fails. Photo and try-on routes must remain separate and consent-gated.

## Routes

`/` is the discover experience with contextual occasion selection. Client states cover Wardrobe, Saved, Profile, Style IQ and the verdict journey while the product is being expanded.

## Release readiness

Set provider keys server-side only before enabling AI. Configure Google OAuth callback URLs in the deployment environment. Build with `yarn build`; deployment is intentionally not performed.
