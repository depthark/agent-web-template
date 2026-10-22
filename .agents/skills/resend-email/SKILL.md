---
name: resend-email
description: Contact form e-mail through Resend – domain verification without touching the client's mailboxes, API key as a Cloudflare secret, recipients from the CMS, confirmation e-mail, spam protection (honeypot, time, links), no-JS fallback, validation UX, end-to-end testing. Use for the contact/inquiry form, "e-maily z formuláře", Resend, or delivery problems.
---

# Resend e-mail (always Resend; the site never hosts mailboxes)

## How the form works

`src/pages/kontakt.astro` → `POST /api/inquiry` (`functions/api/inquiry.ts`):

- With JS: JSON incl. `elapsed` (ms on page) → `{ ok }` / `{ error }`; success shows the panel `#odeslano` (`[data-shown]`).
- Without JS: normal form post → **303** to `/kontakt/#odeslano` (panel shown with `:target`) or `/kontakt/?chyba=1#poptavka`.
- Sends the inquiry to the **recipients** (`contact.json → form.recipients`, CMS "Komu chodí poptávky"; empty = all contacts from Nastavení; env `INQUIRY_TO` overrides) with the customer as `Reply-To`, then a **confirmation** to the customer (texts in CMS, copy of the message, contacts; `Reply-To` = recipients). A failed confirmation never fails the request.
- Sender: `INQUIRY_FROM` or `<site name> <web@<request domain>>` – the domain must be verified in Resend.
- **Spam**: hidden `website` honeypot, `elapsed` < 3 s (script posts only), more than 2 links → fake success, nothing sent (bots learn nothing).
- If the function is unreachable / not configured (503), the page opens a prepared `mailto:` to the recipients – never use `mailto:` as the form `action` (Lighthouse Best Practices penalises it).
- Topics select ("Co řešíte") from `form.topics`; hidden when empty.

## Validation UX (keep)

- Native constraints (`required`, `minlength`, `pattern`, `type=email`), styled with `:user-valid` (green) / `:user-invalid` (red + inline hint via `:has()`); empty optional fields stay neutral.
- Name + phone share a row through **CSS subgrid** so an error line under one field never misaligns the other.
- Patterns compile with the `v` flag – escape `-`, `(`, `)` inside classes.
- Don't hide the success panel with the `hidden` attribute (Tailwind preflight `[hidden]{display:none!important}` in a layer beats any unlayered rule) – use `:not([data-shown], :target)`.

## Resend setup (once per domain)

1. Resend account (the client's, or the owner's team) → **Domains → Add** `<domain>`, region **EU** (`eu-west-1`).
2. Add exactly the records Resend shows, in the zone that is authoritative **now** (old host's DNS or Cloudflare):
   - TXT `resend._domainkey` (DKIM),
   - the return-path records on Resend's own subdomain(s) (e.g. `send…` – CNAMEs, or MX + SPF TXT, depending on what the dashboard lists),
   - optional DMARC only if none exists.
   **Never change the root MX or root SPF** – they belong to the client's mailbox provider. Never add Resend's *receiving* MX on the root.
3. Wait for **Verified**. Create an API key with **Sending access** for this domain only → Cloudflare Pages secret `RESEND_API_KEY` (type Secret; the user pastes it – never put keys in chat or files). Redeploy.
4. Set recipients in the CMS (or `contact.json`).

## Test end to end

- Real submission on the production domain → Resend dashboard → Emails: two messages **Delivered** (inquiry + confirmation). Ask the user to confirm arrival in the mailbox (and spam folder).
- Bot paths send nothing: `curl -s -X POST https://www.<domain>/api/inquiry -H 'Content-Type: application/json' -d '{"name":"Bot","email":"bot@example.com","message":"hello there","website":"x","elapsed":5000}'` → `{"ok":true}` but no new e-mail in Resend.
- No-JS: `curl -si -X POST https://www.<domain>/api/inquiry -d 'name=Test&email=…&message=…'` → `303` to `/kontakt/#odeslano`.

## Mailboxes

The client's mailboxes stay with their provider (Webnode, Google Workspace, Microsoft 365, Seznam, …). Moving DNS to Cloudflare must copy MX, SPF, DKIM, DMARC, autoconfig/autodiscover records 1:1 (`cloudflare-deploy` skill). Tell the client explicitly that e-mail keeps working and that the mailbox subscription must not be cancelled.
