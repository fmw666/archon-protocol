---
name: archon-comic-doc-refactor
description: Refactor Archon protocol documentation into comic-explainer docs with per-document image archives. Use when improving docs/**/*.md (any VitePress page) with 漫画图解, replacing dense prose, ASCII flowcharts, or complex diagrams with concise text plus generated comic illustrations.
---

# Archon Comic Doc Refactor

Turn Archon protocol documentation into readable comic-explainer documentation. This skill is the orchestration layer above `comic-diagram-generation`: it decides what each document needs, where images live, and what text or flowcharts should be replaced.

## Scope

This is the `archon-protocol` site repository — every page under `docs/` is Archon-facing documentation (governance, workflow, architecture, setup, review, drift, decisions, user journeys, adoption). Use this skill across `docs/**/*.md`.

Do not use it for ordinary product docs from other projects, UI pages, or formal diagrams that must stay editable as Mermaid/text.

Treat machine-contract files conservatively:

- `docs/setup/templates/*.md` and `docs/source-files/.archon/templates/*.md` are schema/template contracts. Don't add images. The site templates are reading mirrors of the export contract; the source-files mirror is built into the install bundle.
- `docs/concepts/decisions.md` is the portable Archon framework ADR ledger under a strict line budget. Prefer 0 images. Project/product ADRs (when this protocol is consumed downstream) belong in the consuming project's `.archon/decisions.md`, not here.

## Required Companion Skill

Before generating images, read and follow:

- `.cursor/skills/comic-diagram-generation/SKILL.md`
- `.cursor/skills/comic-diagram-generation/STYLE.md`
- `.cursor/skills/comic-diagram-generation/ARCHON_CHARACTER.md`

This skill owns document refactoring. `comic-diagram-generation` owns visual style, prompt shape, character consistency, and the generation script.

## Image Archive Layout

Every refactored document gets its own image directory under VitePress's static-asset root (`docs/public/`):

```text
docs/public/images/<document-slug>/
```

The runtime URL is `/images/<document-slug>/<image-name>.png` (VitePress serves `docs/public/` at site root).

Examples that already exist in this repo:

- `docs/concepts/architecture.md` → `docs/public/images/architecture/`
- `docs/setup/install.md` → `docs/public/images/setup/` (chapter-shared bucket — multiple setup pages share the bucket)
- `docs/concepts/drift-mechanism.md` → `docs/public/images/drift-mechanism/`
- `docs/concepts/user-journeys.md` → `docs/public/images/user-journeys/`

Slug rules:

- Single doc → use the document's filename stem (`architecture.md` → `architecture/`).
- A chapter folder where every page shares one visual narrative → use the chapter slug as the bucket (`docs/setup/*.md` all draw from `docs/public/images/setup/`). Use this only when chapters are short and tightly related; otherwise prefer per-document slugs.
- The site root `README.md` / `index.md` uses `readme/`.

Image names use a stable sequence and short topic:

```text
01-identity-axioms.png
02-system-map.png
03-delivery-lifecycle.png
```

Markdown links from any `docs/**/*.md` use the absolute `/images/...` form because VitePress resolves those against `docs/public/`:

```markdown
![Comic explainer: <clear alt text>](/images/<document-slug>/<image-name>.png)
```

Do not use relative paths like `../public/images/...` — VitePress routes the absolute form correctly across nested chapter folders, and that is what the existing pages use.

## Refactor Workflow

1. Read the target document fully enough to understand its structure, test anchors, and existing diagrams.
2. Identify sections that are hard to read because they contain dense prose, ASCII diagrams, long process lists, or repeated explanation.
3. Decide the image count yourself. Use one image per major idea, not one image per heading.
4. Preserve mechanical contracts: required headings, tested phrases, tables that define exact rules, command names, paths, thresholds, and validation anchors.
5. Check line budgets before editing governance ledgers (`docs/concepts/decisions.md`). If adding images would exceed a tested cap, skip the document or propose a separate archive/compaction task first.
6. Replace complex diagrams/text with a comic image plus short explanatory prose.
7. Keep precision in compact tables when the reader needs exact rules.
8. Save images under `docs/public/images/<document-slug>/`.
9. Run validation after edits (`npm run build` + `npm run lint:links`).

## Image Count Heuristic

Choose the smallest image set that makes the document easier to understand:

| Document Shape | Typical Count |
|------|------|
| Short guide, one workflow | 1-2 images |
| Medium mechanism doc | 3-5 images |
| Long architecture or user-journey doc | 6-14 images |
| ADR log or reference index (`docs/concepts/decisions.md`) | Usually 0-2 overview images only; 0 if line-budget capped |
| Templates, schemas, or `docs/source-files/.archon/` mirrors | 0 images |

Skip an image when a table, checklist, or code snippet is already clearer than a drawing.

## Replacement Rules

Replace:

- ASCII box diagrams and long arrow diagrams
- Dense lifecycle prose that repeats what an image can show
- Multi-stage explanations where the reader needs an intuitive map first
- Conceptual contrasts such as before/after, hard boundary/soft process, memory/drift/debt

Keep:

- Exact schemas, contracts, CLI commands, and file paths
- Tables that tests or humans use as reference
- Required architecture wording such as `Verdict`, `Close-Out`, `Run-State`, `drift`, `Decision Gate`, and `Validation Gate`
- ADR rationale where legal/history precision matters
- File-tree blocks when they are the clearest install/export contract; add an image nearby instead of replacing them
- Machine-readable template sections, JSON snippets, schema examples, and exact status token definitions

Never remove a tested phrase just because it is visually awkward. If a diagram replacement deletes a phrase that validation expects, reintroduce it as a short sentence.

## Prompt Planning

For each image, write a compact plan before generation:

```markdown
Image: <number-name>
Section: <document heading>
Core message: <one sentence>
Metaphor: <one visual metaphor>
Must survive visually: <3-5 bullets>
Output: docs/public/images/<document-slug>/<number-name>.png
```

Then generate with:

```bash
node .cursor/skills/comic-diagram-generation/scripts/generate-cover.mjs --prompt-file <prompt-file> --output docs/public/images/<document-slug>/<number-name>.png --size 2K --aspect 16:9
```

Use `--proxy http://127.0.0.1:6984` when direct Gemini access fails.

## Document Editing Pattern

Place the image immediately after the heading it explains, then rewrite nearby text:

```markdown
## Delivery Lifecycle

![Comic explainer: Archon delivery lifecycle](/images/architecture/05-delivery-lifecycle.png)

The delivery flow has hard gates at the edges and a self-directed execution interior. Keep the exact gate names below because they are operational contracts.
```

Prefer short paragraphs after images. Do not leave the old complex flowchart below the image unless it carries exact machine-readable information that no table or sentence can preserve.

## Verification

After refactoring:

1. Search the edited document for leftover ASCII diagram fences or box characters.
2. Check every image path exists under `docs/public/images/<document-slug>/`.
3. Confirm every Markdown image reference uses the absolute `/images/...` form, not relative paths.
4. Run `npm run build` (VitePress build catches missing assets) and `npm run lint:links` (catches broken cross-references).
5. If validation fails because a required phrase was removed, restore the phrase in concise prose rather than restoring the old diagram.
6. Confirm generated images are tracked unless intentionally ignored.

## Completion Report

Report:

- Documents refactored
- Image directories created
- Number of generated images
- Major text/diagram blocks replaced
- Validation result (`npm run build` + `npm run lint:links`)

Mention any image generation failures or skipped sections.
