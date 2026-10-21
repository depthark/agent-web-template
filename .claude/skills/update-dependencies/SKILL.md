---
name: update-dependencies
description: Bring the project to the latest stable packages, Bun, Node.js LTS and CI versions, then verify the build. Run FIRST whenever a new site is created from this template, and for periodic upkeep or when the user asks to update dependencies.
---

# Update dependencies

Goal: every package on its latest stable release, Bun on the latest stable, Node.js on the **current Active LTS**, CI and Cloudflare pinned to the same versions – and the site still builds and scores 100 in Lighthouse.

## 1. Find the current versions (never from memory)

- Node.js LTS: `curl -s https://nodejs.org/dist/index.json | node -e 'const d=JSON.parse(require("fs").readFileSync(0));const l=d.find(r=>r.lts);console.log(l.version,l.lts)'` (first entry with an `lts` codename = current Active LTS).
- Bun: `curl -s https://api.github.com/repos/oven-sh/bun/releases/latest | grep tag_name`.
- Packages: `bun outdated` (shows Current / Update / Latest).
- Major upgrades (Astro, Tailwind, TypeScript, Decap): read the release notes / migration guide first (context7 or the project's changelog).

## 2. Update

```bash
bun upgrade                  # local Bun
bun update --latest          # all packages to their latest majors
bun install
```

Then sync every place that pins a version:

| What | Where |
| --- | --- |
| Bun | `package.json → packageManager` (`bun@x.y.z`), `engines.bun`, `.github/workflows/build.yml → bun-version`, Cloudflare Pages env `BUN_VERSION` |
| Node LTS | `.node-version`, `package.json → engines.node`, workflow `node-version`, Cloudflare env `NODE_VERSION`, `@types/node` major = LTS major |
| Decap CMS | `public/admin/index.html` script URL (`decap-cms@x.y.z` on unpkg) |
| driver.js | `public/admin/admin-ux.js` (jsDelivr URL) |
| Vendored codecs | `public/admin/vendor/` (jsquash AVIF, squoosh resize, smartcrop) – update only on purpose, keep the patched `threads` stub; test an upload afterwards |
| GitHub Actions | `actions/checkout`, `actions/setup-node`, `oven-sh/setup-bun` majors |

## Deliberate holds (re-check each time, lift when resolved)

- **`typescript` 6** stays next to `typescript-7` (`npm:typescript@^7`) because `@astrojs/check` / the Astro language server need the TS 6 JS API. When `@astrojs/check` supports TS 7, drop `typescript-7`, move `typescript` to 7 and change `typecheck` to plain `tsc`.
- **`@types/node`** follows the Node LTS major, not "latest".
- `smartcrop-sharp` is pinned (exact) – it matches the vendored browser smartcrop so CMS and CLI focus points agree.

## 3. Verify

```bash
bun run build            # astro check + tsc (TS 7) + astro build – must be 0 errors
bun run preview          # click through /, /projekty/, /kontakt/, /admin/
```

- Fancybox opens and closes; CMS loads (`bun run cms:local`), a test photo upload produces AVIF files.
- Run the `performance-audit` skill's Lighthouse check – still 100s.
- If `bun install` reports blocked postinstalls (`bun pm untrusted`), trust only what is needed (`sharp` usually works without).

## 4. Commit

`chore(deps): update to latest (Astro x, Tailwind y, Bun z, Node LTS n)` – list majors and any code changes they required. Update the versions mentioned in `AGENTS.md` if any are named there.
