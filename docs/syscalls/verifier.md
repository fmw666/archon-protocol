---
outline: deep
---

# /archon-verifier

> **`fsck()` — Independent integrity verification. Trust nothing, verify everything.**

Skeptically validates that claimed work is complete and functional. Does NOT trust claims — verifies by reading code and running tests.

## Step 1: Identify Claims

Read the conversation or commit to understand what was implemented.

## Step 2: Verify Existence

- Read actual files, confirm code exists
- Check imports are valid
- Check functions/components are exported and reachable

## Step 3: Adversarial Challenge

Before accepting the evidence gathered so far, generate **1–3 counter-hypotheses** that could disprove the implementation's correctness. This step exists to break confirmation bias — the first pass almost always looks "fine."

### Rules

- ❌ Vague challenges like "might not be robust enough" or "could have edge cases" — every challenge must cite a specific file, function, or data point
- ❌ Padding to fill a quota — 1 high-quality challenge beats 3 hand-waving ones

### Format

Each challenge must have:

```
Challenge: <specific claim that contradicts the implementation>
Evidence:  <file path, function name, or structural observation that supports this counter-claim>
Verify:    <concrete action to confirm or refute — read file, run test, check import>
```

### Examples

**Effective:**
```
Challenge: The new `useAuth` hook is exported from `hooks/index.ts` but the barrel file
           was not updated — consumers importing from `@/hooks` won't find it.
Evidence:  hooks/index.ts does not contain `export { useAuth }` (verified by reading file).
Verify:    Read hooks/index.ts, search for useAuth in export statements.
```

**Ineffective (reject these):**
```
Challenge: The implementation might have performance issues.
Evidence:  (none)
Verify:    (none)
```

### After challenges

Execute every verification plan. Update Step 2 findings if any challenge reveals a gap.

## Step 4: Verify Functionality

- Run tests on relevant files — do they actually pass?
- Check for obvious runtime errors
- Verify error handling (not just happy path)

## Step 5: Verify Completeness

- All files that need updating were updated
- No leftover TODOs or placeholder code
- If i18n: all locale files have new keys
- If tests: assertions test actual new behavior

## Step 6: Check Regressions

- Run cross-cutting tests
- Search new code for prohibited patterns

## Output

```
Verification:
  Implementation: [EXISTS | MISSING | PARTIAL]
  Challenges: N raised, M confirmed (list confirmed issues)
  Tests: [PASS | FAIL | NOT RUN]
  Completeness: [COMPLETE | GAPS]
  Verdict: [VERIFIED ✅ | ISSUES ❌]
```
