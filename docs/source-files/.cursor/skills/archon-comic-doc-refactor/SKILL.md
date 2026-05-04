---
name: archon-comic-doc-refactor
description: Refactor Archon documentation into comic-explainer docs with per-document image archives. Use when improving docs/archon/*.md with 漫画图解, replacing dense prose, ASCII flowcharts, or complex diagrams with concise text plus generated comic illustrations.
---

# Archon Comic Doc Refactor

Turn Archon documentation into readable comic-explainer documentation. This skill is the orchestration layer above `comic-diagram-generation`: it decides what each document needs, where images live, and what text or flowcharts should be replaced.

## Scope

Use this for `docs/archon/*.md` and Archon-facing documentation that explains governance, workflow, architecture, setup, review, drift, decisions, user journeys, or adoption.

Do not use it for ordinary product docs, UI pages, or formal diagrams that must stay editable as Mermaid/text.

Treat machine-contract files conservatively:

- `docs/archon/templates/*.md` are schema/template contracts; do not add images unless the user explicitly asks for a human-facing guide version.
- `docs/archon/decisions.md` is the portable Archon framework ADR ledger under a strict line budget. Prefer 0 images. Project/product ADRs belong in `.archon/decisions.md`.

## Required Companion Skill

Before generating images, read and follow:

- `.cursor/skills/comic-diagram-generation/SKILL.md`
- `.cursor/skills/comic-diagram-generation/STYLE.md`
- `.cursor/skills/comic-diagram-generation/ARCHON_CHARACTER.md`

This skill owns document refactoring. `comic-diagram-generation` owns visual style, prompt shape, character consistency, and the generation script.

## Image Archive Layout

Every refactored document gets its own image directory:

```text
docs/images/archon/<document-slug>/
```

Examples:

- `docs/archon/architecture.md` → `docs/images/archon/architecture/`
- `docs/archon/setup.md` → `docs/images/archon/setup/`
- `docs/archon/mechanisms/drift-mechanism.md` → `docs/images/archon/drift-mechanism/`
- `docs/archon/user-journeys.md` → `docs/images/archon/user-journeys/`

Image names use a stable sequence and short topic:

```text
01-identity-axioms.png
02-system-map.png
03-delivery-lifecycle.png
```

Markdown links from `docs/archon/<doc>.md` use:

```markdown
![Comic explainer: <clear alt text>](../images/archon/<document-slug>/<image-name>.png)
```

If older Archon images exist directly under `docs/images/`, migrate them into the matching per-document directory when refactoring that document.

Do not leave final Archon doc images in the root `docs/images/` folder. Root `comic-test-*` images are test artifacts and may be intentionally ignored; production doc images belong under `docs/images/archon/<document-slug>/`.

## Refactor Workflow

1. Read the target document fully enough to understand its structure, test anchors, and existing diagrams.
2. Identify sections that are hard to read because they contain dense prose, ASCII diagrams, long process lists, or repeated explanation.
3. Decide the image count yourself. Use one image per major idea, not one image per heading.
4. Preserve mechanical contracts: required headings, tested phrases, tables that define exact rules, command names, paths, thresholds, and validation anchors.
5. Check line budgets before editing governance ledgers. If adding images would exceed a tested cap, skip the document or propose a separate archive/compaction task first.
6. Replace complex diagrams/text with a comic image plus short explanatory prose.
7. Keep precision in compact tables when the reader needs exact rules.
8. Save images under `docs/images/archon/<document-slug>/`.
9. Run validation after edits.

## Image Count Heuristic

Choose the smallest image set that makes the document easier to understand:

| Document Shape | Typical Count |
|------|------|
| Short guide, one workflow | 1-2 images |
| Medium mechanism doc | 3-5 images |
| Long architecture or user-journey doc | 6-10 images |
| ADR log or reference index | Usually 0-2 overview images only; 0 if line-budget capped |
| Templates or schemas | 0 images unless creating a separate human guide |

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
Output: docs/images/archon/<document-slug>/<number-name>.png
```

Then generate with:

```bash
node .cursor/skills/comic-diagram-generation/scripts/generate-cover.mjs --prompt-file <prompt-file> --output docs/images/archon/<document-slug>/<number-name>.png --size 2K --aspect 16:9
```

Use `--proxy http://127.0.0.1:6984` when direct Gemini access fails.

## Document Editing Pattern

Place the image immediately after the heading it explains, then rewrite nearby text:

```markdown
## Delivery Lifecycle

![Comic explainer: Archon delivery lifecycle](../images/archon/delivery/01-lifecycle.png)

The delivery flow has hard gates at the edges and a self-directed execution interior. Keep the exact gate names below because they are operational contracts.
```

Prefer short paragraphs after images. Do not leave the old complex flowchart below the image unless it carries exact machine-readable information that no table or sentence can preserve.

## Verification

After refactoring:

1. Search the edited document for leftover ASCII diagram fences or box characters.
2. Check every image path exists.
3. Confirm no production Archon image remains in root `docs/images/`; each refactored doc should use `docs/images/archon/<document-slug>/`.
4. Run `npm run validate`.
5. If validation fails because a required phrase was removed, restore the phrase in concise prose rather than restoring the old diagram.
6. Confirm generated images are tracked unless intentionally ignored.

## Completion Report

Report:

- Documents refactored
- Image directories created
- Number of generated images
- Major text/diagram blocks replaced
- Validation result

Mention any image generation failures or skipped sections.
