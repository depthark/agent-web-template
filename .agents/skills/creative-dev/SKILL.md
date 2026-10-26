---
name: creative-dev
description: Build expressive, award-level effects in this Astro template with the least possible JavaScript – the effect ladder (HTML → CSS → small JS → Canvas → <ShaderCanvas> WebGL → lazy 3D/WebGPU island), cross-document view transitions, scroll-driven motion, variable-font kinetics, pointer-reactive CSS, shader backdrops, lazy three.js islands, and the performance/accessibility rules that keep Lighthouse 100. Use when implementing a creative brief, animations, WebGL/3D, page transitions, shaders, "make it wow", or step 4–5 of the creative-site workflow.
---

# Creative dev

Input: `docs/creative/brief.md` + `docs/creative/experience.md` (signature specs). The template rules in AGENTS.md still hold (tokens, CMS JSON, conventions); this skill adds how to make it spectacular without paying for it.

References:
- [`references/patterns.md`](references/patterns.md) – copy-ready patterns (view transitions, scroll-driven chapters, pointer → CSS, variable-font kinetics, reveals, carousels, sticky stage).
- [`references/webgl.md`](references/webgl.md) – `<ShaderCanvas>` usage, writing shaders, the lazy 3D island (three.js / WebGPU), GPU budgets.
- The **`css-first`** skill (`.agents/skills/css-first/`) – before any JS, look the effect up in its `css-demos/INDEX.md`; check Baseline there.

## The effect ladder

Climb only as high as the effect needs; write the level and the reason in the signature spec. Every level keeps the levels below it working (progressive enhancement).

| Level | Tool | Typical effects | Cost |
| --- | --- | --- | --- |
| **L0** | Semantic HTML + type | Hierarchy, rhythm, typographic drama, `<details>`, `<dialog>`, popover | 0 |
| **L1** | CSS | Grid composition, `clip-path: shape()`, masks, blend modes, gradients, `@property` animations, scroll-driven animations, cross-document view transitions, `@starting-style`, anchor positioning, `:has()`, container queries, variable-font axes, SVG filters | 0 JS |
| **L2** | SVG | Morphing paths, line drawing (`stroke-dashoffset` + scroll), generated patterns at build time | 0 JS |
| **L3** | Small JS (< 2 kB) | Pointer → CSS custom props, WAAPI for sequences, one `IntersectionObserver` for state | tiny |
| **L4** | Canvas 2D | Particle fields, drawing tools, image sequences | small, CPU |
| **L5** | `<ShaderCanvas>` (WebGL2 fragment shader, ~2 kB) | Fields, noise, distortion, light, gradients that move, image effects | GPU (software GL → CSS fallback) |
| **L6** | Lazy 3D island (three.js / WebGPU via `import()`) | Real 3D models, physics, scenes | 120–300 kB lazy + GPU |

Rule of thumb: most award moments are L1–L2 with one L5. L6 needs the brief to say why 3D *is* the idea.

## Non-negotiables (enforced by `bun run creative:check` and `bun run audit`)

- **Native scroll.** No Lenis/Locomotive/ScrollSmoother. Use scroll-driven animations and `scroll-snap`.
- **No loading screens / preloaders.** HTML content is the first paint; the LCP element is text or the hero `<img>` (`priority`), never a canvas.
- **Reduced motion**: CSS motion inside `@media (prefers-reduced-motion: no-preference)` (or covered by the global override); any rAF/WebGL loop checks `matchMedia("(prefers-reduced-motion: reduce)")` and renders one still frame.
- **Pause what is not seen**: loops stop off-screen (`IntersectionObserver`) and in hidden tabs (`visibilitychange`).
- **Never** `cursor: none`, `maximum-scale`, positive `tabindex`, autoplaying sound, text inside canvas.
- **Budgets per page** (gzip): HTML incl. inline CSS ≤ 50 kB, initial JS ≤ 50 kB, lazy JS ≤ 300 kB. Lighthouse 100 ×4 (+ agentic browsing) mobile and desktop, mobile LCP < 2 s, CLS ≤ 0.01, TBT 0 ms.
- **Animate compositor properties**: `transform`, `opacity`, `filter`, `clip-path` (mostly). Not `width/height/top/left/margin`, not `box-shadow` on large areas. Font-axis animation reflows text – only on short display lines.

## Where things go

| What | Where |
| --- | --- |
| Motion/brand tokens (`--ease-*`, `--duration-*`, colours, fonts) | `public/styles/tailwind.source.css` `@theme` (+ `[data-theme="dark"]`) |
| Global motion (reveals, view transitions) | `public/styles/global.css` |
| Expressive components | `src/components/creative/` (`ShaderCanvas.astro` lives there) |
| Shaders | `src/lib/shaders/<name>.ts` (exported GLSL string) |
| Client scripts | `src/scripts/<name>.ts`, imported from a component `<script>` (Astro bundles, dedupes, defers) |
| Heavy libraries | Only via `import()` inside a script, after load + near viewport |
| Copy, images, toggles the client edits | CMS JSON (`src/data/content/`), never hardcoded |

Astro `<script>` (no attributes) is bundled as a deferred module – use it for anything that imports. `<script is:inline>` only for tiny code that must run before paint (theme). Small bundles are inlined automatically (the shader stage ships inline at ~2 kB gz).

## Workflow

1. **Tokens first** – brand colours (OKLCH, both themes), fonts (self-hosted, subset, fallback metrics: `performance-audit` skill), motion tokens from `experience.md`. Run `bun run css:build`.
2. **Static composition** – build every page at L0–L1 *still*: final layout, type, images. This is also the reduced-motion version. Check 320 px, 200 % zoom, both themes.
3. **Spike the signature** in isolation on a temporary page `src/pages/lab-<name>.astro` (BaseLayout with `noindex`; delete it before merge). Measure: kB, frame time (DevTools Performance, CPU 4× + mobile viewport), GPU time. Abandon or simplify if over budget – before building the rest.
4. **Layer motion** – entrance, reveals, transitions, the signature; each with its reduced-motion translation.
5. **Verify** – `bun run verify` (build + creative-check), then `bun run audit` (browser + Lighthouse); fix everything; hand to `creative-review`.

## Quick decisions

| Want | Use |
| --- | --- |
| Page-to-page continuity | Cross-document view transitions (patterns §1) – not Astro `<ClientRouter />`, not Barba/Swup |
| Something reacts to scroll | `animation-timeline: view()` / `scroll()` (§2) |
| Something reacts to the pointer | Pointer → CSS vars on the element (§3), CSS does the rest |
| Big type that feels alive | Variable-font axes via `@property` (§4), `text-fit` progressive |
| Moving backdrop, light, texture | `<ShaderCanvas>` with a custom fragment (webgl.md) |
| Image distortion on hover | `<ShaderCanvas>` over one image, or CSS `clip-path`/mask transitions first |
| 3D object from the client's world | Lazy 3D island with a poster image (webgl.md) |
| Carousel | Native `overflow-x` + `scroll-snap` + buttons; CSS `::scroll-marker` progressive (§6) |
| Sound | Web Audio after a click on a labelled toggle; muted by default |
