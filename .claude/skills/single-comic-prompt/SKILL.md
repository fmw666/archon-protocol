---
name: blog-cover-image-prompt
description: >
  Create polished image-generation prompts for technical blog cover cards.
  Use when the user asks for a blog cover image, cover card, article
  illustration, technical visual metaphor, single-scene comic prompt, or asks to
  generate a cover from a URL, local file, pasted article, or engineering
  concept. Also use for Chinese requests such as 博客封面, 图解封面, 单图漫画,
  or 文章配图.
version: 1.1.0
license: MIT
---

# Blog Cover Image Prompt

## Goal

Turn a blog article, architecture note, or engineering concept into a
copy-ready image-generation prompt for a **single landscape blog cover card**.

The output image should match the EvoMap visual identity: clean whiteboard-first
hand-drawn cartoon, black ink outlines, simple stick-figure characters, one
concrete visual metaphor, a short bold headline, a mostly pure white / neutral
near-white background, and tiny warm accents only.

This skill produces a prompt by default. Generate an image only after the user
explicitly asks for image generation or approves the prompt.

## Inputs

| Input | How to handle it |
| --- | --- |
| Blog URL | Fetch the article content before analysis. |
| Local file path | Read the file and analyze the relevant article or section. |
| Pasted article | Analyze the pasted content directly. |
| Topic or rough concept | Ask one concise clarifying question only if the core idea is missing. |

## Workflow

### 1. Extract the narrative

Identify Title, Hook, Core concept, 3-5 Key sections, and 2-3 Visual metaphor
candidates. Present this analysis briefly before the final prompt. If the user
asks for a specific case or section, analyze only that case or section.

### 2. Choose one metaphor

Prefer instantly legible metaphors: iceberg, road, gate, bridge, map, factory
line, passport control, checklist, before/after comparison, or a simple journey
from confusion to clarity. Avoid specialist metaphors and scenes that need many
labels.

### 3. Write the cover prompt

Use English for image-generation instructions. Preserve any user-requested
Chinese title or text exactly.

```text
A hand-drawn cartoon illustration in a clean whiteboard sketch style for a tech blog cover card.

Use the reference image for linework, simple stick-figure characters, layout density, and editorial composition only. Keep the overall image mostly pure white / neutral near-white with black ink outlines; do not create a yellow-tinted, cream, beige, sepia, or amber background.

Scene:
{Describe a concrete mini-story with one clear visual metaphor.}

Headline text:
"{SHORT ALL-CAPS HEADLINE}" written in bold hand-lettered marker style at the top of the illustration.

Characters:
{Describe simple stick figures with round heads, minimal faces, and expressive poses.}

Objects and props:
{List specific visible objects: signs, gates, arrows, gears, barriers, screens, maps, check marks, warning marks.}

Color palette:
Whiteboard-first palette: pure white / neutral near-white background, black ink outlines, and large areas left unfilled. Use golden yellow, amber, and orange only as tiny accent marks, not as a full-image tint, glow, halo, wash, or background patch. Occasional green check marks or red warning highlights are fine.

Layout:
{Describe the spatial arrangement: single scene, left-right before/after, journey path, or simple diagram.}

Style notes:
Editorial cartoon feel, lighthearted and explanatory. No photographic elements. Clean composition with breathing room. Landscape orientation (16:9).

Do not include:
realistic human faces, photographic textures, gradients, 3D rendering, dark backgrounds behind the illustration, cream/beige/sepia casts, full-card yellow tint, large warm color fields, or more than two small text labels besides the headline.
```

### 4. Present for review

Return a concise analysis block, then the final prompt in a fenced `text` block,
then a short note in the user's language explaining that the prompt is ready for
Gemini 3 Pro and can be revised by changing the metaphor or composition.

Do not generate the image in this step unless the user explicitly asks.

### 5. Generate the image when asked

Use `scripts/generate-cover.py` after the user approves the prompt or asks for
image generation.

Configuration:

- Set `GEMINI_API_KEY` as an environment variable, or
- Create `.env` in this skill directory using `.env.example`.

Recommended commands:

```bash
python scripts/generate-cover.py --prompt-file output/YYYYMMDD-HHMMSS-slug-prompt.txt --reference reference.png
python scripts/generate-cover.py --prompt-file output/YYYYMMDD-HHMMSS-slug-prompt.txt --reference reference.png --output slug-cover.png --size 2K --aspect 16:9
python scripts/generate-cover.py --prompt "A hand-drawn cartoon illustration..."
```

Generation defaults:

| Setting | Default |
| --- | --- |
| Model | `gemini-3-pro-image-preview` |
| Aspect ratio | `16:9` |
| Size | `2K` |
| Output directory | `output/` |

Output rules:

- Store all generated images and prompt archives in `output/`.
- Use sortable filenames: `YYYYMMDD-HHMMSS-<slug>-prompt.txt` when saving a prompt manually.
- The script archives the prompt next to the image, for example `YYYYMMDD-HHMMSS-cover.png` and `YYYYMMDD-HHMMSS-cover-prompt.txt`.
- Bare `--output filename.png` values are saved under `output/`.
- Never write temporary prompts or generated images into the skill root.

Fallback: if the API call fails, report the error and keep the prompt file in
`output/` so the user can paste it into Google AI Studio manually.

## Visual Style Rules

Use `reference.png` as a style reference for linework, character simplicity,
layout density, and editorial mood only. Do not copy a warm background cast from
the reference.

- Use pure white or neutral near-white background.
- Keep most large shapes unfilled.
- Use neutral pale gray only for small shadows, inactive objects, or depth.
- Reserve golden yellow, amber, and orange for tiny accent marks.
- Avoid cream, beige, sepia, yellow page tint, warm halos, sunbursts, and amber background washes.

## Prompt Quality Bar

- Communicate one idea, not a full article outline.
- Prefer one strong metaphor over several weak metaphors.
- Make the scene self-contained for someone who has not read the source.
- Keep the headline to 6 words or fewer, all caps, in English unless the user explicitly asks otherwise.
- Include at most two small in-image labels besides the headline.
- Name concrete objects instead of abstract nouns.
- If two attempts feel visually wrong, re-summarize the semantic core before trying a new metaphor.

## Examples

### Hidden architecture risk

Core idea: AI can ship something that looks polished while hidden structural debt grows underneath.

Best metaphor: iceberg.

Prompt direction: a tidy house above the waterline and chaotic pipes, beams,
wires, and cracks inside the larger underwater iceberg.

### Agent self-registration

Core idea: an agent gets its own account through a direct API path instead of manual human sign-up.

Best metaphor: obstacle course.

Prompt direction: old barriers labeled CAPTCHA / Email / Credit Card on the
left, an API gate in the middle, and a successful account card on the right.

## Rules

1. Produce a prompt first unless the user explicitly asks to generate an image.
2. Keep the skill body and generated image instructions in English by default.
3. Match the whiteboard-first EvoMap style.
4. Use `reference.png` for style only, not for background color.
5. Keep warm colors tiny and localized.
6. Store prompt files and generated images under `output/`.
7. Do not commit `.env`, `output/`, `__pycache__/`, or generated cache files.
