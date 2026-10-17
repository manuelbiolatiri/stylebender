# Virtual try-on provider request diagnostics

The first live test produced only "Provider could not generate a preview." The server returned that generic message for most non-2xx Vertex AI responses, so it did not distinguish an invalid input from a credentials or region issue.

Fixes:
- `personGeneration: "allow_adult"` was incorrect for the current Google `VirtualTryOnModelParams` REST schema. Use `"allow-adult"`.
- Surface an actionable message with Google's **HTTP status** for a signed-in owner: 400 input, 401 authentication, 403 access/billing, 404 model/region, 429 quota, 503 availability.
- Log only the HTTP status, a restricted machine-readable error code, model and region. Do **not** log photos, request payloads, service-account keys, Google access tokens, or raw provider response bodies.
- This patch makes no paid calls and does not alter authentication, output storage, or feature flags.

Reference: https://docs.cloud.google.com/gemini-enterprise-agent-platform/reference/rest/Shared.Types/VirtualTryOnModelParams

### QA

Run `yarn typecheck && yarn test && yarn build` before merging; no paid provider call is needed for those checks.

If the next authorised live test still fails, record the HTTP status and error code from **Vercel → Stylebender → Logs** for the `/api/try-on` request. Share *only* the code/status, never credentials or uploaded photo data. Confirm Vertex AI API activation and billing in the same project as the JSON credentials.
