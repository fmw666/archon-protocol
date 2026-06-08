# Drift Counter
> Cognitive drift counter. Archon self-assesses delivery complexity after each delivery and increments. Triggers a review when a threshold is reached.
## Current Value
**drift: 0**
## Rules
| Complexity | Definition | Score |
|------------|------------|-------|
| trivial | Single-file change, config tweak, copy edit | +1 |
| small | 2-5 files, no new patterns introduced | +2 |
| medium | New module, new pattern, 5-10 files | +3 |
| large | New system, architecture change, cross-layer modification | +5 |
| fast-path | Qualified per soul/delivery.md §Delivery Fast-Path | +1 fixed (floors bypassed) |
**Mechanical floors** (applied per archon-demand §Close-Out step 4): the self-assessed score is `max(self_assessment, floor)`.
- ≥3 files changed → floor = small (+2)
- ≥6 files changed → floor = medium (+3)
- ≥10 files changed OR new module/pattern/dependency → floor = large (+5)
## Review Tiering
Three thresholds release drift pressure at different cadences.
| Tier | Threshold | Trigger Behavior |
|------|-----------|------------------|
| Light | **drift ≥ 6** | Light review recommended before next medium/large demand · mechanical health audit only · releases 2-4 points |
| Full | **drift ≥ 12** | Full review mandatory · includes reviewer sub-agent · resets to 0-3 |
| Emergency | **drift ≥ 20** | Demand intake halted · full review + blindspot root-cause + forced remediation plan · resets to 0-3 with incident record |
### Dynamic Threshold (Phase-Aware)
| Project Phase | Light | Full | Emergency |
|---------------|-------|------|-----------|
| Milestone start → 50% complete (build-intensive) | 8 | 15 | 22 |
| 50% → milestone close (balanced, default) | 6 | 12 | 20 |
| Milestone close ±1 week (quality convergence) | 4 | 8 | 14 |
| Active debt with deadline ≤7 days (repair bias) | 3 | 6 | 10 |
The highest-severity matching condition wins. Inference happens during /archon routing (Step 0 drift precheck); no flags.
## Post-Review Reset
- Fully clear → reset to 0
- Residual concerns → set to 1-3 with explanation
- Emergency reset MUST log the systemic root cause
## Log Format
- Captured: `Lx: asset name` · multiple separated by `, `
- Not captured: `—`
- Fast-path: `FP`
## Log Compression
**Threshold: 70 hot-file lines.** Keep this file as current value, tiering rules, archive index, and latest delivery rows.
**Strategy:** Move older complete rows into `.archon/drift/archive/<year>-Q<N>.md` with keyword headers for on-demand recall.
Cold archive files must keep their `Rows archived:` header equal to the number of archived delivery rows in their table.
## Archive Index
| Archive | Period | Rows | Keywords | Load When |
|---------|--------|------|----------|-----------|
## Log
| Date | Delivery Summary | +Score | Crystallized | Total |
|------|------------------|--------|--------------|-------|
