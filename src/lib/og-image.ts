/**
 * Open Graph / Twitter share images (1200×630 JPEG), rendered at build time
 * with sharp: a darkened photo from the gallery, a brand glow, the logo and
 * the page title. Titles come from the CMS, so the images follow content
 * changes on every build. Re-brand: LOGO, GLOW and the fonts below.
 */
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { site } from "@/data/site";
import { imageSet, pick } from "@/lib/image-set";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const root = (path: string) => resolve(process.cwd(), path);
/** A TTF/OTF of the heading face (sharp's text renderer can't read woff2). */
const FONT = root("src/assets/fonts/Inter-Medium.ttf");
const FONT_NAME = "Inter Medium";
const LOGO = root("public/images/logo.svg");
const GLOW = "#4F5BD5";

export interface OgPage {
  slug: string;
  path: string;
  title: string;
  /** Image set base path used as the background. */
  photo: string;
}

const firstProjectPhoto = () => site.projects.flatMap((project) => project.images.map((image) => image.src))[0];

/** One share image per page; photos are local, so builds never hit the network. */
export const ogPages = (): OgPage[] => [
  { slug: "home", path: "/", title: site.home.hero.title, photo: site.home.hero.image },
  { slug: "projekty", path: "/projekty/", title: site.projectsPage.title, photo: firstProjectPhoto() ?? site.home.hero.image },
  { slug: "kontakt", path: "/kontakt/", title: site.contactPage.title, photo: site.home.hero.image },
];

/** Absolute URL of the share image for a page path (falls back to home). */
export function ogImageFor(pathname: string): string {
  const page = ogPages().find((p) => p.path === pathname) ?? ogPages()[0];
  return `${site.siteUrl}/og/${page.slug}.jpg`;
}

const escapeMarkup = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function text(markup: string, width: number, dpi: number) {
  return sharp({ text: { text: markup, font: FONT_NAME, fontfile: FONT, width, dpi, rgba: true, wrap: "word" } })
    .png()
    .toBuffer({ resolveWithObject: true });
}

async function backgroundOf(photo: string) {
  const set = imageSet(photo);
  const input = set ? root(`public${set.src}-${pick(set, 1200)}.avif`) : undefined;
  const base = input
    ? sharp(input)
    : sharp({ create: { width: OG_WIDTH, height: OG_HEIGHT, channels: 3, background: "#16181f" } });
  return base.resize(OG_WIDTH, OG_HEIGHT, { fit: "cover", position: "attention" }).blur(3).toBuffer();
}

export async function renderOgImage(page: OgPage): Promise<Buffer> {
  const light = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}">
    <defs>
      <radialGradient id="glow" cx="0.12" cy="0" r="0.75"><stop offset="0" stop-color="${GLOW}" stop-opacity="0.5"/><stop offset="1" stop-color="${GLOW}" stop-opacity="0"/></radialGradient>
      <linearGradient id="veil" x1="0" x2="1"><stop offset="0" stop-color="#121418" stop-opacity="0.78"/><stop offset="1" stop-color="#121418" stop-opacity="0.9"/></linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#veil)"/>
    <rect width="100%" height="100%" fill="url(#glow)"/>
  </svg>`);

  const logo = await sharp(await readFile(LOGO), { density: 300 })
    .resize(260, 260, { fit: "contain", background: "#0000" })
    .png()
    .toBuffer();

  const columnX = 470;
  const columnWidth = OG_WIDTH - columnX - 80;
  const eyebrow = await text(
    `<span foreground="#C9CEFF" letter_spacing="5000">${escapeMarkup(site.name.toUpperCase())}</span>`,
    columnWidth,
    110,
  );
  const title = await text(
    `<span foreground="#FFFFFF" line_height="1.1">${escapeMarkup(page.title)}</span>`,
    columnWidth,
    230,
  );
  const domain = new URL(site.siteUrl).hostname.replace(/^www\./, "");
  const subtitle = await text(`<span foreground="#E3E5EC">${escapeMarkup(domain)}</span>`, columnWidth, 120);

  const gap = 26;
  const blockHeight = eyebrow.info.height + gap + title.info.height + gap + subtitle.info.height;
  let y = Math.round((OG_HEIGHT - blockHeight) / 2);
  const placed: OverlayOptions[] = [];
  for (const part of [eyebrow, title, subtitle]) {
    placed.push({ input: part.data, left: columnX, top: y });
    y += part.info.height + gap;
  }

  return sharp(await backgroundOf(page.photo))
    .composite([{ input: light }, { input: logo, left: 120, top: Math.round((OG_HEIGHT - 260) / 2) }, ...placed])
    .jpeg({ quality: 84, mozjpeg: true, progressive: true })
    .toBuffer();
}
