---
name: i18n
description: Make the site multilingual – Astro i18n routing plus an i18n library for UI strings (Paraglide JS by default), translated CMS content with Decap i18n, hreflang/canonical/sitemap per locale, language switcher, translated slugs and SEO. Use when a site needs a second language.
---

# Multilingual sites

Single-language sites need none of this (`settings.json → language` drives `<html lang>`, og:locale, schema `inLanguage`). For two or more languages use a library – never hand-rolled string objects scattered in components.

## Choose (check current versions/docs first, e.g. via context7)

- **Routing**: Astro's built-in `i18n` config in `astro.config.mjs` – `locales`, `defaultLocale`, `routing.prefixDefaultLocale: false` (default language keeps today's URLs, others under `/en/…`), `fallback` if a page is not translated yet. Helpers from `astro:i18n` (`getRelativeLocaleUrl`, `getAbsoluteLocaleUrl`).
- **UI strings** (labels, buttons, form errors, aria texts): **Paraglide JS** (`@inlang/paraglide-js`) – compiled, typed, tree-shaken message functions, zero runtime cost for static pages. Messages in `messages/<locale>.json`. Alternative only if the user prefers: `astro-i18next`.
- **Content**: Decap CMS i18n – in `config.yml` top-level `i18n: { structure: multiple_files, locales: [cs, en], default_locale: cs }`, then `i18n: true` per collection and `i18n: true | duplicate | false` per field (images and slugs usually `duplicate`). Files become `src/data/content/<locale>/…json` (or `…/<name>.<locale>.json` with `multiple_files`); `src/data/site.ts` gets `getSite(locale)`.

## Implement

1. Config + folder structure (`src/pages/[...]` or `src/pages/en/…` mirrors; or a dynamic `[locale]` segment with `getStaticPaths`).
2. `site.ts` → per-locale object; `site.nav` per locale with translated slugs (keep the default locale's slugs unchanged).
3. `BaseLayout`: `<html lang>`, `og:locale` + `og:locale:alternate`, canonical per locale, **`hreflang` for every translation + `x-default`** (to the default locale).
4. `sitemap.xml`: one `<url>` per locale page with `xhtml:link rel="alternate" hreflang` entries.
5. Structured data `inLanguage` per page; `llms.txt` per language or one with sections.
6. Language switcher in the header (and mobile menu): links to the *same page* in the other locale, `lang` + `hreflang` attributes on the links, current language `aria-current`. No automatic redirects by browser language (bad for SEO and bots); optionally a dismissible suggestion.
7. Form: labels/errors through Paraglide; `/api/inquiry` redirects back to the localised contact URL; confirmation e-mail texts per locale in `contact.json`.
8. Fonts: add unicode ranges for the new scripts (see `performance-audit`).
9. Share images: `ogPages()` per locale.

## Check

- Every page reachable in every locale or falls back deliberately; no mixed-language pages.
- `seo-audit` per locale; Search Console sees hreflang without errors.
- Lighthouse still 100 (Paraglide adds no client JS for static text).
