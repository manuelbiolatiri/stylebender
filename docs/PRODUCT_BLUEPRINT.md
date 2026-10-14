# Stylebender — product blueprint

## Product thesis

Stylebender is a decisive, editorial menswear stylist for UK men. It turns a real occasion, real wardrobe, and realistic budget into one strong next outfit decision, then helps the user recreate, elevate, preview, and learn from it.

The product is not a generic chat interface or a catalogue. Every surface should answer: “What should I wear next, and why?”

## Experience architecture

| Layer       | Experience                                                     | V1 truth state                                                           |
| ----------- | -------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Discover    | Occasion-led editorial home, seasonal inspiration, style facts | Local editorial content; live trend/news requires a connected source     |
| Decide      | Style Verdict with Wear / Change One Piece / Elevate / Skip    | Deterministic local fixture until Gemini is wired server-side            |
| Recreate    | Achieve This Look with owned vs missing pieces and budget      | Illustrative prices only until a permitted product source exists         |
| Refine      | Elevate My Look with history and profile signals               | Local versions first                                                     |
| Own         | Wardrobe, item detail, saved looks                             | IndexedDB media + localStorage metadata is the next implementation slice |
| Preview     | Try-On, studio/changing-room scenes, consent                   | Never claim physical fit; external processing is opt-in                  |
| Learn       | Style IQ and Daily Style Edit                                  | Curated, source-labelled content; no fabricated live news                |
| Personalise | Style Profile, Partner Match, Accessories, Yoruba Style        | Explicit preferences and respectful styling guidance                     |

## Navigation map

Discover → occasion → Verdict → Achieve / Elevate / Try-On / Save.

Wardrobe → item detail → evaluate outfit → Verdict.

Saved → saved look or try-on → Achieve / Elevate / Try-On.

Profile → Style DNA, consent, privacy, export/import, delete-all-local-data.

Secondary discovery surfaces: Style IQ, Daily Style Edit, Partner Match, Accessories, Yoruba Style.

## AI boundary

Gemini is the only generative provider. Calls must remain server-side and pass through typed adapters with Zod schemas, rate limits, cost caps, and provider-error states. The browser never receives provider keys. Try-on remains an adapter boundary: if Gemini alone cannot produce a safe, supported visual flow, show an unavailable/demo state rather than fabricated output.

## Privacy boundary

Guest and signed-in identity are separate from cloud media. Wardrobe images remain local by default. Face/body photos require explicit per-operation consent that names the provider, purpose, data sent, and retention limitations. Generated images are visual previews, never proof of fit.

## V1 / V2 boundary

V1 includes accessories, partner matching, Yoruba styling, changing-room presentation modes, optional ambience, Style IQ, daily editorial, and the core wardrobe/styling flows. V2 is audio AI chat. Ambience must remain optional and user-controlled; it is not voice chat.

## Delivery sequence

1. Foundation: route map, design tokens, GSAP motion primitives, responsive shell, auth and PWA.
2. Local product: onboarding, Style DNA, IndexedDB wardrobe, saved data, Verdict, Achieve, Elevate.
3. Gemini gateway: styling, critique, education, personalisation, typed errors and usage limits.
4. Rich V1: Try-On consent gateway, accessories, partner matching, Yoruba styling, environments, ambience, Style IQ, Daily Edit.
5. Release: Playwright flows at 390 / 768 / 1440, accessibility, offline checks, build and deployment documentation.

## Current implementation

The repository currently contains the editorial Discover shell, Google/Auth.js session gating, 30-day sessions, guest landing access, local saved-state demo, supplied artwork, and honest integration documentation. The next high-value slice is the local-first data layer and route-level product surfaces above.
