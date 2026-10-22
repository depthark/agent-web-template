---
name: site-migration
description: Replace an existing website (Webnode, WordPress, Wix, static host…) with this template without losing SEO, URLs, photos or e-mail – inventory, URL map and redirects, content and photo import, keywords and verification tokens, DNS snapshot and rollback, before/after measurement. Use when the new site takes over a live domain.
---

# Migrating an existing site

## 1. Inventory (before writing code)

- **Pages and URLs**: crawl the old site (sitemap.xml, navigation, `curl` + link extraction). Every indexed URL must exist on the new site or get a 301. Default: keep the exact same paths (and trailing-slash style).
- **Content**: texts per page, FAQ, prices, contacts, legal info (company, IČO), opening hours, map, social links.
- **SEO assets**: `<title>`, meta description, meta keywords, Search Console verification meta (`google-site-verification` – copy into `settings.json → googleSiteVerification`, the property stays verified), Analytics/GTM container ID, structured data.
- **Photos**: download originals (largest size the old CDN serves), keep project grouping and order; import with `scripts/image-set.ts` (`image-pipeline` skill). Write alt texts.
- **E-mail**: who hosts the mailboxes (MX). They stay where they are.
- **DNS snapshot**: registrar, nameservers / NSSET, KEYSET/DNSSEC, every record (`dig` against the authoritative NS) → `docs/ROLLBACK.md` with exact steps to go back.
- **Baseline**: Lighthouse (mobile + desktop) of the old site's main pages, same day, same machine – for the before/after comparison.

## 2. Build

- Recreate pages with the same URLs; put redirects for anything renamed in `public/_redirects` (Cloudflare Pages format: `/old/ /new/ 301`).
- Rewrite copy shorter and clearer, keep meaning; keep keywords that the old pages ranked for (page `seo.keywords` + site keywords).
- Keep the same GTM container if the client uses it.

## 3. Switch

- Follow `cloudflare-deploy`: first `www` CNAME at the current DNS host (zero downtime), nameserver move later.
- Keep the old site/subscription running (and the mailbox subscription forever, unless mail moves) until the new site has run cleanly for a few weeks.

## 4. After launch

- Check every old URL returns 200 or 301 (script over the inventory list).
- Search Console: submit the new sitemap, request indexing of main pages (`seo-audit`); remove obsolete sitemap entries with the user's consent.
- Measure again and give the client the before/after numbers.
