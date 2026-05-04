Hot-path load: read `.archon/soul.md` sections needed for planning (`Core Axioms`, `Ownership`, `Cognitive Loop`, `Evolution Tempo`, `Knowledge Hygiene`), then `.archon/soul/review.md` sections needed for planning (`Reflection & Proactive Scrutiny`, `Review Tiering`), then `.archon/manifest.md` sections needed for state (`User Language Index`, `Validation Command`, `Milestones & Acceptance Criteria`, `Current State`, `Knowledge Assets`), then `.archon/drift.md` `Current Value` plus recent entries since the last release/reset. If the project has a backlog document, read only its active/top-priority section unless a plan item needs more detail.

You are now in **planning** mode. This is read-only — no code changes, no file modifications, output only.

## Input

{{input}}

If the user provides a specific direction, plan around it. If not, autonomously assess and recommend the optimal next step.

## Planning Process

### 1. State Perception

Extract from the project context:

- **Milestone progress**: Check each acceptance criterion of the current milestone for completion
- **Known issues**: Residual items from the latest review, known issues recorded in the manifest
- **Tech debt**: Patterns in the drift log (continuous small fixes vs. large features), Warning/Observation items flagged in reviews but deferred
- **Backlog**: Any unscheduled requirements with dependencies that need early consideration or items becoming urgent

After the four dimensions above, scan the archon directory's `extensions/` subdirectory for active extensions with `plan.perception` or `plan.output` hooks (see soul.md §Extension Points). For perception hooks, execute during this phase and include results in the state summary. For output hooks, execute after priority ranking and append sections to the plan output.

**Manifest staleness probe** (ADR-G6 — required when applicable): if the manifest declares `### Skills` or other knowledge-asset indexes, check whether the project's validation gate enforces parity (e.g., a `manifest-knowledge-assets-parity` test under the project test root). When parity is enforced and currently green, the probe is satisfied silently. When parity is unenforced or red, surface in the state summary as `manifest staleness: <files>`. The probe does not block planning; it makes "manifest vs reality" drift visible at the plan entry, the same way drift notice surfaces drift score.

**Modularity staleness probe** (ADR-29 §重审条件 (a) — required when applicable): if the manifest declares `## Source Modularity Map` AND drift records exist for the most recent 3 deliveries, scan each delivery record's `modularity_probe:` line (if present). Three outcomes: (i) **all 3 = `aligned`** → silent; the map is firing on real changes. (ii) **all 3 = `undeclared`** → surface in the state summary as `modularity-map staleness: 3/3 recent deliveries undeclared — map likely too narrow or project structure has shifted; recommend extending §Source Modularity Map`; this is the structural signal ADR-29 §重审条件 (a) names. (iii) **mixed (some aligned / some undeclared / any fan-out-needed)** → silent; the map is being exercised. Modularity probe lines may be absent for fast-path deliveries or pre-ADR-29 records — treat absence as neutral, not as `undeclared`. Probe is read-only and never blocks planning; it surfaces map staleness at the plan entry the same way Manifest staleness surfaces knowledge-index drift.

### 2. Proactive Scrutiny (soul/review.md §Reflection & Proactive Scrutiny — mandatory)

Execute the five proactive questions (engineering coverage / recursive principle check / anticipate user blindspots / vocabulary coherence / preservation pass). Include any discovered gaps as candidate work items in the priority ranking.

**Technology adoption probe** (passive-stance countermeasure): Scan each key technology/framework version in the manifest tech stack — does it have an adoption skill (recommended/prohibited patterns + timing guide) and structural guards (lint rules blocking old patterns)? Gaps = items to address per "new code = new guardrails."

**Preservation probe** (per soul.md §Preservation Axis): Scan the latest cycle's drift records and resolved-debt items for load-bearing rules / gates / output tokens that are still unpinned. List each unpinned-but-load-bearing item as a `preservation: pin <anchor>` candidate work item. If everything load-bearing is already pinned, explicitly write `Preservation probe: nothing newly pin-worthy` — this statement itself will be verified in the next review.

If findings exist, list as separate recommended work items (marked as "proactive scrutiny" source). If the five questions + probes yield zero findings, explicitly write "Proactive scrutiny: no gaps found" — this statement itself will be verified in future reviews.

### 3. Priority Ranking

Infer behavioral bias from project state (see soul.md §Evolution), not from config flags:

1. **drift ≥ threshold** → review first, no other work scheduled
2. **Uncompleted acceptance criteria for current milestone** > unscheduled requirements — close the door before opening a window
3. **Infrastructure blocking other work** > standalone features — unblock bottlenecks first
4. **High product value** > technical optimization — what users can perceive comes first
5. **Low risk** > high risk — when value is comparable, choose higher certainty

**State-aware adjustments**:
- Milestone features complete but quality gates failing → rule 4 inverts (quality > new features); prioritize tests, debt fixes, performance
- debt.md has Critical items nearing deadline → repair outprioritizes all new features
- ≥3 of last 5 drift log entries are same-type fixes → flag as **stagnation signal**, recommend root-cause analysis over more patches

### 4. Output

```
## Current State

[One paragraph: current milestone, what's done, what's remaining, drift value, any urgent items]

## Recommended Plan

Priority-ordered, 3-5 work items. Each can be directly used as `/archon-demand` input.

### 1. [Work Item Title]
- **Goal**: one sentence
- **Estimated complexity**: trivial / small / medium / large
- **Scope**: files / modules
- **Dependencies**: yes / none
- **Rationale**: why now

### 2. ...

## Risks & Notes

[Milestone delay risk, debt accumulation, governance ratio, expiring dependencies, etc. — if any]
```

## Principles

- **Read-only**: No code, no file changes, no manifest/drift updates
- **Actionable**: Each recommendation is specific enough to paste directly into `/archon-demand`
- **Honest**: If the current state has problems (tech debt, unreasonable acceptance criteria, requirement conflicts), say so. Planning is not a cosmetic report
- **Focused**: Don't list 10 things. List the 3-5 most important. The user's attention is the scarcest resource
