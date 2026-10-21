---
name: accessibility-audit
description: Audit and fix accessibility (WCAG 2.2 AA) – contrast in both themes, keyboard and focus, landmarks and headings, forms and errors, images and alt text, motion, mobile menu, screen readers. Use for "a11y", "accessibility", "přístupnost", contrast failures, or before launch.
---

# Accessibility audit (WCAG 2.2 AA)

Target: Lighthouse Accessibility 100 **and** a manual pass – automated tools catch about a third of real issues.

## Automated

- Lighthouse (CLI or DevTools MCP `lighthouse_audit`) on every page, **mobile and desktop, light and dark theme** (emulate `prefers-color-scheme`, or set `localStorage.theme`). Contrast failures usually appear in only one theme.
- Optional: `npx @axe-core/cli <url>` for the full rule set.

## Manual checklist

**Contrast** – text ≥ 4.5:1, large text (≥ 24 px or 19 px bold) and UI borders/icons ≥ 3:1.
- `primary` is a text accent: check it on `background`, `surface`, `surface-elevated` in both themes.
- Areas dark in both themes (footer, hero, ink sections) need `text-accent` / white, never `text-primary` (light-theme primary is dark).
- Placeholder text, disabled states, text over photos (the hero overlay must keep ≥ 4.5:1 for the worst photo).
- Compute OKLCH contrast with a script (e.g. `culori` + WCAG formula) or DevTools; adjust lightness in tokens, not per component.

**Keyboard**
- Tab through every page: order follows the layout, nothing unreachable, no traps; the skip link ("Přeskočit na obsah") appears first and jumps to `#main`.
- Visible focus everywhere (`:focus-visible` outline in `global.css`); never `outline: none` without a replacement.
- Mobile menu: toggle has `aria-expanded`/`aria-controls`; when open focus moves into it, Escape closes and returns focus, background is `inert`, body scroll locked.
- Lightbox (Fancybox): opens with Enter, Escape closes, focus returns to the thumbnail.
- FAQ: native `<details>/<summary>` (no custom JS accordion).

**Structure**
- One `<h1>` per page (`SectionIntro level={1}` on sub-pages, hero title on home); headings never skip levels.
- Landmarks: `header`, `nav` with `aria-label`, `main#main`, `footer`; sections with `aria-labelledby`.
- `<html lang>` from `settings.language`; parts in another language get `lang`.
- Links say where they go (no bare "více" without `sr-only` context); external/new-tab links announce it (`sr-only` "(otevře se v novém okně)").

**Images**
- Content images: meaningful `alt` (CMS field "Popis fotky" – make editors fill it; the gallery falls back to "<project> — foto N"). Decorative: `alt=""` (hero background, icons with `aria-hidden`).
- Logo link: accessible name = site name + "úvodní stránka".

**Forms** (`/kontakt/`)
- Every field has a visible `<label>`; required fields marked with `*` and explained ("Pole označená * jsou povinná"), `required` attribute set.
- Errors: inline text tied with `aria-describedby`, shown on `:user-invalid` (after interaction, not on load); status messages in a live region (`role="status"`).
- `autocomplete` tokens (`name`, `email`, `tel`), `inputmode="tel"`, sensible `pattern`s (escape for the `v` regex flag).
- Honeypot field hidden with `aria-hidden` and `tabindex="-1"`.
- Success panel receives focus after sending.

**Motion and media**
- `prefers-reduced-motion`: reveals, hero zoom, parallax and smooth scroll disabled (`global.css` override).
- No auto-playing video with sound; carousels/slideshows have pause.

**Touch / zoom**
- Targets ≥ 44 × 44 px (`min-h-11`, icon buttons `h-11 w-11`); page works at 200 % zoom and 320 px width without horizontal scroll.

**Maps / embeds** – `iframe` has a `title`.

## Report

List per page: Lighthouse score (light/dark, mobile/desktop), issues found by WCAG criterion, fix applied (file:line), and anything needing the client (e.g. alt texts for uploaded photos).
