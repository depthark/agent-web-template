# agent-web-template

Starter for small business and portfolio websites, built to be driven by an AI coding agent.

**Astro (static) · TypeScript 7 · Bun · Tailwind CSS v4 · Decap CMS · Fancybox · Cloudflare Pages · Resend · in-repo AVIF image pipeline**

- Lighthouse 100/100/100/100 (mobile + desktop) out of the box: inlined critical CSS, self-hosted subset fonts with metric-matched fallbacks, responsive AVIF with focus points, deferred third parties.
- Decap CMS in Czech with guided tours, a photo widget that compresses to AVIF in the browser and commits to the repo, editorial workflow and a publish-status panel.
- Contact form via a Cloudflare Pages Function and Resend (recipients from the CMS, confirmation e-mail, spam protection, works without JS).
- SEO: per-page meta, JSON-LD graph, sitemap with images, generated share images, `llms.txt`.
- Light/dark theme, accessible mobile menu, PWA with offline page.

## For agents

Start with [`AGENTS.md`](AGENTS.md). Skills for every recurring task are in [`.agents/skills/`](.agents/skills) – a new project begins with `update-dependencies`, then `new-project`.

## Quick start

```bash
bun install
bun run dev          # http://localhost:4321
bun run cms:local    # second terminal → http://localhost:4321/admin/
bun run build        # CSS → astro check + tsc (TS 7) → astro build
```

Placeholder content (`Název firmy`, `example.cz`) and placeholder photos are meant to be replaced.
