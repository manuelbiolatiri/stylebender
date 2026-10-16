# Stylebender folded-fabric identity (PR proposal)

Direction: expressive editorial wordmark + simplified folded-fabric symbol, chosen from the user's Concept 1 and Concept 6 shortlist. The lightweight mark is a hand-built true SVG, not a raster trace. The website wordmark uses the existing serif CSS stack so no third-party font binaries are committed.

Palette: forest #14251E, ivory #F6F4ED, bronze #B68754. Avoid metallic effects, embroidery/needle motifs and ornate SB monograms.

Files: `public/stylebender-symbol.svg` is the current primary icon; generated favicons, Apple touch and PWA icons match the mark. The legacy `public/stylebender-mark.png` is deliberately retained for safe rollback, but removed from visible navigation references.

Usage: show the small icon alongside the case-sensitive ‘Stylebender’ wordmark. Keep clear space of at least 10% of the icon width. Avoid placing the symbol on busy imagery. Use the inverse ivory mark on forest.

Visual QA: rendered at 16, 24, 32, 64, 128 and 256px on contrasting backgrounds. Review against the included local brand-board prior to merging. A device/browser smoke test and typecheck/build still remain to run after checking out the PR; no live deployment was performed. Typeface naming and trademark clearance remain unverified. Public use warrants a trademark search.
