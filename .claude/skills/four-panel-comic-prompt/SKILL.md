---
name: four-panel-comic-prompt
description: >
  Create polished image-generation prompts for vertical 4-panel educational
  comics from engineering concepts, architecture notes, scripts, documents, or
  rough panel ideas. Use when the user asks for a four-panel comic, comic
  explainer, AI Owner comic, engineering concept visual, architecture comic, or
  Chinese requests such as 四格漫画, 漫画图解, 图解漫画, or 技术漫画.
version: 1.1.0
license: MIT
---

# Four-Panel Comic Prompt

## Goal

Turn a rough engineering concept, architecture note, document, or panel script
into a copy-ready image-generation prompt for a **vertical 4-panel educational
comic**.

The comic uses the same EvoMap visual identity as
`../single-comic-prompt/reference.png`: clean whiteboard-first hand-drawn
cartoon, black ink outlines, a simple AI Owner mascot, concrete visual
metaphors, very little in-image text, a pure white / neutral near-white
background, and tiny warm accents only.

This skill produces a prompt by default. Generate an image only after the user
explicitly asks for image generation or approves the prompt.

## Inputs

| Input | How to handle it |
| --- | --- |
| Rough panel script | Normalize it into the 4-beat structure. |
| Local document path | Read the document and choose the strongest single concept. |
| Pasted notes | Extract one explainable engineering concept. |
| Topic only | Ask one concise clarifying question if the concept is too vague. |

If the input contains multiple concepts, choose the strongest one for a single
comic and mention that choice before the prompt.

## Workflow

### 1. Extract the teaching concept

Identify Concept, Wrong approach, Correct layer switch, Action, and System
result. Present this analysis briefly before the final prompt.

### 2. Convert the concept into four beats

| Panel | Purpose | Content rule |
| --- | --- | --- |
| 1 | Wrong approach | Show the tempting mistake or local optimization. |
| 2 | Correct approach | Show the layer switch, better lens, or architecture boundary. |
| 3 | Action | Show AI Owner applying the rule, tool, or workflow. |
| 4 | System result | Show the simpler, safer, or more coherent outcome. |

Keep each panel to one idea. Compress details into visible symbols: checklist,
boundary line, switch, magnifying glass, memory box, validation stamp, gate,
road, delivery lane, warning mark, or green check.

### 3. Write the comic prompt

Use English for image-generation instructions. Preserve any user-requested
Chinese titles or captions exactly.

```text
Create a vertical 4-panel educational comic explaining one engineering concept.

Important text rule:
The instructions below are for the image model only. Do not draw panel numbers, section labels, narrative sentences, explanatory paragraphs, or the words "caption", "panel", "narrative", or "instructions" in the image. Each panel may contain only one short hand-lettered caption listed below.

Theme:
{one-sentence concept}

Four-panel story:
Panel 1 visual: {wrong approach as a concrete scene}
Panel 1 caption: "{SHORT CAPTION}"

Panel 2 visual: {correct layer switch as a concrete scene}
Panel 2 caption: "{SHORT CAPTION}"

Panel 3 visual: {AI Owner action as a concrete scene}
Panel 3 caption: "{SHORT CAPTION}"

Panel 4 visual: {system result as a concrete scene}
Panel 4 caption: "{SHORT CAPTION}"

Style:
hand-drawn cartoon illustration in a clean whiteboard sketch style
use ../single-comic-prompt/reference.png for linework, character simplicity, layout density, and editorial composition only; ignore its cream/yellow background color
pure white / neutral near-white background with black ink marker outlines
panel interiors are unfilled and white; no beige wash, no cream tint, no warm background patches
large areas left unfilled; use neutral pale gray only for tiny shadows or faded inactive objects
golden yellow, amber, and orange used only as tiny accent marks, not as page tint, halo, glow, or background shading
occasional green check marks and red warning highlights
flat editorial cartoon feel, no photographic elements, no 3D rendering

Character:
consistent "AI Owner" cartoon mascot
simple round head, minimal face, black hair, expressive pose
wearing a simple white shirt labeled "AI OWNER" in black ink
appears in every panel with a context-specific tool
personality: calm, focused, slightly deadpan

Layout:
vertical 4-panel layout, top to bottom
clean black panel borders
clear downward flow arrows between panels
generous white space

Color system:
whiteboard-first palette
pure white / neutral near-white background, no yellow-tinted full-page fill
black ink outlines
warm yellow / amber / orange accents only in tiny highlights
green check marks for success
red marks for warnings

Do not include:
photorealism
3D rendering
gradients
dark backgrounds
cream, beige, sepia, warm halo, sunburst, or amber background wash
large yellow shapes
complex graph clutter
long speech bubbles
paragraph text
panel numbers
instructional headings
extra captions beyond the four specified captions
```

### 4. Present for review

Return a concise analysis block, then the final prompt in a fenced `text` block,
then a short note in the user's language explaining that the prompt is ready for
Gemini 3 Pro and can be revised by changing the character, composition, or
metaphor.

Do not generate the image in this step unless the user explicitly asks.

### 5. Generate the image when asked

Use `scripts/generate-comic.py` after the user approves the prompt or asks for
image generation.

Configuration:

- Set `GEMINI_API_KEY` as an environment variable, or
- Create `.env` in this skill directory using `.env.example`.

Recommended commands:

```bash
python scripts/generate-comic.py --prompt-file output/YYYYMMDD-HHMMSS-slug-prompt.txt --reference ../single-comic-prompt/reference.png
python scripts/generate-comic.py --prompt-file output/YYYYMMDD-HHMMSS-slug-prompt.txt --reference ../single-comic-prompt/reference.png --output slug-comic.png --size 2K --aspect 9:16
python scripts/generate-comic.py --prompt "Create a vertical 4-panel educational comic..."
```

Generation defaults:

| Setting | Default |
| --- | --- |
| Model | `gemini-3-pro-image-preview` |
| Aspect ratio | `9:16` |
| Size | `2K` |
| Output directory | `output/` |

Output rules:

- Store all generated images and prompt archives in `output/`.
- Use sortable filenames: `YYYYMMDD-HHMMSS-<slug>-prompt.txt` when saving a prompt manually.
- The script archives the prompt next to the image, for example `YYYYMMDD-HHMMSS-comic.png` and `YYYYMMDD-HHMMSS-comic-prompt.txt`.
- Bare `--output filename.png` values are saved under `output/`.
- Never write temporary prompts or generated images into the skill root.

Fallback: if the API call fails, report the error and keep the prompt file in
`output/` so the user can paste it into Google AI Studio manually.

## Visual Style Rules

Use `../single-comic-prompt/reference.png` as the canonical visual reference for
linework, composition density, character simplicity, and editorial mood only. Do
not copy the reference image's cream/yellow background cast.

- Use pure white or neutral near-white background.
- Keep panel interiors white and unfilled.
- Use neutral pale gray only for faded inactive paths, small shadows, or minor object fills.
- Reserve golden yellow, amber, and orange for tiny accent marks only.
- Avoid cream, beige, sepia, yellow page tint, warm halos, sunbursts, amber background washes, and large yellow shapes.

## Prompt Quality Bar

- Explain one engineering concept per comic.
- Preserve the four-beat order: wrong approach, correct approach, action, system result.
- Keep each panel visually simple and readable.
- Reuse the same AI Owner mascot in every panel.
- Use at most one short caption per panel.
- Prefer visible symbols over abstract nouns.
- Keep long explanations outside the image.
- If a generated image contains too much text, rewrite the prompt with an explicit "Important text rule" and shorter captions.
- If a generated image looks yellow, tighten the prompt around pure white / neutral near-white background and explicitly ban warm washes.

## Rules

1. Produce a prompt first unless the user explicitly asks to generate an image.
2. Keep the skill body and generated image instructions in English by default.
3. Preserve user-requested Chinese captions only when they are intentional image text.
4. Match the `single-comic-prompt` whiteboard-first visual identity.
5. Use the reference image for style only, not for background color.
6. Keep warm colors tiny and localized.
7. Store prompt files and generated images under `output/`.
8. Do not commit `.env`, `output/`, `__pycache__/`, or generated cache files.
