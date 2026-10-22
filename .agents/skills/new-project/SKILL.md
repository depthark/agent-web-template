---
name: new-project
description: Turn this template into a new client website – naming, domain, brand tokens, logo/icons, content, CMS repo, Cloudflare Pages, Resend, analytics, launch checks. Use when starting a site from agent-web-template (placeholder "Název firmy" / example.cz still present).
---

# New project from the template

Work through the steps in order; ask the user only for what you cannot find (client name, domain, logo, texts, photos, who edits). Keep a short checklist in the conversation.

## 0. Dependencies first

Run the `update-dependencies` skill. Do not start on outdated packages.

## 1. Identity

- `package.json` → `name`, `description`.
- `wrangler.toml` → `name` (Cloudflare Pages project, e.g. `client-cz`).
- `astro.config.ts` and `.env.example` → `https://www.<domain>`.
- `public/robots.txt` → `Sitemap:` URL.
- `public/admin/config.yml` → `backend.repo` (`owner/repo`), `base_url`, `site_url`, `display_url`.
- `public/manifest.webmanifest` → `name`, `short_name`, `description`, colours, `shortcuts`.
- `src/data/content/settings.json` → name, tagline, description, `language`, keywords, company, contacts, social, `analytics.gtmId`, `googleSiteVerification` (keep the old site's if it exists – Search Console stays verified).
- `src/lib/structured-data.ts` → `BUSINESS_TYPE` (most specific schema.org LocalBusiness subtype).
- Search for leftovers: `grep -rn "Název firmy\|example.cz\|OWNER/REPO\|00000000" --exclude-dir=node_modules .`

## 2. Brand

- Tokens in `public/styles/tailwind.source.css` (`@theme` + `[data-theme="dark"]`): `primary`, `accent`, surfaces, ink, footer. Check contrast (text ≥ 4.5:1) for `primary` on `background`/`surface` and `accent` on `footer-bg` / `ink` – the `accessibility-audit` skill has the method.
- Logo: client artwork as **white** SVG at `public/images/logo.svg`, tight `viewBox`, no artboard clip; never redraw a client logo. Header inverts it in light theme. Optimise with SVGO.
- `scripts/generate-icons.ts` → `INK`, and `MARK_VIEWBOX` if the logo has a wordmark; run `bun run icons`.
- `src/lib/og-image.ts` → `GLOW`, font (TTF in `src/assets/fonts/`).
- Fonts: if the brand needs other faces, follow the fonts section of `performance-audit` (self-hosted, subset, fallback metrics). Keep at most 2–3 families, weights 400–600.

## 3. Content and pages

- Fill content JSON (or let the client do it in the CMS later). Copy rules: short, customer-outcome focused, the client's language.
- Pages: keep `/`, `/projekty/`, `/kontakt/`; add others the same way (content JSON → CMS file entry → page in `src/pages/` → `site.nav` → `ogPages()` → sitemap images). If the site **replaces an existing one**, run `site-migration` first – URLs must not change.
- Multiple languages → `i18n` skill before building pages.
- Photos: delete the placeholders (`public/gallery/web/hero-*`, `public/gallery/projekty/ukazkovy-projekt/`, `src/data/content/projects/ukazkovy-projekt.json`), import real ones (`image-pipeline` skill). Remove `scripts/placeholders.ts` + its script entry when no longer needed.

## 4. Repository

- New repo for the client (or under the owner's account), push `main`.
- GitHub Pages stays off; `.github/workflows/build.yml` is only a build check.

## 5. Services (each has a skill)

1. `cloudflare-deploy` – Pages project, env/secrets, custom domain, DNS.
2. `decap-cms` – GitHub OAuth app, secrets, editors as collaborators.
3. `resend-email` – domain, API key, recipients, test.
4. Analytics – GTM ID in Nastavení (or leave empty = no tracking).

## 6. Launch checks

- `performance-audit`, `accessibility-audit`, `seo-audit` on the production URL – all 100.
- Form test end to end (two e-mails delivered), CMS login + photo upload by an editor account (not only the owner).
- Search Console: sitemap submitted, main pages "Request indexing".
- `client-handoff` – guide for the client, editors invited.
- Write `docs/` notes for anything pending (e.g. DNS switch waiting on the registrar) so the next agent can continue.
