# Accessibility for expressive interfaces

Award sites break these most. Each is a hard gate in `creative-review` (WCAG 2.2 AA unless noted). The general audit is the `accessibility-audit` skill; this file covers what expressive work adds.

## Motion

| Rule | WCAG | Do |
| --- | --- | --- |
| Respect `prefers-reduced-motion` | 2.3.3 (AAA, but our floor) | Global override in `global.css` stays; JS/WebGL check `matchMedia` and render a still frame; scroll-driven effects inside `@media (prefers-reduced-motion: no-preference)` |
| Moving content > 5 s next to other content needs pause/stop/hide | 2.2.2 | Marquees, looping videos, ambient canvases near text: pause button (or stop after 5 s), pause on hover/focus |
| No more than 3 flashes per second | 2.3.1 | No strobe, no fast colour inversion of large areas; check shader output with high-contrast palettes |
| Vestibular triggers | 2.3.3 | Limit: parallax over large areas, zoom on scroll, spinning, scroll-jacked direction changes, full-screen camera moves. Allow only in the signature, short, and off with reduced motion |
| Animation from interaction can be disabled | 2.3.3 | Pointer-driven distortions follow reduced motion too |

## Reading and perceiving

| Rule | WCAG | Do |
| --- | --- | --- |
| Text over imagery/shaders ≥ 4.5:1 | 1.4.3 | Overlay/scrim from tokens; check against the *brightest* frame of the shader, both themes |
| Real text, not text in canvas/images | 1.4.5 | Canvas/WebGL is decoration; headings and copy are HTML above it |
| Split-letter animations | 1.3.1 / 4.1.2 | Parent keeps the real text: `<h1 aria-label="Celý nadpis"><span aria-hidden="true">…letters…</span></h1>`, or animate whole lines (preferred) |
| Reflow at 320 px, zoom 200 % | 1.4.10 / 1.4.4 | Display type uses `clamp()` with a rem floor; no fixed-height text boxes; never block zoom |
| Content order = visual order | 1.3.2 / 2.4.3 | Grid placement must not reorder reading; check Tab order on asymmetric layouts |
| Colour not the only signal | 1.4.1 | States also by text/shape |
| Non-text contrast ≥ 3:1 | 1.4.11 | Thin hairline buttons, outline CTAs over photos |

## Operating

| Rule | WCAG | Do |
| --- | --- | --- |
| Keyboard for everything | 2.1.1 | Custom interactions get a `<button>`; drag has a click/keys alternative (2.5.7) |
| Visible focus, not obscured | 2.4.7 / 2.4.11 | Template `:focus-visible` ring; sticky elements must not cover the focused element (`scroll-padding`) |
| Targets ≥ 24 px (template: 44) | 2.5.8 | Also for small nav dots, close buttons, carousel controls |
| No hover-only content | 1.4.13 | Hover reveals also on focus and tap; dismissible with Esc |
| Pointer gestures have single-pointer alternatives | 2.5.1 | Pinch/rotate/multi-finger never required |
| Custom cursor | — | Never `cursor: none`; never delay or offset the real pointer |
| Native scroll | 2.1.1, 2.4.3 | No scroll hijacking libraries; `scroll-snap` only `proximity` on long text |
| Sound | 1.4.2 | Opt-in toggle (`<button aria-pressed>`), muted by default, remembered |

## Screen readers

- Decorative canvas/SVG: `aria-hidden="true"`. Meaningful visual: `role="img"` + `aria-label` and the same information as text nearby.
- Dynamic states announced via `aria-live="polite"` only when the user caused them.
- Hidden "reward" sections must be reachable by keyboard and not trap focus.
- Page transitions: focus moves to the new page's `<h1>` or `main` naturally (MPA navigation does this; keep it MPA).

## Testing (in addition to `bun run audit`)

- macOS VoiceOver / NVDA: headings list, landmarks, the signature section read top to bottom.
- System setting "Reduce motion" on: walk every page.
- Keyboard only: whole site, including the signature.
- Phone (or Playwright mobile) with CPU throttling 4×: signature stays responsive.
