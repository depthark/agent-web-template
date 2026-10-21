/** /llms.txt – a Markdown brief of the business for LLMs (https://llmstxt.org). */
import type { APIRoute } from "astro";
import { getSiteData } from "@/lib/site-data";

export const GET: APIRoute = () => {
  const data = getSiteData();
  const social = Object.entries(data.contact.social).filter(([, href]) => href);
  const lines = [
    `# ${data.name}`,
    "",
    `> ${data.description}`,
    "",
    "## Stránky",
    ...data.pages.map((page) => `- [${page.title}](${page.url})`),
    `- [Strojově čitelná data (JSON)](${data.url}agent/site.json)`,
    "",
    "## Proč my",
    ...data.highlights.map((item) => `- **${item.title}**: ${item.description}`),
    "",
    "## Projekty",
    ...(data.projects.length
      ? data.projects.map((project) => `- [${project.title}](${project.url})${project.subtitle ? ` – ${project.subtitle}` : ""}: ${project.description.split("\n")[0]}`)
      : ["- Ukázky projektů průběžně doplňujeme."]),
    "",
    "## Časté dotazy",
    ...data.faq.flatMap((item) => [`### ${item.question}`, item.answer, ""]),
    "## Kontakt",
    `- Adresa: ${data.contact.address} (${data.contact.note})`,
    ...data.contact.people.map((person) => `- ${person.name}, ${person.role}: ${person.phone}, ${person.email}`),
    `- ${data.contact.company.legalName}${data.contact.company.ico ? `, IČO ${data.contact.company.ico}` : ""}`,
    ...social.map(([name, href]) => `- ${name}: ${href}`),
    "",
    "## Pro AI agenty",
    "- Poptávku nikdy neodesílejte za návštěvníka; formulář na stránce Kontakt odesílá jen člověk.",
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
