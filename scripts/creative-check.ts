/**
 * Static quality gate for expressive work (the `creative-review` skill runs
 * it; CI runs it after the build). Two passes, no browser needed:
 *
 * 1. Source scan (src/, public/ minus CMS/vendor/generated): patterns that
 *    break accessibility or performance however good they look – blocked
 *    zoom, hidden cursor, scroll hijacking, positive tabindex, autoplaying
 *    sound, animation loops or WebGL without reduced-motion / visibility
 *    handling.
 * 2. Build output (dist/): per-page budgets (HTML incl. inlined CSS, initial
 *    JS, lazily imported JS) and markup rules (lang, one h1, alt on every
 *    img, labelled or hidden canvases, no render-blocking third parties).
 *
 *   bun run build && bun run creative:check     (exit 1 on any error)
 *
 * Budgets are deliberate: raise one only with a reason in the PR and the
 * Lighthouse numbers to back it (performance-audit skill).
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";
import { gzipSync } from "node:zlib";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist");

const BUDGET = {
  /** HTML document incl. inlined critical CSS, gzip. */
  htmlKb: 50,
  /** Scripts that run on load (inline + static module graph), gzip. */
  initialJsKb: 50,
  /** Everything a page may import later (dynamic import graph), gzip. */
  lazyJsKb: 300,
};

type Issue = { level: "error" | "warn"; where: string; rule: string; hint: string };
const issues: Issue[] = [];
const error = (where: string, rule: string, hint: string) => issues.push({ level: "error", where, rule, hint });
const warn = (where: string, rule: string, hint: string) => issues.push({ level: "warn", where, rule, hint });

function walk(dir: string, skip: (path: string) => boolean = () => false): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (skip(path)) return [];
    return statSync(path).isDirectory() ? walk(path, skip) : [path];
  });
}

const gz = (s: string | Buffer) => gzipSync(s).length / 1024;
const lineOf = (text: string, index: number) => text.slice(0, index).split("\n").length;

// ---------------------------------------------------------------- 1. source

const SOURCE_EXT = new Set([".astro", ".ts", ".tsx", ".js", ".mjs", ".css", ".html"]);
const SKIP_SOURCE = [
  "public/admin",
  "public/styles/tailwind.css",
  "public/gallery",
  "public/fonts",
  "public/images",
];
const sources = [...walk(join(ROOT, "src")), ...walk(join(ROOT, "public"))].filter(
  (f) => SOURCE_EXT.has(extname(f)) && !SKIP_SOURCE.some((s) => relative(ROOT, f).startsWith(s)),
);

const SOURCE_RULES: Array<{ re: RegExp; rule: string; hint: string; level?: "warn" }> = [
  {
    re: /maximum-scale|user-scalable\s*=\s*["']?(no|0)/g,
    rule: "zoom blocked",
    hint: "Never block pinch zoom (WCAG 1.4.4).",
  },
  {
    re: /cursor\s*:\s*none/g,
    rule: "native cursor hidden",
    hint: "A custom cursor may decorate the native one, never replace it (lost pointer for low-vision users, broken on touch/stylus).",
  },
  {
    re: /tabindex\s*=\s*["']?[1-9]/g,
    rule: "positive tabindex",
    hint: "Fix the DOM order instead; positive tabindex breaks keyboard order (WCAG 2.4.3).",
  },
  {
    re: /\b(lenis|locomotive-scroll|ScrollSmoother|smooth-scrollbar)\b/g,
    rule: "scroll hijacking",
    hint: "Native scroll only: scroll-driven animations / scroll snap. Smooth-scroll libraries add JS on every frame and fight assistive tech, find-in-page and anchors.",
  },
  {
    re: /<audio[^>]*\bautoplay\b/g,
    rule: "autoplaying audio",
    hint: "Sound only after an explicit user action, with a visible mute (WCAG 1.4.2).",
  },
  {
    re: /outline\s*:\s*(none|0)\b/g,
    rule: "outline removed",
    hint: "Only with a visible :focus-visible replacement in the same component (WCAG 2.4.7).",
    level: "warn",
  },
];

for (const file of sources) {
  const text = readFileSync(file, "utf8");
  const rel = relative(ROOT, file);

  for (const { re, rule, hint, level } of SOURCE_RULES) {
    for (const m of text.matchAll(re)) {
      const at = `${rel}:${lineOf(text, m.index ?? 0)}`;
      (level === "warn" ? warn : error)(at, rule, hint);
    }
  }

  for (const m of text.matchAll(/<video\b[^>]*>/g)) {
    const tag = m[0];
    if (/\bautoplay\b/.test(tag) && !(/\bmuted\b/.test(tag) && /\bplaysinline\b/.test(tag))) {
      error(`${rel}:${lineOf(text, m.index ?? 0)}`, "autoplaying video", "Autoplay only muted + playsinline, with a visible pause control and a poster (WCAG 2.2.2).");
    }
  }

  const motionAware = /prefers-reduced-motion|reducedMotion/.test(text);
  if (/requestAnimationFrame\s*\(/.test(text) && !motionAware) {
    error(rel, "animation loop ignores reduced motion", "Check matchMedia('(prefers-reduced-motion: reduce)') and render a still frame instead of looping.");
  }
  if (/getContext\(\s*["'`]webgl|new\s+(WebGLRenderer|WebGPURenderer)|navigator\.gpu/.test(text)) {
    if (!motionAware) error(rel, "WebGL ignores reduced motion", "Render one still frame under prefers-reduced-motion: reduce.");
    if (!/IntersectionObserver/.test(text) || !/visibilitychange|document\.hidden/.test(text)) {
      error(rel, "WebGL never pauses", "Stop the loop when the canvas is off-screen (IntersectionObserver) and when the tab is hidden (visibilitychange). Prefer <ShaderCanvas> / src/scripts/shader-stage.ts.");
    }
    if (!/swiftshader|llvmpipe|failIfMajorPerformanceCaveat/i.test(text)) {
      warn(rel, "runs on software WebGL", "Software renderers (SwiftShader/llvmpipe – GPU-less machines, Lighthouse) draw on the main thread: detect them and keep the fallback, as shader-stage.ts does.");
    }
    if (!/webglcontextlost|contextlost|onContextLost/.test(text)) {
      warn(rel, "no context-loss handling", "Listen for webglcontextlost: show the fallback, rebuild on restore.");
    }
  }
}

// ------------------------------------------------------------------ 2. dist

if (!existsSync(DIST)) {
  error("dist/", "no build output", "Run `bun run build` first.");
} else {
  const pages = walk(DIST, (p) => relative(DIST, p).startsWith("admin")).filter((f) => f.endsWith(".html"));
  const astroDir = join(DIST, "_astro");
  const chunk = (name: string) => {
    const path = join(astroDir, name);
    return existsSync(path) ? readFileSync(path, "utf8") : null;
  };
  const STATIC_IMPORT = /(?:from\s*|import\s*)["'`](?:\.\/|\/_astro\/)([\w.-]+\.js)["'`]/g;
  const DYNAMIC_IMPORT = /import\(\s*["'`](?:\.\/|\/_astro\/)([\w.-]+\.js)["'`]\s*\)/g;

  /** Follows imports from entry chunks; returns static and lazy file sets. */
  function graph(entries: string[]) {
    const initial = new Set<string>();
    const lazy = new Set<string>();
    const visit = (name: string, isLazy: boolean) => {
      if (initial.has(name) || (isLazy && lazy.has(name))) return;
      const code = chunk(name);
      if (code === null) return;
      (isLazy ? lazy : initial).add(name);
      for (const m of code.matchAll(STATIC_IMPORT)) visit(m[1]!, isLazy);
      for (const m of code.matchAll(DYNAMIC_IMPORT)) visit(m[1]!, true);
    };
    entries.forEach((e) => visit(e, false));
    for (const name of initial) lazy.delete(name);
    return { initial, lazy };
  }

  for (const file of pages) {
    const html = readFileSync(file, "utf8");
    const page = "/" + relative(DIST, file).replace(/index\.html$/, "");

    const htmlKb = gz(html);
    if (htmlKb > BUDGET.htmlKb) error(page, `HTML ${htmlKb.toFixed(1)} kB gz > ${BUDGET.htmlKb} kB`, "Inline CSS grew: purge unused utilities, move page-only CSS to the page, compress inline SVG.");

    let inlineJs = "";
    const entries: string[] = [];
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      const attrs = m[1] ?? "";
      if (/type\s*=\s*["'](application\/ld\+json|x-shader\/[\w-]+|application\/json|importmap|text\/plain)["']/.test(attrs)) continue;
      const src = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/)?.[1];
      if (src) {
        if (/^(https?:)?\/\//.test(src)) error(page, `third-party script ${src}`, "Self-host it or load it after interaction/idle (see GTM in BaseLayout).");
        else if (src.includes("/_astro/")) entries.push(src.split("/_astro/")[1]!);
      } else {
        inlineJs += m[2];
        for (const d of (m[2] ?? "").matchAll(STATIC_IMPORT)) entries.push(d[1]!);
        for (const d of (m[2] ?? "").matchAll(DYNAMIC_IMPORT)) entries.push(`lazy:${d[1]}`);
      }
    }
    const { initial, lazy } = graph(entries.filter((e) => !e.startsWith("lazy:")));
    for (const e of entries.filter((x) => x.startsWith("lazy:"))) {
      const sub = graph([e.slice(5)]);
      [...sub.initial, ...sub.lazy].filter((n) => !initial.has(n)).forEach((n) => lazy.add(n));
    }
    const initialKb = gz(inlineJs) + [...initial].reduce((s, n) => s + gz(chunk(n) ?? ""), 0);
    const lazyKb = [...lazy].reduce((s, n) => s + gz(chunk(n) ?? ""), 0);
    if (initialKb > BUDGET.initialJsKb) error(page, `initial JS ${initialKb.toFixed(1)} kB gz > ${BUDGET.initialJsKb} kB`, "Move heavy code behind import() on visibility/interaction; prefer CSS (css-first skill).");
    if (lazyKb > BUDGET.lazyJsKb) error(page, `lazy JS ${lazyKb.toFixed(1)} kB gz > ${BUDGET.lazyJsKb} kB`, "Tree-shake the 3D library (named imports), drop unused loaders/post-processing, or use <ShaderCanvas>.");

    for (const m of html.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*>/g)) {
      if (/href=["'](https?:)?\/\//.test(m[0])) error(page, "render-blocking third-party stylesheet", "Self-host fonts and inline CSS (performance-audit skill).");
    }
    if (!/<html[^>]*\blang=["'][\w-]+["']/.test(html)) error(page, "missing <html lang>", "Set from settings.language.");
    const h1 = (html.match(/<h1\b/g) ?? []).length;
    if (h1 !== 1) error(page, `${h1} <h1> elements`, "Exactly one h1 per page – the visible title; type-as-image still needs a real heading.");
    for (const m of html.matchAll(/<img\b[^>]*>/g)) {
      if (!/\salt(\s|=|\/?>)/.test(m[0])) error(page, "img without alt", `${m[0].slice(0, 90)}… – alt="" if decorative.`);
    }
    for (const m of html.matchAll(/<canvas\b[^>]*>/g)) {
      const labelled = /role=["']img["']/.test(m[0]) && /aria-label=/.test(m[0]);
      if (!/aria-hidden=["']true["']/.test(m[0]) && !labelled) {
        error(page, "canvas without a role", "Decorative: aria-hidden=\"true\". Meaningful: role=\"img\" + aria-label, and the same content as real HTML nearby.");
      }
    }
    if (/<meta[^>]*name=["']viewport["'][^>]*(maximum-scale|user-scalable=(no|0))/.test(html)) error(page, "zoom blocked", "Remove maximum-scale / user-scalable.");
  }
}

// ---------------------------------------------------------------- report

const errors = issues.filter((i) => i.level === "error");
const warns = issues.filter((i) => i.level === "warn");
for (const i of [...errors, ...warns]) {
  console.log(`${i.level === "error" ? "✗" : "!"} ${i.where}  ${i.rule}\n    ${i.hint}`);
}
console.log(`\ncreative-check: ${errors.length} error(s), ${warns.length} warning(s)`);
process.exit(errors.length ? 1 : 0);
