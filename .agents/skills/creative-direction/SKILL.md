---
name: creative-direction
description: Concept and art direction for an original, award-level site – client truth inventory, reference teardowns, award landscape, inspiration from art (not web galleries), three divergent concepts, originality tests, the art-direction brief (type, colour, grid, imagery, motion principles, voice). Use for "creative direction", "concept", "make it original/unique/award-winning", "look at this site for inspiration", moodboards, or step 1–2 of the creative-site workflow.
---

# Creative direction

Output: `docs/creative/research.md` and `docs/creative/brief.md` in the project. Nothing gets built before the brief passes the originality tests. Write client-facing parts in the client's language (Czech by default), the rest in English.

References (read when the step needs them):
- [`references/originality-protocol.md`](references/originality-protocol.md) – truth inventory, three concepts, rule inversion, **cliché register**, originality tests, mutations.
- [`references/art-canon.md`](references/art-canon.md) – artists and movements → web techniques.
- [`references/award-landscape.md`](references/award-landscape.md) – Awwwards 2024–2026 winners, what they teach, 2027 signals, the user's reference sites (Spatzek).
- [`references/reference-teardown.md`](references/reference-teardown.md) – how to analyse a site the user names.

## 1. Research (`docs/creative/research.md`)

1. **Truth inventory** (originality protocol §1) – from the client, their current site, photos, social, the brief. Quote real words and numbers. If something essential is missing, list it as a question for the user; do not invent facts about the client.
2. **Reference teardowns** – for every site the user names, follow `reference-teardown.md`. Record the *method* to learn and what not to take. Unreachable site → say so, use indexes, ask for the right URL.
3. **Category conventions** – ten things every competitor does (for rule inversion).
4. **Landscape check** – skim `award-landscape.md`; refresh it (search "Awwwards Site of the Month <month year>") if older than three months and add what you find, with sources.
5. **Art sources** – shortlist 3 entries from `art-canon.md` that resonate with the inventory (or find a better one: architecture, film, music, craft; always say what *rule* you take).

## 2. Concepts

Write three divergent concepts (Material / Process / Inversion) in the exact format of protocol §2. Include for each a **stillness description** (reduced motion) and an **effect-ladder level** (see `creative-dev`). Then run the six originality tests (§5) on each and show the results in a small table. Mutate (§6) and re-test anything that fails.

Pick one (ask the user once if they are reachable; otherwise choose and justify).

## 3. Art-direction brief (`docs/creative/brief.md`)

Sections, all concrete enough that two different developers would build the same thing:

- **Idea** (one sentence) · **Truth** · **Art source + rule taken** · **Rules inverted** (with reasons) · **Signature moment** (what, where, how it degrades).
- **Voice** – tone of copy, three example headlines in the client's language, words to avoid.
- **Typography** – families (licence, variable axes, Czech diacritics coverage: test `ěščřžýáíéůúťďň ĚŠČŘŽÝÁÍÉŮÚŤĎŇ` at display size and tight leading – carons collide easily), roles (display / text / mono), fluid scale with `clamp()` values, measure (60–75 ch), treatments allowed (outline, italic axis, width axis).
- **Colour** – OKLCH tokens for light *and* dark (or a justified single theme), contrast pairs pre-checked (text ≥ 4.5:1, large ≥ 3:1, UI ≥ 3:1). Brand colour stays an accent per AGENTS.md unless the concept says otherwise *and* contrast holds.
- **Grid & space** – columns per breakpoint, the module, the rhythm (spacing scale), where the grid is broken on purpose.
- **Imagery** – photo direction (light, crop, focus), illustration/3D rules, what never to show (stock, handshake, laptop-on-desk).
- **Motion principles** – what motion *means* in this concept (e.g. "things settle like sawdust": slow-in, no bounce), 2–3 easing curves and durations as tokens, the entrance choreography, which elements may move on scroll, the reduced-motion translation.
- **Sound** (if any) – opt-in only, what triggers it, default muted.
- **Signature spec handoff** – the input for `creative-ux` (interaction) and `creative-dev` (effect level, budget).
- **Risks** – performance, accessibility, content (does the client have the photos?), maintenance (can the client edit it in the CMS?).
- **Originality test results** – the table from step 2.

## Principles

- Concept from the client's truth; inspiration from art, architecture, film, craft; the web only to learn craft and to know what is already done.
- One idea, one signature moment, one typographic voice, ≤ 3 colours plus neutrals. Restraint everywhere else makes the signature land.
- The accessible, fast version is the real version. A concept that only works with a mouse, motion or WebGL is a bad concept – change it now, not in QA.
- Content stays editable in Decap CMS (AGENTS.md → Data layer); the concept may not depend on copy lengths the client cannot keep.
- Never imitate a living artist's or studio's signature look; name influences in the brief, take only rules.
