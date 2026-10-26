---
name: creative-review
description: The quality gate for creative work – automated gates (creative-check, audit with Lighthouse 100, reduced motion, keyboard, reflow, target size), originality tests, and an Awwwards-style jury score (design, usability, creativity, content, plus developer criteria) with screenshots reviewed by the creative-jury agent. Use before calling any creative page done, before merge/launch, or for "review the design", "is it award-worthy", "score this site".
---

# Creative review

Nothing expressive ships until this passes. Output: `docs/creative/review.md` (append one dated round per review). Run it after every substantial change to a page, not only at the end.

## 1. Automated gates (all must pass)

```bash
bun run verify     # build (astro check + tsc 7) + creative-check (source rules, budgets, markup)
bun run audit      # real browser on every sitemap page + Lighthouse mobile/desktop
# deployed site:   bun run audit -- --url https://www.example.cz --no-build
```

`audit` needs Google Chrome (or `CHROME_PATH`). It writes `.audit/report.md`, Lighthouse JSON per page and screenshots in `.audit/shots/` (mobile/desktop × light/dark, plus `*-mobile-reduced-full.png`).

| Gate | Source | Threshold |
| --- | --- | --- |
| Build, types | `verify` | 0 errors |
| Source rules (zoom, cursor, tabindex, scroll hijack, autoplay, loops without reduced motion, WebGL without pause) | `creative-check` | 0 errors |
| Budgets per page | `creative-check` | HTML ≤ 50 kB gz, initial JS ≤ 50 kB, lazy JS ≤ 300 kB |
| Markup (lang, one h1, alt, canvas role, no 3rd-party CSS/JS) | `creative-check` | 0 errors |
| Console errors | `audit` | none, both themes and viewports |
| Reduced motion | `audit` | no rAF loop, no endless animation |
| Reflow 320 px | `audit` | no horizontal scroll |
| Keyboard | `audit` | every Tab stop has a visible indicator and is on screen |
| Target size | `audit` | ≥ 24 px (template convention 44 px – flag 24–43 px manually) |
| Lighthouse | `audit` | 100 in every category, mobile + desktop; mobile LCP < 2 s; CLS ≤ 0.01; TBT 0 ms (1–50 ms warns – find the long task; > 50 ms fails) |

A failing gate is fixed, never waived. If a budget truly must move, change it in `scripts/creative-check.ts` in its own commit with the reason and the Lighthouse numbers.

## 2. Manual checks (the tools cannot see these)

- Screen reader pass of each page (headings list, landmarks, signature section) – `creative-ux/references/expressive-a11y.md`.
- Contrast of text over imagery/shaders at their brightest frame, both themes.
- Signature acceptance tests from each spec in `docs/creative/experience.md`.
- Touch on a real phone or Playwright mobile emulation with CPU 4×: the signature stays smooth.
- CMS: edit the content that feeds expressive parts in `bun run cms:local` – very short and very long texts, one and thirty images – nothing breaks.
- Czech typography: diacritics at display sizes, one-letter prepositions not at line ends in headings.

## 3. Jury (independent)

Spawn the **`creative-jury`** agent (`.agents/agents/creative-jury.md`) with: the brief, the experience doc, `.audit/report.md` and the screenshots folder. It must not have written the code. It scores like an awards jury and returns ranked findings.

Score each 1–10 (decimals allowed):

| Criterion | Weight | Looks at |
| --- | --- | --- |
| **Design** | 40 % | Composition, typography, colour, imagery, detail, consistency across pages and themes |
| **Usability** | 30 % | Clarity, navigation, speed, accessibility, mobile, forms |
| **Creativity** | 20 % | Originality of the idea and its execution; does it pass the six originality tests |
| **Content** | 10 % | Copy voice, information value, imagery quality, client's language |

Developer criteria (pass / needs work, each with evidence): semantics & SEO, animations & transitions (purposeful, smooth, reduced-motion translated), accessibility, performance (WPO), responsive, markup & metadata.

**Pass**: all gates green **and** weighted score ≥ 8.0 **and** creativity ≥ 8 **and** no criterion < 7. Otherwise: fix the ranked findings (highest impact first), re-run gates, re-jury. No round limit; if the same finding returns twice, fix its root cause (often the concept or a token, not the component).

## 4. Originality re-check

Re-run the six tests from `creative-direction/references/originality-protocol.md` on the *built* site (screenshots, not the brief). Built work drifts towards clichés – compare against the cliché register.

## review.md round template

```md
## Round <n> – <date>
Gates: verify ✓/✗ · audit ✓/✗ (<n> errors) · Lighthouse table (from .audit/report.md)
Jury: design x · usability x · creativity x · content x → weighted x.x (pass/fail)
Developer: semantics ✓ · motion ✓ · a11y ✓ · WPO ✓ · responsive ✓ · markup ✓
Originality tests: swap ✓ · screenshot ✓ · gallery ✓ · sentence ✓ · removal ✓ · stillness ✓
Findings (ranked): 1. … (file:line, fix) 2. …
Fixed this round: …
```
