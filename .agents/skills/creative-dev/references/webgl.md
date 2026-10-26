# WebGL, shaders and 3D – fast and accessible

Two tools, in this order: **`<ShaderCanvas>`** (L5) for anything that is a moving surface; a **lazy 3D island** (L6) only when real geometry is the idea.

## `<ShaderCanvas>` (L5)

`src/components/creative/ShaderCanvas.astro` + `src/scripts/shader-stage.ts` (~2 kB gz, inlined by Astro). Already does: mount near viewport on idle after `load`; **software renderers (SwiftShader, llvmpipe) keep the CSS fallback** – they render on the main thread, so GPU-less machines (and Lighthouse / PageSpeed, which run without a GPU: measured TBT 139 s with a 30 fps shader before this rule) see the still design; WebGL2 full-screen triangle; DPR and fps caps; pause off-screen and in hidden tabs; one still frame under reduced motion; designed CSS fallback (no WebGL, compile error, context loss, forced colours, print, `prefers-reduced-data`); colours from CSS tokens that follow the theme toggle. Verified in Chromium (GPU path forced): renders, 0 frames off-screen, 0 frames with reduced motion, no console errors; on SwiftShader it stays on the fallback with 0 frames.

Consequence: **Lighthouse never sees your shader** – judge its cost yourself in DevTools on real hardware (below), and design the fallback as carefully as the shader, because lab tools, old laptops and some visitors get exactly that.

```astro
---
import ShaderCanvas from "@/components/creative/ShaderCanvas.astro";
import { grain } from "@/lib/shaders/grain"; // your shader
---
<section class="relative isolate overflow-hidden bg-ink-deep text-white">
  <ShaderCanvas
    fragment={grain}
    colors={["var(--color-ink-deep)", "var(--color-ink)", "var(--color-primary)", "var(--color-accent)"]}
    fps={30}
    dpr={1.5}
  />
  <div class="relative …">…real content, real headings…</div>
</section>
```

Writing a shader (`src/lib/shaders/<name>.ts`, export a GLSL ES 3.00 string with `void main()`; the stage declares the uniforms):

| Uniform | Value |
| --- | --- |
| `u_time` | seconds since mount (fixed `12.0` under reduced motion) |
| `u_resolution` | canvas size in device px |
| `u_pointer` | 0–1, y up, eased; listener only attached if the shader mentions `u_pointer` |
| `u_scroll` | 0 → 1 while the stage crosses the viewport |
| `u_color[4]` | the four `colors` (any CSS colour, read via computed style) |
| `u_dark` | 1 in dark theme |

Shader rules:
- **Cost scales with pixels**: full-screen at DPR 1.5 on a 390 px phone ≈ 0.8 Mpx per frame. Keep loops short (fbm ≤ 5 octaves), avoid `pow`/`exp` in loops, no texture lookups in loops, early-out where alpha is 0.
- **Ambient = 30 fps.** 60 only for pointer-reactive moments.
- **Design the still frame**: check how frame `u_time = 12.0` looks – it is what reduced-motion users get.
- **Contrast**: content over the shader must keep 4.5:1 against its *brightest* possible pixel – add a scrim in CSS if needed.
- **No flashing**: no hard, fast luminance changes over large areas (< 3 per second, WCAG 2.3.1).
- Add grain *inside* the shader (hash noise ±1.5 %) to stop gradient banding instead of a CSS overlay layer.
- Write the default `field` shader's replacement per project – `src/lib/shaders/field.ts` is only a starting point.

Image effects: pass the image as the CSS fallback (slot `fallback` with an `<img>`), keep the real `<img>` with `alt` in the DOM. If the effect needs the image as a texture, extend the stage with a `sampler2D` uniform loaded from the same AVIF (`createImageBitmap`) – keep the LCP image outside the effect.

## Lazy 3D island (L6)

When real 3D geometry *is* the concept (a product, an object from the client's world). Pattern: a poster image is the content and the LCP candidate; the 3D scene replaces it only after load, near the viewport, on capable devices.

```astro
---
import ResponsiveImage from "@/components/ui/ResponsiveImage.astro";
---
<figure class="relative" data-scene>
  <ResponsiveImage src={posterSrc} alt={alt} width={1600} height={1200} sizes="(min-width: 64rem) 50vw, 100vw" />
  <canvas class="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-slow" aria-hidden="true"></canvas>
  <figcaption class="sr-only">{caption}</figcaption>
</figure>

<script>
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const lowPower = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;

  for (const host of document.querySelectorAll<HTMLElement>("[data-scene]")) {
    if (lowPower) continue; // keep the poster
    const near = new IntersectionObserver(async ([entry]) => {
      if (!entry?.isIntersecting) return;
      near.disconnect();
      await new Promise<void>((r) => ("requestIdleCallback" in window ? requestIdleCallback(() => r()) : setTimeout(r, 200)));
      const { mountScene } = await import("@/scripts/scene"); // three.js lives behind this import
      mountScene(host, { reducedMotion: reduced });
    }, { rootMargin: "50% 0px" });
    near.observe(host);
  }
</script>
```

`src/scripts/scene.ts` responsibilities (mirror `shader-stage.ts`):
- **Named imports** from `three` (tree-shaking); no `import * as THREE`. Only the loaders you use (`GLTFLoader` + `DRACOLoader`/`MeshoptDecoder` for compressed geometry; KTX2 textures).
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))`; `powerPreference: "low-power"` unless the brief demands more; antialias off when post-processing does it.
- Render **on demand** for static scenes (render after input / scroll changes only); loop only while visible and `!document.hidden`; under reduced motion render once.
- Skip software renderers exactly like `shader-stage.ts` (`UNMASKED_RENDERER_WEBGL` matches `swiftshader|llvmpipe|software` → keep the poster).
- `IntersectionObserver` + `visibilitychange` pause; `webglcontextlost` → fade back to the poster; `dispose()` geometry, materials, textures, renderer when leaving.
- Fade the canvas in (`opacity` → 1) only after the first frame; the poster stays underneath.
- **WebGPU**: `import { WebGPURenderer } from "three/webgpu"` + `await renderer.init()` – it falls back to WebGL2 by itself. Use it when you need compute or TSL; plain WebGL2 is smaller.
- Assets: glTF with Draco/Meshopt, textures KTX2 (Basis) or AVIF, total ≤ 1.5 MB per scene, loaded after the poster.

Budgets: lazy JS ≤ 300 kB gz per page (`creative-check`), frame time ≤ 8 ms on a mid phone (DevTools: 390 px, CPU 4×), no TBT (all work after load, chunks small; split heavy setup with `await scheduler.yield?.()` between steps).

Accessibility: the canvas is `aria-hidden`; the poster's `alt` and the caption carry the meaning; any interaction (rotate the object) also works with buttons / arrow keys and is never required to read the content.

## Debugging and measuring

- Chrome DevTools → Performance with "Screenshots", CPU 4×, mobile viewport: GPU and main thread per frame.
- `chrome://gpu` for the backend; Spector.js (extension) to inspect draw calls.
- `bun run audit` proves: no rAF under reduced motion, no console errors, Lighthouse 100 – run it after every WebGL change.
