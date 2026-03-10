---
outline: deep
---

# /archon-lint

> **`check()` — Validate protocol integrity, link health, and consistency invariants.**

Run automated checks on the Archon Protocol ecosystem. Read-only — does not modify any files.

**Invoke**: `/archon-lint` or `pnpm lint`

## Overview

`/archon-lint` combines three independent check phases into a single command:

| Phase | Script | What it checks |
|-------|--------|---------------|
| 1. Link Audit | `scripts/lint-links.mjs` | Internal markdown links resolve to valid routes or files |
| 2. Integrity | `scripts/lint-integrity.mjs` | Consistency invariants CI-1 through CI-9 |
| 3. Tests | `vitest run` | Document format, prohibition quality, ecosystem integrity, demand completeness |

All three must pass. Failure in any phase returns a non-zero exit code.

## Phase 1: Link Audit

Walks every `.md` file under `docs/`, extracts markdown links (`[text](target)`), and resolves them:

| Link type | Resolution strategy |
|-----------|-------------------|
| Absolute (`/syscalls/init`) | Match against VitePress routes (cleanUrls) |
| Relative (`./demand`) | Resolve from current file's directory |
| External (`https://...`) | Skipped (not checked) |
| Anchor-only (`#section`) | Skipped |
| Inside code fences | Skipped |

### Reports

```
lint-links: checked 142 internal links across 28 files
lint-links: broken 2
  syscalls/demand.md:45 → /drivers/missing (route not found)
  guide/faq.md:12 → ./nonexistent (relative target not found)
```

## Phase 2: Consistency Invariants

Verifies the invariants defined in the [Document Integrity Protocol](/kernel/doc-integrity):

| ID | Invariant | How checked |
|----|-----------|-------------|
| CI-1 | Driver count in kernel tables = file count in `docs/drivers/` | Parse kernel markdown table rows |
| CI-2 | Syscall count in kernel tables = file count in `docs/syscalls/` | Parse kernel markdown table rows |
| CI-3 | Daemon count in kernel tables = file count in `docs/daemons/` | Parse kernel markdown table rows |
| CI-4 | Every name in kernel tables has a corresponding `docs/` file | Name→file existence check |
| CI-5 | `reference/constraints.md` summaries match driver sources | Cross-reference ❌ prohibitions |
| CI-6 | Every `.cursor/rules/archon-*` traces to a `docs/` source | Parse Source header in deployed files |
| CI-7 | `docs/public/init.md` lists all components | String search for each component name |
| CI-9 | `ai-index.md` lists all components | String search for each file path |

### Reports

```
  ✅ CI-1: driver count matches: 5
  ✅ CI-2: syscall count matches: 6
  ✅ CI-3: daemon count matches: 2
  ✅ CI-4: all kernel table names resolve to docs/ files
  ✅ CI-5: constraint summaries match driver sources
  ✅ CI-6: all deployed rules trace to docs/ sources
  ❌ CI-7: init.md missing syscall: lint
  ✅ CI-9: ai-index.md lists all components

lint-integrity: 1 violation(s) found ❌
```

## Phase 3: Tests

Runs the existing Vitest test suite (`pnpm test`), which covers:

| Test file | Verifies |
|-----------|----------|
| `doc-format.test.js` | Document structure, body length, no CJK, ❌ in drivers |
| `prohibition-quality.test.js` | Every ❌ is specific, grep-verifiable |
| `ecosystem-integrity.test.js` | Cross-references between README, init, demand, self-auditor |
| `demand-completeness.test.js` | All stages present, sub-stage counts |

## When to Run

| Trigger | Why |
|---------|-----|
| After adding/removing a component | Catch missing propagation targets |
| After editing `docs/` files | Catch broken internal links |
| Before committing docs changes | Prevent drift from reaching main branch |
| In CI pipeline | Gate merges on protocol integrity |
| During `/archon-demand` Stage 1.5 | Automated lint within delivery pipeline |

## CI Integration

Add to GitHub Actions:

```yaml
- name: Archon Lint
  run: pnpm lint
```

Or run individual phases:

```yaml
- run: node scripts/lint-links.mjs
- run: node scripts/lint-integrity.mjs
- run: pnpm test
```

## Relationship to Other Syscalls

| Syscall | Relationship |
|---------|-------------|
| `/archon-audit` | Audit checks project code quality (0-100 score). Lint checks protocol integrity. |
| `/archon-verifier` | Verifier validates claimed work. Lint validates the protocol itself. |
| `/archon-demand` | Demand Stage 1.5 runs the project's linter. `/archon-lint` runs the protocol's own checks. |
| `/archon-init` | Init Step 5 (health check) overlaps with CI-6. Lint is more comprehensive. |

## Output

```
Archon Lint:
  Phase 1 (links):     142 checked, 0 broken ✅
  Phase 2 (integrity): 9 invariants, 0 violations ✅
  Phase 3 (tests):     4 suites, 28 tests passed ✅
  Result: CLEAN ✅
```
