# Patterns (copy, then adapt to the brief)

All patterns are progressive: without support or with reduced motion the page is complete and still. Translate plain CSS into Tailwind utilities where one exists; keep compound selectors, keyframes and `@property` in `global.css` or a component `<style>` (AGENTS.md → Conventions). Baseline status: check the matching demo in the `css-first` skill.

## 1. Cross-document view transitions (MPA page transitions, zero JS)

```css
/* global.css */
@media (prefers-reduced-motion: no-preference) {
  @view-transition {
    navigation: auto;
  }
}

::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: var(--duration-standard);
  animation-timing-function: var(--ease-out-soft);
}

/* Header stays put while pages change under it
   (SiteHeader.astro: add class="vt-header" to the <header>). */
.vt-header {
  view-transition-name: site-header;
}
```

Shared element (project tile → project detail): give both elements the same unique name on their pages.

```astro
<!-- list page -->
<img … style={`view-transition-name: project-${project.slug}`} />
<!-- detail page -->
<img … style={`view-transition-name: project-${project.slug}`} />
```

Rules: names unique per page; ≤ 400 ms; never animate layout-heavy elements; browsers without support just navigate. Do not add Astro `<ClientRouter />` (it turns the site into a JS router).

## 2. Scroll-driven motion

Chapter progress (whole page):

```css
@keyframes grow-x {
  from { scale: 0 1; }
  to { scale: 1 1; }
}

@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: scroll()) {
    .progress {
      transform-origin: 0 50%;
      animation: grow-x linear both;
      animation-timeline: scroll(root);
    }
  }
}
```

Element tied to its own visibility (scrub, not trigger):

```css
@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .plate {
      animation: plate-open linear both;
      animation-timeline: view();
      animation-range: entry 10% cover 45%;
    }
  }
}

@keyframes plate-open {
  from { clip-path: inset(0 50% 0 50%); }
  to { clip-path: inset(0 0 0 0); }
}
```

Sticky stage ("long take"): a tall section, a sticky child, and a named view timeline on the section so children animate across the whole pinned range.

```css
.stage {
  view-timeline-name: --stage;
  block-size: 250vh; /* keep pins short: ≤ 1.5 extra viewports */
}

.stage__sticky {
  position: sticky;
  inset-block-start: var(--header-height);
  block-size: calc(100svh - var(--header-height));
}

@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .stage__layer {
      animation: layer-in linear both;
      animation-timeline: --stage;
      animation-range: contain 0% contain 100%;
    }
  }
}

/* Reduced motion / no support: the stage is a normal section. */
@media (prefers-reduced-motion: reduce) {
  .stage { block-size: auto; }
  .stage__sticky { position: static; block-size: auto; }
}
```

The template's `data-reveal` (`global.css`) already covers simple enter reveals – use it with `--reveal-i` for stagger.

Scroll-*triggered* (time-based, play once on enter: `animation-trigger`) is Chrome-only in 2026 – progressive only, see `css-first/css-demos/animation/scroll-triggered.css`.

## 3. Pointer → CSS custom properties

One small listener, coalesced to one write per frame, scoped to the element (a write on `:root` restyles the whole document). CSS does the visual work.

```astro
<div class="tilt" data-pointer>…</div>

<script>
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  for (const el of document.querySelectorAll<HTMLElement>("[data-pointer]")) {
    let x = 0.5, y = 0.5, queued = false;
    el.addEventListener("pointermove", (e) => {
      if (reduced.matches || e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      x = (e.clientX - r.left) / r.width;
      y = (e.clientY - r.top) / r.height;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        el.style.setProperty("--px", x.toFixed(3));
        el.style.setProperty("--py", y.toFixed(3));
        queued = false;
      });
    }, { passive: true });
    el.addEventListener("pointerleave", () => {
      el.style.removeProperty("--px");
      el.style.removeProperty("--py");
    });
  }
</script>

<style>
  .tilt {
    --px: 0.5;
    --py: 0.5;
    transform: perspective(60rem) rotateX(calc((var(--py) - 0.5) * -6deg)) rotateY(calc((var(--px) - 0.5) * 6deg));
    transition: transform var(--duration-slow) var(--ease-out-soft);
  }
  .tilt::after { /* light that follows the pointer */
    content: "";
    position: absolute;
    inset: 0;
    background: radial-gradient(30rem at calc(var(--px) * 100%) calc(var(--py) * 100%), color-mix(in oklch, var(--color-accent) 25%, transparent), transparent 60%);
    pointer-events: none;
  }
</style>
```

Touch users get the static state – design it as the default.

## 4. Variable-font kinetics

```css
@property --wght {
  syntax: "<number>";
  inherits: true;
  initial-value: 400;
}

.display {
  font-variation-settings: "wght" var(--wght);
}

@media (prefers-reduced-motion: no-preference) {
  @supports (animation-timeline: view()) {
    .display {
      animation: weight-in linear both;
      animation-timeline: view();
      animation-range: entry 0% cover 40%;
    }
  }
}

@keyframes weight-in {
  from { --wght: 300; }
  to { --wght: 700; }
}
```

The template's fonts are instanced to `wght` 400–600 for size – widen the axis range when subsetting (`performance-audit` → Fonts) or the animation clamps. Axis animation re-lays out text every frame: short display lines only, `contain: layout` on the wrapper.

Fit a headline to its box: `text-fit` (progressive) with a `clamp()` font size as the base.

## 5. Accessible kinetic headline

Animate whole lines; keep one text node per line for assistive tech.

```astro
<h1 class="headline" aria-label={title}>
  {lines.map((line, i) => (
    <span class="headline__line" aria-hidden="true" style={`--i: ${i}`}>{line}</span>
  ))}
</h1>

<style>
  .headline__line { display: block; }
  @media (prefers-reduced-motion: no-preference) {
    .headline__line {
      transition: translate var(--duration-slow) var(--ease-out-soft), opacity var(--duration-slow);
      transition-delay: calc(var(--i) * 80ms);
      @starting-style { translate: 0 0.4em; opacity: 0.001; }
    }
  }
</style>
```

`lines` come from the CMS (a multiline field) – never split letters.

## 6. Native carousel

```html
<section aria-roledescription="carousel" aria-label="Realizace">
  <div class="track" tabindex="0">…slides (li)…</div>
  <button type="button" data-dir="-1" aria-label="Předchozí">…</button>
  <button type="button" data-dir="1" aria-label="Další">…</button>
</section>
```

```css
.track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min(80%, 36rem);
  gap: 1rem;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory; /* slides are images – fine; proximity for text */
  scrollbar-width: thin;
}
.track > * { scroll-snap-align: start; }
```

Buttons: `track.scrollBy({ left: dir * track.clientWidth * 0.8 })` (smooth only without reduced motion). CSS `::scroll-button()` / `::scroll-marker` (Chrome) may replace them progressively – see `css-first/css-demos/interaction/css-carousel.css`.

## 7. Masks, cut-outs, typofoto

```css
.cutout {
  background: url(/gallery/web/hero-1200.avif) center / cover;
  background-clip: text;
  color: transparent;
}
@media (forced-colors: active) {
  .cutout { background: none; color: CanvasText; }
}
```

Use real text (selectable, translatable); check contrast of the image region behind the letters – if it cannot be guaranteed, keep a solid text colour and put the image *behind* the text instead.

## 8. Build-time generative art (zero runtime)

Generate SVG at build time in the Astro frontmatter (seeded by slug/date), inline it. A different composition per project page costs nothing at runtime and has no motion concerns.

```astro
---
const seed = [...slug].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const rand = (() => { let s = seed; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32); })();
const cells = Array.from({ length: 64 }, (_, i) => ({ x: i % 8, y: Math.floor(i / 8), r: Math.floor(rand() * 4) * 90 }));
---
<svg viewBox="0 0 8 8" aria-hidden="true" class="h-auto w-full text-primary">
  {cells.map((c) => <use href="#module" transform={`translate(${c.x} ${c.y}) rotate(${c.r} 0.5 0.5)`} />)}
</svg>
```
