# Extension: Demand Pool

## Metadata

- **ID**: demand-pool
- **Status**: active
- **Description**: Captures and triages unfulfilled user ideas as a structured demand pool
- **Data files**: demands.md

## Hooks

### demand.close-out

**Trigger**: When the Verdict is reject/alternative and the rejected demand has future re-eval value (timing issue, not direction issue); OR when the user mentions a product idea unrelated to the current demand during conversation.

**Reads**: demands.md

**Behavior**: Append a new row to the Active table in demands.md. Auto-increment ID (DP-{N}, based on highest existing ID across all tables). Set origin to `demand-reject` or `conversation`. Write a one-sentence engineering distillation of the user's original idea. Select tags from the fixed set: `ui` / `backend` / `auth` / `governance` / `performance` / `content` / `ux` / `infra` / `product`. If no capture needed, skip silently.

**Output**: Close-Out line: `demand-pool: captured(DP-N)|none`

### plan.perception

**Trigger**: Always.

**Reads**: demands.md

**Behavior**: Count active and parked items. Flag stale items (>30 days in Active with no disposition change). Identify active items that align with the current milestone's direction or the next milestone.

**Output**: Add to State Perception: `Demand Pool: N active (M stale), N parked`

### plan.output

**Trigger**: When active items exist in demands.md.

**Reads**: demands.md

**Behavior**: For each active item, recommend one action: `graduate` (promote to backlog with rationale), `park` (with reason and re-eval condition), or `keep` (still relevant but not actionable yet). For stale items (>30 days), default recommendation is park unless clearly still relevant.

**Output**: Append a "Demand Pool Triage" section to the plan output:

```
## Demand Pool Triage

| ID | Recommendation | Rationale |
|----|---------------|-----------|
| DP-N | graduate → B-N | aligns with M4 direction |
| DP-M | park | superseded by ADR-8 |

Active: N · Stale: N · Parked: N
```

### review.health

**Trigger**: Always.

**Reads**: demands.md

**Behavior**: Check three conditions: (1) stale items >30 days in Active, (2) parked items whose re-eval conditions may have been met given current project state, (3) Graduated table exceeding 10 entries. Summarize findings.

**Output**: Append "Demand Pool Health" to the review health audit:

```
**Demand Pool Health**
- Stale active items (>30d): N (list IDs if any)
- Parked items with potentially met re-eval conditions: N (list IDs if any)
- Graduated overflow: yes/no
- Assessment: healthy | needs-triage | needs-cleanup
```

## Graduation Protocol

When an active item is recommended for graduation during plan or triage:

1. Add a new entry to `backlog.md` under the appropriate section (需求池 or 已排期) with the next B-{N} ID
2. Move the demand from Active to Graduated table in demands.md, recording the backlog ID and date
3. The backlog entry inherits the demand description but may be expanded with functional specs

## Parking Protocol

When an active item is parked:

1. Move from Active to Parked table in demands.md
2. Fill in Reason (why not now) and Re-eval (condition that would make it relevant again)
3. Parked items with re-eval conditions met are surfaced during review.health
