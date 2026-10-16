# Real virtual try-on: one person + one garment

## Status

**Feature branch / proof of concept. Not connected to paid inference and not production enabled.**

This is a real Google Cloud Vertex AI Virtual Try-On integration, using Google's specialized model `virtual-try-on-001`. It is not a static overlay or fabricated product imagery.

The screen accepts (1) a consenting adult's photo and (2) a photo of **one** garment. The browser resizes/compresses each image locally. Both remain local until the user ticks explicit consent and presses **Generate virtual try-on**. The model returns one generated image to the current session. The app does not intentionally store uploaded or generated images in localStorage, IndexedDB, Saved Looks or a server-side database, and does not log image bytes.

**Google Cloud processes uploaded image data on generate.** Its processing/retention depends on the user's Google Cloud agreement and service settings. Never promise the images cannot leave the device after generation is requested.

## Enable only after budget and privacy approval

The route deliberately requires both flags:

```text
TRYON_ENABLED=true
TRYON_PAID_CALLS_APPROVED=true
TRYON_OWNER_EMAIL=admin@stylebender.test
GOOGLE_VERTEX_LOCATION=us-central1
GOOGLE_VERTEX_SERVICE_ACCOUNT_JSON=<server-side JSON service-account secret>
```

The service account's project must enable Vertex AI, have access to `virtual-try-on-001` in the chosen supported region, and have permission to invoke publisher model predictions. **Never commit JSON keys.** Prefer short-lived workload identity over long-lived service account keys before opening the app beyond an owner-only PoC.

Calls require owner sign-in, a permitted photo type (JPEG/PNG after browser compression), two images each under 1.5 MB, consent, and two feature switches. A best-effort per-process limit of two paid attempts per owner per day is included, but it is **not a durable budget limit** on serverless. Do not enable production or multi-user use until durable quotas, authentication and budget controls are reviewed. The existing owner-only email Credentials sign-in alone is not high-assurance security for a costly public endpoint.

No new database or garment catalogue integration is necessary to test one person + one uploaded garment. A generated try-on **does not verify real-world sizing, material or colour**.

## Deterministic QA (no paid API requests)

```bash
yarn typecheck
yarn test
yarn build
yarn test:e2e tests/e2e/try-on-poc.spec.ts
```

Playwright mocks the image endpoint. Tests check no request before consent, one request on deliberate generation, error handling, back navigation and mobile widths. The unit test checks paid calls remain gated off. Full live photo fidelity, actual provider response contract, Cloud region/model authorization and real iOS capture require a separate, explicitly approved **billable** smoke test.

Official API references:
- https://cloud.google.com/vertex-ai/generative-ai/docs/reference/rest/Shared.Types/VirtualTryOnModelInstance
- https://cloud.google.com/vertex-ai/generative-ai/docs/reference/rest/v1/projects.locations.endpoints/predict
- https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/vto/virtual-try-on-001
