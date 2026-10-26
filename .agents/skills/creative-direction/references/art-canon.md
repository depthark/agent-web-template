# Art canon – inspiration from outside the web

Web galleries make sites that look like web galleries. Original work borrows a **rule** from another discipline and applies it to the client's own material. Each entry: the artist's principle → what it becomes on the web → the platform feature that does it cheaply. Take the principle, never the look (no pastiche of a famous image).

Pick **one** primary source per project (two at most). Name it in the brief and say which rule you take from it.

## Grid, system, structure

| Source | Principle | On the web | Built with |
| --- | --- | --- | --- |
| **Josef Müller-Brockmann**, Swiss Style | A modular grid is the content's logic, made visible | Grid that changes module by content type; visible baseline/columns as ornament | CSS Grid + `subgrid`, `round()` to snap to a baseline, gap decorations (`column-rule`) |
| **Karl Gerstner**, *Designing Programmes* | Design a *programme* that generates layouts, not one layout | A layout engine: every project page composed by rules (data → template permutations) | Astro components with variant rules; container queries |
| **Wim Crouwel** | Type built from the grid itself | Display lettering drawn on the site grid (SVG from a cell matrix) | SVG `<use>` cells, CSS grid of spans with `aria-hidden` + real text |
| **Agnes Martin** | Quiet repetition, hand-drawn imperfection | Hairline rules, near-white fields, tiny irregularities | `repeating-linear-gradient`, `random()` (where supported) or seeded per item |
| **Piet Mondrian** | Asymmetric balance with a few primaries | Layout of unequal blocks that re-balance per breakpoint | Grid template areas per container size |
| **Zdeněk Sýkora** (CZ, 1960s computer-generated *Structures*) | One module, rotated by a rule, makes a field | Pattern generated from the brand mark rotated 0/90/180/270° by a rule | CSS grid + `rotate` from `sibling-index()` / nth-child, or a fragment shader |
| **Sol LeWitt**, wall drawings | The artwork is the instruction; anyone executes it | Generative pieces whose rule is published on the page (a reward for the curious) | Shader or SVG with a seeded rule; the rule text in HTML |
| **Vera Molnár** | Order + 1 % disorder | Perfect grid with one controlled deviation that follows the cursor or scroll | `@property` + scroll-driven animation on one element |

## Colour and light

| Source | Principle | On the web | Built with |
| --- | --- | --- | --- |
| **Josef Albers**, *Interaction of Color* | A colour changes with its neighbour | Brand colour that shifts perceptually as sections change background | OKLCH tokens, `color-mix()`, relative colours per section |
| **Mark Rothko** | Large soft fields that make you slow down | Full-viewport colour fields between dense content; soft edges | gradients in `oklch`, `mask-image`, `ShaderCanvas` with slow noise |
| **James Turrell** | Light as material; the frame defines the sky | A framed aperture whose colour changes with time of day (client's city) | CSS custom props set at build or from `Date()` on load; `@property` transition |
| **Olafur Eliasson** | The visitor's presence completes the work | Colour/shadow responds to the visitor (pointer, tilt, ambient light – opt-in) | pointer → CSS vars; `DeviceOrientation` only after a tap |
| **Hilma af Klint** | Diagrams of an inner system, symmetrical and botanical | Navigation as a diagram of the business (services as a living chart) | SVG + CSS `offset-path`, anchor positioning for labels |
| **Josef Sudek** (CZ photographer) | Patient light through a window; mist, glass | Photography-led site; slow light sweep over images | `mask-image` gradient animated with scroll timeline |

## Perception and motion

| Source | Principle | On the web | Built with |
| --- | --- | --- | --- |
| **Bridget Riley**, Op Art | Repetition + tiny shifts → movement without motion | Stripes/waves that appear to move as you scroll (static frames) | `repeating-*-gradient`, scroll-driven `background-position` – watch vestibular limits |
| **Carlos Cruz-Diez** | Colour that changes with the viewer's position | Bands that reveal different colours as the page scrolls past | Layered gradients + `background-attachment` / scroll timeline |
| **Eadweard Muybridge** | Motion as a sequence of stills | Process shown as frame strips that scrub with scroll | `animation-timeline: view()` on a sprite / `object-position` steps |
| **Norman McLaren**, **Oskar Fischinger**, **Len Lye** | Drawing directly on film; visual music | Shapes choreographed to a rhythm (optionally to sound after opt-in) | WAAPI timelines, CSS `steps()`, Web Audio analyser → CSS vars |
| **Saul Bass** | Title sequences: one graphic idea, cut to rhythm | Page entrance as a 2-second title sequence of the concept (skippable, reduced-motion still) | `@starting-style`, view transitions, keyframes on SVG |
| **Jan Švankmajer** (CZ), stop-motion | Tactile, uncanny, handmade motion | Stepped, low-fps animation of real objects photographed | `steps()` timing, image sprites in AVIF |

## Type as image and voice

| Source | Principle | On the web | Built with |
| --- | --- | --- | --- |
| **Paula Scher** | Type at architectural scale, the wall is the page | Headlines that fill and break the viewport, still real text | `clamp()` / container units, `text-fit` (progressive), `text-wrap: balance` |
| **Wolfgang Weingart**, **David Carson** | Break typographic rules with intent | Collisions, overlaps, rotated lines – in the hero only, body stays calm | Grid overlap, `writing-mode`, variable font axes |
| **Barbara Kruger**, **Jenny Holzer** | Direct statements, the viewer addressed | Short declarative lines as section dividers; LED-like ticker done honestly | Plain HTML; `@keyframes` marquee only with pause control |
| **Karel Teige** (CZ), *typofoto* | Type and photo as one composition | Text cut-outs revealing photos, photo crops aligned to letterforms | `background-clip: text`, `mask` with SVG text, `mix-blend-mode` |
| **Ladislav Sutnar** (CZ) | Information design: clarity as a visual signature | Price lists, timetables, specs designed beautifully (often the most-used content) | Tables with `subgrid`, `font-variant-numeric: tabular-nums` |
| **Czech film poster school** (1960s) | Surreal collage, hand lettering, flat colour | Collage hero assembled from client photos with flat colour planes | `clip-path: shape()`, blend modes |

## Space, void, material

| Source | Principle | On the web | Built with |
| --- | --- | --- | --- |
| **Tadao Ando** | Concrete, one slit of light, procession | A sequence of quiet sections leading to one bright moment | Scroll-driven light/mask, generous whitespace |
| **Kenya Hara**, *White*; Japanese *ma* | Emptiness as content; the pause | Large intervals, one element per screen, slower rhythm | Spacing tokens, `scroll-snap` (proximity, never mandatory for long text) |
| **Carlo Scarpa** | Obsessive joints and details | Micro-details: focus rings, hairlines, numeric labels crafted like joinery | Component-level CSS; `corner-shape`, `border-area` clips |
| **Kurt Schwitters**, **Hannah Höch**, **Robert Rauschenberg** | Collage of found material | Process documents, sketches, receipts of the client's real work arranged as layers | Absolute layers with `rotate`, CSS `random()` with fallbacks |
| **Dieter Rams** | Less but better; honest controls | UI controls that look exactly like what they do | Native elements styled (`appearance: base-select`, popover) |

## Data, light, systems

| Source | Principle | On the web | Built with |
| --- | --- | --- | --- |
| **Ryoji Ikeda** | Data as pure light/sound, precision | Real client data (orders, kilometres, seasons) rendered as a precise visual | SVG/Canvas from build-time JSON; shader for density |
| **Casey Reas**, **Zach Lieberman**, **Tyler Hobbs** | Code as a drawing tool; process over output | A generative mark unique per page/day, seeded from content | `ShaderCanvas` or SVG generated at build (zero runtime JS) |
| **Brian Eno**, generative music; **John Cage**, chance | Systems that never repeat; chance operations | Composition that varies per visit within strict rules | Seeded randomness at build or on load; CSS `random()` progressive |
| **Refik Anadol**, **teamLab** | Immersive data spectacles | Use sparingly: one immersive section, never the whole site | `ShaderCanvas`; heavy 3D only via lazy island |

## Film and narrative

| Source | Principle | On the web | Built with |
| --- | --- | --- | --- |
| **Andrei Tarkovsky** | The long take; time you can feel | One continuous scroll "shot" through the story, no cuts | Sticky stage + scroll timeline driving a scene |
| **Stanley Kubrick**, one-point perspective | Symmetry pulls the eye to one point | Symmetric heroes that converge on the CTA | Grid centring, perspective transforms |
| **Chris Marker**, *La Jetée* | A story told in still images | Photo essay with timed captions, readable as plain text | Figures + `view()` reveals, captions in HTML |

## How to use a source (worked example)

Client: a Brno joinery. Source: **Carlo Scarpa** (joints) + **Zdeněk Sýkora** (rotated modules).
- Rule taken: *the joint is the ornament* and *one module, rotated by a rule*.
- Signature: the site grid is drawn from the workshop's real dovetail profile (SVG module); sections are joined by animated "joints" that close as you scroll (scroll-driven `clip-path: shape()`), the pattern behind the contact form is the dovetail module rotated by Sýkora's rule.
- Reduced motion: joints are shown closed; the pattern is static.
- What is *not* taken: Scarpa's colours, Sýkora's black-and-white look.
