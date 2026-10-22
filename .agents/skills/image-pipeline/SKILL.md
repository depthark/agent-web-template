---
name: image-pipeline
description: Work with photos – the in-repo AVIF image-set pipeline (no image CDN). Covers CMS uploads (browser compression, focus point, Git commit), bulk import with bun run image-set, using ResponsiveImage/srcset/sizes, galleries and the Fancybox lightbox, replacing placeholders. Use whenever images, galleries, uploads or image performance are involved.
---

# Image pipeline (always use this – no Cloudinary/imgix, no WebP/JPEG fallbacks)

## Model

- One photo = an **image set**: `public/gallery/<group>/<name>-<width>.avif` for widths **400, 800, 1200, 1800, 2400**, never upscaled; a standard width is skipped when the original is within 18 % of it (e.g. 1225 px → 400, 800, 1225).
- Content stores only the **base path** `/gallery/<group>/<name>` (+ optional `focus: { x, y }` in %). `src/lib/image-set.ts` reads the available widths and the intrinsic size (AVIF `ispe` box) at build time.
- Groups: `web/` (site photos – hero, cards), `projekty/<slug>/` (one folder per project; the folder name = project slug, so slugs never change after creation).
- Same pipeline twice: **browser** (`public/admin/image-pipeline.js` + `image-worker.js` – Squoosh AVIF encoder via jSquash WASM, Lanczos3 resize, smartcrop focus, module-worker pool) and **Node** (`scripts/image-set.ts` – sharp + smartcrop-sharp). Same widths, quality and focus logic.

## Rendering

- `<ResponsiveImage src="/gallery/…" alt width height sizes max focus priority />`:
  - `max` caps the srcset for small boxes (tiles: `TILE_MAX = 800`).
  - lazy images get `sizes="auto, <your sizes>"` (browser uses the real layout width).
  - `focus` → `object-position`, so `object-cover` crops keep the subject.
  - `priority` only for the LCP image (+ preload with the same srcset/sizes, see `heroPreload()`).
- Gallery (`ProjectSection.astro`): tiles ≤ 800 px (lead tile ≤ 1200), lightbox `data-srcset` from `LIGHTBOX_MIN = 1200` up with `data-sizes="min(100vw, Xvh)"`, thumbnails 400 px. A phone never downloads 2400 px.
- Fancybox (`projekty.astro`): `Fancybox.bind("[data-fancybox]")`, `Hash: true`, CSS imported on first hover/focus.
- Plain `/images/...` paths still render as a normal `<img>` (icons, logos).

## CMS uploads (editors)

- Widgets: `project-gallery` (list: upload many, reorder, star = lead photo, alt text, hide, focus editor) and `photo` (single image field).
- Flow: select/drag files → browser resizes + encodes in workers (progress shown) → smartcrop focus (editable by clicking the thumbnail) → **one commit** with all files through the GitHub Git Data API using the editor's CMS token (`repo-store.js`), message ends with `[skip ci]` → the entry JSON gets `{ src, alt, hidden, focus }` → visible on the site after **Publikovat**.
- `[skip ci]` also stops Cloudflare Pages from building that commit (Cloudflare skips any commit whose *message* contains it). If a real content commit ever gets skipped, push an empty commit.
- Locally (`bun run cms:local`) files are written through `decap-server`.
- Removed photos stay in the repo (recoverable); unreferenced sets can be cleaned up manually.
- Recommend editors upload landscape photos ~2400 px wide (JPEG/PNG; HEIC must be converted first).

## Bulk import (agent)

```bash
bun run image-set ./photo.jpg /gallery/projekty/<slug>/<slug>-01
bun run image-set https://old-site.example/img.jpg /gallery/web/hero
```

Prints `{ src, width, height, widths, focus }` – put `src` (+ `focus`) into the content JSON. For many files, import `makeImageSet` from `scripts/image-set.ts` in a small script (download → set → write JSON). Name files `<slug>-01`, `-02`, … in display order.

## Template placeholders

`bun run placeholders` creates gradient image sets for the hero and the sample project. In a real project delete them (`public/gallery/web/hero-*`, `public/gallery/projekty/ukazkovy-projekt/`, the sample project JSON) once real photos exist.

## Rules

- Every `<img>` has width/height (no CLS); content images need real alt text.
- Do not commit originals or JPEG copies; only the AVIF set.
- After changing `public/admin/*.js` bump `?v=` in `public/admin/index.html`.
