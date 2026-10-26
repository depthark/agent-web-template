# Originality protocol

"Original" is not "unusual". It means: **this site could only belong to this client**, and a visitor remembers one specific thing about it. The protocol makes that repeatable.

## 1. Mine the client, not the galleries

Fill the *truth inventory* before looking at a single website. Ask the client or dig it out (old site, social, photos, visit if possible):

| Ask | Examples of usable material |
| --- | --- |
| What do they physically make or touch? | Wood grain, dough, steel offcuts, paper, soil, fabric weave |
| Where are they? | Street grid, river, local stone, the light at 7 pm, dialect words |
| How does the work happen (process)? | Steps, tools, waiting times, sounds, measurements, waste |
| What artefacts already exist? | Logo construction, workwear, vans, receipts, sketches, a 1990s sign |
| What numbers matter to them? | Tolerances, temperatures, years, kilometres, seasons |
| What do customers say (literally)? | Reviews, recurring phrases, misunderstandings |
| What is the one tension in the business? | Old craft vs. new tech, tiny team vs. big projects, slow vs. fast |

The concept must be traceable to at least one line of this inventory (Lando Norris: the helmet; Spatzek: the angles of his own logo).

## 2. Three divergent concepts, then choose

Write three concepts that differ in **kind**, not in colour:

- **A – Material**: the site is made of the client's material (texture, joint, grain, ink).
- **B – Process / time**: the site behaves like the work happens (layering, curing, rising, assembling).
- **C – Inversion**: take the category's conventions and invert two of them on purpose (Spatzek's method).

Each concept states, in this order:
1. **Idea** – one sentence, no adjectives like "modern", "clean", "premium".
2. **Truth** – which inventory line it comes from.
3. **Art source** – one entry from `art-canon.md` and the rule taken from it.
4. **Signature moment** – the one thing people will describe to a friend.
5. **Rules broken** – conventions inverted (never an accessibility rule – see below).
6. **Cost** – effect-ladder level needed (`creative-dev`), estimated KB and risk.
7. **Without motion** – what it is with reduced motion / no JS (must still be the concept).

Choose with the user when they are around; when working autonomously choose the one with the strongest *Truth* and the lowest *Cost* that still passes the tests below, and record why in `docs/creative/brief.md`.

## 3. Rule inversion (allowed and forbidden)

List the ten conventions of the client's category (e.g. bakery: warm beige, script logo, photo of croissants, "Since 1998", map at the bottom…). Invert **two or three** with intent; explain each in the brief.

Never invertible (they are the floor, not style): readable contrast, real text, keyboard access, visible focus, zoom, native scroll, reduced-motion respect, no seizure-risk flashing, labels on forms, content order = reading order, fast first paint.

## 4. The cliché register (2024 – 2026)

These read as "award-site template" in 2026. Avoid them, or use one only if the concept gives it new meaning (and say how in the brief).

| Cliché | Why it is tired / harmful | If you really need the effect |
| --- | --- | --- |
| Preloader counting 0 → 100 % | Delays content, hurts LCP, says "heavy site" | Show content immediately; animate *in* on `@starting-style` |
| Custom cursor blob / ring following the mouse | Lags, hides targets, useless on touch | Decorate the native cursor locally (a label near links), never `cursor: none` |
| Inertia smooth scroll (Lenis/Locomotive) | Fights native scroll, a11y tools, find-in-page | Native scroll + scroll-driven animations |
| Horizontal pinned gallery | Scroll-direction hijack, broken on trackpads/keyboard | Native `overflow-x` carousel with `scroll-snap` + buttons |
| Split-letter stagger on every heading | Screen readers read letters; noise everywhere | Once, on the h1, with `aria-label` on the parent |
| Infinite logo/ticker marquee | Moving text with no pause (WCAG 2.2.2) | Static wall of logos, or marquee with pause control + hover pause |
| Film grain overlay on everything | Muddy text, GPU cost on full-screen layers | Grain inside images or the shader only |
| Iridescent 3D blob / glass torus | The 2021–2024 default | A 3D object from the client's world, or none |
| Bento grid of cards | 2024's default dashboard look | A grid derived from the content's real proportions |
| Glassmorphism panels | Low contrast over photos, blur cost | Solid surfaces; blur only for the sticky header (already in template) |
| Magnetic buttons | Moves the target away from the pointer | Static target, expressive hover state |
| RGB-split / liquid hover distortion on every image | Fatigue, GPU cost | One meaningful image interaction, if any |
| Sticky stacking cards | Overused 2024–2025 | Use only if the content is truly a stack (e.g. layers of a process) |
| Oversized footer wordmark | Every agency since 2023 | Footer that ends the story (address as a composition, opening hours as a clock) |
| Dark mode + neon lime | Post-Lando copycats | Colour from the inventory |
| "Scroll to explore" mouse icon | Patronising, wasted space | Make the first screen invite scrolling by composition (cropped content) |

## 5. Originality tests (all must pass before build starts)

1. **Swap test** – replace the logo and name with a competitor's. If the site still works for them, it is not original. Fix the concept, not the decoration.
2. **One-screenshot test** – a single screenshot, logo hidden, is recognisable as this client to someone who knows them.
3. **Gallery test** – search Awwwards / Godly / Siteinspire / Codrops for the signature idea (by description). If the top results are near-identical, mutate (step 6).
4. **One-sentence test** – the idea fits in one sentence a client would repeat.
5. **Removal test** – removing the signature moment loses meaning, not just decoration.
6. **Stillness test** – the reduced-motion version still expresses the idea.

## 6. Mutation techniques (when a concept is too familiar)

Change one axis and re-test: **scale** (tiny → monumental), **material** (pixels → paper/wood/glass), **time** (instant → slow, per-season, per-time-of-day), **axis** (vertical → depth, linear → radial), **sense** (sound → shape, temperature → colour), **medium** (print, signage, film titles, packaging), **agency** (spectacle → the visitor causes it), **tone** (serious → deadpan humour, Oryzo-style).

## 7. Reward layer (optional)

A small thing for the curious that does not hide content: a rule published in the footer (LeWitt), a hidden page unlocked by a code built from the brand (Spatzek's name numbers), a seasonal variant. It must be keyboard reachable and never required.
