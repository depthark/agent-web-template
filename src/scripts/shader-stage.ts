/**
 * Shader stage – the one WebGL entry point of the template (see the
 * `creative-dev` skill). Renders a fragment shader on a full-bleed canvas
 * behind real HTML content, and costs nothing until it is needed:
 *
 * - mounts only when the stage comes near the viewport, on idle, never
 *   before the LCP;
 * - WebGL2 with one full-screen triangle (no buffers, no library, ~2 kB);
 * - renders only while visible and the tab is shown, capped fps and DPR;
 * - `prefers-reduced-motion: reduce` → one still frame, no loop;
 * - no WebGL / compile error / context loss → the CSS fallback stays
 *   (the canvas only fades in after its first frame);
 * - colours come from CSS custom properties (`--shader-color-0…3`, OKLCH
 *   tokens welcome) and follow the theme toggle.
 *
 * Uniforms available to every shader: u_time (s), u_resolution (px),
 * u_pointer (0–1, y up, eased), u_scroll (0 → 1 while the stage crosses the
 * viewport), u_color[4] (linear-ish sRGB 0–1), u_dark (0 | 1).
 */

const VERTEX = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const PREAMBLE = `#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_scroll;
uniform vec3 u_color[4];
uniform float u_dark;
out vec4 fragColor;
`;

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

/** Any CSS colour (oklch, color-mix, …) → sRGB 0–1, via a 1×1 2D canvas. */
let probe: CanvasRenderingContext2D | null | undefined;
function toRgb(color: string): [number, number, number] {
  // Created on first use (after the visibility gate), not at module load.
  probe ??= document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe || !color) return [0, 0, 0];
  probe.clearRect(0, 0, 1, 1);
  probe.fillStyle = "#000";
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  // A warning, not an error: the fallback is the designed state, and console
  // errors cost the Lighthouse Best Practices score.
  console.warn("[shader-stage]", gl.getShaderInfoLog(shader));
  return null;
}

function mount(stage: HTMLElement) {
  const canvas = stage.querySelector<HTMLCanvasElement>("canvas");
  const source = stage.querySelector<HTMLScriptElement>('script[type="x-shader/x-fragment"]')?.textContent;
  // Hidden by CSS (forced colours, print, reduced data) → keep the fallback, spend nothing.
  if (!canvas || !source || getComputedStyle(canvas).display === "none") return;

  const maxDpr = Number(stage.dataset.dpr) || 1.5;
  const frameMs = 1000 / (Number(stage.dataset.fps) || 60);
  const usesPointer = source.includes("u_pointer");

  const gl = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: "low-power",
    failIfMajorPerformanceCaveat: true,
  });
  if (!gl) return;
  // Software rasterisers (SwiftShader, llvmpipe – GPU-less machines, Lighthouse
  // and PageSpeed runs) draw on the main thread: every frame is a long task.
  // Those visitors get the designed CSS fallback instead.
  const debug = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer = String(gl.getParameter(debug ? debug.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
  if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) {
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return;
  }

  let program: WebGLProgram | null = null;
  let loc: Record<string, WebGLUniformLocation | null> = {};

  function build() {
    if (!gl) return false;
    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fs = compile(gl, gl.FRAGMENT_SHADER, PREAMBLE + source);
    if (!vs || !fs) return false;
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
    gl.useProgram(program);
    loc = Object.fromEntries(
      ["u_time", "u_resolution", "u_pointer", "u_scroll", "u_color", "u_dark"].map((n) => [
        n,
        gl.getUniformLocation(program!, n),
      ]),
    );
    readColors();
    return true;
  }

  function readColors() {
    if (!gl || !program) return;
    const style = getComputedStyle(stage);
    const colors = [0, 1, 2, 3].flatMap((i) => toRgb(style.getPropertyValue(`--shader-color-${i}`).trim()));
    gl.uniform3fv(loc.u_color, colors);
    gl.uniform1f(loc.u_dark, document.documentElement.dataset.theme === "dark" ? 1 : 0);
  }

  let visible = false;
  let raf = 0;
  let last = 0;
  let start = performance.now();
  // A fixed moment for the still frame, so reduced motion still looks designed.
  const STILL_TIME = 12.0;
  const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
    const w = Math.max(1, Math.round(canvas!.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas!.clientHeight * dpr));
    if (canvas!.width !== w || canvas!.height !== h) {
      canvas!.width = w;
      canvas!.height = h;
    }
  }

  function draw(now: number) {
    if (!gl || !program) return;
    resize();
    const rect = stage.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    const scroll = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.y += (pointer.ty - pointer.y) * 0.08;
    gl.viewport(0, 0, canvas!.width, canvas!.height);
    gl.uniform1f(loc.u_time, reducedMotion.matches ? STILL_TIME : (now - start) / 1000);
    gl.uniform2f(loc.u_resolution, canvas!.width, canvas!.height);
    gl.uniform2f(loc.u_pointer, pointer.x, pointer.y);
    gl.uniform1f(loc.u_scroll, scroll);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (!stage.dataset.ready) stage.dataset.ready = "";
  }

  function loop(now: number) {
    raf = 0;
    if (!visible || document.hidden || reducedMotion.matches) return;
    raf = requestAnimationFrame(loop);
    if (now - last < frameMs - 1) return;
    last = now;
    draw(now);
  }

  function play() {
    if (reducedMotion.matches) {
      draw(performance.now());
      return;
    }
    if (!raf && visible && !document.hidden) raf = requestAnimationFrame(loop);
  }

  if (!build()) return;

  new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
    play();
  }).observe(stage);
  new ResizeObserver(() => reducedMotion.matches && visible && draw(performance.now())).observe(canvas);
  document.addEventListener("visibilitychange", play);
  reducedMotion.addEventListener("change", play);
  new MutationObserver(() => {
    readColors();
    if (reducedMotion.matches) draw(performance.now());
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  if (usesPointer) {
    window.addEventListener(
      "pointermove",
      (e) => {
        const r = stage.getBoundingClientRect();
        pointer.tx = (e.clientX - r.left) / (r.width || 1);
        pointer.ty = 1 - (e.clientY - r.top) / (r.height || 1);
      },
      { passive: true },
    );
  }

  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    cancelAnimationFrame(raf);
    raf = 0;
    program = null;
    delete stage.dataset.ready;
  });
  canvas.addEventListener("webglcontextrestored", () => {
    start = performance.now();
    if (build()) play();
  });
}

const idle = (cb: () => void) =>
  "requestIdleCallback" in window ? requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 200);

function init() {
  const near = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        near.unobserve(entry.target);
        idle(() => mount(entry.target as HTMLElement));
      }
    },
    { rootMargin: "50% 0px" },
  );
  document.querySelectorAll<HTMLElement>("[data-shader-stage]").forEach((el) => near.observe(el));
}

// Never compete with the first paint / LCP: start after load.
if (document.readyState === "complete") init();
else window.addEventListener("load", init, { once: true });
