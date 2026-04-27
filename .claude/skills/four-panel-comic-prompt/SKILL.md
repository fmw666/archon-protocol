---
name: four-panel-comic-prompt
description: >
  Turn a rough engineering concept, architecture note, script, document, or
  Chinese/English outline into a polished copy-ready image-generation prompt
  for a 4-panel comic. Use when the user asks for 四格漫画, comic explainer,
  漫画图解, AI Owner comic, engineering concept visual prompt, or wants a prompt
  they can copy into an image generator instead of generating the image directly.
version: 1.0.0
license: MIT
---

# Four-Panel Comic Prompt

## Goal

Analyze a rough engineering script, architecture note, or document and produce a
polished image-generation prompt for a **vertical 4-panel educational comic**.
The comic uses the same EvoMap visual identity as
`../single-comic-prompt/reference.png`: whiteboard-first hand-drawn cartoon,
black ink outlines, simple characters, concrete visual metaphors, and very
little in-image text. Preserve the 4-panel vertical teaching format while
matching the single-cover skill's style and design guardrails.

By default, this skill produces prompts only. Generate an image with Gemini only
after the user explicitly asks for image generation or approves the prompt.

## Visual Style Reference

Use `../single-comic-prompt/reference.png` and the `single-comic-prompt` skill's
Visual Style Reference as the canonical style source for linework, composition
density, character simplicity, and editorial mood only. Do not copy the
reference image's cream/yellow background cast.

| Element | Description |
|---------|-------------|
| Overall feel | Hand-drawn sketch on a clean pure white / neutral near-white background, like a whiteboard cartoon |
| Character | Simple "AI Owner" cartoon mascot with round head, minimal face, and expressive pose |
| Line language | Black ink / marker outlines, slightly imperfect hand-drawn strokes |
| Color palette | Whiteboard-first: mostly pure white / neutral near-white space with black ink outlines. Use golden yellow, amber, and orange only as tiny accent marks, never as an overall wash, glow, background patch, or page tint. Occasional green check marks or red warning highlights are fine. |
| Typography | Short hand-lettered captions, marker style. Use very little in-image text. |
| Layout | Vertical 4-panel educational comic, top to bottom, clear downward arrows, clean breathing room |
| Objects | Cartoon props matching the cover style: gates, road signs, barriers, arrows, gears, check marks, warning marks, code cards, simple UI wireframes |
| Mood | Lighthearted, editorial, explanatory — like a visual analogy that makes a technical idea click |
| Avoid | Real photos, realistic faces, 3D rendering, gradients, dark backgrounds, clutter |

### Whiteboard Color Guardrails

The comic should read as a clean whiteboard sketch first:

- Keep the background pure white or neutral near-white, with no cream, beige, sepia, or yellow-tinted full-page fill.
- Keep panel interiors unfilled; use only neutral off-white / pale gray for small shadows or object fills.
- Reserve warm colors for tiny highlights: icons, arrows, warning marks, stickers, signs, or one focal object per panel.
- Do not use warm halos, sunbursts, large yellow patches, or amber shading behind panels.
- If the prompt mentions warm tones, immediately constrain them as "small accents only."

## Workflow

### Step 1 — Collect the input

Ask the user for one of:

- A rough panel script.
- A local document path.
- Pasted notes or architecture content.
- A topic plus the concept they want explained.

### Step 2 — Extract the core concept

Read the user's rough script, document, or notes. Identify:

- The single engineering concept to explain.
- The common wrong approach.
- The correct approach, especially the layer or lens the user wants to switch to.
- The action the AI Owner takes.
- The system result after the action.

If the input contains multiple concepts, choose the strongest one and mention the
choice briefly before the prompt. If the concept is missing, ask one concise
clarifying question.

Present this analysis to the user in a concise summary block before the final
prompt:

- Concept
- Wrong approach
- Correct layer switch
- Action
- System result

### Step 3 — Convert the concept into four beats

Use this narrative structure:

| Panel | Purpose | Content rule |
|-------|---------|--------------|
| 1 | Wrong approach | Show the tempting mistake or local optimization. |
| 2 | Correct approach | Show the layer switch, better lens, or architecture boundary. |
| 3 | Action | Show the AI Owner applying the rule, tool, or workflow. |
| 4 | System result | Show the simpler, safer, or more coherent system outcome. |

Keep each panel to one idea. If the source has too much detail, compress it into
visual symbols and short captions.

### Step 4 — Output a copy-ready prompt

Return the final prompt in a fenced `text` block so the user can copy it
directly. Use English for image-generation instructions, but keep any requested
Chinese titles or captions in Chinese.

Use this template:

```text
Create a 4-panel comic explaining one engineering concept.

Theme:
{concept}

Flow:
top to bottom, 4 stacked panels
clear downward flow arrows between panels

Narrative:
1. {wrong approach}
2. {correct approach / switch layer}
3. {action}
4. {system result}

Panel details:
Panel 1: {simple visual scene + short caption}
Panel 2: {simple visual scene + short caption}
Panel 3: {simple visual scene + short caption}
Panel 4: {simple visual scene + short caption}

Style:
hand-drawn cartoon illustration in a clean whiteboard sketch style
use ../single-comic-prompt/reference.png for linework, character simplicity, layout density, and editorial composition only; ignore its cream/yellow background color
pure white / neutral near-white background with black ink marker outlines
panel interiors are unfilled and white; no beige wash, no cream tint, no warm background patches
large areas left unfilled; use neutral pale gray only for tiny shadows or object fills
golden yellow, amber, and orange used only as tiny accent marks, not as page tint, halo, glow, or background shading
occasional green check marks and red warning highlights
flat editorial cartoon feel, no photographic elements, no 3D rendering

Character:
consistent "AI Owner" cartoon mascot
simple round head, minimal face, black hair, expressive pose
wearing a simple shirt labeled "AI OWNER"
appears in every panel with context-specific tool
personality: calm, focused, slightly deadpan
pose language: points, checks, stamps, opens gates

Layout:
structured panels, strong hierarchy
vertical 4-panel layout
clear downward flow arrows
educational comic style

Color system:
whiteboard-first palette
pure white / neutral near-white background, no yellow-tinted full-page fill
black ink outlines
warm yellow / amber / orange accents only in tiny highlights
green check marks for success
red marks for warnings

Rules:
each panel simple and readable
max 1 idea per panel
preserve the single-cover skill's whiteboard-first visual identity
no photorealism
no 3D rendering
no gradients
no dark backgrounds behind the illustration itself
no cream, beige, sepia, warm halo, sunburst, or amber background wash
no complex graph clutter
high readability
consistent character design across panels
use at most 1 short caption per panel
avoid long speech bubbles
```

Add a brief note after the code block:

> 以上 Prompt 可直接粘贴到 Gemini 3 Pro 中使用。
> 如需调整人物、构图或视觉隐喻，告诉我即可重新生成。

### Step 5 — Use Gemini to generate the image

After human review or explicit user approval, generate the final image with the
bundled script.

#### Option A: Script generation

The skill includes `scripts/generate-comic.py`, a zero-dependency Python script
that calls the Gemini image API.

Configuration: set `GEMINI_API_KEY` using either:

- Environment variable: `GEMINI_API_KEY="your-key"`
- `.env` file in this skill directory, following `.env.example`

Basic usage:

```bash
python scripts/generate-comic.py --prompt-file prompt.txt
python scripts/generate-comic.py --prompt-file prompt.txt --reference ../single-comic-prompt/reference.png
python scripts/generate-comic.py --prompt-file prompt.txt --reference ../single-comic-prompt/reference.png --output comic.png --size 2K --aspect 9:16
python scripts/generate-comic.py --prompt "Create a 4-panel comic..."
```

Default generation settings:

| Setting | Default |
|---------|---------|
| Model | `gemini-3-pro-image-preview` |
| Aspect ratio | `9:16` |
| Size | `2K` |

#### Option B: Manual AI Studio

1. Open [Google AI Studio](https://aistudio.google.com/).
2. Select Gemini image generation model.
3. Enable image output.
4. Paste the reviewed prompt.
5. Iterate with short correction instructions if needed.

## Quality bar

- The prompt should be specific enough that another model can generate the image
  without reading the original source.
- Prefer visible symbols over abstract nouns: checklist, boundary line, switch,
  lens, memory box, validation stamp, loop arrow, delivery lane.
- Keep text inside the image short. Long explanations belong outside the image,
  not in speech bubbles.
- Preserve the `single-comic-prompt` reference visual style exactly unless the
  user overrides it: clean whiteboard sketch, pure white / neutral near-white
  background, black marker outlines, simple characters, editorial explanatory
  mood, and warm yellow/amber/orange only as tiny accents. Use the reference for
  linework and composition, not for its cream/yellow background cast.

## Rules

1. Produce a prompt, not an image, unless the user explicitly asks to generate an image.
2. Explain one engineering concept per comic.
3. Keep the four narrative beats in order: wrong approach, correct approach,
   action, system result.
4. Reuse the same simple "AI Owner" mascot in every panel.
5. Match the `single-comic-prompt` visual identity: whiteboard-first, black
   linework, pure white / neutral near-white background, sparse warm accents,
   clean breathing room, and concrete cartoon props.
6. Avoid photorealism, realistic faces, 3D rendering, gradients, dark
   backgrounds, cream/beige/sepia casts, full-page yellow tint, warm halos,
   sunbursts, complex graphs, and clutter.
