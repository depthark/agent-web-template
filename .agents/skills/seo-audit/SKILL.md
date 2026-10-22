---
name: seo-audit
description: Check and improve technical SEO – titles and descriptions, canonical/hreflang, Open Graph share images, schema.org JSON-LD, sitemap with images, robots, noindex on preview hosts, llms.txt, Search Console submission and re-indexing. Use for "SEO", "Google", "structured data", "sitemap", "indexing", or before/after launch.
---

# SEO audit

## What the template generates (verify, don't rebuild)

| Item | Source |
| --- | --- |
| `<title>` (`Name \| Title` on home, `Title \| Name` elsewhere), description, keywords (page + site-wide) | CMS `seo` objects → `BaseLayout.astro` |
| Canonical, `hreflang` + `x-default`, `og:*`, `twitter:*`, geo meta | `BaseLayout.astro` |
| Share images 1200×630 per page | `src/lib/og-image.ts` → `/og/<slug>.jpg` (add new pages to `ogPages()`) |
| JSON-LD `@graph`: WebSite, LocalBusiness (`BUSINESS_TYPE`), Person per contact, WebPage per page, BreadcrumbList, FAQPage (home), ImageGallery per project | `src/lib/structured-data.ts` |
| `sitemap.xml` with `image:image` entries | `src/pages/sitemap.xml.ts` (from `site.nav`) |
| `robots.txt` (disallow `/admin/`, `/api/`, sitemap URL) | `public/robots.txt` |
| `noindex` on `*.pages.dev` (production and preview hosts) | `public/_headers` |
| `llms.txt`, `/agent/site.json` | `src/pages/llms.txt.ts`, `src/lib/site-data.ts` |
| Search Console verification meta | `settings.json → googleSiteVerification` |

## Checklist

- Titles ≤ 60 chars, descriptions 120–160, unique per page, in the site language, with the main service + place.
- Exactly one `<h1>` per page; headings describe content.
- Every page in `site.nav` is in the sitemap; new pages added to `ogPages()`.
- `PUBLIC_SITE_URL` / `astro.config.ts → site` = the canonical production origin (with `www` if that is the main host) – canonical, sitemap and OG URLs all derive from it.
- One host only: apex → `www` (or the reverse) with a 301 (see `cloudflare-deploy`); `http` → `https`.
- Trailing slashes consistent (`trailingSlash: "always"`).
- Images: descriptive alt texts (they also go into the sitemap as titles and into ImageGallery captions).
- Structured data valid: <https://search.google.com/test/rich-results> and <https://validator.schema.org/> on `/` and a gallery page. Business data (address, phone, opening hours, geo) must match the Google Business Profile.
- Social preview: check `/og/<slug>.jpg` renders the right title; test with a link preview (e.g. opengraph.xyz).
- Lighthouse SEO 100 on the **production domain** (on `*.pages.dev` it fails by design because of `noindex`).
- When replacing a site: same URLs (or 301s), keep the old keywords that worked, keep the Search Console verification token (`site-migration` skill).

## Search Console (after launch or a content overhaul)

1. Property for the canonical host (URL-prefix `https://www.<domain>/`, or a Domain property via DNS TXT).
2. **Sitemaps** → submit `sitemap.xml` (re-submitting is fine; old bogus entries can be removed – ask first).
3. **URL inspection** → each main page → **Request indexing** (Google says "added to a priority crawl queue"; repeat requests don't help). Pages appear updated within days.
4. Afterwards: Pages report (excluded/404), Core Web Vitals report, Enhancements (FAQ, breadcrumbs).

In a browser session, focus the "Inspect any URL" box by its accessibility ref before typing – clicking by coordinates after closing a dialog often misses it.

## Report

Per page: title/description lengths, schema types found, rich-results status, Lighthouse SEO; plus Search Console actions done.
