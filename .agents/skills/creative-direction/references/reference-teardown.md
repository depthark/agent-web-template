# Reference teardown

How to analyse a site the user points to ("look at X") – to learn *methods*, never to copy. Output goes to `docs/creative/research.md` and, for lasting value, to `award-landscape.md`.

## When the site is reachable

Use a real browser (Playwright, or Chrome DevTools MCP if present). Collect evidence, not impressions.

```ts
// bun -e – or paste into a Playwright script; CHROME_PATH as for `bun run audit`
import { chromium } from "playwright-core";
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const requests: string[] = [];
page.on("request", (r) => requests.push(`${r.resourceType()} ${r.url()}`));
await page.goto(TARGET, { waitUntil: "networkidle" }); // TARGET = the reference URL
const facts = await page.evaluate(() => ({
  generator: document.querySelector('meta[name="generator"]')?.getAttribute("content"),
  fonts: [...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.family} ${f.weight} ${f.style}`),
  globals: ["gsap", "ScrollTrigger", "Lenis", "THREE", "barba", "Swup", "__NUXT__", "__NEXT_DATA__", "Webflow", "Framer"].filter((g) => g in window),
  canvases: [...document.querySelectorAll("canvas")].map((c) => `${c.width}x${c.height}`),
  h1: [...document.querySelectorAll("h1")].map((h) => h.textContent?.trim()),
  lang: document.documentElement.lang,
  bodyFont: getComputedStyle(document.body).fontFamily,
  colors: [...new Set([...document.querySelectorAll("body, h1, h2, a, button, header, footer, section")].flatMap((e) => [getComputedStyle(e).color, getComputedStyle(e).backgroundColor]))].slice(0, 20),
  reducedMotionCss: [...document.styleSheets].some((s) => { try { return [...s.cssRules].some((r) => r.cssText.includes("prefers-reduced-motion")); } catch { return false; } }),
}));
```

Then:
1. **Screens**: screenshot each section at 390 px and 1440 px; record a short video of the scroll (`recordVideo` context option) to study timing.
2. **Motion**: DevTools → Performance, record a scroll: which properties animate (transform/opacity only?), frame time, long tasks. Animations panel: durations and easings.
3. **Weight**: total transfer, JS size, number of requests, WebGL textures (Network → filter by `img`/`fetch`, `.ktx2`, `.glb`, `.hdr`).
4. **Lighthouse** mobile + desktop (`npx -y lighthouse@13 URL`) – record the four scores and LCP/CLS/TBT. Award sites often score poorly; note the *cause*.
5. **Accessibility probes**: Tab through the first 20 stops; zoom 200 %; `prefers-reduced-motion` on; screen reader headings list. Note what breaks.
6. **Credits / case study**: footer credits, Awwwards/CSSDA/FWA page, studio case study, Codrops article.

## When it is not reachable

(Network policy, geo-block, dead domain.) Use search indexes: Awwwards/CSSDA/FWA listings and case studies, Behance, the studio's LinkedIn/X posts, Codrops. Mark every fact with its source and say clearly what could not be verified. Never invent values (fonts, colours, libraries).

## Output template

```md
### <site> – <who>, <year>
- Concept / narrative:
- Signature moment:
- Layout & grid:
- Type (families, scale, treatment):
- Colour (values):
- Motion (what moves, how, duration/easing, scroll or time):
- Tech (framework, libraries, WebGL?, CMS, hosting):
- Performance (Lighthouse m/d, LCP, JS kB):
- Accessibility (what works / breaks):
- Awards:
- **Method to learn** (1–3 bullets, phrased as reusable principles):
- **Do not take** (the look, the signature itself):
- Sources:
```
