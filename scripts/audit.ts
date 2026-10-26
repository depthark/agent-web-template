/**
 * Runtime quality gate – a real browser on every page of the sitemap (the
 * `creative-review` skill runs it before anything is called done).
 *
 *   bun run audit                      build for localhost, serve dist/, audit
 *   bun run audit -- --url https://www.example.cz   audit a deployed site
 *   options: --no-build  --no-lighthouse  --pages /,/kontakt/  --out .audit
 *
 * Browser: Google Chrome (Playwright channel "chrome") or CHROME_PATH.
 * Lighthouse runs through `npx lighthouse@13` with the same browser.
 *
 * Per page (fails = exit 1):
 * - no console errors / uncaught exceptions;
 * - prefers-reduced-motion: no rAF loop and no infinite CSS/WAAPI animation
 *   keeps running (WCAG 2.2.2, 2.3.3);
 * - no horizontal scroll at 320 px (WCAG 1.4.10 Reflow);
 * - every Tab stop shows a focus indicator and is on screen (2.4.7, 2.4.11);
 * - interactive targets ≥ 24 × 24 px unless inline in text (2.5.8);
 * - Lighthouse mobile + desktop: 100 in every category, mobile LCP < 2 s,
 *   CLS ≤ 0.01, TBT 0 ms (1–50 ms = warning, run-to-run variance);
 * and screenshots (mobile/desktop × light/dark, plus full-page reduced
 * motion) in <out>/shots/ for the visual review by the creative-jury agent.
 */
import { chromium, type Browser, type BrowserContextOptions } from "playwright-core";
import { spawn, spawnSync } from "node:child_process";
import { createReadStream, existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { extname, join } from "node:path";
import { brotliCompressSync } from "node:zlib";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const option = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

const OUT = option("out") ?? ".audit";
const PORT = Number(option("port") ?? 4380);
const LIGHTHOUSE = "lighthouse@13";
// TBT budget is 0 ms (AGENTS.md); 1–50 ms is reported as a warning because a
// single ~70 ms parse task flips between 0 and ~20 ms across runs.
const LIMITS = { score: 100, lcpMobileMs: 2000, cls: 0.01, tbtMs: 0, tbtFailMs: 50 };

type Finding = { level: "error" | "warn"; page: string; check: string; detail: string };
const findings: Finding[] = [];
const fail = (page: string, check: string, detail: string) => findings.push({ level: "error", page, check, detail });
const note = (page: string, check: string, detail: string) => findings.push({ level: "warn", page, check, detail });

mkdirSync(join(OUT, "shots"), { recursive: true });
mkdirSync(join(OUT, "lighthouse"), { recursive: true });

// ------------------------------------------------------------ target site

let base = option("url")?.replace(/\/$/, "");
let server: Server | undefined;

if (!base) {
  base = `http://localhost:${PORT}`;
  if (!flag("no-build")) {
    console.log(`Building for ${base} …`);
    const build = spawnSync("bun", ["run", "build"], {
      stdio: "inherit",
      env: { ...process.env, PUBLIC_SITE_URL: base },
    });
    if (build.status !== 0) process.exit(build.status ?? 1);
  }
  server = await serve(join(process.cwd(), "dist"), PORT);
  console.log(`Serving dist/ on ${base} (its URLs point to localhost – rebuild before any manual deploy).`);
}

/** Static server for dist/ with Cloudflare-like trailing-slash handling. */
function serve(dist: string, port: number): Promise<Server> {
  const types: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".xml": "application/xml",
    ".txt": "text/plain; charset=utf-8",
    ".svg": "image/svg+xml",
    ".avif": "image/avif",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".webmanifest": "application/manifest+json",
  };
  const s = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url ?? "/", "http://x").pathname);
    let file = join(dist, path);
    if (!file.startsWith(dist)) return res.writeHead(403).end();
    if (existsSync(file) && statSync(file).isDirectory()) {
      if (!path.endsWith("/")) return res.writeHead(308, { Location: `${path}/` }).end();
      file = join(file, "index.html");
    }
    const status = existsSync(file) ? 200 : 404;
    if (status === 404) file = join(dist, "404.html");
    const type = types[extname(file)] ?? "application/octet-stream";
    // Brotli like Cloudflare, or the simulated mobile network punishes text.
    if (/text|javascript|json|xml|svg|manifest/.test(type) && /\bbr\b/.test(String(req.headers["accept-encoding"]))) {
      res.writeHead(status, { "Content-Type": type, "Content-Encoding": "br", Vary: "Accept-Encoding" });
      return res.end(brotliCompressSync(readFileSync(file)));
    }
    res.writeHead(status, { "Content-Type": type });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => s.listen(port, () => resolve(s)));
}

async function pagesToAudit(): Promise<string[]> {
  const list = option("pages");
  if (list) return list.split(",").map((p) => p.trim());
  const xml = await fetch(`${base}/sitemap.xml`).then((r) => (r.ok ? r.text() : ""));
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
  return locs.length ? [...new Set(locs)] : ["/"];
}

// --------------------------------------------------------------- browser

async function launch(): Promise<Browser> {
  const executablePath = process.env.CHROME_PATH;
  try {
    return await chromium.launch(executablePath ? { executablePath } : { channel: "chrome" });
  } catch (e) {
    console.error(
      "Could not start Chrome. Install Google Chrome, or set CHROME_PATH to a Chromium/Chrome binary.\n",
      (e as Error).message.split("\n")[0],
    );
    process.exit(1);
  }
}

const VIEWPORTS: Record<string, BrowserContextOptions> = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 } },
};

const slug = (path: string) => path.replace(/^\/|\/$/g, "").replace(/\//g, "_") || "home";

async function runtimeChecks(browser: Browser, path: string) {
  const url = base + path;
  const name = slug(path);

  // Screenshots + console errors: both viewports, both themes.
  for (const [vp, opts] of Object.entries(VIEWPORTS)) {
    for (const theme of ["light", "dark"]) {
      const ctx = await browser.newContext({ ...opts, colorScheme: theme as "light" | "dark" });
      await ctx.addInitScript((t) => {
        try {
          localStorage.setItem("theme", t);
        } catch {}
      }, theme);
      const page = await ctx.newPage();
      const errors: string[] = [];
      page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(url, { waitUntil: "load" });
      await page.waitForTimeout(1200);
      await page.screenshot({ path: join(OUT, "shots", `${name}-${vp}-${theme}.png`) });
      for (const e of errors) fail(path, `console error (${vp}, ${theme})`, e.slice(0, 200));
      await ctx.close();
    }
  }

  // Reduced motion: nothing may keep moving; full-page shot shows final states.
  {
    const ctx = await browser.newContext({ ...VIEWPORTS.mobile, reducedMotion: "reduce" });
    await ctx.addInitScript(() => {
      const w = window as unknown as { __raf: number };
      w.__raf = 0;
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) => {
        w.__raf++;
        return raf(cb);
      };
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "load" });
    await page.mouse.move(10, 10);
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(2500);
    const before = await page.evaluate(() => (window as unknown as { __raf: number }).__raf);
    await page.waitForTimeout(2000);
    const after = await page.evaluate(() => (window as unknown as { __raf: number }).__raf);
    if (after - before > 2) fail(path, "reduced motion: rAF loop", `${after - before} frames in 2 s while prefers-reduced-motion: reduce`);
    const infinite = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.playState === "running" && a.effect?.getComputedTiming().iterations === Infinity)
        .map((a) => {
          const t = (a.effect as KeyframeEffect | null)?.target as Element | null;
          return `${(a as CSSAnimation).animationName ?? "animation"} on ${t?.tagName.toLowerCase() ?? "?"}${t?.className ? "." + String(t.className).split(" ")[0] : ""}`;
        }),
    );
    if (infinite.length) fail(path, "reduced motion: endless animation", infinite.slice(0, 5).join(", "));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: join(OUT, "shots", `${name}-mobile-reduced-full.png`), fullPage: true });
    await ctx.close();
  }

  // Motion allowed: endless animations need a pause control (WCAG 2.2.2) – report for review.
  {
    const ctx = await browser.newContext(VIEWPORTS.desktop);
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "load" });
    await page.waitForTimeout(1500);
    const endless = await page.evaluate(
      () =>
        document
          .getAnimations()
          .filter((a) => a.playState === "running" && a.effect?.getComputedTiming().iterations === Infinity).length,
    );
    if (endless) note(path, "endless animations", `${endless} running – moving content > 5 s next to text needs a pause control (WCAG 2.2.2)`);

    // Keyboard: every Tab stop visibly focused and on screen.
    const seen = new Set<string>();
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      // Focus scrolls the element into view – smoothly, if the site uses scroll-behavior: smooth.
      await page
        .waitForFunction(
          () => {
            const r = document.activeElement?.getBoundingClientRect();
            return !r || (r.bottom > 0 && r.top < innerHeight);
          },
          undefined,
          { timeout: 1500 },
        )
        .catch(() => {});
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const id = `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${el.getAttribute("href") ? `[href="${el.getAttribute("href")}"]` : ""} "${(el.textContent ?? el.getAttribute("aria-label") ?? "").trim().slice(0, 30)}"`;
        const indicator =
          (cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0) ||
          cs.boxShadow !== "none" ||
          el.matches(":focus-visible") === false;
        const onScreen = r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth && r.width > 0;
        return { id, indicator, onScreen };
      });
      if (!info || seen.has(info.id)) break;
      seen.add(info.id);
      if (!info.indicator) fail(path, "focus not visible", info.id);
      if (!info.onScreen) fail(path, "focused element off screen", info.id);
    }

    // Target size (WCAG 2.5.8): ≥ 24 px, inline links in running text excepted.
    const small = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>("a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button]")]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          // Not rendered, or visually hidden until focused (skip link, sr-only).
          if (r.width <= 1 || r.height <= 1 || getComputedStyle(el).visibility === "hidden") return false;
          if (el.closest("[aria-hidden=true], [inert]")) return false;
          const inText = getComputedStyle(el).display === "inline" && el.parentElement?.closest("p, li, dd, td");
          return !inText && (r.width < 24 || r.height < 24);
        })
        .map((el) => `${el.tagName.toLowerCase()} "${(el.textContent ?? el.getAttribute("aria-label") ?? "").trim().slice(0, 24)}"`),
    );
    for (const s of small.slice(0, 5)) fail(path, "target < 24 px", s);
    await ctx.close();
  }

  // Reflow at 320 CSS px.
  {
    const ctx = await browser.newContext({ viewport: { width: 320, height: 640 } });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "load" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 1) fail(path, "horizontal scroll at 320 px", `${overflow}px too wide`);
    await ctx.close();
  }
}

// ------------------------------------------------------------ lighthouse

type LhRow = { page: string; form: string; scores: Record<string, number>; lcp: number; cls: number; tbt: number };
const lhRows: LhRow[] = [];

async function lighthouse(path: string, form: "mobile" | "desktop") {
  const file = join(OUT, "lighthouse", `${slug(path)}-${form}.json`);
  // Async on purpose: the dist/ server lives in this process and must keep answering.
  const run = () =>
    new Promise<void>((resolve) => {
      const child = spawn(
        "npx",
        [
          "-y",
          LIGHTHOUSE,
          base + path,
          "--quiet",
          "--output=json",
          `--output-path=${file}`,
          "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage",
          ...(form === "desktop" ? ["--preset=desktop"] : []),
        ],
        { stdio: "inherit" },
      );
      const timer = setTimeout(() => child.kill(), 180_000);
      child.on("exit", () => {
        clearTimeout(timer);
        resolve();
      });
    });
  const read = (): LhRow | null => {
    if (!existsSync(file)) return null;
    const r = JSON.parse(readFileSync(file, "utf8"));
    const a = r.audits;
    return {
      page: path,
      form,
      scores: Object.fromEntries(Object.values(r.categories).map((c: any) => [c.id, Math.round((c.score ?? 0) * 100)])),
      lcp: a["largest-contentful-paint"]?.numericValue ?? 0,
      cls: a["cumulative-layout-shift"]?.numericValue ?? 0,
      tbt: a["total-blocking-time"]?.numericValue ?? 0,
    };
  };
  const ok = (row: LhRow) =>
    Object.values(row.scores).every((s) => s >= LIMITS.score) &&
    (form === "desktop" || row.lcp < LIMITS.lcpMobileMs) &&
    row.cls <= LIMITS.cls &&
    row.tbt <= LIMITS.tbtFailMs;

  rmSync(file, { force: true });
  await run();
  let row = read();
  // Lighthouse varies ±2 points between runs: one retry before failing.
  if (row && !ok(row)) {
    await run();
    row = read() ?? row;
  }
  if (!row) return fail(path, `lighthouse ${form}`, "no report (is Chrome installed? npx reachable?)");
  lhRows.push(row);
  for (const [id, s] of Object.entries(row.scores)) if (s < LIMITS.score) fail(path, `lighthouse ${form} ${id}`, `${s} < ${LIMITS.score} – see ${file}`);
  if (form === "mobile" && row.lcp >= LIMITS.lcpMobileMs) fail(path, "LCP mobile", `${Math.round(row.lcp)} ms ≥ ${LIMITS.lcpMobileMs} ms`);
  if (row.cls > LIMITS.cls) fail(path, `CLS ${form}`, row.cls.toFixed(3));
  if (row.tbt > LIMITS.tbtFailMs) fail(path, `TBT ${form}`, `${Math.round(row.tbt)} ms`);
  else if (row.tbt > LIMITS.tbtMs) note(path, `TBT ${form}`, `${Math.round(row.tbt)} ms (budget 0 ms) – look at long tasks in ${file}`);
}

// ------------------------------------------------------------------ main

const pages = await pagesToAudit();
console.log(`Auditing ${pages.length} page(s) on ${base}: ${pages.join(", ")}`);
const browser = await launch();
for (const path of pages) {
  console.log(`· ${path}`);
  try {
    await runtimeChecks(browser, path);
  } catch (e) {
    fail(path, "browser checks crashed", (e as Error).message.split("\n")[0] ?? "");
  }
}
await browser.close();

if (!flag("no-lighthouse")) {
  for (const path of pages) {
    await lighthouse(path, "mobile");
    await lighthouse(path, "desktop");
  }
}
server?.close();

// ---------------------------------------------------------------- report

const errors = findings.filter((f) => f.level === "error");
const warns = findings.filter((f) => f.level === "warn");
const md = [
  `# Audit – ${base}`,
  "",
  `${new Date().toISOString()} · ${pages.length} page(s) · ${errors.length} error(s) · ${warns.length} warning(s)`,
  "",
  lhRows.length ? "| Page | Form | Perf | A11y | BP | SEO | LCP | CLS | TBT |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |" : "",
  ...lhRows.map(
    (r) =>
      `| ${r.page} | ${r.form} | ${r.scores.performance} | ${r.scores.accessibility} | ${r.scores["best-practices"]} | ${r.scores.seo} | ${Math.round(r.lcp)} ms | ${r.cls.toFixed(3)} | ${Math.round(r.tbt)} ms |`,
  ),
  "",
  "## Findings",
  "",
  ...(findings.length ? findings.map((f) => `- ${f.level === "error" ? "✗" : "!"} \`${f.page}\` **${f.check}** – ${f.detail}`) : ["None."]),
  "",
  `Screenshots: \`${OUT}/shots/\` (mobile/desktop × light/dark, \`*-mobile-reduced-full.png\` = whole page with reduced motion).`,
].join("\n");
writeFileSync(join(OUT, "report.md"), md);
console.log("\n" + md);
process.exit(errors.length ? 1 : 0);
