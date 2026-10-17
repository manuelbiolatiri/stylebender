# Try-on mobile quality improvements

Scope: one outfit photo + one real garment image, with an optional *text-only* style check. Preserve photo privacy and explicit paid-call consent.

- **Compare:** After a successful Vertex AI generation, a keyboard- and touch-accessible slider displays original and generated images in the same viewport. There is no AI claim of accurate sizing or fit. Both images remain in the current browser session and object URLs are revoked on unmount.
- **Crop:** Tall shopping-site screenshots automatically open a manual crop editor. Adjust top/bottom/left/right with accessible sliders and apply. Cropping occurs on the decoded original pixels *before* local 1280px JPEG compression, so browser chrome is trimmed and only the crop is sent when the user explicitly generates.
- **Existing pieces:** My Look pieces with trustworthy same-origin catalogue photos and wardrobe garments saved to IndexedDB can be selected as the try-on garment. Missing photos show an honest upload prompt; no other garment is substituted as a fake match. Wardrobe cards have a contextual **Try on** action opening the same screen with the garment already selected. Private wardrobe media does not get submitted until generate.
- **Styling assessment:** A separate optional **Get styling assessment (Gemini)** action compares the garment name to the currently opened look's garment names and occasion. It submits **text metadata only**, not the person's photo, product screenshot or generated image; response explicitly states it is not visual assessment. It uses the existing server Gemini key, not a new provider. This is another potentially billable call and only occurs on explicit tap.
- **Bottom navigation:** Try On reserves extra mobile scrolling clearance and scrolls the comparison into view after generation.

Tests added: crop bounds, screenshot pre-crop, one-click generation only, side-by-side slider, current-look reference image, Wardrobe entry, text-only style-check transport, bottom-nav clearance at 320/375/390/430 CSS pixels. Mocked routes avoid paid Vertex/Gemini requests.

QA required: `yarn typecheck && yarn test && yarn build && yarn test:e2e tests/e2e/try-on-improvements.spec.ts`. Real iPhone Safari needs visual inspection; test results **not run** in this connector-only change. Do not merge/deploy without approval. The existing owner-only Credentials auth and serverless best-effort model quotas remain limitations before expanding beyond personal use.
