# Comic Explainer Style Standard

Use this reference when preparing prompts for `comic-diagram-generation`.

## Target Feel

The image should feel like a polished editorial sketch on a clean digital
whiteboard: precise, readable, friendly, and lightly playful. It should not look
like paper, a soft illustration pack, a corporate vector scene, or a busy
infographic.

## Background Control

Use three prompt layers together. Do not rely on only `white background`.

Positive background:

```text
The canvas must look like a clean digital whiteboard: flat pure white background,
not paper, not beige, not cream, no warm tint.
Pure white / neutral near-white background with black ink marker outlines.
Large areas left unfilled; no paper texture.
```

Negative constraints:

```text
Do not include: cream or beige page tint, warm halo, parchment texture, paper
grain, yellow background, large yellow shapes, gradients, shadows, or warm
lighting wash.
```

Yellow containment:

```text
Use golden yellow, amber, and orange only as tiny accent marks.
```

Tiny accent means small sparks, cursor marks, badge dots, button glints, or
lightbulb rays. It does not mean background fills, large panels, global lighting,
or big object surfaces.

## Linework

- Use thick black marker outlines and clear silhouettes.
- Keep line weight consistent across characters, cards, arrows, and props.
- Prefer crisp ink over pencil, watercolor, airbrush, or low-opacity sketching.
- Avoid soft shadows. If grounding is needed, use tiny neutral gray contact
  marks only.

## Palette

Default palette:

- Background: pure white / neutral near-white
- Structure and text: black
- Primary accents: lavender, mint, pale cyan
- Neutral support: light gray
- Success: green check marks only
- Warning: small red marks only
- Warm colors: golden yellow, amber, orange only as tiny accents

Avoid global warm tone. If the whole image feels yellow, remove yellow/amber
from object fills and keep only cool pastel accents.

## Composition

- Use landscape 16:9 unless the user asks otherwise.
- Prefer one of these layouts: left-to-right journey, before/after split,
  iceberg above/below, workbench sequence, checkpoint flow, map route.
- Leave large white gaps between groups. Breathing room is part of the style.
- Keep 3-5 main visual groups. Split into multiple images if the idea needs
  more than 6 groups.
- Arrows should be bold, black, and directional. Avoid tiny connector spaghetti.

## Characters

- Use stick figures, small robots, or bean-shaped characters.
- Faces should be minimal: dots, smiles, worried eyebrows, simple expressions.
- Body language should explain the state: confused, planning, building,
  celebrating, blocked, or inspecting.
- Do not render realistic people, detailed skin, portrait faces, or fashion
  detail.

For Archon-related images, do not use a generic robot. Use the canonical
**Archon Steward** from `ARCHON_CHARACTER.md`: white rounded-square voxel head,
black visor-line eyes, lavender scarf/tabard, lavender check-mark chest badge,
mint utility belt, and calm owner-like posture.

## Text

- Headline: English ALL-CAPS by default, 6 words or fewer.
- In-image labels: large, black, short, and sparse.
- Avoid paragraphs inside the image.
- If exact text rendering matters, generate a no-text version and add text later
  in design software.

## Metaphor Quality

A good metaphor is instantly readable without explaining the product. Prefer
universal scenes:

- Iceberg = hidden risk
- Workshop bench = agent work in progress
- Checkpoint/gate = access or registration
- Toolbox/cable cleanup = refactor
- Map route = coordination or journey
- Blueprint/inspection stamp = governance

Reject metaphors that create false claims. Do not show explosions, disasters,
security threats, or broken products unless the source idea actually says that.

## Prompt Polish

Strong prompt traits:

- Starts with canvas and style constraints
- States the core message explicitly
- Describes a mini-story, not a mood
- Names concrete props
- Defines layout direction
- Ends with strict negative constraints

Weak prompt traits:

- `nice hand-drawn image about AI`
- `white background` without negative warm/yellow constraints
- too many labels
- multiple metaphors in one image
- abstract words without physical objects
