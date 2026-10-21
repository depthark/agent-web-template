---
name: performance-audit
description: Measure and fix Core Web Vitals and Lighthouse performance (target 100 on mobile and desktop) – LCP, CLS, TBT, render-blocking CSS, fonts, images, third parties. Use for "performance", "web vitals", "Lighthouse", "page speed", slow pages, or after adding fonts, images or scripts.
---

# Performance audit

Target: **Lighthouse 100 in all categories on every page, mobile and desktop**; mobile LCP < 2 s, TBT 0 ms, CLS ≤ 0.01. The template meets this out of the box – new work must not regress it.

## Measure

1. Build and serve production output: `bun run build && bun run preview` (dev server numbers are meaningless). Better: the deployed URL – Cloudflare adds Brotli/HTTP3 and that is what users get. Run SEO checks on the production domain, not `*.pages.dev` (those are `noindex` on purpose).
2. Lighthouse CLI (mobile is the default form factor):
   ```bash
   npx -y lighthouse@12 https://www.example.cz/ --quiet --chrome-flags="--headless=new" \
     --output=json --output-path=lh.json
   node -e 'const r=require("./lh.json"),a=r.audits;console.log(Object.values(r.categories).map(c=>c.id+"="+Math.round(c.score*100)).join(" "),"LCP",a["largest-contentful-paint"].displayValue,"CLS",a["cumulative-layout-shift"].displayValue,"TBT",a["total-blocking-time"].displayValue)'
   ```
   Add `--preset=desktop` for desktop. Run every page, run twice if a score looks off (variance ±2).
3. Chrome DevTools MCP (if available): `performance_start_trace` with reload → `performance_analyze_insight` for LCP breakdown (TTFB / load delay / load time / render delay), render-blocking requests, layout-shift culprits. `lighthouse_audit` covers a11y/SEO/best practices (not performance).
4. For a before/after comparison with an old site, measure both the same way on the same day and keep the numbers (useful for the client).

## What the template already does (keep it)

- **No render-blocking requests**: `BaseLayout` inlines `@font-face` + fallback faces + `tailwind.css` + `global.css` into one `<style>`; page CSS too (`build.inlineStylesheets: "always"`). Do not add `<link rel="stylesheet">` or web-font CSS from other origins.
- **LCP image**: only the hero (or the first big image of a page) is `priority` → `loading="eager"` + `fetchpriority="high"` + `<link rel="preload" as="image" imagesrcset imagesizes>` with the *same* srcset/sizes as the `<img>` (`heroPreload()`). Everything else `loading="lazy"` with `sizes="auto, …"`.
- **Responsive AVIF** (`image-pipeline` skill): tiles never fetch more than 800 px, lightbox ≥ 1200 px only on open.
- **Third parties after load**: GTM loads on `requestIdleCallback` after `load` or on first interaction; maps are lazy iframes; Fancybox CSS is imported on first hover/focus of a gallery item.
- **Below-the-fold backgrounds** must not load on first paint: set them only when near the viewport (IntersectionObserver with `rootMargin: "100% 0px"` adding a `data-near` attribute, plus a `<noscript>` fallback style).
- **No layout shift**: every image has width/height (aspect ratio); fonts have metric-matched fallbacks; the hero cue / reveals animate `transform`/`opacity` only.
- **Caching** (`public/_headers`): `/_astro/*` and `/fonts/*` immutable; `/gallery/*` one year (new uploads get new names); HTML revalidates.
- **SVG logo** optimised with SVGO (`npx svgo file.svg`).

## Fonts (the usual source of CLS and LCP render delay)

- Self-host only (`public/fonts/`), variable woff2, `font-display: swap`.
- Subset per family: Latin (`U+0000-00FF,…`) + a tiny Czech/Slovak subset (`U+010C-010F,U+011A-011B,U+0139-013A,U+013D-013E,U+0147-0148,U+0154-0155,U+0158-0159,U+0160-0161,U+0164-0165,U+016E-016F,U+017D-017E`) – ranges are in `BaseLayout.astro`. Other languages: add their ranges.
- Limit the weight axis to what the design uses (400–600): `fonttools varLib.instancer in.ttf wght=400:600`, then `pyftsubset … --unicodes=<range> --flavor=woff2 --layout-features='*'`. Source: Fontsource / Google Fonts variable TTF (OFL – ship the licence in `public/fonts/`).
- **Fallback metrics**: for each family add `["<Family> Fallback", "<local font>", size-adjust, ascent-override, descent-override]` to `fallbacks` in `BaseLayout.astro` and put `"<Family> Fallback"` second in the `--font-*` stack. Compute with fontTools: `size-adjust = avgCharWidth(web)/avgCharWidth(local)` (Arial for sans, Times New Roman for serif), `ascent-override = ascender/unitsPerEm/size-adjust`, `descent-override = |descender|/unitsPerEm/size-adjust` – or copy from Fontsource's / `@capsizecss/metrics` values. Verify CLS is 0 with slow-3G throttling.
- Do **not** preload fonts when CSS is inlined – it competes with the LCP image.
- The OG image renderer (sharp) needs a TTF of the heading face in `src/assets/fonts/`.

## Typical fixes (seen in practice)

| Symptom | Cause | Fix |
| --- | --- | --- |
| LCP render delay 1 s+ | external stylesheet / Google Fonts CSS | inline CSS, self-host fonts |
| Mobile LCP is a lazy image | first large image on a sub-page not `priority` | mark that one `priority`, preload |
| CLS 0.1 on text pages | font swap reflow | fallback faces with metric overrides |
| TBT > 0 | GTM / chat widgets on load | defer to idle / interaction |
| Large image transfer | full-size image in a small box | `max` prop on `ResponsiveImage`, correct `sizes` |
| Best Practices < 100 | `mailto:` form action, console errors, missing source maps of 3rd parties | real `/api/` endpoint, fix errors |
| Background image competes with LCP | CSS background set eagerly | `data-near` lazy background |

## Report

Give a table per page: perf / a11y / best practices / SEO, LCP, CLS, TBT (mobile and desktop), what changed, and anything left with its cause.
