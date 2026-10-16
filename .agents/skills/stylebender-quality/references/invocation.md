# Future invocation

From a future Codex session opened in the repository, invoke:

```text
Use $stylebender-quality to run a complete mobile product-quality cycle for Stylebender.
Read the approved mobile design and MVP scope, inspect the current UI and prior screenshots, fix only the highest-priority agreed defects, run the required checks, capture 320/375/390/430px screenshots, compare them with references, and return the PASS/FAIL evidence report.
```

For a narrower pass, add the route and boundary, for example: `Use $stylebender-quality to review only the mobile Saved journey; preserve desktop and do not run paid provider evaluation.`

The final report should contain:

```text
Result: PASS | FAIL
Scope: ...
Iteration: 0 | 1 | 2
Changed files: ...
Checks: command → PASS/FAIL/NOT RUN (evidence)
Screenshots: 320 ...; 375 ...; 390 ...; 430 ...
Comparison: ...
Recommendation rubric: ...
Unresolved issues: ...
External/provider checks not run: ...
```
