# AGENTS

Template for small business / portfolio websites: **Astro (static) + TypeScript 7 + Bun + Tailwind v4 + Decap CMS + Fancybox**, hosted on **Cloudflare Pages**, contact form e-mails through **Resend**, photos as **AVIF image sets in the repo** (compressed in the CMS, no image CDN). Out of the box it scores Lighthouse 100/100/100/100 on mobile and desktop – keep it that way. For original, award-level sites it has a **creative workflow** (skills `creative-*`, agents `creative-director` / `creative-jury`, gates `bun run verify` + `bun run audit`) that keeps those scores.

## First thing in a new project

When this template is used for a new site (fresh clone, `Název firmy` / `example.cz` still in the content), **before anything else**:

1. Run the **`update-dependencies`** skill – bring every package, Bun, Node (LTS) and CI to the latest stable/LTS versions, then build.
2. Run the **`new-project`** skill – name, domain, brand, content, CMS repo, Cloudflare, Resend, icons.

Never start building pages on outdated dependencies.

When the user wants a **creative / original / award-level** site (or names reference sites), hand it to the **`creative-director`** agent or follow the **`creative-site`** skill yourself – after the two steps above.

## Skills

Project skills live in `.agents/skills/<name>/SKILL.md` (`.claude/skills` is a symlink, so Claude Code also offers them as `/name`). When a task matches a skill's description (front matter), read that `SKILL.md` first and follow it.

| Skill | Use when |
| --- | --- |
| `update-dependencies` | First run of a new project, or periodic upkeep: latest packages, Bun, Node LTS, CI |
| `new-project` | Turning the template into a client site (checklist end to end) |
| `performance-audit` | Core Web Vitals / Lighthouse performance; fonts; images; third parties |
| `accessibility-audit` | a11y (WCAG 2.2 AA): contrast, keyboard, focus, forms, motion, screen readers |
| `seo-audit` | Meta, structured data, sitemap, robots, share images, Search Console, indexing |
| `image-pipeline` | Anything about photos: CMS uploads, image sets, focus, bulk import |
| `decap-cms` | Collections, widgets, GitHub OAuth app, editors, editorial workflow |
| `resend-email` | Contact form, Resend domain, recipients, spam protection |
| `cloudflare-deploy` | Pages project, secrets, custom domain, DNS (incl. keeping e-mail at the old host), NSSET, apex redirect, DNSSEC |
| `site-migration` | Replacing an existing site (Webnode, WordPress, …): URLs, SEO, photos, e-mail, DNS |
| `i18n` | The site needs more than one language |
| `client-handoff` | Client guide (PDF), inviting editors, final checks |
| `creative-site` | Original, award-level site or page – the end-to-end workflow with gates (runs the four below) |
| `creative-direction` | Research, reference teardowns, award landscape, art sources, concepts, originality tests, art-direction brief |
| `creative-ux` | Narrative, choreography, motion language, signature interaction spec, accessibility of expressive UI |
| `creative-dev` | Effect ladder (CSS → `<ShaderCanvas>` → lazy 3D), view transitions, scroll-driven motion, WebGL rules |
| `creative-review` | Gates (`verify`, `audit`), jury scoring, originality re-check – before any creative work is done |
| `css-first` | Any CSS question: modern CSS before JS, Baseline status, 74 demos (vendored from luko248/css-first-skill) |

## Agents

Custom agents live in `.agents/agents/<name>.md` (`.claude/agents` is a symlink for Claude Code).

| Agent | Role |
| --- | --- |
| `creative-director` | Runs `creative-site` end to end: research → concept → experience → spike → build → review loop. Writes decisions to `docs/creative/`. |
| `creative-jury` | Independent critic (read-only): gates, screenshots, originality tests, awards-style scores and ranked findings. Never grades its own work. |

## Fixed decisions (do not replace without the user asking)

- **Hosting: Cloudflare Pages** (Git integration, deploy on push to `main`). Functions in `functions/` for `/api/*`.
- **E-mail from the site: Resend** (EU region, the client's domain verified, sending only). Mailboxes stay where they are (MX untouched).
- **Images: our in-repo pipeline** – AVIF image sets in `public/gallery/`, compressed in the browser by the CMS (`public/admin/image-pipeline.js`) or by `bun run image-set`. No Cloudinary/imgix/WebP fallbacks.
- **CMS: Decap** with GitHub backend + editorial workflow, Czech UI, custom photo widgets.
- **Lightbox: Fancybox** (`@fancyapps/ui`), CSS loaded on demand.
- **Multilingual sites: an i18n library** (see the `i18n` skill), never hand-rolled string maps.
- Fonts self-hosted, critical CSS inlined, no render-blocking third parties.
- **Creative effects: CSS-first effect ladder** – native scroll (no Lenis/Locomotive), no preloaders, WebGL through `<ShaderCanvas>` or a lazily imported 3D island; enforced by `bun run creative:check` and `bun run audit`.

## Tech stack

| Area | Library / service | Where |
| --- | --- | --- |
| Framework | Astro (static output, `trailingSlash: "always"`, `inlineStylesheets: "always"`) | `astro.config.ts`, `src/` |
| Runtime / package manager | Bun (`packageManager` in `package.json`) – also runs the TypeScript scripts in `scripts/` directly | `bun install`, `bun run …`, `bun scripts/<name>.ts` |
| Node.js | LTS, for tools that require it (Astro CLI, CI setup) | `.node-version`, `engines`, CI |
| Language | TypeScript 7 (`typescript-7`, native `tsc`) for `.ts`; TypeScript 6 kept only for `@astrojs/check` until its API supports 7 | `bun run typecheck` |
| Styling | Tailwind CSS v4 via `@tailwindcss/cli` | `public/styles/tailwind.source.css` → `tailwind.css` (generated, committed) |
| Variants | `tailwind-variants` + `tailwind-merge` | `src/components/ui/Button.astro` |
| Lightbox | Fancybox `@fancyapps/ui` | `src/pages/projekty.astro` |
| Images | AVIF image sets, widths 400/800/1200/1800/2400, never upscaled; tiles ≤ 800 px, lightbox ≥ 1200 px, `sizes="auto"` for lazy images, focus point → `object-position` | `src/lib/image-set.ts`, `src/components/ui/ResponsiveImage.astro`, `scripts/image-set.ts`, `public/admin/image-*.js` |
| CMS | Decap CMS (unpkg) + `decap-server` locally; driver.js tours | `public/admin/` |
| CMS auth | GitHub OAuth app via Pages Functions; `_middleware.ts` ignores service-worker navigation-preload requests (else the one-time OAuth code is exchanged twice) | `functions/api/auth.ts`, `callback.ts`, `_middleware.ts` |
| Contact form | Resend via `/api/inquiry` (JSON from script, 303 redirect without JS, honeypot + time + link checks, confirmation e-mail) | `functions/api/inquiry.ts`, `src/pages/kontakt.astro` |
| Content | JSON in git, composed by `src/data/site.ts` | `src/data/content/**/*.json` |
| Rich text | `marked` (project descriptions from the CMS) | `src/lib/markdown.ts` |
| SEO | Meta/OG/Twitter, JSON-LD graph, sitemap with images, robots, share images rendered by sharp | `src/layouts/BaseLayout.astro`, `src/lib/structured-data.ts`, `src/pages/sitemap.xml.ts`, `src/lib/og-image.ts` |
| AI agents | `llms.txt`, `/agent/site.json` | `src/pages/llms.txt.ts`, `src/lib/site-data.ts` |
| Analytics | Google Tag Manager, only when `settings.json → analytics.gtmId` is set; loaded on idle/first interaction | `BaseLayout.astro` |
| PWA | Manifest + service worker + offline page | `public/manifest.webmanifest`, `public/sw.js`, `src/pages/offline.astro` |
| UI icons | [Heroicons](https://heroicons.com) (`heroicons` package, MIT, by Tailwind Labs) inlined at build – `<Icon name="…">`, no JS | `src/components/ui/Icon.astro` |
| App icons | Favicon/PWA set generated from `public/images/logo.svg` | `bun run icons` |
| Creative effects | `<ShaderCanvas>` – WebGL2 fragment-shader backdrop (~1.9 kB gz, lazy, paused off-screen, still frame on reduced motion, CSS fallback); shaders as GLSL strings | `src/components/creative/`, `src/scripts/shader-stage.ts`, `src/lib/shaders/` |
| Quality gates | `creative-check` (source rules, per-page budgets, markup) and `audit` (Playwright + Chrome: console, reduced motion, reflow, keyboard focus, target size, screenshots; Lighthouse 13 mobile/desktop) | `scripts/creative-check.ts`, `scripts/audit.ts` |
| CI | GitHub Actions: `bun run verify` (build + creative-check); Cloudflare deploys | `.github/workflows/build.yml` |

## Structure

```
functions/api/        auth.ts, callback.ts (CMS login), inquiry.ts (contact form → Resend)
public/admin/         Decap CMS: config.yml, photo pipeline, widgets, tours, publish status, vendor/ (AVIF encoder, resize, smartcrop)
public/gallery/       image sets: web/ (site photos), projekty/<slug>/ (project galleries)
public/fonts/         self-hosted woff2 (Latin + Czech/Slovak subsets) + licences
public/images/        logo.svg (white art), favicons/ (generated)
public/styles/        tailwind.source.css (tokens), global.css, tailwind.css (generated)
scripts/              image-set.ts, generate-icons.ts, placeholders.ts, creative-check.ts, audit.ts
src/data/             site.ts + content/ (settings, home, projects page, contact, projects/<slug>.json)
src/lib/              image-set, gallery, images (hero preload), markdown, navigation, og-image, structured-data, site-data
src/components/       SiteHeader, MobileMenu, SiteFooter, HeroSection, SectionIntro, FaqSection, ProjectSection, ThemeToggle, SocialLinks, ui/, icons/, creative/ (ShaderCanvas)
src/scripts/          client scripts imported by components (shader-stage.ts)
src/lib/shaders/      fragment shaders as exported GLSL strings (field.ts = starting point)
docs/creative/        per project: research, brief, experience, review (creative workflow)
src/pages/            index, projekty, kontakt, 404, offline, sitemap.xml, llms.txt, build.json, og/[slug].jpg, agent/site.json
```

## Design system

All tokens live in `@theme` in `public/styles/tailwind.source.css`; components use utilities (`bg-surface`, `text-muted`, `rounded-2xl`, `duration-fast`, …). Re-brand there, not in components.

- **Colours (OKLCH)**: `background/surface/surface-elevated`, `foreground/muted/subtle`, `border(-strong)`, `action/action-hover/on-action` (filled buttons – neutral ink, inverted in dark), `primary` (brand accent – **text accents only**: eyebrows, links, icons, focus), `accent` (light tint for glows and for text on always-dark areas like the footer), `success/danger(-soft)` (form states), `ink/ink-deep` (sections dark in both themes), `footer-bg/footer-text`. Dark theme overrides under `[data-theme="dark"]`.
- **Never** fill large areas or buttons with the brand colour; on always-dark surfaces use `text-accent`, not `text-primary` (contrast).
- **Fonts**: `--font-sans` (body) and `--font-heading` (h1–h3); both Inter by default. Changing fonts → `performance-audit` skill (subsetting + fallback metrics).
- **Z-index**: `--z-base/sticky/header/overlay/modal`; Tailwind v4 has no `z-*` mapping → `z-[var(--z-modal)]`.
- Dark mode: `ThemeToggle` writes `data-theme` on `<html>` (persisted), first load follows `prefers-color-scheme`; `@custom-variant dark` hooks `dark:` to the attribute.
- Glass header: `.glass` in `global.css` puts the blur on `::before`, so it does not become a containing block for the fixed mobile menu.

## Components

- `BaseLayout.astro` – head (meta, OG, Twitter, canonical, hreflang, JSON-LD), **inlined critical CSS** (`@font-face` + fallback faces + `tailwind.css` + `global.css` in one `<style>`), LCP preload, theme init, deferred GTM, skip link, SW registration.
- `SiteHeader.astro` – sticky glass header: logo (white art, inverted in light theme), name + tagline, nav, theme toggle, CTA → `/kontakt/#poptavka`.
- `MobileMenu.astro` – native **Popover API** (`popover` + `popovertarget`): open/close, Escape, tap outside and `aria-expanded` come from the browser; the panel sits in the top layer exactly below the header (`--header-height`, the header has that fixed height), hamburger → X and scroll lock via `:has(:popover-open)`, entrance via `@starting-style`, first link `autofocus`. One inline line closes it when a link is tapped. Never duplicate the logo or a close button in the panel.
- `HeroSection.astro` – full-bleed image set (LCP, `priority`), ink overlay, logo, eyebrow, title (subtitle only if filled), two CTAs, staggered motion-safe entrance, scroll cue to `#obsah` (keyframes animate only Y – Tailwind centres with `translate`).
- `SectionIntro.astro` – eyebrow + heading + lead; `level={1}` for the page `<h1>`.
- `FaqSection.astro` – native `<details name>` accordion; also the FAQPage schema.
- `ProjectSection.astro` – one project: title, subtitle, Markdown text, gallery (tiles ≤ 800 px with focus crop, Fancybox srcset ≥ 1200 px, 400 px thumbs).
- `ui/Button.astro` (variants `primary`, `secondary`, `outline`, `outline-on-dark`, `ghost`, `hero-primary`, `hero-outline`; `fullWidth`; min 44 px), `ui/IconButton.astro`, `ui/ResponsiveImage.astro`. `ui/Icon.astro` – Heroicons (`variant`: outline, solid, mini, micro; `label` makes it meaningful, else `aria-hidden`); brand logos (Facebook, Instagram) stay in `src/components/icons/`.

## Data layer

Content is edited in Decap CMS and stored as JSON; `src/data/site.ts` composes it into one typed `site` object – components never import JSON directly.

- `settings.json` – name, tagline, description, `language`, keywords, social, `company` (legal name, IČO, address, geo, opening hours, contacts, map embed), `analytics.gtmId`, `googleSiteVerification`.
- `home.json` – `seo`, `hero`, `features` (cards), `faq`, `cta`.
- `projects.json` – projects page intro + `seo`.
- `contact.json` – intro, `form` (`recipients`, `topics`, success texts, confirmation e-mail), `seo`.
- `projects/<slug>.json` – CMS folder collection: `order`, `slug`, `title`, `subtitle`, `text` (Markdown), `images: [{ src, alt, hidden, focus }]` (`src` = image-set base path).

`site.nav` stays in code (`src/data/site.ts`). Adding a page: content JSON + CMS file entry + page + nav + `ogPages()` + sitemap images if any.

## Conventions

- Copy lives in content JSON (CMS), never hardcoded in templates (UI micro-copy like form labels excepted).
- Images: `<ResponsiveImage>` with an image-set path, fixed width/height, `max` for small boxes; only the LCP image gets `priority` (+ preload via `heroPreload()`).
- Cards that are not links get **no hover effect** (no lift, no zoom) – it suggests a click.
- **As little JavaScript as possible.** Prefer HTML/CSS platform features: `<details>`, Popover API, `<dialog>`, `:has()`, `:user-invalid`, `@starting-style`, scroll-driven animations, native form posts. JS only where the platform can't (persisting the theme, Fancybox, form enhancement), inline and small, loaded late; every feature must work or degrade gracefully without it. Icons are build-time SVG, never an icon font or JS library.
- All CTAs that ask for an inquiry link to `/kontakt/#poptavka`; nav "Kontakt" goes to the page top.
- Anchors clear the sticky header through `scroll-padding-block-start` on `html` – no per-element `scroll-margin`.
- Scroll reveals are CSS-only (`data-reveal`, `animation-timeline: view()`), stagger with `--reveal-i`.
- Component `<style>` only for what Tailwind can't express (layered gradients with `color-mix()`, keyframes, compound selectors).
- Never use the `hidden` attribute for something CSS must show later: Tailwind preflight hides `[hidden]` with a layered `!important` no unlayered rule beats.
- Agents (llms.txt, site.json) are read-only; nothing may submit the form for a visitor.
- **TypeScript everywhere** (`.ts`, `astro.config.ts`, `scripts/*.ts` run by Bun – no build step, no `.mjs`). Only type syntax a runtime can strip (`erasableSyntaxOnly`: no `enum`/`namespace`). Plain JavaScript only in `public/` (served to the browser as-is: `public/admin/*.js`, `public/sw.js`).
- After editing `public/admin/*.js`, bump `?v=` in `public/admin/index.html`.
- Commit messages: Conventional Commits in English. Client-facing text: the client's language (Czech by default).

## UX rules

- Light and dark theme; respect `prefers-color-scheme` on first load.
- Tap targets ≥ 44 px (`min-h-11`); focus ring `focus-visible` with `primary`.
- Respect `prefers-reduced-motion` (global override in `global.css`, hero zoom, reveals).
- Mobile-first: full-width CTAs below `sm`.
- Forms: native validation styled with `:user-valid` / `:user-invalid`, inline hints via `:has()`, related fields in one row through CSS subgrid so an error message never misaligns the pair.

## Performance budget

Lighthouse 100 in every category on every page (Lighthouse 13 adds *agentic browsing* – also 100), mobile and desktop; LCP < 2 s (mobile, simulated), TBT 0 ms, CLS ≤ 0.01. Per page (gzip): HTML with inlined CSS ≤ 50 kB, initial JS ≤ 50 kB, lazily imported JS ≤ 300 kB (`scripts/creative-check.ts`). Details and the fixes that got there: `performance-audit` skill; `bun run audit` checks it all locally.

## Build & dev

- `bun run dev` – Tailwind watcher + Astro dev server (http://localhost:4321)
- `bun run cms:local` – local Decap backend; edit at `http://localhost:4321/admin/` (writes files directly)
- `bun run build` – minify CSS → `astro check` → TypeScript 7 `tsc --noEmit` → `astro build`
- `bun run verify` – build + `creative:check` (source rules, budgets, markup) – what CI runs
- `bun run audit` – builds for localhost, serves `dist/`, runs browser checks + Lighthouse on every sitemap page → `.audit/report.md`, `.audit/shots/` (needs Chrome or `CHROME_PATH`; `--url https://… --no-build` for a deployed site)
- `bun run preview` – serve `dist/`
- `bun run image-set <file-or-url> /gallery/<group>/<name>` – make an image set, prints `{ src, focus, … }`
- `bun run icons` – favicon/PWA icons from `public/images/logo.svg`
- `bun run placeholders` – regenerate the template's placeholder photos
- `public/styles/tailwind.css` is generated but committed – regenerate, never edit.
