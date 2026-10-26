# Creative workflow – how to use it

A workflow for **original, award-level sites** that stay **accessible (WCAG 2.2 AA)** and score **Lighthouse 100** on every page. It lives in the template as agents, skills and two quality gates.

## Start

In Claude Code, in a project made from this template:

```
Use the creative-director agent to design and build an original site for <client>.
Truth: <what they make, where, how, any material you have>. References: <URLs>.
```

or run the workflow yourself with `/creative-site`. Other agents (Codex etc.) find the same skills through `AGENTS.md`.

## What happens

| Phase | Skill | Artifact |
| --- | --- | --- |
| 1 Research – client truth, reference teardowns, award landscape, art sources | `creative-direction` | `docs/creative/research.md` |
| 2 Concept – three divergent concepts, originality tests, art-direction brief | `creative-direction` | `docs/creative/brief.md` |
| 3 Experience – narrative, choreography, motion tokens, signature spec | `creative-ux` | `docs/creative/experience.md` |
| 4 Spike the signature, measure it | `creative-dev` (+ `css-first`) | lab page (deleted) |
| 5 Build CSS-first, WebGL only where it earns it | `creative-dev` | the site |
| 6 Gates + independent jury until it passes | `creative-review` + `creative-jury` agent | `docs/creative/review.md` |
| 7 Ship | `seo-audit`, `client-handoff`, … | — |

Originality is engineered, not hoped for: concepts come from the client's own material plus one *rule* borrowed from art (`art-canon.md` – Müller-Brockmann, Sýkora, Albers, Turrell, Teige, Sutnar, Ando, Saul Bass, …), are checked against a register of 2024–2026 clichés, and must pass six tests (swap, one-screenshot, gallery, one-sentence, removal, stillness).

## Gates

```bash
bun run verify   # build + creative-check: source rules, per-page budgets, markup – CI runs this
bun run audit    # Chrome on every page: console errors, reduced motion, 320 px reflow, keyboard focus,
                 # target size, screenshots + Lighthouse 13 mobile/desktop → .audit/report.md
bun run audit -- --url https://www.client.cz --no-build   # the deployed site
```

`audit` uses your installed Google Chrome (or `CHROME_PATH=/path/to/chrome`).

## The WebGL piece

`<ShaderCanvas>` (`src/components/creative/`) renders a fragment shader behind real content for ~2 kB: lazy, paused off-screen and in hidden tabs, one still frame with reduced motion, CSS fallback for no WebGL, software GL (incl. Lighthouse/PageSpeed), forced colours, print. Heavier 3D goes into a lazily imported island with a poster image (`creative-dev/references/webgl.md`).

## Research notes (October 2026)

- Awwwards Site of the Year 2025: **Lando Norris** (OFF+BRAND); Developer SOTY: **Messenger** (abeto); 2024: **Igloo Inc**. Monthly winners 2025–2026 and what each teaches: `.agents/skills/creative-direction/references/award-landscape.md`.
- **danielspatzek.com** – method studied via Awwwards/CSSDA case studies (the site itself was blocked by the research container's network policy): rule inversion, geometry from Bruegel/Michelangelo matching his logo, a hidden section encoded from his name.
- **mistrymont.com** – unreachable and not indexed under that spelling; send the correct URL and ask the agent to run `reference-teardown.md` on it.
- "Best sites of 2027" do not exist yet; the landscape file lists the signals leading there (native motion, bolder type and colour, anti-polish, accessibility law, WebGPU).
