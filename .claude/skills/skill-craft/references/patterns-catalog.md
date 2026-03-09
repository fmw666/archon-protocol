# Skill Writing Patterns Catalog

A collection of proven patterns extracted from production skills. Each pattern
includes the problem it solves, the solution, and a concrete example.

---

## Table of Contents

1. [Decision Tree Pattern](#1-decision-tree-pattern)
2. [Phase-Based Workflow Pattern](#2-phase-based-workflow-pattern)
3. [Fallback Chain Pattern](#3-fallback-chain-pattern)
4. [Template + Placeholder Pattern](#4-template--placeholder-pattern)
5. [Scoring Rubric Pattern](#5-scoring-rubric-pattern)
6. [Tool Delegation Pattern](#6-tool-delegation-pattern)
7. [Progressive Output Pattern](#7-progressive-output-pattern)
8. [Conditional Phase Pattern](#8-conditional-phase-pattern)
9. [Reference Map Pattern](#9-reference-map-pattern)
10. [Pushy Description Pattern](#10-pushy-description-pattern)

---

## 1. Decision Tree Pattern

**Problem**: The skill needs to handle multiple scenarios, and the AI picks the
wrong approach because all options are listed equally.

**Solution**: Use an explicit decision tree with clear branching conditions.

**Example** (from webapp-testing):

```markdown
User task → Is it static HTML?
    ├─ Yes → Read HTML file directly to identify selectors
    │         └─ Write Playwright script using selectors
    └─ No (dynamic webapp) → Is the server already running?
        ├─ No → Use scripts/with_server.py helper
        └─ Yes → Reconnaissance-then-action:
            1. Navigate and wait for networkidle
            2. Take screenshot or inspect DOM
            3. Execute actions with discovered selectors
```

**When to use**: Skills that handle multiple project types, input formats, or
user scenarios. The tree eliminates ambiguity about which path to take.

---

## 2. Phase-Based Workflow Pattern

**Problem**: Complex skills with many steps lose coherence — the AI forgets
earlier steps or jumps ahead.

**Solution**: Organize into numbered phases with clear entry/exit criteria.

**Example** (from mcp-builder):

```markdown
### Phase 1: Deep Research and Planning
[entry: user provides API to integrate]
[exit: implementation plan documented]

### Phase 2: Implementation
[entry: plan confirmed by user]
[exit: code compiles, basic tests pass]

### Phase 3: Review and Test
[entry: implementation complete]
[exit: all quality checks pass]

### Phase 4: Create Evaluations
[entry: code is stable]
[exit: 10 eval questions with verified answers]
```

**When to use**: Any skill with more than 3 distinct stages. Phases prevent
the AI from mixing concerns across stages.

---

## 3. Fallback Chain Pattern

**Problem**: The skill depends on a tool that might not be installed, might
fail, or might not support the user's environment.

**Solution**: Define a primary tool, then explicit fallbacks in order of
preference. Always end with a manual/skip option.

**Example**:

```markdown
#### Step 2: Circular dependency detection

Primary:
  npx madge --circular --extensions js,ts,jsx,tsx src/

Fallback 1: If madge fails (missing config, non-standard imports),
  use Grep to search for bidirectional imports between file pairs.

Fallback 2: If Grep is inconclusive, note the limitation in the report
  and score this sub-dimension conservatively based on architecture review.

Never silently skip — always document which path was taken and why.
```

**When to use**: Every step that invokes an external tool (npm packages, CLI
tools, APIs). Especially important for skills used across different environments.

---

## 4. Template + Placeholder Pattern

**Problem**: Output format drifts between invocations — the AI improvises
different structures each time.

**Solution**: Define an exact template file with `{placeholders}` and
a placeholder reference table.

**Example**:

```markdown
Read [report-template.md](report-template.md) and fill in every section.
Never skip a section — write "No issues found" if a section is clean.

## Placeholder Reference

| Placeholder | Source | Format |
|------------|--------|--------|
| `{score}` | Phase 3 total | Integer |
| `{level}` | Risk level lookup | `CRITICAL` / `HIGH` / `MODERATE` / `LOW` |
| `{top_issues}` | Phase 2 findings | Numbered list, 1 per line |
```

**When to use**: Skills that generate structured output (reports, configs,
prompts, documentation). Templates ensure consistency across invocations.

---

## 5. Scoring Rubric Pattern

**Problem**: Subjective assessments vary wildly between invocations — the AI
gives 8/10 one time and 4/10 the next for the same input.

**Solution**: Define explicit deduction criteria with concrete thresholds.

**Example**:

```markdown
### Module Granularity — 18 points

Start at 18. Deduct for:

| Condition | Deduction | Notes |
|-----------|-----------|-------|
| 1-3 files > 500 lines | -2 | Serious god-file risk |
| 4+ files > 500 lines | -5 | Systemic problem |
| Any file > 1000 lines | -3 (additional) | Near-unmaintainable |
```

**When to use**: Skills that rate, score, or evaluate anything. Without a
rubric, scores are meaningless noise. Include calibration anchors (example
profiles with expected score ranges) for additional consistency.

---

## 6. Tool Delegation Pattern

**Problem**: The AI re-implements complex logic that a script could handle
deterministically and faster.

**Solution**: Bundle scripts in `scripts/` and invoke them as black boxes.

**Example** (from webapp-testing):

```markdown
**Helper Scripts Available**:
- `scripts/with_server.py` - Manages server lifecycle

Always run scripts with `--help` first to see usage.
DO NOT read the source — these scripts are designed to be called
as black boxes, not loaded into context.
```

**When to use**: Deterministic tasks (file transformation, aggregation,
validation) or complex setup (server management, environment configuration).
Scripts keep the AI's context clean and reduce hallucination risk on
procedural tasks.

---

## 7. Progressive Output Pattern

**Problem**: The AI generates the entire output at once, overwhelming the user
and making it impossible to course-correct mid-way.

**Solution**: Generate output in stages with confirmation checkpoints.

**Example**:

```markdown
1. Present your plan before executing. Output:
   - Summary of changes and rationale
   - Full TODO checklist for the current priority tier
   - Risks or trade-offs identified
   Then ask: "Above is my plan. Shall I proceed?"

2. Wait for explicit confirmation before making edits.

3. After completing each tier, summarize what was done and
   ask whether to continue to the next tier.
```

**When to use**: Skills that make destructive or hard-to-reverse changes
(refactoring, file deletion, config rewrites). Also valuable for skills
where the user wants to stay in the loop.

---

## 8. Conditional Phase Pattern

**Problem**: Some phases only apply to certain project types or scan modes,
but the AI runs them unconditionally.

**Solution**: Mark phases with explicit conditions and mode tags.

**Example**:

```markdown
### Phase 2 — Manual analysis (Full mode only)

### Step 7: Framework-specific scan
# React / Next.js only — detected in Step 0
Skip if not a React/Next.js project.

### Phase 6 — Visualization (optional)
This phase is optional in Quick mode and recommended in Full mode.
Ask the user before proceeding.
```

**When to use**: Skills that support multiple modes (quick/full), multiple
project types (frontend/backend/fullstack), or optional enrichment features.

---

## 9. Reference Map Pattern

**Problem**: The AI doesn't know which reference file to read, so it either
reads all of them (wasting context) or none of them (missing critical info).

**Solution**: Place a table at the bottom of SKILL.md that maps each
reference file to its purpose and loading trigger.

**Example**:

```markdown
## Reference files

| File | Purpose | When to read |
|------|---------|-------------|
| [references/scanning.md](...) | Phase 1 step-by-step | Before starting any scan |
| [scoring-reference.md](...) | Deduction criteria | During Phase 3 scoring |
| [report-template.md](...) | Report output structure | Before generating output |
| [references/tools.md](...) | Recommended tools list | When filling Section 7 |
```

**When to use**: Any skill with more than one reference file. The table
acts as a routing layer — the AI reads the map first, then fetches only
the file relevant to the current phase.

---

## 10. Pushy Description Pattern

**Problem**: The skill exists but the AI never triggers it because the
description is too narrow or too formal.

**Solution**: Write descriptions that generously cover edge cases, informal
phrasings, and adjacent intents. Over-triggering is better than under-triggering
— a triggered skill that decides it's not relevant can gracefully exit, but
a skill that never triggers is useless.

**Example**:

```yaml
# Under-triggers — too narrow:
description: Create MCP servers for external API integration.

# Over-triggers appropriately — catches real user intent:
description: >
  Guide for creating high-quality MCP servers that enable LLMs to interact
  with external services through well-designed tools. Use when building MCP
  servers to integrate external APIs or services, whether in Python or
  TypeScript. Also use when the user mentions "MCP", "tool integration",
  "external API", "connect to service", or wants to connect AI to any
  third-party service — even if they don't explicitly mention "MCP".
```

**Tips**:
- Include informal trigger phrases ("turn this into...", "make it work with...")
- Add "(in any language)" if the skill should trigger for multilingual users
- Mention adjacent concepts that imply the skill's domain
- End with an open-ended catch: "even if they don't explicitly say X"

---

## Anti-patterns to avoid

| Anti-pattern | Problem | Fix |
|-------------|---------|-----|
| **The Wall of Text** | 1500+ line SKILL.md, AI loses focus by line 500 | Extract to references/, keep SKILL.md as orchestration |
| **The MUSTerator** | MUST/ALWAYS/NEVER on every line, reads like a legal contract | Replace with reasoning: explain *why* the constraint exists |
| **The Orphan Reference** | SKILL.md mentions a file that doesn't exist | Always verify links after restructuring |
| **The Hardcoded Path** | Assumes a specific directory structure or OS | Use detection logic or let the AI adapt |
| **The Silent Failure** | Tool fails → skill produces nothing, no explanation | Add fallback chains for every external dependency |
| **The Shy Description** | Description is so narrow it never triggers | Write "pushy" descriptions that generously capture intent |
| **The Context Hog** | "Read ALL reference files before starting" | Load references on-demand, during the phase that needs them |
| **The Subjective Score** | "Rate quality from 1-10" with no rubric | Define explicit deduction criteria with thresholds |
| **The Monolingual Skill** | Hardcoded UI text in one language | Use English for instructions, follow user's language for output |
| **The Versionless Skill** | No version in frontmatter, impossible to track changes | Add `version: X.Y.Z` and update on changes |
