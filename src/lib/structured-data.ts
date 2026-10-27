/**
 * schema.org JSON-LD built from the same content the pages render, so the
 * structured data can never drift from what visitors (and the CMS) see.
 *
 * Shared nodes (WebSite, business, people) go on every page; pages add their
 * own nodes (FAQPage, ImageGallery, BreadcrumbList) through BaseLayout's
 * `schema` prop. Pick the most specific business type for a new client
 * (https://schema.org/LocalBusiness subtypes) in `BUSINESS_TYPE`.
 */
import { site, type Project } from "@/data/site";
import { absoluteUrl, imageSet } from "@/lib/image-set";
import { ogImageFor } from "@/lib/og-image";
import { markdownToText } from "@/lib/markdown";
import { getProjectMedia } from "@/lib/gallery";

type Node = Record<string, unknown>;

/** e.g. ["ProfessionalService", "HomeAndConstructionBusiness"], "Restaurant", "Dentist" … */
const BUSINESS_TYPE: string | string[] = "ProfessionalService";

const locale = ({ cs: "cs-CZ", sk: "sk-SK" } as Record<string, string>)[site.language] ?? site.language;

export const ids = {
  website: `${site.siteUrl}/#website`,
  business: `${site.siteUrl}/#business`,
  person: (index: number) => `${site.siteUrl}/#person-${index + 1}`,
};

const absolute = (path: string) => (/^https?:/i.test(path) ? path : `${site.siteUrl}${path}`);

/** Absolute URL of a content image (image set → its ~1200 px file). */
export const shareImage = (source: string) => {
  const set = imageSet(source);
  return set ? absoluteUrl(site.siteUrl, set) : absolute(source);
};

const people = (): Node[] =>
  site.company.contacts.map((person, index) => ({
    "@type": "Person",
    "@id": ids.person(index),
    name: person.name,
    jobTitle: person.role,
    ...(person.email ? { email: `mailto:${person.email}` } : {}),
    ...(person.phone ? { telephone: person.phone } : {}),
    worksFor: { "@id": ids.business },
    sameAs: Object.values(site.social).filter(Boolean),
  }));

const business = (): Node => {
  const { company } = site;
  return {
    "@type": BUSINESS_TYPE,
    "@id": ids.business,
    name: site.name,
    legalName: company.legalName,
    ...(company.ico ? { taxID: company.ico } : {}),
    slogan: site.tagline,
    description: site.description,
    url: `${site.siteUrl}/`,
    image: ogImageFor("/"),
    logo: `${site.siteUrl}/images/favicons/web-app-manifest-512x512.png`,
    ...(company.phones[0] ? { telephone: company.phones[0] } : {}),
    ...(company.emails[0] ? { email: company.emails[0] } : {}),
    address: {
      "@type": "PostalAddress",
      ...(company.street ? { streetAddress: company.street } : {}),
      ...(company.postalCode ? { postalCode: company.postalCode } : {}),
      addressLocality: company.city,
      addressRegion: company.region,
      addressCountry: company.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: company.geo.latitude,
      longitude: company.geo.longitude,
    },
    hasMap: `https://www.google.com/maps/search/?api=1&query=${company.geo.latitude},${company.geo.longitude}`,
    areaServed: company.areaServed,
    openingHoursSpecification: company.openingHours.map((hours) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: hours.days,
      opens: hours.opens,
      closes: hours.closes,
    })),
    contactPoint: company.contacts.filter((person) => person.phone || person.email).map((person) => ({
      "@type": "ContactPoint",
      contactType: "customer service",
      name: person.name,
      telephone: person.phone,
      email: person.email,
      availableLanguage: [site.language],
    })),
    employee: company.contacts.map((_, index) => ({ "@id": ids.person(index) })),
    sameAs: Object.values(site.social).filter(Boolean),
  };
};

const website = (): Node => ({
  "@type": "WebSite",
  "@id": ids.website,
  url: `${site.siteUrl}/`,
  name: site.name,
  description: site.description,
  inLanguage: locale,
  publisher: { "@id": ids.business },
});

export const baseGraph = (): Node[] => [website(), business(), ...people()];

export const webPage = (
  canonical: string,
  title: string,
  description: string,
  type = "WebPage",
  image = ogImageFor("/"),
): Node => ({
  "@type": type,
  "@id": `${canonical}#webpage`,
  url: canonical,
  name: title,
  description,
  inLanguage: locale,
  isPartOf: { "@id": ids.website },
  about: { "@id": ids.business },
  primaryImageOfPage: image,
});

export const breadcrumbList = (canonical: string, crumbs: Array<{ name: string; href: string }>): Node => ({
  "@type": "BreadcrumbList",
  "@id": `${canonical}#breadcrumbs`,
  itemListElement: crumbs.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: absolute(crumb.href),
  })),
});

export const faqPage = (items = site.home.faq): Node => ({
  "@type": "FAQPage",
  "@id": `${site.siteUrl}/#faq`,
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
});

export const projectGalleries = (projects: Project[]): Node[] =>
  projects
    .map((project) => ({ project, media: getProjectMedia(project) }))
    .filter(({ media }) => media.length)
    .map(({ project, media }) => ({
      "@type": "ImageGallery",
      "@id": `${site.siteUrl}/projekty/#${project.slug}`,
      name: project.title,
      description: [project.subtitle, markdownToText(project.text)].filter(Boolean).join(" – "),
      creator: { "@id": ids.business },
      image: media.map(({ alt, set }) => ({
        "@type": "ImageObject",
        contentUrl: absoluteUrl(site.siteUrl, set, 2400),
        thumbnailUrl: absoluteUrl(site.siteUrl, set, 400),
        width: set.width,
        height: set.height,
        caption: alt,
        creator: { "@id": ids.business },
        copyrightHolder: { "@id": ids.business },
      })),
    }));
