---
name: comic-diagram-generation
description: >-
  Generate polished hand-drawn comic explainer images and visual-metaphor
  prompts for technical ideas, AI agent workflows, product concepts, blog covers,
  and architecture narratives. Use when the user asks for 漫画图解, 卡通图解,
  comic explainer, blog cover illustration, visual metaphor, or an explanatory
  image rather than a formal diagram.
---

# Comic Diagram Generation

Create crisp comic explainer images by translating an idea into one simple
visual metaphor, then generating a Gemini image with the bundled script.

## Use This Skill When

- The user asks for `漫画图解`, `卡通图解`, `comic explainer`, blog cover art, or
  a visual metaphor.
- The output should explain an abstract technical idea in a friendly editorial
  cartoon style.
- A formal flowchart or architecture diagram would feel too rigid.

Use `diagram-generation` instead for formal system diagrams, charts, matrices,
or anything that must remain editable as text.

## Non-Negotiables

- 先对齐语义，再找视觉。If two image attempts miss the point, stop and restate
  the core message before changing the metaphor.
- One image = one core message + one visual metaphor + one composition.
- Default canvas is a clean digital whiteboard: pure white / neutral near-white,
  no paper texture, no warm tint.
- Keep labels large and sparse. Headline plus at most 2-3 short in-image labels
  unless the user explicitly asks for a labeled process card.
- After every generated image, ask for feedback. If the user replies `1`, copy
  the accepted image into `examples/`.

## Standard Workflow

1. Collect input: URL, local file, pasted text, or a short concept.
2. Extract:
   - Topic/title
   - Core message in one sentence
   - Main tension, before/after, or hidden contrast
   - 3-5 ideas that must survive visually
   - 2-3 metaphor candidates
3. For long or ambiguous input, present the extracted meaning before generating.
4. Choose the clearest metaphor. Prefer everyday scenes over abstract diagrams.
5. Read `STYLE.md` before writing the final prompt.
6. If the image includes Archon, Archon governance, drift, review, demand,
   project ownership, validation, or engineering stewardship, also read
   `ARCHON_CHARACTER.md` and include the Archon Steward snippet.
7. Write a self-contained prompt using the blueprint below.
8. Generate with `scripts/generate-cover.mjs`; default output goes to
   `docs/public/images/`.
9. Show the saved path and ask: `这张图可以吗？如果满意请回复 1，我会把它额外归档到 Skill examples。`
10. If the user replies `1`, copy the accepted image to
   `.cursor/skills/comic-diagram-generation/examples/`.

## Prompt Blueprint

```text
A hand-drawn comic explainer illustration for "[TOPIC]".
The canvas must look like a clean digital whiteboard: flat pure white background,
not paper, not beige, not cream, no warm tint.
Pure white / neutral near-white background with black ink marker outlines.
Large areas left unfilled; no paper texture.
Use golden yellow, amber, and orange only as tiny accent marks.
Crisp black linework, high contrast, cool pastel accents, light editorial cartoon
mood, clear visual metaphor, landscape 16:9.

Headline text: "[SHORT ALL-CAPS HEADLINE]" at the top in bold black
hand-lettered marker style, readable, 6 words or fewer.

Core message: [One sentence explaining what the image must communicate.]

Scene: [Describe the mini-story. Say what happens, where the viewer looks first,
and what changes from left to right / top to bottom / above vs below.]

Characters: [Simple stick-figure or small robot/bean characters with round heads,
minimal faces, and expressive poses.]

Archon character, if present: [Use `ARCHON_CHARACTER.md` exactly enough to keep
the Archon Steward consistent: white rounded-square voxel head, black visor-line
eyes, lavender scarf/tabard, lavender check-mark chest badge, mint utility belt,
clipboard/blueprint/stamp/marker, calm owner-like posture.]

Objects and props: [Concrete props such as signs, arrows, cards, screens,
toolboxes, wires, maps, check marks, gates, bridges, or documents.]

Layout: [Single scene, before/after split, left-to-right journey, iceberg split,
workbench, checkpoint flow, or map route. Leave large white gaps between groups.]

Color palette: Pure white / neutral near-white background, black outlines,
lavender, mint, pale cyan, and light neutral gray. Use golden yellow, amber, and
orange only as tiny accent marks. Use red only for warnings and green only for
success.

Style notes: Clean digital whiteboard sketch, crisp marker outlines, consistent
line weight, no washed-out haze, no generic corporate vector art. The metaphor
should read instantly.

Do not include: cream or beige page tint, warm halo, parchment texture, paper
grain, yellow background, large yellow shapes, gradients, shadows, warm lighting
wash, amber/orange background areas, photographic textures, 3D rendering, dark
backgrounds, realistic faces, tiny text, or clutter.
```

## Gemini Script

The bundled generator is a zero-dependency Node script:

```bash
node .cursor/skills/comic-diagram-generation/scripts/generate-cover.mjs --prompt-file prompt.txt
```

Useful options:

```bash
node .cursor/skills/comic-diagram-generation/scripts/generate-cover.mjs --prompt-file prompt.txt --proxy http://127.0.0.1:6984
node .cursor/skills/comic-diagram-generation/scripts/generate-cover.mjs --prompt-file prompt.txt --output docs/images/my-comic.png --size 2K --aspect 16:9
node .cursor/skills/comic-diagram-generation/scripts/generate-cover.mjs --prompt-file prompt.txt --reference reference.png
```

Configuration:

- The script reads `GEMINI_API_KEY` from the shell environment first.
- Otherwise it reads `.env` in this skill directory.
- `.env` is ignored by git; `.env.example` is the tracked template.
- Without `--output`, images are saved to `docs/public/images/comic-<timestamp>.png`.
- Use `--proxy http://127.0.0.1:6984` when direct Gemini access times out.

## Metaphor Defaults

- Hidden risk: iceberg, cracked foundation, tangled basement
- Coordination: control room, traffic intersection, orchestra, map route
- Automation: workshop bench, factory line, conveyor belt, robot assistant
- Access or registration: checkpoint, keycard door, passport gate, arcade level
- Refactor or cleanup: untangled cables, sorted toolbox, repaired bridge
- Governance or constraints: rails, blueprint, inspection stamp, guardrails

Reject metaphors that distort the product truth. The image may simplify, but it
must not imply a failure, threat, or capability the concept does not claim.

## Archon Character Rule

For any Archon-related image, Archon is always the **Archon Steward** defined in
`ARCHON_CHARACTER.md`.

Do not invent a new Archon appearance per image. Reuse the same silhouette,
colors, accessories, and personality:

- White rounded-square voxel head
- Thick black marker outline
- Two black dot eyes behind a black rectangular visor line
- Lavender scarf or short tabard
- Lavender chest badge with one black check mark
- Mint utility belt with marker/ruler
- Clipboard, blueprint, inspection stamp, or black marker
- Calm, precise, owner-like pose

If product AI Agents also appear, keep them visually separate: product Agents do
not get Archon's lavender scarf/tabard or check-mark chest badge.

## Acceptance Checklist

Before generation:

- [ ] `STYLE.md` has been considered for background, linework, palette, layout,
  and negative constraints
- [ ] For Archon-related images, `ARCHON_CHARACTER.md` has been applied
- [ ] One core message, one metaphor, one composition
- [ ] Background control uses all three layers: positive white canvas, negative
  warm/yellow exclusions, and yellow-as-tiny-accent only
- [ ] Headline is short and readable
- [ ] Prompt names concrete objects, not vague vibes
- [ ] Default save path is `docs/public/images/`

After generation:

- [ ] Saved path is shown to the user
- [ ] User feedback is requested
- [ ] Only images approved with `1` are copied into `examples/`
