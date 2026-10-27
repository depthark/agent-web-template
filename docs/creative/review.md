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

## Round 6 – 2026-10-27 (jury #1) ✗

Jury (`creative-jury`): design 7.6 · usability 8.2 · creativity 8.3 · content 7.7 → **7.9 (fail, bar 8.0)**; all gates green. Findings and what was done:

1. *Concept stops at the home page* → /projekty/ projects are plates (P. 01–03, client/role in the margin, closing CTA); /kontakt/ form is **Tab. 07** (`:user-invalid · :has() · subgrid` – what it really runs on), contacts in its margin.
2. *Three plates labelled features they did not use* → Tab. 02 runs on real `@layer`s (an ID selector in an earlier layer loses to `.layer` in the last one; every card prints the winner); Tab. 06 is an `@supports` table with CSS-only readouts of the visitor's browser; Tab. 05 marker per theme; vermilion hairline drawn under each plate title; print styles.
3. *No grid break, waterfall not at the fold* → name `min(21.5cqi, 15rem)` bleeds into the margin; hero spacing tightened.
4. *Anybody draws Slovak ľ wrong* (centred háček) → `lcaron` rebuilt from `l` + the apostrophe caron of `ď` with per-region gvar deltas (correct at every width/weight); `docs/creative/tools/fix-lcaron.py`, documented in `public/fonts/README.md` (OFL, no Reserved Font Name).
5. *Micro-typography* → `„…“` quotes, no-break spaces, one-letter prepositions bound to the next word site-wide (`typeset()` in `site.ts`), "e-mailu" unbreakable, layer names with diacritics.
6. *Screen-reader order* → hero notes `aria-hidden`; colophon meter not a live region; arrow `content: "→" / ""`; `lang="en"` on English titles (+ CMS field).
7. *Contact row* → short unbreakable link texts in the margin.
8. *Talks* → place shown only when not Brno; Figma talks described by topic (exact titles: open question for Lukáš).
9. *Header box, footer, list spacing* → hairline-only header; footer is one imprint line; list leading 7.
10. *Layout cost* → `contain: layout` on the name, `contain: layout paint` on waterfall rows, `content-visibility: auto` on plates (style+layout on load −25 % at 4× CPU).

## Round 7 – 2026-10-27 (gates) ✓

verify ✓ · audit ✓ – Lighthouse 100 in every category on all pages (mobile/desktop), CLS 0, mobile LCP ≤ 1.52 s; warning: home mobile TBT 38 ms (variance 0–94 ms across runs on the shared build machine).
