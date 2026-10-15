# Recommendation quality evaluation

The mocked regression suite in `tests/recommendation-quality.test.ts` covers five varied occasions across three wardrobe states: empty, one owned shirt, and a blazer-plus-loafers wardrobe. It checks that occasion, confirmation state, sample-vs-owned semantics and weather handling survive prompt construction, and that incomplete or duplicate model output is rejected.

The API now requires 3–6 unique garments with an upper, lower and footwear role, except for clearly traditional one-piece looks. Invalid output returns a recoverable 502-style error to the client instead of becoming a saved outfit.

The optional qualitative suite is `tests/recommendation-quality.live.test.ts`. It is skipped by default. Run it only when explicitly evaluating model output:

```text
RUN_LIVE_STYLIST_EVAL=true GEMINI_API_KEY=… yarn vitest run tests/recommendation-quality.live.test.ts
```

That command makes five direct Gemini calls and should never run in CI or as part of the default test command.

## Review criteria

- Occasion/formality fit: the outfit would be plausible for the stated social setting.
- Completeness: upper/lower/footwear roles are present unless traditional dress makes that structure inappropriate.
- Coherence: colour, material, silhouette and footwear work together.
- Wardrobe integrity: owned means an actual local wardrobe match; sample references are never silently treated as owned.
- Weather discipline: weather influences the recommendation only when explicitly supplied.
- Replacement fidelity: changing a piece preserves the original role/category and every other garment.
- Explanation quality: the response gives one concise summary and no more than three useful reasons.
