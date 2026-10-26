# Award landscape 2024 – 2026 (and where it is heading for 2027)

Researched 2026-10-26 from search indexes (the award sites themselves were not reachable from the research container). Treat as a dated snapshot: re-check winners on [awwwards.com/websites/sites_of_the_month](https://www.awwwards.com/websites/sites_of_the_month/) and [awwwards.com/annual-awards/winners](https://www.awwwards.com/annual-awards/winners) before quoting them to a client. "2027's best sites" do not exist yet; this file describes the direction leading into 2027.

**How to use it:** to understand what juries reward and what has already been done to death. **Never** to pick a site to imitate. The originality protocol (`originality-protocol.md`) decides what we make.

## Awwwards Annual Awards 2025

| Award | Winner | Studio |
| --- | --- | --- |
| Site of the Year (jury + users' choice) | Lando Norris | OFF+BRAND (Glasgow) |
| Developer Site of the Year | Messenger | abeto |
| E-commerce of the Year | Scout Motors | — |
| Agency of the Year | Immersive Garden | — |
| Studio of the Year | Malvah | — |
| Independent of the Year | Louis Paquet | — |

2024 Site of the Year: **Igloo Inc** (Awwwards listing + case study, 30 Oct 2024).

## Sites of the Month

| Month | Site | By |
| --- | --- | --- |
| 2025-02 | Dropbox Brand | Daybreak Studio |
| 2025-03 | Siena Film Foundation | Niccolò Miranda |
| 2025-04 | Navigate | Resn |
| 2025-05 | Anime.js | Julian Garnier |
| 2025-06 | Montfort | Immersive Garden |
| 2025-07 | Tracing Art | Resn |
| 2025-08 | Cartier Watches & Wonders 2025 | Immersive Garden |
| 2025-09 | Terminal Industries | REJOUICE |
| 2025-10 | Ponpon Mania | Patrick Heng |
| 2025-12 | MindMarket | Louis Paquet |
| 2026-01 | Bruno's Portfolio | Bruno Simon |
| 2026-02 | The Renaissance Edition | Shopify |
| 2026-03 | GQ & AP The Extraordinary Lab | Immersive Garden |
| 2026-04 | Oryzo AI | Lusion |
| 2026-05 | Floema | — |
| 2026-06 | Son Daven | — |
| 2026-07 | Lama Lama | — |
| 2026-08 | ERA Residence | — |
| 2026-09 | Why Zero | Sindhur Dutta |

(January and November 2025 were not confirmed by the sources.)

## What the winners actually teach

| Site | The move | Transferable lesson |
| --- | --- | --- |
| **Lando Norris** (OFF+BRAND) | Cursor-reactive blob overlays on the hero photo that echo the black blob pattern of his helmet; neon from the helmet (`#CBF902` on `#2D3126`, paper `#F4F3F1`, grey `#7F8177`); content split "On Track" / "Off Track". | The visual language is **lifted from the subject's own artefact** (the helmet), not from other websites. The information architecture is a **duality that is true of the person**. |
| **Messenger** (abeto) | A tiny planet you walk around delivering letters; other visitors appear live; emoji-only communication. Three.js, models from Houdini/Blender. | A site can be a **place with a verb** (deliver, explore) rather than pages with sections. Presence of other people is content. |
| **Oryzo AI** (Lusion) | Satirical launch of an "AI product" that is a cork coaster, produced with total seriousness – a year-long internal project spanning site, founder video, Product Hunt, a fake open-weights repo. | **Tone is a creative lever.** Commit to a premise completely; craft makes the joke land. |
| **Bruno Simon** (2026 rebuild) | Kept the 2019 concept (drive a car through the portfolio) and rebuilt it on Three.js **TSL/WebGPU**, "ten times better". | A strong concept survives a decade; **the technology serves the idea**, and WebGPU is now production-real (with WebGL fallback). |
| **Anime.js** (Julian Garnier) | A library's site that *is* a demonstration of the library. | **Show, don't tell**: the product performs on the page. |
| **Immersive Garden** (Montfort, Cartier, GQ & AP) | Luxury-grade real-time 3D, cinematic lighting, slow camera, very restrained UI. | Restraint around a single spectacular element reads as luxury; clutter reads as cheap. |
| **Resn** (Navigate, Tracing Art) | Playful, toy-like interaction; the visitor makes something happen. | **Agency** beats spectacle: let the visitor cause the effect. |
| **Spatzek – dnlsptzk IV** (see below) | Site treated as an artwork: listed web-design rules and broke them on purpose; layout angles from paintings; hidden section. | **Rule inversion** and **a geometry borrowed from art history** as method. |

Codrops case studies in 2026 show where craft is going: persistent **WebGPU scenes across page transitions** with a tiny vanilla router (Ben Paine, Jun 2026), **compute-shader procedural worlds** (False Earth, Apr 2026), **MSDF text dissolving** with TSL (Jan 2026), scroll-driven WebGPU scene pipelines (Shader.se), and – equally – sites praised for **restraint and rhythm** (Naked City Films) and **editorial composition** (Bisous).

## Signals for 2027 (forecasts – low confidence, mostly agency blogs)

- **Native motion**: view transitions and scroll-driven animations replace JS motion libraries. One scan of award homepages found smooth-scroll libraries on ~66 % of them and view transitions on ~3 % – the gap is our opportunity: the same feel with no JS.
- **Away from neutral minimalism**: bolder colour, oversized type, 3D and motion in combination.
- **Anti-polish / authenticity**: raw, human, no stock imagery; process shown.
- **Accessibility as law**: the European Accessibility Act applies since 28 June 2025; WebAIM 2026 still finds ~96 % of top home pages failing automated WCAG checks. Award sites are among the worst offenders – an accessible award-level site is itself a differentiator.
- **Readable by agents**: semantic HTML, a real `<h1>`, structured data; one scan found 21 % of award homepages had no `<h1>`.
- **WebGPU** for heavy 3D (Three.js `WebGPURenderer` falls back to WebGL2).

## Reference sites given by the user

### danielspatzek.com – Daniel Spatzek / Spatzek Studio (Linz, Austria)

Not fetchable from the research container (network policy); compiled from Awwwards, CSS Design Awards and his case study via search.

- **dnlsptzk IV** (his 4th portfolio, 2022): CSSDA Website of the Month May 2022, Website of the Year 2022 nominee; site lists 1× Awwwards SOTM, 19× SOTD, 13× Developer, 12× Mobile Excellence. Earlier portfolio: Awwwards SOTD 23 Nov 2018.
- **Concept**: "a work of art rather than a portfolio". He **listed common web-design rules and set out to break each one** (the landing ignores "keep it clean and simple").
- **Geometry from painting**: analysed the compositional structure of Bruegel and Michelangelo paintings, found **four main angles – the same as his personal logo**; the intro is built on them.
- **Hidden layer**: numbers on screen (`4 14 12 19 16 20 26 11`) are letter positions of "dnlsptzk" and unlock a hidden section.
- **Craft lesson**: the work section's zoom into a monitor started as scaling a huge PNG to 800 % – rebuilt three times, finally on **canvas**.
- **Stack**: Nuxt, GSAP + ScrollTrigger, three.js, Storyblok, Netlify. Tags: one page, typographic, WebGL, loading animation, intro.
- **Studio work**: Bennett & Clive (Awwwards SOTM Mar 2024 + Developer), Orken for SIXMOREVODKA (SOTD Oct 2024), SIXMOREVODKA (SOTD 2020, 2022), VIITA Watches (SOTD).
- **What we take**: the *method* (rule inversion, geometry from a source artwork tied to the identity, a reward layer for the curious), not the look. What we do differently: native scroll, no loading screen, content in HTML, Lighthouse 100.

### mistrymont.com

Could not be reached (proxy denied the host) and no indexed page exists under that spelling (also tried mysterymont / misterymont). **Ask the user for the correct URL**, then run `reference-teardown.md` on it and add the findings here.

## Sources

- Awwwards: [Annual Awards winners](https://www.awwwards.com/annual-awards/winners), [Sites of the Month](https://www.awwwards.com/websites/sites_of_the_month/), [Sites of the Year](https://www.awwwards.com/websites/sites_of_the_year/), [Spatzek Studio profile](https://www.awwwards.com/spatzekstudio/), [Case study dnlsptzkIV](https://www.awwwards.com/case-study-dnlsptzkiv-by-daniel-spatzek.html), [Bruno's portfolio case study](https://www.awwwards.com/brunos-portfolio-case-study.html)
- [CSS Design Awards – dnlsptzk IV](https://www.cssdesignawards.com/sites/dnlsptzk-iv/41379)
- [DesignRush – Lando Norris website](https://designrush.com/best-designs/websites/lando-norris-website-design)
- Codrops: [Lusion feature](https://tympanus.net/codrops/2026/04/13/lusion-where-digital-craft-meets-ambitious-experimentation/), [Three.js conference speakers](https://tympanus.net/codrops/2026/07/16/meet-the-speakers-of-the-first-three-js-conference/), [June 2026 archive](https://tympanus.net/codrops/2026/06/)
- [Lusion – Oryzo BTS part 1](https://blog.lusion.co/oryzo-bts-part-1-7-concept-and-creative-direction)
- [Messenger (Wikipedia)](https://en.wikipedia.org/wiki/Messenger_(video_game))
- Trend forecasts: [Webyansh scan](https://webyansh.com/post/top-web-design-trends), [Lovart](https://www.lovart.ai/blog/web-design-trends-2027), [Graticle](https://graticle.com/blog/way-too-early-2027-web-design-predictions/), [Codeweb Barcelona](https://codewebbarcelona.com/en/web-design-trends-2027/)
- [Chrome – scroll-triggered animations](https://developer.chrome.com/blog/scroll-triggered-animations)
