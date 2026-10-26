# Signature interaction spec (template)

Copy into `docs/creative/experience.md`, one per signature moment. Every field is required; "n/a" needs a reason.

```md
## Signature: <name>

**Concept link** – which line of the brief this expresses (idea / truth / art rule).

**Where** – page, section id, viewport position.

**What the visitor sees** – frame by frame (start → middle → end), with timings.

**Trigger** – time | scroll range (`view()` entry 0 % → cover 50 %, …) | pointer | click | keyboard | none.

**Input parity**
| Input | Behaviour |
| --- | --- |
| Mouse / trackpad | |
| Touch (390 px) | |
| Keyboard | (focusable control? which keys? focus ring where?) |
| Screen reader | (what is announced; the equivalent text in HTML) |
| No pointer at all | |

**Reduced motion** – the still version (describe the frame shown).

**Fallbacks** – no JS: … · no WebGL / context lost: … · forced colours: … · print: … · slow device (mid Android, CPU 4×): …

**Effect-ladder level** – L0–L6 (creative-dev) and why a lower level cannot do it.

**Budget** – JS kB gz (initial / lazy), GPU (fragment cost at 390 px, DPR cap), frame time ≤ 8 ms on mid phone, no LCP impact.

**Content dependency** – which CMS fields feed it; what happens with very short / very long text, 1 vs 30 images, missing image.

**Failure modes** – what can go wrong and what the visitor then sees.

**Acceptance tests**
- [ ] Works with mouse, touch, keyboard; screen reader hears <…>
- [ ] Reduced motion: still frame matches the description, no rAF loop (`bun run audit`)
- [ ] No WebGL: fallback is the designed state
- [ ] 320 px: no horizontal scroll; 200 % zoom: usable
- [ ] Lighthouse mobile 100 on the page; LCP element is not the canvas
- [ ] < 3 flashes per second; no large-area parallax > 1 viewport
```
