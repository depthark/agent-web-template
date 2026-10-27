---
name: creative-ux
description: Experience and interaction design for expressive sites – narrative structure, page choreography, the signature interaction spec, motion language and tokens, kinetic typography, navigation that stays usable, and accessibility for expressive interfaces (reduced motion as a designed alternative, vestibular safety, keyboard, screen readers, touch, Czech typography). Use after the creative brief exists, for "UX", "interaction", "motion design", "animation spec", "page transitions", "storytelling", or step 3 of the creative-site workflow.
---

# Creative UX

Input: `docs/creative/brief.md` (from `creative-direction`). Output: `docs/creative/experience.md` – precise enough to build without guessing. References:
- [`references/signature-spec.md`](references/signature-spec.md) – template for the signature interaction (fill one per signature moment).
- [`references/expressive-a11y.md`](references/expressive-a11y.md) – the accessibility rules expressive work most often breaks, with the WCAG criterion and the fix.

## 1. Narrative structure

Pick the structure that fits the idea (write why):

| Structure | Feels like | Good for | Watch out |
| --- | --- | --- | --- |
| **Long take** | One continuous scroll "shot" | A single story, a process | Long page: give an index / chapter nav |
| **Chapters** | Numbered acts with clear breaks | Services, a manifesto | Each chapter needs its own heading (h2) |
| **Exhibition** | Rooms; work shown with space | Portfolios, makers | Do not hide work behind interaction |
| **Index / archive** | A precise list you can sort | Many projects, menus, price lists | Make the list itself beautiful (Sutnar) |
| **Instrument** | The visitor plays something | Products, brands with a verb | Must have a non-interactive reading |
| **Place** | A space to explore (Messenger) | Rare – events, culture | Highest cost; HTML version required |

Then the **page map**: for each page, the sequence of sections with *purpose* (orient, prove, invite, reassure, act), the content each needs (from the CMS JSON), and the single action the page asks for. The inquiry CTA always leads to `/kontakt/#poptavka` (AGENTS.md).

## 2. Choreography

- **First screen in < 1 s of attention**: who, what, the signature hinting at itself, and a reason to scroll (composition crops the next section – no "scroll to explore" icon).
- **Entrance**: one title-sequence moment ≤ 1.2 s total, CSS only (`@starting-style` / keyframes), content readable from the first frame (animate from 0.0x opacity offsets only on decoration; text may rise but must start legible within 300 ms). Never a loading screen.
- **Scroll**: pick per section one of *reveal* (template `data-reveal`), *scrub* (scroll-driven, tied to meaning), *pin* (sticky stage, short – max 1.5 viewports), or *still*. Most sections are *still* or *reveal*. Rhythm: calm – calm – signature – calm.
- **Page transitions**: cross-document View Transitions (`creative-dev`) – continuity of one shared element (the project image → its detail), ≤ 400 ms, never blocking navigation.
- **Hover/focus**: every hover effect has an equal focus-visible state; nothing important only on hover; touch gets the information without hover.

## 3. Motion language

Define in `experience.md` and as tokens in `public/styles/tailwind.source.css` (`@theme`):

- **Meaning** – one sentence: what motion represents in this concept (weight, growth, light, precision…).
- **Easings** – 2–3 named curves (`--ease-<name>`), each with its use. Prefer `linear()` for physical curves (springs, settles) over JS physics.
- **Durations** – `--duration-*` scale; UI feedback 120–200 ms, layout 300–500 ms, narrative 600–1200 ms. Nothing over 1.2 s that the user must wait for.
- **Distance** – max travel (e.g. 24 px for reveals), max scale change (≤ 1.05 on content), no rotation of text blocks while reading.
- **Reduced-motion translation** – for each motion, the still equivalent (final state, a cross-fade ≤ 200 ms, or a static composition). Reduced motion is a *designed* version, not "animations off".

## 4. Type as interface

- Fluid scale with `clamp()` tied to the grid; display sizes may use container units in heroes.
- Line length 60–75 ch for body; `text-wrap: pretty` for body, `balance` for headings.
- Kinetic type: animate variable-font axes (`font-variation-settings` via registered `@property`) or transforms on whole lines – never split words into letter spans unless the parent has the real text for assistive tech (see expressive-a11y).
- **Czech**: test diacritics in the display face at the tightest leading used; never all-caps tracking so wide that `Ř`/`Č` carons collide with the line above; keep `lang="cs"` so hyphenation (`hyphens: auto`) works; non-breaking space after one-letter prepositions (v, k, s, z, o, u, a, i) – `typeset()` in `src/data/site.ts` does it for all CMS text at build time.

## 5. Navigation

Expressive layouts still need boring navigation: the template header (logo → home, nav, theme toggle, CTA) or a justified alternative that keeps: visible current page, keyboard order = visual order, the mobile menu as Popover API (template `MobileMenu`). Long pages get an in-page index (chapter links). Never hide navigation behind an unlabelled gesture.

## 6. Signature interaction

Fill `references/signature-spec.md` for each signature moment: trigger, states, input methods (mouse, touch, keyboard, none), reduced-motion version, no-JS / no-WebGL version, screen-reader experience, performance budget, failure modes, acceptance tests. The `creative-dev` skill implements from it; `creative-review` tests against its acceptance list.

## 7. Content & microcopy

Write the UI copy in the client's language (Czech by default) in the voice from the brief: CTA labels that say the outcome ("Domluvit zaměření", not "Odeslat"), alt texts that describe purpose, error messages that tell how to fix. All page copy goes to the CMS JSON (AGENTS.md → Conventions).

## Done when

`experience.md` has: structure + page map, choreography per section, motion tokens with reduced-motion translations, type scale, navigation decision, one filled signature spec per signature moment, and the copy deck. Every expressive element has a keyboard path, a touch path and a still version on paper before code starts.
