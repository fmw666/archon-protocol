# Proposed Rules

Staging area for rules discovered by Stage 3.6 (Knowledge Evolution). Rules listed here have NOT been approved — they are proposals awaiting review.

## How Rules Graduate

1. Agent discovers a new anti-pattern or technique during Stage 3.6
2. Agent writes the proposal here (not directly to constraint skills)
3. User or `archon-audit` reviews proposals for:
   - Specificity: Does it contain a grep-able code pattern?
   - Non-contradiction: Does it conflict with existing rules?
   - Generality: Is this a real pattern or a one-off workaround?
4. Approved rules are moved to the appropriate constraint skill
5. Rejected rules are deleted with a brief reason

## Pending Proposals

_(none yet — proposals will appear here as Stage 3.6 discovers new patterns)_

## Template

```
### [PROPOSED] <short description>
- **Source**: Task that discovered it
- **Target skill**: archon-code-quality | archon-test-sync | archon-async-loading | archon-error-handling
- **Proposed prohibition**: ❌ <concrete pattern> — <alternative>
- **Evidence**: <what happened that led to this discovery>
```
