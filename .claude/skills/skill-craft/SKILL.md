---
name: skill-craft
description: >
  Create, review, and improve high-quality Agent Skills that follow proven
  engineering patterns. Use this skill whenever the user wants to create a new
  skill, improve an existing skill, review a skill for quality, convert a
  workflow into a reusable skill, or mentions "create skill", "write skill",
  "skill quality", "SKILL.md" — even if they just say "turn this into a skill"
  or "make this repeatable" (in any language).
version: 1.0.0
license: MIT
---

# Skill Craft

Create Agent Skills that are clear, maintainable, and effective. A well-crafted
skill turns a one-off AI interaction into a repeatable, high-quality workflow that
works reliably across different projects and contexts.

Most skills fail not because of bad instructions, but because of bad architecture:
they're too long for the AI to hold in context, too vague for consistent results,
or too rigid to adapt across projects. This skill teaches the structural patterns
that avoid those failure modes.

## When to activate

- User wants to create a new skill from scratch
- User wants to improve or refactor an existing skill
- User says "turn this into a skill" or "make this repeatable"
- User wants a quality review of a SKILL.md file
- User mentions "skill quality", "SKILL.md best practices"

---

## Skill anatomy

Every skill follows this structure:

```
skill-name/
├── SKILL.md              (required — the only file the AI reads first)
├── references/           (optional — detailed docs loaded on-demand)
│   ├── topic-a.md
│   └── topic-b.md
├── scripts/              (optional — executable code for deterministic tasks)
│   └── helper.py
└── assets/               (optional — templates, icons, fonts used in output)
    └── template.html
```

### Three-level loading (progressive disclosure)

This is the most important architectural pattern. It controls how much context
the AI consumes, which directly affects response quality:

| Level | What | Context cost | When loaded |
|-------|------|-------------|-------------|
| **L1: Metadata** | `name` + `description` in frontmatter | ~100 words | Always — this is how the AI decides whether to use the skill |
| **L2: SKILL.md body** | Instructions, workflow, rules | <500 lines ideal | When the skill triggers |
| **L3: Bundled resources** | references/, scripts/, assets/ | Unlimited | On-demand, only when a specific phase needs them |

**Why this matters**: An AI reading a 2000-line SKILL.md will lose focus on the
early instructions by the time it reaches the end. Progressive disclosure keeps
the orchestration layer lean and loads details only when needed — the same
principle behind lazy loading in software.

---

## Workflow

### Phase 1 — Capture intent

Start by understanding what the skill should do. Extract from conversation
context or ask directly:

1. **What**: What should the AI be able to do with this skill?
2. **When**: What user phrases or contexts should trigger it?
3. **Output**: What does the final output look like?
4. **Constraints**: What must the skill NOT do? What tools does it need?
5. **Audience**: Who will use this skill — technical users, non-technical, both?

If the current conversation already contains a workflow the user wants to
capture (e.g., they say "turn this into a skill"), extract answers from the
conversation history: the tools used, the sequence of steps, corrections the
user made, input/output formats observed.

### Phase 2 — Architect the skill

Before writing any instructions, decide the structural layout.

**Decision tree for file organization:**

```
Is the skill workflow > 300 lines of instructions?
├─ No → Single SKILL.md, no reference files
└─ Yes → Split by phase:
    ├─ Core orchestration → SKILL.md (<500 lines)
    ├─ Detailed procedures → references/
    ├─ Output templates → root level or assets/
    └─ Deterministic scripts → scripts/
```

**What goes WHERE:**

| Content type | Location | Reason |
|-------------|----------|--------|
| Trigger logic, workflow overview, rules | SKILL.md | Must be in L2 context for orchestration |
| Detailed step-by-step procedures | `references/` | Only needed during specific phases |
| Scoring criteria, deduction tables | `references/` | Heavy detail, loaded during scoring only |
| Output templates (reports, prompts) | Root level | Referenced by name from SKILL.md |
| Helper scripts, code generation | `scripts/` | Executed as black boxes, not loaded into context |
| Static assets (HTML templates, fonts) | `assets/` | Used in output generation |

**Reference files need a map.** At the bottom of SKILL.md, include a reference
table so the AI knows which file to read and when:

```markdown
## Reference files

| File | Purpose | When to read |
|------|---------|-------------|
| [references/scanning.md](...) | Phase 1 procedures | Before scanning |
| [references/scoring.md](...) | Deduction criteria | During Phase 3 |
```

### Phase 3 — Write the skill

Read [references/patterns-catalog.md](references/patterns-catalog.md) for the
complete catalog of proven writing patterns with examples.

Key principles:

**1. Write a "pushy" description.**

The `description` field is the primary trigger mechanism. AI models tend to
under-trigger skills — they err on the side of not using them. Combat this by
making the description generously inclusive about when to activate.

```yaml
# Too narrow — will miss many valid triggers:
description: Create MCP servers for external API integration.

# Pushy — captures a wider range of valid user intents:
description: >
  Guide for creating high-quality MCP servers that enable LLMs to interact
  with external services through well-designed tools. Use when building MCP
  servers to integrate external APIs or services, whether in Python or
  TypeScript. Also use when the user mentions "MCP", "tool integration",
  "external API", or wants to connect AI to any third-party service.
```

**2. Explain the WHY, not just the WHAT.**

Today's AI models are smart. When they understand *why* an instruction exists,
they can adapt it intelligently to edge cases. When they only know *what* to do,
they follow it rigidly and break on anything unexpected.

```markdown
# Weak — rigid, no context:
ALWAYS run lints after each file edit.

# Strong — explains the reasoning:
Run lints after each file edit. Vibe-coded changes often introduce subtle
errors that compound if left unchecked — catching them immediately prevents
cascading failures in later steps.
```

**3. Use imperative mood, present tense.**

Write instructions as direct commands: "Read the file", "Run the scan",
"Ask the user". Avoid passive voice and conditional hedging.

**4. Structure for scannability.**

The AI reads the full SKILL.md on every invocation. Use tables, short
paragraphs, and clear headers so it can quickly find the relevant section
for the current task. Walls of text get lost in the attention window.

**5. Include concrete examples.**

Examples ground abstract instructions. Show input/output pairs, command
invocations, and expected results.

**6. Define fallbacks for every external tool.**

Any tool can fail. If your skill depends on `npx some-tool`, include what
to do when it fails: manual alternative, graceful degradation, or explicit
skip-and-document.

**7. End with a rules section.**

Rules are the hard constraints that override everything else. Keep them
numbered, short, and unambiguous. Rules exist for things the AI might
otherwise get wrong — if the instruction is obvious, it doesn't need a rule.

### Phase 4 — Review & refine

After writing, evaluate the skill against the quality checklist:

**Structure quality:**

- [ ] SKILL.md is under 500 lines
- [ ] Description is "pushy" — lists trigger phrases generously
- [ ] Progressive disclosure is used (no 1000+ line monoliths)
- [ ] Reference files have a map table at the bottom of SKILL.md
- [ ] Every reference file is mentioned with "when to read" guidance

**Instruction quality:**

- [ ] Instructions explain WHY, not just WHAT
- [ ] Imperative mood throughout ("Do X", not "You should do X")
- [ ] Concrete examples for non-obvious instructions
- [ ] Fallbacks defined for every external tool or dependency
- [ ] No meaningless MUSTs/ALWAYs/NEVERs — replaced with reasoning

**Robustness:**

- [ ] Works across different project types (not hardcoded to one stack)
- [ ] Handles tool failures gracefully (fallbacks documented)
- [ ] Language-agnostic where possible (adapts to user's language)
- [ ] No secrets, credentials, or environment-specific paths
- [ ] Rules section covers the most likely failure modes

**Content hygiene:**

- [ ] Zero hardcoded non-English text (unless it's a locale-specific skill)
- [ ] No orphan references (every link target exists)
- [ ] No redundant instructions (each point adds unique value)
- [ ] Version number in frontmatter matches the skill's evolution stage

---

## Improving an existing skill

When reviewing or improving a skill, follow this diagnostic sequence:

1. **Read the full SKILL.md** and all referenced files.
2. **Check the structure** against the checklist above.
3. **Identify the #1 problem** — usually one of:
   - Too long (>500 lines, needs progressive disclosure)
   - Too vague (missing examples, unclear workflow)
   - Too rigid (all MUSTs, no WHY explanations)
   - Missing fallbacks (breaks when a tool is unavailable)
   - Poor description (under-triggers, misses valid use cases)
4. **Fix the #1 problem first**, then re-evaluate.
5. **Generalize from specific feedback.** If a skill fails on a test case,
   don't add a narrow patch — understand why it failed and fix the underlying
   pattern so it works across similar cases.

### Common refactoring moves

| Symptom | Refactoring |
|---------|-------------|
| SKILL.md > 500 lines | Extract detailed procedures to `references/` |
| Same code generated in every invocation | Bundle it as a script in `scripts/` |
| Inconsistent output format | Add a template file in root or `assets/` |
| Description doesn't trigger reliably | Rewrite as "pushy" with more trigger phrases |
| Instructions ignored in long skills | Move critical rules to the top, not the bottom |
| Tool failures crash the workflow | Add explicit fallback blocks |

---

## Rules

1. **SKILL.md stays under 500 lines.** If approaching the limit, extract detail
   into reference files. This is a hard constraint — longer skills degrade AI
   performance because instructions at the end receive less attention.
2. **Description is the trigger.** Invest disproportionate effort in the
   `description` field. A perfect skill with a bad description never activates.
3. **Every reference file needs a reason to exist.** Don't split for the sake
   of splitting. A file in `references/` should contain >50 lines of detail
   that's only needed during a specific phase.
4. **Explain, don't command.** Replace rigid MUSTs with reasoning. The AI
   follows reasoned instructions more reliably than arbitrary commands.
5. **Fallbacks are not optional.** Any workflow step that depends on an external
   tool must have a documented fallback path.
6. **Test with edge cases.** After writing, mentally run the skill against:
   a trivial project, a massive monorepo, a non-standard stack, and a user
   who gives minimal context. If any of these break the workflow, fix it.
7. **Version your skills.** Use semantic versioning in the frontmatter. Bump
   patch for fixes, minor for new features, major for breaking workflow changes.

---

## Reference files

| File | Purpose | When to read |
|------|---------|-------------|
| [references/patterns-catalog.md](references/patterns-catalog.md) | Complete catalog of proven writing patterns with examples | During Phase 3 writing |

---

*Skill Craft v1.0.0 — Built on patterns from [anthropics/skills](https://github.com/anthropics/skills)*
