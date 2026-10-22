---
name: client-handoff
description: Hand the finished site to the client – plain-language PDF guide (what changed, how the services fit together, how to edit), inviting editors, final verification, notes for the next agent. Use at launch or when the user asks for a client document / návod pro klienta.
---

# Client handoff

## 1. Final verification

- `performance-audit`, `accessibility-audit`, `seo-audit` on the production domain.
- Form end to end (inquiry + confirmation delivered), mailboxes still receive and send.
- CMS: an **editor** account logs in, edits a text, uploads a photo, publishes; the change appears.
- Search Console: sitemap submitted, main pages requested for indexing.

## 2. Editors

Invite each editor as a repo collaborator (`decap-cms` skill). Tell them to accept the invitation, then log in at `https://www.<domain>/admin/` via "Přihlásit se přes GitHub". Be present (or available) for the first login.

## 3. Guide for the client (PDF)

Audience: a non-technical owner. Language: the client's. Tone: calm, concrete, no jargon without explanation. Keep it ~8 A4 pages:

1. Cover – logo + screenshot of the new site.
2. **What changed** vs. the old site – 3 KPIs (Lighthouse score, mobile first paint before → after, monthly cost of the new services) + a before/after table (where the site lives, editing, photos, form, search engines, backups, domain & e-mail).
3. **How it fits together** – one diagram: visitor → Cloudflare (site) ; editor → admin → GitHub → Cloudflare build ; form → Resend → mailbox ; domain/e-mail at their provider.
4. **Services** – one card each (Cloudflare, GitHub, Administrace, Resend, domain/e-mail provider, Google): what it does, an everyday comparison, price (free tier limits – verify current numbers).
5. **How to edit** – admin screenshot + 5 steps (log in, choose, edit, save = draft, publish → 2–3 min).
6. **Photos** – gallery screenshot; upload, focus point, star, order, alt text, hide.
7. **When someone writes** – the inquiry flow from the customer's and the recipient's side; spam protection; e-mail unchanged.
8. **Security, backups, next steps, glossary**, contact.

How to build it: an HTML file with print CSS (`@page { size: A4; margin: 0 }`, one `<section class="page">` per page, fonts from the site), screenshots taken with Chrome DevTools (desktop, mobile, admin), rendered with headless Chrome:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --no-pdf-header-footer --allow-file-access-from-files --virtual-time-budget=8000 \
  --print-to-pdf="$PWD/guide.pdf" "file://$PWD/guide.html"
```

Render every page to PNG (e.g. `pypdfium2`) and look at each one – fix overflow (content colliding with the footer) before sending. Keep the HTML source and assets next to the PDF (`docs/klient/`). Never include the owner's private e-mail or secrets; ask the user to confirm any claim you could not verify (prices, limits, who invites whom).

## 4. For the next agent

Update `AGENTS.md` (client-specific facts, decisions), `docs/ROLLBACK.md`, and a handoff file for anything pending (e.g. waiting for a registrar).
