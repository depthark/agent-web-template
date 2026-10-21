/**
 * Single source of site content.
 *
 * Everything editable lives in `src/data/content/*.json`, which Decap CMS
 * (`/admin/`) reads and writes. This module only composes those files into
 * one typed object and derives convenience fields (address, phones, …), so
 * components never import JSON directly.
 */
import settings from "./content/settings.json";
import home from "./content/home.json";
import projectsPage from "./content/projects.json";
import contact from "./content/contact.json";

export interface GalleryImage {
  /** Image set base path, e.g. /gallery/projekty/<slug>/<slug>-01 (see src/lib/image-set.ts). */
  src: string;
  alt?: string;
  hidden?: boolean;
  /** Focus point in percent, kept in frame when tiles crop the photo. */
  focus?: { x: number; y: number };
}

export interface Project {
  order?: number;
  slug: string;
  title: string;
  /** Short line under the title, e.g. "Rodinný dům, Praha · 2026". */
  subtitle?: string;
  /** Description in Markdown (bold, italics, lists, links) from the CMS editor. */
  text: string;
  images: GalleryImage[];
}

// One file per project (CMS folder collection "Projekty"), sorted by `order`.
const projects = Object.values(
  import.meta.glob<Project>("./content/projects/*.json", { eager: true, import: "default" }),
).sort((a, b) => (a.order ?? 99) - (b.order ?? 99) || a.title.localeCompare(b.title, settings.language));

const company = settings.company;
const address = `${company.street}, ${company.postalCode} ${company.city}`;

export const site = {
  name: settings.name,
  tagline: settings.tagline,
  language: settings.language,
  siteUrl: (import.meta.env.PUBLIC_SITE_URL || import.meta.env.SITE || "https://www.example.cz").replace(/\/$/, ""),
  description: settings.description,
  keywords: settings.keywords,
  googleSiteVerification: settings.googleSiteVerification,
  gtmId: settings.analytics.gtmId,
  nav: [
    { href: "/", label: "Úvod" },
    { href: "/projekty/", label: "Projekty" },
    { href: "/kontakt/", label: "Kontakt" },
  ],
  social: settings.social,
  company: {
    ...company,
    address,
    phones: company.contacts.map((person) => person.phone).filter(Boolean),
    emails: company.contacts.map((person) => person.email).filter(Boolean),
  },
  home,
  projectsPage,
  projects: projects.map((project) => ({ ...project, images: project.images ?? [] })),
  contactPage: contact,
};

export type SiteData = typeof site;

/** `+420 777 000 000` → `tel:+420777000000` */
export const telHref = (phone: string) => `tel:${phone.replace(/\s+/g, "")}`;
