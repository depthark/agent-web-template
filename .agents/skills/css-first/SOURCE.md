# Source

Vendored from [luko248/css-first-skill](https://github.com/luko248/css-first-skill) (MIT, © Lukáš Chylík), listed on [skills.sh](https://skills.sh/luko248/css-first-skill/css-first).

- Upstream commit: `75ba17b3afbdc4dcf5d18480db104c9dd0518a99` (2026-09-25)
- Not copied: `CLAUDE.md` (contributor notes for the upstream repo), `.git`.

Update: re-clone upstream and copy `SKILL.md README.md references/ css-demos/ scripts/ agents/` over this folder, then bump the commit above. Refresh Baseline snapshots with `python3 scripts/update_baseline.py --check` from this folder.

## How it fits this template

- The `creative-dev` skill sends every "can CSS do this?" question here first (the **effect ladder**).
- Demos use plain CSS; in this repo translate them to Tailwind utilities where a utility exists, otherwise a component `<style>` (see AGENTS.md → Conventions).
- Template browser targets: last 2 versions of Chrome, Edge, Safari, Firefox. 🟡 Limited / 🟣 experimental features only behind `@supports` with a finished fallback.
