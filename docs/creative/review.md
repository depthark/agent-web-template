# Review – "Špecimen"

Phase 6 of `creative-site`. Gates: `bun run verify` + `bun run audit` (Lighthouse 13, Chromium without GPU in the build container). Jury: `creative-jury` agent.

## Round 1 – 2026-10-27 (gates)

Gates: verify ✓ · audit ✗ (7 errors)

| Page | Form | Perf | A11y | BP | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- |
| / | mobile | 95 | 100 | 100 | 100 | 1973 ms | 0.091 |
| /projekty/ | desktop | 100 | **95** | 100 | 100 | 457 ms | 0.001 |
| /kontakt/ | mobile | 96 | **97** | 100 | 100 | 1966 ms | 0.000 |

Findings and fixes:
1. **Scroll-driven animations never ran** (found before the audit, by inspecting `document.getAnimations()`): Lightning CSS folded `animation-timeline` into the `animation` shorthand, which Chromium drops. → longhands everywhere; new `creative-check` rule fails the build if it happens again (verified against the broken build: 3 errors).
2. **CLS 0.091** – hero name and claim re-flowed on font swap: the metric-matched fallback was `local("Arial")` only, absent on Linux (Lighthouse). → Arial-metric list (Arial, Helvetica, Liberation Sans, Arimo).
3. **Contrast 2.4:1** – text caught mid-fade by `data-reveal` at the fold (project description, the form section). → no fades on body text or forms (documented in `expressive-a11y.md`).
4. **Mobile FCP 2.0 s** – six font files (119 kB) before first paint. → Martian Mono replaced by system mono; Anybody trimmed to used glyphs in one file from the upstream TTF (62 → 36 kB).

## Round 2 – 2026-10-27 (gates)

Gates: verify ✓ · audit ✗ (1 error) – home mobile performance 99 (FCP 1.5 s, SI 2.5 s).
Fix: **one typeface** – Anybody also sets body text (wdth 96); Inter removed (font bytes 75 → 36 kB).

## Round 3 – 2026-10-27 (gates)

Gates: audit ✗ – Lighthouse 100 everywhere, but CLS 0.028 on /projekty/ mobile (headline re-wrap on swap).
Fixes: fallback face per typographic role with `size-adjust` measured in the browser (body 101.82 %, claim 113.40 %, display 154.77 %); display width caps in `em` instead of `ch`; project titles moved to the calibrated display role; **preload** of the single font (LCP is text, no hero image).

## Round 4 – 2026-10-27 (gates)

Gates: audit ✗ – CLS 0 everywhere; home mobile 98: speed index 3.9 s, TBT 4–12 ms.
Cause: entrance animated the weight axis for 900 ms → layout every frame on the largest text. Fix: compositor-only settle (translate + opacity, 450 ms); axis motion stays scroll-linked.

## Round 5 – 2026-10-27 (gates) ✓

Gates: verify ✓ · audit ✓ (0 errors, 1 warning)

| Page | Form | Perf | A11y | BP | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | mobile | 100 | 100 | 100 | 100 | 1369 ms | 0.000 | 0 ms |
| / | desktop | 100 | 100 | 100 | 100 | 371 ms | 0.000 | 0 ms |
| /projekty/ | mobile | 100 | 100 | 100 | 100 | 1370 ms | 0.000 | 0 ms |
| /projekty/ | desktop | 100 | 100 | 100 | 100 | 314 ms | 0.000 | 0 ms |
| /kontakt/ | mobile | 100 | 100 | 100 | 100 | 1365 ms | 0.000 | 13 ms ⚠ |
| /kontakt/ | desktop | 100 | 100 | 100 | 100 | 371 ms | 0.000 | 0 ms |

(Agentic-browsing category: 100 on every page.) Warning: 13 ms TBT on /kontakt/ mobile from the form-enhancement script.

Not covered by the lab: the WebGL gamut plate (skipped on software GL by design) – verified separately with the GPU path forced: renders in both themes, 0 frames off-screen, still frame with reduced motion.
