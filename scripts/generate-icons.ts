#!/usr/bin/env bun
/**
 * Generates the favicon / PWA icon set from the logo – white art
 * (public/images/logo.svg, the same file the header and hero use) on the
 * brand ink. Replace the logo with the client's artwork (white, tight
 * viewBox), set INK, then run `bun run icons`. Outputs are committed.
 *
 *  - App, maskable and apple-touch icons: the logo with safe-zone margins.
 *  - favicon.svg / .ico / 96 px: the same art, larger in the frame. For a
 *    logo with a wordmark, set MARK_VIEWBOX to a square around the symbol
 *    only – words are unreadable at 16–48 px.
 */
import sharp from "sharp";
import { readFile, writeFile } from "node:fs/promises";

const OUT = "public/images/favicons";
const LOGO = "public/images/logo.svg";
const INK = "#1b1d24";
/** Square around the symbol in the logo's viewBox units, or null for the whole logo. */
const MARK_VIEWBOX: string | null = null;

const source = await readFile(LOGO, "utf8");
const inner = source.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<title>.*?<\/title>/, "");
const fullLogo = /viewBox="([^"]+)"/.exec(source)?.[1] ?? "0 0 1024 1024";

/** Logo art centred on an ink square; `scale` < 1 adds a safe-zone margin. */
function iconSvg({ viewBox, scale = 1, radius = 0 }: { viewBox: string; scale?: number; radius?: number }) {
  const [x, y, w, h] = viewBox.split(/\s+/).map(Number);
  const size = Math.max(w, h) / scale;
  const ox = x - (size - w) / 2;
  const oy = y - (size - h) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ox} ${oy} ${size} ${size}"><rect x="${ox}" y="${oy}" width="${size}" height="${size}" rx="${(radius * size) / 512}" fill="${INK}"/>${inner}</svg>`;
}

const favicon = iconSvg({ viewBox: MARK_VIEWBOX ?? fullLogo, scale: 0.8, radius: 112 });
const appIcon = iconSvg({ viewBox: fullLogo, scale: 0.8, radius: 112 });
const maskable = iconSvg({ viewBox: fullLogo, scale: 0.66 }); // inside the 80 % safe zone
const apple = iconSvg({ viewBox: fullLogo, scale: 0.76 });

const png = (svg: string, size: number) => sharp(Buffer.from(svg), { density: 300 }).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

/** .ico with embedded PNGs (supported by every current browser). */
function ico(images: Array<{ size: number; data: Buffer }>) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, data }, i) => {
    const at = 6 + i * 16;
    header.writeUInt8(size >= 256 ? 0 : size, at);
    header.writeUInt8(size >= 256 ? 0 : size, at + 1);
    header.writeUInt16LE(1, at + 4);
    header.writeUInt16LE(32, at + 6);
    header.writeUInt32LE(data.length, at + 8);
    header.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...images.map((image) => image.data)]);
}

const files: Record<string, Promise<Buffer>> = {
  "web-app-manifest-512x512.png": png(appIcon, 512),
  "web-app-manifest-192x192.png": png(appIcon, 192),
  "maskable-512x512.png": png(maskable, 512),
  "maskable-192x192.png": png(maskable, 192),
  "apple-touch-icon.png": png(apple, 180),
  "favicon-96x96.png": png(favicon, 96),
};
await writeFile(`${OUT}/favicon.svg`, `${favicon}\n`);
for (const [name, data] of Object.entries(files)) await writeFile(`${OUT}/${name}`, await data);
const icoSizes = await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(favicon, size) })));
await writeFile(`${OUT}/favicon.ico`, ico(icoSizes));
console.log("icons written to", OUT);
