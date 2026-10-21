---
name: cloudflare-deploy
description: Deploy and run the site on Cloudflare Pages – Git integration, build settings, secrets, custom domain, DNS at the current registrar vs. moving nameservers (NSSET for .cz), keeping e-mail records intact, apex→www redirect, SSL, DNSSEC, rollback notes, noindex on pages.dev. Use for hosting, domains, DNS, deploys, or "nasadit web".
---

# Cloudflare Pages

**Ground rules**: DNS, registrar and Cloudflare changes affect production – confirm each with the user. Never type secrets or passwords (the user enters them). Never change the root MX/SPF or other mail records. Before changing anything at the old host, write a rollback note (current NS/NSSET, KEYSET, every DNS record) into `docs/ROLLBACK.md`.

## 1. Pages project

1. Workers & Pages → Create → Pages → **Connect to Git** → the repo. Production branch `main`, build `bun run build`, output `dist`.
2. Variables and Secrets (Production + Preview): `PUBLIC_SITE_URL=https://www.<domain>`, `BUN_VERSION`, `NODE_VERSION` (match `package.json`/`.node-version`), and as **Secret**: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `RESEND_API_KEY` (+ optional `INQUIRY_FROM`, `INQUIRY_TO`). With `wrangler.toml` in the repo the build log shows "Build environment variables: (none found)" – runtime secrets for Functions still work when set as Secret type.
3. Each push to `main` deploys; `/build.json` shows the deployed commit (the CMS publish panel uses it). Commits whose message contains `[skip ci]` are **not built** – if a needed commit got skipped, push an empty commit.
4. GitHub Pages stays off; `.github/workflows/build.yml` only checks the build.
5. `public/_headers` already sends `X-Robots-Tag: noindex` for `https://:project.pages.dev/*` and `https://:version.:project.pages.dev/*`.

## 2. Custom domain – two paths

**A. DNS stays at the current provider (fastest, use first)**
- Pages → Custom domains → add `www.<domain>`. At the current DNS host set `www` CNAME → `<project>.pages.dev.` (remove the old `www` record). Within minutes the domain turns **Active** with SSL. Don't revert early – while "Pending/Inactive" visitors may briefly see an SSL error; wait.
- Apex: if the old host can redirect `<domain>` → `https://www.<domain>` (301, path kept), keep that until the nameservers move.

**B. Move nameservers to Cloudflare (full control: apex redirect, DNSSEC, caching rules)**
1. Add the zone in Cloudflare (Free plan). Before switching, recreate **every** existing record exactly (A/AAAA of the apex, MX, SPF/TXT, DKIM CNAME/TXT, DMARC, autoconfig CNAME, `_autodiscover._tcp` SRV, Resend records, verification TXTs). Mail records **DNS only** (grey cloud). The `www` CNAME → `<project>.pages.dev` **Proxied**. Verify the copy record by record (`dig @<old-ns>` vs. the Cloudflare list). Watch the Cloudflare "Add record" dialog: toggling proxy changes its height and moves the Save button – confirm each record saved.
2. Registrar change: for `.cz` the nameservers are an **NSSET**; many hosts (e.g. Webnode) change it only on request through support. Ask them to set the NSSET to the two Cloudflare nameservers **and remove the existing KEYSET** (DNSSEC) in the same step – a leftover KEYSET with new nameservers breaks resolution for validating resolvers. Draft the request text for the user.
3. After the switch: `whois <domain>` (nsset/keyset), `dig NS`, `dig DS` (must be empty until step 5), Cloudflare zone **Active**, every record resolves as before, test e-mail in both directions.
4. Apex → www: `A @ 192.0.2.1` **Proxied** (placeholder) + Rules → Redirect Rules: hostname equals `<domain>` → `concat("https://www.<domain>", http.request.uri.path)`, 301, preserve query string. Test with `curl -sI`.
5. SSL/TLS **Full (strict)**, Always Use HTTPS, Automatic HTTPS Rewrites, min TLS 1.2. No Rocket Loader / Auto Minify / injected scripts (Zaraz, analytics beacons) without asking – they break the performance budget. AI Crawl Control: search + agents allow, training per the client's wish.
6. DNSSEC: Cloudflare → DNS → Settings → Enable → give the DS/DNSKEY values to the registrar (for .cz a new KEYSET; Webnode-style hosts need a support request). Verify DS on a public resolver and <https://dnsviz.net>.

If DNS from the local terminal is unreliable (sandbox), use DNS-over-HTTPS in a browser: `https://dns.google/query?name=<name>&rr_type=<TYPE>`.

## 3. Handoff when waiting on a registrar

Write `docs/AFTER-NSSET.md` (or similar): current state, the expected record table, what to verify, remaining steps (apex redirect, zone settings, DNSSEC, Search Console). The next agent continues from it when the user says the switch happened.

## 4. Done

- `https://www.<domain>/build.json` = `git rev-parse HEAD`.
- Apex and `http://` redirect to `https://www.<domain>/` with path.
- Form, CMS login, mail all tested; Lighthouse on the production domain.
- Update `docs/ROLLBACK.md` with the new state.
