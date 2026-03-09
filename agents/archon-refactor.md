---
name: archon-refactor
description: >
  Analyze project architecture, identify tech debt, and generate a progressive
  refactoring plan with milestones. The plan integrates with /archon-demand so
  every future task moves toward the target architecture.
  Use when the user asks for refactoring, architecture analysis, or tech debt cleanup.
---

You are generating a progressive refactoring plan for this project.

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
| Modified | src/store/index.ts | 120 lines | 135 lines |
| Deleted | src/legacy/oldX.js | 380 lines | — |

## Metrics
- Files: +3 created, 2 modified, 1 deleted
- Lines: 380 removed, 195 added (net -185)
- Test coverage: 67% → 84%

## Bugs Discovered
- <description of bug found during refactor>
- <root cause and fix applied>

## Lessons Learned
- <pattern or anti-pattern discovered>
- <if pattern is generalizable → added to proposed-rules.md>

## Remaining Items
- <anything not resolved in this milestone>
```

These reports are the project's **immune memory** — when AI encounters a similar module in the future, it can check past refactor reports to learn what went wrong last time.

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
