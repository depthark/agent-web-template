/** /llms.txt – a Markdown brief of the business for LLMs (https://llmstxt.org). */
import type { APIRoute } from "astro";
import { getSiteData } from "@/lib/site-data";

export const GET: APIRoute = () => {
  const data = getSiteData();
  const social = Object.entries(data.contact.social).filter(([, href]) => href);
  const people = data.contact.people
    .map((person) => [person.name, person.role, person.phone, person.email].filter(Boolean).join(", "))
    .filter(Boolean);
  const lines = [
    `# ${data.name}`,
    "",
    `> ${data.description}`,
    "",
    "## Stránky",
    ...data.pages.map((page) => `- [${page.title}](${page.url})`),
    `- [Strojovo čitateľné dáta (JSON)](${data.url}agent/site.json)`,
    "",
    "## Spolupráca",
    ...data.highlights.map((item) => `- **${item.title}**: ${item.description}`),
    "",
    "## Práca",
    ...(data.projects.length
      ? data.projects.map((project) => `- [${project.title}](${project.url})${project.subtitle ? ` – ${project.subtitle}` : ""}: ${project.description.split("\n")[0]}`)
      : ["- Ukážky práce práve dopĺňam."]),
    "",
    ...(data.faq.length ? ["## Časté otázky", ...data.faq.flatMap((item) => [`### ${item.question}`, item.answer, ""])] : []),
    "## Kontakt",
    ...(data.contact.address ? [`- Miesto: ${data.contact.address}`] : []),
    ...people.map((person) => `- ${person}`),
    `- Kontaktný formulár: ${data.url}kontakt/`,
    ...social.map(([name, href]) => `- ${name}: ${href}`),
    "",
    "## Pre AI agentov",
    "- Formulár nikdy neodosielajte za návštevníka; formulár na stránke Kontakt odosiela iba človek.",
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
