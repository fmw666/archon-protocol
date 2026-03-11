---
outline: deep
---

# /archon-demand

> **`exec()` — Full delivery pipeline for a one-line requirement.**

Implements, audits, fixes, evolves knowledge, and commits — all in one pass.

**Preloads drivers**: archon-code-quality, archon-test-sync, archon-async-loading, archon-error-handling, archon-handoff

## Stage 0: Refactor Alignment

If `docs/refactor-plan.md` exists, read it. Identify which milestone relates to this requirement. Prefer target architecture patterns during implementation.

## Stage 1: Implement

**Before writing code**: If `archon.config.yaml` declares `benchmarks.primary`, read that module's structure (directory layout, naming, data flow, test patterns). New code should imitate the benchmark — not reinvent patterns.

Write code under all constraint skills preloaded in your context. Follow every `❌` prohibition. Prefer boring consistency with existing modules over locally optimal but novel approaches.

## Stage 1.5: Linter & Test Verification

1. Run the project's lint command (read `enforcement.lint_command` from `archon.config.yaml`, fallback to `pnpm lint`). Read output. Fix all errors.
2. Run the project's test command (read `enforcement.test_command` from config, fallback to `pnpm test`). Read output. Fix all failures.
3. If lint or tests fail on pre-existing issues unrelated to this change, note them but do not block.

> **Documents achieve SHOULD. Processes achieve MUST.** Lint and test results are the final authority — if they pass, the code is compliant. If they fail, the code is not done. See [ADR-003](/decisions/ADR-003-executable-enforcement).

## Stage 2: Performance Audit

Check project perf docs for applicable items:
- List-rendered links: `prefetch={false}`
- Async sections: skeleton + error retry + 3-state values
- No redundant requests
- Off-screen sections: defer with IntersectionObserver

## Stage 3: Self-Audit (7 Dimensions)

### 3.1 Rule compliance
Search modified files for `❌` violations from constraint skills. Recognize `@archon-exception: <ID> — <reason>` annotations as documented exceptions.

### 3.2 Code structure
File sizes, single responsibility, no circular deps.

### 3.3 Edge cases
null, empty, error, boundary values.

### 3.4 Test sync
Find tests, update assertions, add coverage, run all.

### 3.5 i18n
`t("key")`, all locales, no `.replace()`.

### 3.6 Knowledge evolution
New anti-pattern or technique discovered?

1. Write the finding to `proposed-rules.md` (staging area). Do NOT modify constraint skills directly. Rules graduate to skills only after user approval.
2. **Constraint hardening evaluation** ([ADR-003](/decisions/ADR-003-executable-enforcement)): For each new finding, assess:
   - Can it be expressed as a **lint rule**? → Note the recommended rule name (e.g. `no-explicit-any`). If the project's linter supports it, propose enabling it.
   - Can it be expressed as a **structural scan test**? → If the pattern is grep-verifiable, create or recommend a test in the structural test directory (see `test-sync` driver Section 5).
   - Neither (requires cognitive understanding)? → Remains document-layer only (SHOULD). Note why it cannot be hardened.
3. The goal: every constraint that CAN be a process-level check MUST become one over time. Documents guide; processes enforce.

### 3.7 Adversarial self-challenge
Generate at least 1 counter-hypothesis that challenges the overall assessment from 3.1–3.6. Must cite a specific file/function/diff section, not generic concerns. If confirmed → fix before proceeding; if refuted → note and continue.

### 3.8 Doc integrity check
If this task changed any `docs/` file, follow the [Doc Integrity Protocol](/kernel/doc-integrity):
1. Content change → follow ripple propagation (update reference docs, deployed copies)
2. Structural change (add/remove component) → follow full propagation checklist
3. Verify `pnpm test` passes (CI-8)

## Stage 4: Fix

Fix all issues from Stages 2-3 (including doc integrity violations). Re-run tests until all pass.

## Stage 5: Refactor Progress

If refactor plan exists: mark completed items, update milestone progress.

## Stage 6: Commit

Stage related files only. Conventional commit. Verify with `git status`.

## Output

```
✅ Implemented: <summary>
✅ Lint & Test: passed / fixed N items
✅ Performance: passed / fixed N items
✅ Self-audit: found N issues, all fixed
✅ Tests: X files, Y tests passing
✅ Evolution: N rules proposed (or N/A)
✅ Refactor: milestone N at X% (or N/A)
✅ Committed: <hash> <message>
```

## Opt-Out Flags

| Flag | Skips | Best for |
|------|-------|----------|
| `quick` | Stages 2, 3.5, 3.6, 3.7, 5 | Hotfixes, small changes, styling |
| `no-commit` | Stage 6 | Exploration, review before commit |
| `skip-tests` | Stage 3.4 | Pure visual/styling changes |

Flags can be combined: `quick no-commit skip-tests` for minimal pipeline.
