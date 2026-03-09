---
name: archon-refactor
description: >
  Analyze project architecture, identify tech debt, and generate a progressive
  refactoring plan with milestones that integrate with the demand workflow.
  Activate when the user asks for refactoring, architecture analysis, or tech debt cleanup.
---

# Refactor — Progressive Architecture Plan

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
- Each task achievable in a single `/demand` call

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

After each milestone completion, generate a report at `docs/refactor-reports/<milestone>.md` with: change table, metrics (lines/files/coverage delta), bugs discovered, lessons learned, remaining items. These reports are the project's immune memory — AI checks them before working on similar modules.

## Integration

Once saved, every `/demand` call:
- Stage 0: reads the plan, aligns implementation with target architecture
- Stage 5: updates progress after completion

## Output

```
Refactoring Plan:
  Milestones: N
  Total tasks: M
  Saved: docs/refactor-plan.md
  Next: /demand will auto-align with Milestone 1
```
