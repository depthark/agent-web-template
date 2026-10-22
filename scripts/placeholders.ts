#!/usr/bin/env bun
/**
 * Placeholder photos for the template (abstract gradients) as real image
 * sets, so the site builds and shows the gallery before the client's photos
 * exist. Replace them in the CMS or with `bun run image-set`, then delete
 * the placeholder files from public/gallery/.
 */
import sharp from "sharp";
import { makeImageSet } from "./image-set.ts";

const SETS: Array<[base: string, width: number, height: number, colors: [string, string, string]]> = [
  ["/gallery/web/hero", 2400, 1600, ["#1b1d24", "#3a4596", "#8b93e6"]],
  ["/gallery/projekty/ukazkovy-projekt/ukazkovy-projekt-01", 2400, 1600, ["#2a2f3a", "#5b6ad0", "#d8dcf5"]],
  ["/gallery/projekty/ukazkovy-projekt/ukazkovy-projekt-02", 1600, 2000, ["#20242c", "#3f8f7a", "#cfe9e1"]],
  ["/gallery/projekty/ukazkovy-projekt/ukazkovy-projekt-03", 2400, 1600, ["#262126", "#b0603d", "#f2dccf"]],
];

for (const [base, width, height, [a, b, c]] of SETS) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>
      <radialGradient id="r" cx=".72" cy=".38" r=".5"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <rect width="100%" height="100%" fill="url(#r)"/>
  </svg>`;
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  const set = await makeImageSet(png, base);
  console.log(base, set.widths.join(", "));
}
