# Self-Reinforcing Feedback Loop

The core engine of Archon Protocol: every task makes the next task's output higher quality.

## Traditional vs Archon

```
Traditional:  Human writes → CI checks → Human fixes → CI re-checks
              Feedback delay: minutes to hours

Archon:       AI writes → AI audits → AI fixes → New patterns → Rules updated
              Feedback delay: seconds. Each cycle strengthens the next.
```

## The Demand Loop

A single `/archon-demand` call triggers the full pipeline:

```
Stage 1: Implement (under constraint skills)
    ↓
Stage 2: Performance audit
    ↓
Stage 3: 6-dimension self-audit
    ↓
Stage 4: Fix all issues
    ↓
Stage 5: Refactor progress update
    ↓
Stage 6: Commit
```

## Stage 3.6: Knowledge Evolution

This is the most critical stage — it's the system's learning mechanism.

After every audit, the agent asks:

> "Did I encounter an anti-pattern not yet covered by existing constraints?"

| Discovery | Action | Effect |
|-----------|--------|--------|
| New anti-pattern | Write to `proposed-rules.md` | Staged for review |
| New best practice | Write to `proposed-rules.md` | Staged for review |
| Architecture insight | Update knowledge docs | Future context is richer |

### Evolution Safety: The Staging Area

Discovered rules are NOT written directly to constraint skills. They go to `proposed-rules.md` — a staging area where they await approval. This prevents:

- **Noise accumulation**: AI generalizing edge cases into universal rules
- **Self-contradiction**: New rules conflicting with existing ones
- **Quality degradation**: Vague or untestable prohibitions entering the system

Rules graduate to constraint skills only after:
1. User review and explicit approval, OR
2. Passing automated quality checks (`prohibition-quality.test.js`) and contradiction detection (`ecosystem-integrity.test.js`)

## The Positive Feedback Loop

```
Task 1: AI might make mistake X
         ↓ Stage 3.6 discovers X
         ↓ Writes proposal to proposed-rules.md
         ↓ User approves → ❌ prohibit X added to constraint skill
Task 2: AI blocked from X at Stage 1
         ↓ Stage 3.6 discovers Y
         ↓ Writes proposal → approved → ❌ prohibit Y
Task N: Constraint system is comprehensive
         AI is heavily constrained at Stage 1
         Audit finds fewer issues
         Code quality monotonically increases
```

**More tasks → better constraints → higher quality → fewer fixes → faster delivery.**

## Real-World Example

1. **First feature (Admin Dashboard)**: Multiple API failures crashed the entire page. Stage 3.6 produced: `❌ Single API failure crashes the page — wrap each section with isError/refetch`

2. **Second feature (Account/Agents page)**: AI automatically used independent error handling (constraint exists). Stage 3.6 discovered viewport lazy loading. Added: `❌ Firing all API calls on mount regardless of scroll — use skip: !inView`

3. **All subsequent UI tasks**: Skeleton screens + independent errors + viewport lazy loading became automatic behavior.

Two feature requests → three best practices permanently embedded into the constraint system.
