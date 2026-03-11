# Commands Reference

## Primary Commands (Syscalls)

### `/archon-init`

Bootstrap the Archon Protocol ecosystem or run a health check.

| Field | Value |
|-------|-------|
| Source | [`docs/syscalls/init.md`](/syscalls/init) |
| OS Equivalent | `boot()` |
| Mode | Read-write |

**Fresh install**: scans project, detects tech stack, integrates with lint/test ecosystem ([ADR-003](/decisions/ADR-003-executable-enforcement)), generates `archon.config.yaml`, deploys protocol files.

**Health check**: verifies all files exist, config matches project, lint/test coverage mapping, reports gaps.

**Remote bootstrap**: `curl -s https://aaep.site/init.md`

### `/archon-demand <requirement>`

Full delivery pipeline for a one-line requirement.

| Field | Value |
|-------|-------|
| Source | [`docs/syscalls/demand.md`](/syscalls/demand) |
| OS Equivalent | `exec()` |
| Preloads | archon-code-quality, archon-test-sync, archon-async-loading, archon-error-handling, archon-handoff |

**Stages**:

| Stage | What happens |
|-------|-------------|
| 0 | Refactor alignment (read plan if exists) |
| 1 | Implement under constraints |
| 1.5 | Lint & Test verification — run lint + test, read output, fix. Processes are MUST ([ADR-003](/decisions/ADR-003-executable-enforcement)) |
| 2 | Performance audit |
| 3 | 7-dimension self-audit (3.1 rules, 3.2 structure, 3.3 edge cases, 3.4 tests, 3.5 i18n, 3.6 evolution, 3.7 adversarial challenge) |
| 4 | Fix all issues |
| 5 | Update refactor progress |
| 6 | Commit |

**Opt-out flags**:

| Flag | Skips | Best for |
|------|-------|----------|
| `quick` | Stages 2, 3.5, 3.6, 5 | Hotfixes, small changes, styling |
| `no-commit` | Stage 6 | Exploration, review before commit |
| `skip-tests` | Stage 3.4 | Pure visual/styling changes |

### `/archon-audit`

Full project health check. Read-only — does not modify code.

| Field | Value |
|-------|-------|
| Source | [`docs/syscalls/audit.md`](/syscalls/audit) |
| OS Equivalent | `stat()` |
| Mode | Read-only |
| Preloads | archon-code-quality, archon-test-sync |

Produces a scored report (0-100) across 5 dimensions: lint, tests, rule compliance, architecture, documentation.

### `/archon-refactor`

Generate a progressive refactoring plan with milestones.

| Field | Value |
|-------|-------|
| Source | [`docs/syscalls/refactor.md`](/syscalls/refactor) |
| OS Equivalent | `defrag()` |

Saves plan to `docs/refactor-plan.md`. Future `/archon-demand` calls automatically align with the plan.

### `/archon-verifier`

Independent validation of claimed work.

| Field | Value |
|-------|-------|
| Source | [`docs/syscalls/verifier.md`](/syscalls/verifier) |
| OS Equivalent | `fsck()` |
| Mode | Read-only |

Skeptically verifies: code exists, tests pass, no TODOs left, no regressions. Includes an adversarial challenge step that forces counter-hypotheses before declaring verified.

### `/archon-lint`

Validate protocol integrity, link health, and consistency invariants.

| Field | Value |
|-------|-------|
| Source | [`docs/syscalls/lint.md`](/syscalls/lint) |
| OS Equivalent | `check()` |
| Mode | Read-only |

**Phases**:

| Phase | What happens |
|-------|-------------|
| 1 | Link audit — walk docs/*.md, resolve internal links |
| 2 | Integrity — verify CI-1 through CI-9 consistency invariants |
| 3 | Tests — run Vitest suite (doc format, prohibitions, ecosystem) |

**Run**: `pnpm lint` or individual phases via `pnpm lint:links`, `pnpm lint:integrity`, `pnpm test`.

## Internal Workflows (Daemons)

These are spawned by `/archon-demand`, not directly invoked by users:

| Daemon | Source | Spawned by |
|--------|--------|-----------|
| Self-audit | [`docs/daemons/self-auditor.md`](/daemons/self-auditor) | demand Stage 3 (7 dimensions including adversarial self-challenge) |
| Test runner | [`docs/daemons/test-runner.md`](/daemons/test-runner) | demand Stage 3.4 |
