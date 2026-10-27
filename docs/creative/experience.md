# Experience – "Špecimen"

Phase 3 of `creative-site`. Structure: **Chapters** (numbered plates of a specimen book), with an index.

## Page map

| Page | Purpose | Sections |
| --- | --- | --- |
| `/` Špecimen | Who, what, proof, invite | Tab. 00 hero · Obsah (index) · Tab. 01 Systém (VIGo) · Tab. 02 Vrstvy (services) · Tab. 03 Texty (writing) · Tab. 04 Pódium (talks) · Tab. 05 Farba (OKLCH) · Tab. 06 Nástroje (open source) · Tiráž (colophon) · CTA |
| `/projekty/` Práca | Detail of the work | Intro + three project plates (VIGo, css-first, agent-web-template), text-only |
| `/kontakt/` Kontakt | Act | Template form – topics: workshop, prednáška, konzultácia, mentoring, iné |

Every inquiry CTA → `/kontakt/#poptavka`. One action per page.

## Plates (home)

Each plate: margin column = `Tab. 0N` (vermilion mono), the CSS feature it runs on (`code`), Baseline status in words; content column = h2 + text + the live specimen.

| Tab. | Title | Content (facts from research) | Runs on | Baseline (css-first snapshot 2026-09) |
| --- | --- | --- | --- | --- |
| 00 | Špecimen | Name + role + two CTAs + Slovak alphabet waterfall | `font-variation-settings`, `animation-timeline: scroll()`, `@property` | scroll-driven: obmedzená dostupnosť |
| — | Obsah | Numbered index of plates (anchors) | `counter()` | široko dostupné |
| 01 | Systém | VIGo: 124 components, 2,000+ variables, Kooperativa/ČPP back offices; 124 cells set in sequence | custom properties, `animation-timeline: view()` | obmedzená |
| 02 | Vrstvy | Services as `@layer` stack: workshopy (spec-driven, vlastní AI agenti, AI frontend workflow), prednášky, konzultácie & mentoring | `@layer` | široko dostupné |
| 03 | Texty | Articles (links to lukaschylik.dev/blog) | `animation-timeline: view()` | obmedzená |
| 04 | Pódium | Talks: FrontKon #25, Frontendisti Brno (host), Web Science 2026 | `container-type: scroll-state` – the plate's label changes when stuck | obmedzená |
| 05 | Farba | OKLCH: lightness × hue slice of the gamut, sRGB edge marked; ref. "Farby na webe v roku 2025" | `oklch()`, `<canvas>` (the one exception) | široko dostupné |
| 06 | Nástroje | css-first skill, css-first MCP, agent-web-template | `@supports` | široko dostupné |
| — | Tiráž | Fonts, measured JS of this page, built with the creative workflow | Resource Timing (only JS) | — |

## Choreography

- **First screen**: name at display size, role line, CTAs, waterfall begins at the fold (cropped → invites scroll). No loading screen.
- **Entrance** (≤ 0.6 s, CSS keyframes, compositor-only): name lines settle 0.12em upward with a short fade, staggered 60 ms. *Review round 2:* the first version animated the weight axis (300 → 800, 900 ms); it re-laid out the largest text every frame and pushed mobile speed index to 3.9 s – axis motion is now scroll-linked only.
- **Scroll**: hero waterfall `wdth` 150 → 50 and `wght` 800 → 200 across the page's first 100svh; margin readouts count with it. Plate 01 cells set left→right across their entry. Other plates: template `data-reveal`. Hairline under each plate title draws on entry.
- **Page transitions**: cross-document view transitions, root cross-fade 220 ms, header persists.
- **Hover/focus**: links underline thickness 1 → 2px + vermilion; same on `:focus-visible`. Cards are not links → no hover.

## Motion tokens

| Token | Value | Use |
| --- | --- | --- |
| `--ease-set` | `cubic-bezier(0.2, 0.7, 0.1, 1)` | entrance, settles |
| `--duration-fast` | 160 ms | UI feedback |
| `--duration-standard` | 420 ms | reveals, hairlines |
| `--duration-slow` | 900 ms | hero entrance total |

Reduced motion: no entrance, no scroll-linking, no view transitions; waterfall shows the full axis range statically (each line at a fixed wdth/wght step), readouts show those static values.

## Signature: Tab. 00 – Špecimen

**Concept link** – type specimen rule: the sample at true size, labelled with its spec; the name is the image.

**Where** – `/` hero (`#specimen`).

**What the visitor sees** – Left margin: `Tab. 00 · Špecimen`, `font: Anybody`, `wght 800`, `wdth 150` (live). Content: "Lukáš / Chylík" in two lines at display size; role sentence; CTAs. Below: five lines of the Slovak alphabet (`Aa Áá Ää Bb Cc Čč Dd Ďď …`) at 6 / 4.5 / 3 / 2 / 1.25 rem, each labelled in the margin with its size. Scrolling the first viewport condenses every line (wdth 150 → 50) and lightens it; readouts count.

**Trigger** – page scroll (`scroll(root)`) range 0 → 100svh.

**Input parity**
| Input | Behaviour |
| --- | --- |
| Mouse / trackpad / touch | Native scroll drives it; nothing else needed |
| Keyboard | Space/PageDown scroll drives it; CTAs are the only focus stops |
| Screen reader | h1 "Lukáš Chylík", role paragraph, CTAs; waterfall and readouts `aria-hidden` |
| No pointer | Same as keyboard |

**Reduced motion** – static: name at wght 800 wdth 150; the waterfall lines step through wdth 150/125/100/75/50 so the *axis* is still shown; readouts show these fixed numbers.

**Fallbacks** – no scroll timelines (Firefox): static as reduced motion; no `@property`: readouts show the static numbers from `content`; forced colours: system colours, no vermilion; print: name + text only.

**Effect-ladder level** – L1 (CSS only). Variable-font animation re-lays out text → only the waterfall lines and the name, `contain: layout paint` on the hero.

**Budget** – 0 kB JS; fonts: Anybody subset ≤ 60 kB (two subsets, loaded only when used); no LCP impact (LCP = name text, fallback face metric-matched).

**Content dependency** – name and role from `settings.json`/`home.json`; alphabet is fixed (language specimen).

**Failure modes** – font fails to load → fallback face (`Anybody Fallback` metrics on Arial); axes do nothing, layout identical.

**Acceptance tests**
- [ ] 320 px: name fits without horizontal scroll at all wdth values
- [ ] Reduced motion: static, no running animation (`bun run audit`)
- [ ] Lighthouse mobile 100; CLS ≤ 0.01 with font swap
- [ ] VoiceOver reads only the h1, role, CTAs in the hero
