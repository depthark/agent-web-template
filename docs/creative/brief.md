# Brief – lukaschylik.dev, "Špecimen"

Phase 2 of `creative-site`. Worked autonomously (the user was away): concept chosen by the criteria below, alternatives kept.

## Three concepts

| | A – Material: **Kaskáda** | B – Process: **2 000 premenných** | C – Inversion: **Špecimen** |
| --- | --- | --- | --- |
| Idea | The site is built from the cascade: each section is a CSS layer, you scroll *down through* the stack. | The page compiles itself from design tokens: raw variables in the hero resolve into the composed page as you scroll. | Lukáš presented as a **type specimen of modern CSS**: numbered plates, each demonstrating a feature he writes and talks about, executed on his own work and labelled with its specification. |
| Truth | Article on cascade layers & @scope | VIGo: 2,000+ design variables | "CSS wizard", css-first author, blog + FrontKon talk on exactly these features; Slovak writer |
| Art source / rule | Agnes Martin – quiet repetition (weak link) | Karl Gerstner – design the programme | Type specimen books – *every sample at true size with its spec*; Ladislav Sutnar – *information design as the signature* |
| Signature | Layers peel on scroll | Tokens fly into place | **Live specimen**: the name and a Slovak-alphabet waterfall whose variable-font axes follow the scroll, with CSS-only numeric readouts of the axis values in the margin |
| Rules inverted | — | No hero copy | No portrait; no mock-up cards; the page **shows its own source and its own weight** |
| Ladder | L1 | L1 + many moving elements (vestibular, cost) | L1 everywhere, L3 for one live meter (≈0.5 kB), one L5 plate (OKLCH gamut shader) as the declared exception |
| Stillness | A stack of cards – generic | The compiled page – loses the idea | A specimen is *by nature* still – full idea survives |

### Originality tests

| Test | A | B | C |
| --- | --- | --- | --- |
| Swap (another dev's name) | ✗ any CSS dev | ✗ any DS dev | ✓ plates are his articles, his talk, his numbers, his skill |
| One screenshot | ✗ | ~ | ✓ paper, vermilion marginalia, waterfall of Slovak diacritics |
| Gallery | ~ | ✗ "tokens assembling" is a common motion trope | ✓ type-foundry specimens exist; a *developer* specimen of CSS features does not show up |
| One sentence | ✓ | ✓ | ✓ |
| Removal | ~ | ✓ | ✓ without plates/labels it is a generic portfolio |
| Stillness | ✗ | ✗ | ✓ |

**Chosen: C – Špecimen.** Strongest truth, cheapest ladder, passes all six. A and B stay as fallbacks (B's token idea lives on inside plate 02).

## Art direction

- **Idea** (SK): *Lukáš Chylík ako špecimen moderného CSS – každá tabuľa predvádza vlastnosť, o ktorej píše a prednáša, na jeho vlastnej práci.*
- **Truth**: CSS craft + the features he teaches + Slovak voice.
- **Art source**: specimen sheets (true size + label) and Sutnar (numbered modules, marginal notes, rhythm).
- **Rules inverted**: (1) no portrait/avatar – the name *is* the image; (2) no screenshots in cards – work is shown as data and live CSS; (3) the source is visible – every plate names its CSS feature and Baseline status, the colophon measures the page's own JavaScript.
- **Signature moment**: hero "Tab. 00 – Špecimen" (see `experience.md`).

### Voice (Slovak)
Precise, dry, a little nerdy; short declaratives; numbers instead of adjectives. Headlines e.g. *„Najprv CSS. Potom JavaScript."*, *„124 komponentov, 2 000+ premenných, jeden systém."*, *„Workshop, prednáška alebo druhý pár očí."* Avoid: "vášnivý", "pixel-perfect", "moderný a čistý", emoji.

### Typography
| Role | Family | Why | Axes kept |
| --- | --- | --- | --- |
| Display / specimen | **Anybody** (OFL, Tyler Finck) | Extreme width axis (50–150) – the specimen can *show* an axis | wght 100–900, wdth 50–150 |
| Text | **Anybody** at wdth ~96, wght 400 (was Inter) | Review round 1: one typeface halves the font bytes before first paint (75 → 36 kB) and makes the site a specimen of *one* face and its axes | same file |
| Marginalia / code | System monospace (`ui-monospace`, SF Mono, Cascadia, Menlo…) | First choice was Martian Mono; dropped in review round 1 – six font files pushed mobile FCP to 2.0 s. The system mono costs 0 kB | — |

Anybody ships as **one 36 kB file** (both axes, only Latin + CZ/SK + punctuation glyphs, from the upstream variable TTF). Subsets: Latin + CZ/SK range (`ä ô ľ ĺ ŕ ď ť ň` – SK needs `Ĺĺ Ľľ Ŕŕ`, already in the template range). Test string at display size: `ĽŠČŤŽÝÁÍÉÔÄŇĎĹŔ ľščťžýáíéôäňďĺŕ`.
Scale: display `clamp(3.5rem, 16cqi, 13rem)`, h2 `clamp(2rem, 6cqi, 4.5rem)`, body 1.0625rem/1.7, marginalia 0.75rem uppercase-free mono, `text-wrap: balance` headings / `pretty` body, measure ≤ 68ch.

### Colour (OKLCH, contrast checked – lowest pair 4.94:1)
| Token | Light ("paper") | Dark ("lamp-black") |
| --- | --- | --- |
| background | `0.972 0.010 85` | `0.170 0.008 60` |
| surface | `0.945 0.012 85` | `0.210 0.009 60` |
| foreground | `0.200 0.012 60` (16.7:1) | `0.940 0.012 85` (16.1:1) |
| muted | `0.420 0.012 60` (7.8:1) | `0.780 0.010 85` (9.6:1) |
| primary – vermilion, text/rules only | `0.530 0.190 33` (5.4:1) | `0.720 0.150 38` (7.3:1) |
| footer | bg `0.140 0.008 60`, text `0.860 0.010 85`, accent `0.780 0.130 45` | same |

One accent only: **vermilion** = the proof-reader's ink of specimen sheets. Never as a fill behind text.

### Grid & space
Book page: a **margin column** (plate number, feature label, Baseline, live readouts) + a **content column**. Desktop `grid-template-columns: [margin] minmax(10rem, 16rem) [content] minmax(0, 1fr)`; below 48rem the margin collapses into a label row above the content. Hairline rules (1px `border-strong`) between plates; generous vertical rhythm (plates ≥ 70svh on desktop, natural height on mobile). The grid is broken once: the hero name bleeds to the right edge.

### Imagery
No photos (none verified). Images are the type itself, live CSS, data (124 cells), and one OKLCH gamut plate. Share images: template generator with the name.

### Motion principles
*Type is set, not animated.* Motion is the compositor setting a line: short vertical settle (≤ 0.35em), weight settling from light to final, hairlines drawing left→right. Easing `--ease-set: cubic-bezier(0.2, 0.7, 0.1, 1)`; durations 160 / 420 / 900 ms. Scroll-linked only in the hero (axes) and plate 02 (cells set in sequence). Reduced motion: everything already set; readouts show final values.

### Sound
None.

### Effect ladder & budget
L0–L1 for everything; L3: colophon meter (Resource Timing, ≈0.5 kB inline). L5: plate 06 gamut shader through `<ShaderCanvas>` (CSS `linear-gradient(in oklch longer hue…)` fallback). Budgets as template: HTML ≤ 50 kB gz, JS initial ≤ 50 kB.

### Risks
- Fonts: two extra families → keep subsets small (target ≤ 45 kB per family woff2), metric-matched fallbacks for Anybody (CLS).
- Live counters in CSS (`@property <integer>` + `counter()`) are Chromium-first → static values are correct by default.
- Scroll-state container queries (plate 05) are Chromium-only → the plate works without them.
- Content the client cannot keep: plate copy lives in `home.json`; feature labels are code (they describe the implementation).

### Placeholders to fill (not invented)
- Contact e-mail for the form recipients (`contact.json → form.recipients`) and Resend domain.
- Phone / postal address / legal entity – omitted from the UI.
- Portrait (deliberately not used), testimonials, prices – not used.
