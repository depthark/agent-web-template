---
name: creative-site
description: End-to-end workflow for an original, award-level creative website on this template – research, concept, art direction, experience design, signature spike, build, and a gated review – always accessible (WCAG 2.2 AA) and Lighthouse 100, CSS-first with WebGL only where it earns its place. Use when the user wants a "creative", "original", "award-winning", "Awwwards-level", "wow" or "unique" site or page, a portfolio/brand site with art direction, or names reference sites for inspiration. The creative-director agent runs this.
---

# Creative site workflow

Seven phases, each with an artifact in `docs/creative/` and a gate. Never skip a gate; never start building before phase 2 passes. Keep a checklist of the phases in the conversation and tick them off.

```
0 Setup ─► 1 Research ─► 2 Concept & brief ─► 3 Experience ─► 4 Spike ─► 5 Build ─► 6 Review ─► 7 Ship
                         (creative-direction)   (creative-ux)   (creative-dev)        (creative-review + creative-jury)
```

## 0. Setup

- New project? `update-dependencies` → `new-project` first (AGENTS.md). Identity, domain, CMS repo can run in parallel with phases 1–3.
- `mkdir -p docs/creative`. These docs are part of the repo (decisions survive the session).
- Confirm tooling: `bun run verify` passes on the untouched template; Chrome available for `bun run audit` (or `CHROME_PATH`).

## 1. Research → `docs/creative/research.md`

Skill **`creative-direction`** §1: truth inventory, teardowns of every reference the user names, category conventions, award landscape refresh, three art sources.
**Gate**: the inventory has real client material (not assumptions); every reference has "method to learn / do not take".

## 2. Concept & brief → `docs/creative/brief.md`

`creative-direction` §2–3: three divergent concepts → originality tests → choice → art-direction brief.
**Gate**: all six originality tests pass; the brief names its truth, art source and the rule taken; the reduced-motion version is described; the effect-ladder level is justified. Ask the user to confirm the concept if they are reachable (one question, with the three concepts summarised); otherwise proceed and flag the choice in the final report.

## 3. Experience → `docs/creative/experience.md`

Skill **`creative-ux`**: structure, page map, choreography, motion tokens with reduced-motion translations, type scale, navigation, one signature spec per signature moment, copy deck in the client's language.
**Gate**: every expressive element has a keyboard path, touch path and still version written down.

## 4. Spike the signature

Skill **`creative-dev`** workflow step 3: build the signature alone on a temporary `noindex` page; measure kB, frame time (mobile, CPU 4×), Lighthouse.
**Gate**: within budget (`creative-dev` non-negotiables) with its fallbacks working. If not – simplify the effect or go down the ladder, and update the brief. Do not build the rest on an unproven signature.

## 5. Build

`creative-dev` steps 1, 2, 4: tokens → static composition of every page (this *is* the reduced-motion version) → content wired to CMS JSON (+ `public/admin/config.yml` fields for anything the client edits) → motion layers → signature.
Use the `css-first` skill for every effect question before JavaScript. Keep the template's conventions (AGENTS.md): tokens, `ResponsiveImage`, image pipeline, `/kontakt/#poptavka` CTAs, Czech copy in JSON.
Run `bun run verify` after each page; commit per page/feature (Conventional Commits).

## 6. Review → `docs/creative/review.md`

Skill **`creative-review`**: `bun run verify`, `bun run audit`, manual checks, then the **`creative-jury`** agent scores the screenshots and docs.
**Gate**: all automated gates green, jury pass (weighted ≥ 8.0, creativity ≥ 8, nothing < 7). Fix and repeat until it passes; there is no "good enough" exit except the user explicitly accepting a named gap.

## 7. Ship

- Remove lab pages; `bun run verify` once more; `rm -rf .audit` is ignored by git anyway.
- Usual launch skills: `seo-audit`, `accessibility-audit` (manual parts), `performance-audit` on the deployed URL (`bun run audit -- --url https://… --no-build`), `client-handoff` (document how the client edits the expressive parts in the CMS).
- Final report to the user: concept in one sentence, what was built, the Lighthouse table, jury scores, open questions.

## Working autonomously (user away)

Proceed through every phase without waiting; where the user would normally choose (concept), choose by the brief's criteria and record the alternatives so they can switch. Never invent client facts – leave clearly marked placeholders in the CMS JSON and list them. Stop only for missing credentials or a destructive/irreversible action.
