---
outline: deep
---

# /archon-refactor

> **`defrag()` — Analyze architecture and generate a progressive refactoring plan.**

Identifies tech debt, defines target architecture, and creates milestones that integrate with `/archon-demand`.

## Phase 1: Analyze

Scan project: directory structure, dependency graph, code smells, anti-patterns, tech stack alignment, existing docs.

## Phase 2: Define Target Architecture

1. Describe current architecture
2. Describe target architecture
3. List gaps and rationale

## Phase 3: Create Milestones

Break refactoring into progressive milestones:
- Order by dependency (foundations first)
- Each milestone independently shippable
- Each task achievable in a single `/archon-demand` call

Per milestone: goal, files involved, task checklist, acceptance criteria.

## Phase 4: Write Plan

Save to `docs/refactor-plan.md`:

```markdown
# Refactoring Plan
Generated: <date>

## Current Architecture
...

## Target Architecture
...

## Milestones

### Milestone 1: <name>          ░░░░░░░░░░ 0%
- [ ] Task 1
- [ ] Task 2
Acceptance: <criteria>

## Progress Log
| Date | Demand | Milestone | Items |
```

## Phase 5: Refactor Reports (Immune Memory)

After each milestone is completed via `/archon-demand`, generate a refactor report at `docs/refactor-reports/<milestone-name>.md`:

```markdown
# Refactor Report: <Milestone Name>
Date: <date>

## Changes
| Action | File | Before | After |
|--------|------|--------|-------|
| Created | src/features/X/index.ts | — | 45 lines |

## Metrics
- Files: +3 created, 2 modified, 1 deleted
- Lines: 380 removed, 195 added (net -185)
- Test coverage: 67% → 84%

## Bugs Discovered
- <description and root cause>

## Lessons Learned
- <pattern or anti-pattern discovered>
- <if generalizable → added to proposed-rules.md>
```

These reports are the project's **immune memory** — when AI encounters a similar module, it checks past reports to learn what went wrong last time.

## Integration

Once saved, every `/archon-demand` call:
- Stage 0: reads the plan, aligns implementation with target architecture
- Stage 5: updates progress after completion

## Output

```
Refactoring Plan:
  Milestones: N
  Total tasks: M
  Saved: docs/refactor-plan.md
  Next: /archon-demand will auto-align with Milestone 1
```
