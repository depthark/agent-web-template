/**
 * Machine-readable facts about the business, derived from the CMS content.
 * Feeds /agent/site.json and /llms.txt.
 */
import { site } from "@/data/site";
import { getProjectMedia } from "@/lib/gallery";
import { markdownToText } from "@/lib/markdown";

const url = (path: string) => `${site.siteUrl}${path}`;

export function getSiteData() {
  return {
    name: site.name,
    url: url("/"),
    language: site.language,
    description: site.description,
    highlights: site.home.features.items.map(({ title, text }) => ({ title, description: text })),
    projects: site.projects.map((project) => ({
      title: project.title,
      subtitle: project.subtitle ?? null,
      description: markdownToText(project.text),
      url: url(`/projekty/#${project.slug}`),
      photos: getProjectMedia(project).length,
    })),
    faq: site.home.faq,
    contact: {
      address: site.company.address,
      geo: site.company.geo,
      note: site.company.openingNote,
      openingHours: site.company.openingHours,
      people: site.company.contacts,
      company: { legalName: site.company.legalName, ico: site.company.ico },
      social: site.social,
      contactPage: url("/kontakt/"),
    },
    pages: site.nav.map((item) => ({ title: item.label, url: url(item.href) })),
  };
}

export type SiteFacts = ReturnType<typeof getSiteData>;
