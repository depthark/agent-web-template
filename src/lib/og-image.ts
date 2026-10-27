/**
 * Open Graph / Twitter share images (1200×630 JPEG), rendered at build time
 * with sharp in the site's specimen style: paper, a rule, the name set in
 * Anybody, the page title (from the CMS) and the domain. `photo` stays in the
 * page list for sites that want a photo card again.
 */
import { resolve } from "node:path";
import sharp from "sharp";
import { site } from "@/data/site";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

const root = (path: string) => resolve(process.cwd(), path);
/** TTFs (sharp's text renderer can't read woff2): a static instance of the
 *  specimen face (Anybody wdth 150 / wght 800) and Inter for the small text. */
const FONT_DISPLAY = root("src/assets/fonts/Anybody-Specimen.ttf");
const FONT_TEXT = root("src/assets/fonts/Inter-Medium.ttf");
// Brand tokens (tailwind.source.css, light theme) as hex.
const PAPER = "#f9f5ee";
const INK = "#1a1511";
const VERMILION = "#c12b09";

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

async function text(markup: string, font: string, fontfile: string, width: number, dpi: number) {
  return sharp({ text: { text: markup, font, fontfile, width, dpi, rgba: true, wrap: "word" } })
    .png()
    .toBuffer({ resolveWithObject: true });
}

/** "Specimen" share card: paper, a vermilion rule, the name as the image,
 *  the page title, the domain – the same system as the site. */
export async function renderOgImage(page: OgPage): Promise<Buffer> {
  const margin = 72;
  const width = OG_WIDTH - margin * 2;
  const label = await text(
    `<span foreground="${VERMILION}">${escapeMarkup(page.title)}</span>`,
    "Inter Medium",
    FONT_TEXT,
    width,
    100,
  );
  const name = await text(
    `<span foreground="${INK}" line_height="0.86">${escapeMarkup(site.name.replace(" ", "\n"))}</span>`,
    "Anybody Specimen",
    FONT_DISPLAY,
    width,
    560,
  );
  const tagline = await text(
    `<span foreground="${INK}">${escapeMarkup(site.tagline)}</span>`,
    "Inter Medium",
    FONT_TEXT,
    width,
    140,
  );
  const domain = await text(
    `<span foreground="#6b625a">${escapeMarkup(new URL(site.siteUrl).hostname.replace(/^www\./, ""))}</span>`,
    "Inter Medium",
    FONT_TEXT,
    width,
    100,
  );

  const rule = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}"><rect x="${margin}" y="${margin + 44}" width="${width}" height="3" fill="${INK}"/></svg>`,
  );

  return sharp({ create: { width: OG_WIDTH, height: OG_HEIGHT, channels: 3, background: PAPER } })
    .composite([
      { input: rule },
      { input: label.data, left: margin, top: margin },
      { input: name.data, left: margin - 6, top: margin + 80 },
      { input: tagline.data, left: margin, top: OG_HEIGHT - margin - tagline.info.height },
      { input: domain.data, left: OG_WIDTH - margin - domain.info.width, top: OG_HEIGHT - margin - domain.info.height + 4 },
    ])
    .jpeg({ quality: 86, mozjpeg: true, progressive: true })
    .toBuffer();
}
