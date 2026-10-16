# Sunday demo: single user journey

Open the installed Stylebender app, tap **Use an example** or type a personal occasion, and select **Style my look**. After owner-only sign-in if needed, generate one real outfit, tap the shoes to swap them, save the refined look, then open Saved and reopen it after refreshing.

Automated rehearsal: `yarn test:e2e tests/e2e/demo-journey.spec.ts`. This Playwright test mocks Gemini and writes screenshots to the test output directory. It does not prove real AI quality or real authentication; verify those separately on your installed iPhone PWA with an authorised live call.

Keep the walkthrough to 60–90 seconds; no new onboarding screen or additional product feature.
