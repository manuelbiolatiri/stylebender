# Elevate: optional alternative study

The **Elevate** action is an optional preview workflow, not a replacement for My Look.

1. The user taps **Back to My Look** at any time to return to their original look.
2. Four equal-sized direction buttons select the aesthetic; none calls Gemini until the user explicitly taps **Preview [direction] look**.
3. The returned comparison is labelled **Optional preview / Not applied**. Generating never writes the current outfit or saved outfit history.
4. The user chooses **Keep original**, which returns without modifying the current outfit, or **Adopt this look**, which saves the alternative and makes it current.
5. Only previously adopted alternatives appear in the persisted history.

**Do not make paid live Gemini requests during QA.** Test with `yarn typecheck && yarn test && yarn build && yarn test:e2e tests/e2e/elevate-preview.spec.ts`. Confirm layout and bottom-nav clearance at 320, 375, 390 and 430 CSS pixels, plus an actual iPhone Safari session. Focused Playwright tests use a mocked `/api/stylist` route; the real Gemini output and camera/browser behaviour are not covered.
