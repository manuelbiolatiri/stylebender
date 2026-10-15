# Vercel configuration

Configure these variables as server-only Vercel project environment variables for Preview and Production:

```text
AUTH_SECRET=<long random value>
AUTH_ADMIN_EMAIL=admin@stylebender.test
GEMINI_API_KEY=<Gemini key>
GEMINI_MODEL=gemini-3.8-flash
GEMINI_FALLBACK_MODEL=gemini-3.6-flash
GEMINI_MAX_REQUESTS_PER_HOUR=8
GEMINI_MAX_OUTPUT_TOKENS=2048
```

Do not add `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` or passwords to source control. Credentials are intended for owner-only testing in this MVP amendment. Anyone who knows the configured admin email can enter this intentionally weak test flow.

No Vercel Marketplace integration is required for the current Shop this Look state. Retailer links remain disabled until a permitted UK feed or approved integration supplies verified product name, retailer, image, GBP price, availability and outbound URL data. Do not enable fabricated or manually guessed listings.

After configuring the variables, run `yarn build` locally and verify `/sign-in`, the Credentials session, Gemini request limits, weather sample selection and the unavailable shopping state before deploying. Deployment is intentionally a separate approval step.
