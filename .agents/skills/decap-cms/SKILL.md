---
name: decap-cms
description: Set up and extend the Decap CMS admin (/admin/) – config.yml collections and fields, custom photo widgets, GitHub OAuth app via Cloudflare Pages Functions, editors as GitHub collaborators, editorial workflow and publish status, guided tours, local editing. Use for anything about the administration, content model, editor access or login problems.
---

# Decap CMS

## Pieces

| File | Role |
| --- | --- |
| `public/admin/index.html` | Loads Decap from unpkg (pinned version), vendor codecs, our scripts (`?v=` cache-bust) |
| `public/admin/config.yml` | Backend, workflow, collections, fields (Czech UI, `locale: cs`) |
| `photo-upload.js`, `image-pipeline.js`, `image-worker.js`, `repo-store.js` | Photo pipeline (see `image-pipeline` skill) |
| `gallery-manager.js` (`project-gallery` widget), `media-widgets.js` (`photo` widget) | Custom widgets |
| `admin-ux.js` | driver.js guided tours per screen, "Nápověda" button, confirm-before-remove dialogs |
| `publish-status.js` | After "Publikovat" polls `/build.json` until the deployed commit changes, shows "Hotovo – změny jsou na webu" |
| `functions/api/auth.ts`, `callback.ts` | GitHub OAuth for the GitHub backend |

## Content model rules

- Each JSON file in `src/data/content/` ↔ one CMS `files` entry (or a `folder` collection for repeatable items like projects). Read it only through `src/data/site.ts`.
- Labels and hints in the client's language; every hint says **where on the site** the field shows.
- `slug` fields: pattern `^[a-z0-9-]+$`, hint "po vytvoření neměňte" (folder names and anchors depend on them).
- Rich text: `widget: markdown`, `modes: [rich_text]`, minimal buttons (bold, italic, lists, link) → rendered by `src/lib/markdown.ts`.
- Reuse the `&seo` anchor for every page's SEO object.
- Lists the site iterates (FAQ, cards, topics, recipients) are `list` widgets; empty list = section hidden (code must handle it).
- When you add a field: add it to the JSON with a sensible value, to `config.yml`, to the TypeScript usage, and mention it in the tour text if editors need to know.

## GitHub OAuth (once per site)

1. GitHub → Settings → Developer settings → **OAuth Apps → New**: Homepage `https://www.<domain>`, callback `https://www.<domain>/api/callback`. (Owner account or the client's org.)
2. Generate a client secret; in Cloudflare Pages → Settings → Variables and Secrets add `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` as **Secret** type (with `wrangler.toml` present, plain build variables are not read by Functions). Redeploy.
3. `config.yml`: `backend.repo: owner/repo`, `branch: main`, `base_url: https://www.<domain>`, `auth_endpoint: api/auth`. Login works on the production domain (not on `*.pages.dev`) because `base_url` points there.
4. Test `https://www.<domain>/api/auth` → redirects to GitHub. Never paste secrets into chat or files; the user enters them in the dashboard.

## Editors

- Each editor needs a GitHub account with **write** access: `gh api -X PUT repos/<owner>/<repo>/collaborators/<user>` (sends an invitation; they must accept it at `github.com/<owner>/<repo>/invitations`). A repo on a personal account cannot grant "admin" to collaborators – write is enough for the CMS; admin needs an organisation.
- First login asks the editor to authorise the OAuth app.
- Test the first login **and a photo upload with an editor account**, not only the owner's.

## Editorial workflow

`publish_mode: editorial_workflow`: Save = draft (a PR on a `cms/…` branch; Cloudflare builds a preview) → status (Ke kontrole / Připraveno) → **Publikovat → Publikovat nyní** merges to `main` → Cloudflare deploys (2–3 min). `squash_merges: true`, Conventional-Commit-style messages from `commit_messages`.

## Local

`bun run dev` + `bun run cms:local` → `http://localhost:4321/admin/` writes files directly (no login).

## Troubleshooting

- "Not Found" on login → OAuth secrets missing or not Secret type, or wrong callback URL.
- "The code passed is incorrect or expired" → `/api/callback` ran twice (service-worker navigation preload sends a parallel request). `functions/api/_middleware.ts` answers preload requests with 204 – keep it; any function reached by a navigation must not do one-time work on a preload request.
- Uploads fail with 404/403 → editor lacks write access, or `backend.repo` wrong.
- Changes not visible → the PR is still a draft (Schvalování tab), or the deploy is running (`/build.json`).
- Admin JS changes not visible → bump `?v=` in `index.html`.
