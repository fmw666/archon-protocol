# Commands Reference

## Primary Commands

### `/archon-init`

Bootstrap the Archon Protocol ecosystem or run a health check.

| Field | Value |
|-------|-------|
| Agent | `archon-init.md` |
| Skill | `archon-init/SKILL.md` |
| Mode | Read-write |

**Fresh install**: scans project, detects tech stack, generates `archon.config.yaml`, verifies deployment.

**Health check**: verifies all files exist, config matches project, reports gaps.

### `/archon-demand <requirement>`

Full delivery pipeline for a one-line requirement.

| Field | Value |
|-------|-------|
| Agent | `archon-demand.md` |
| Skill | `archon-demand/SKILL.md` |
| Preloads | archon-code-quality, archon-test-sync, archon-async-loading, archon-error-handling |

**Stages**:

| Stage | What happens |
|-------|-------------|
| 0 | Refactor alignment (read plan if exists) |
| 1 | Implement under constraints |
| 1.5 | Linter verification (run lint, read errors, fix) |
| 2 | Performance audit |
| 3 | 6-dimension self-audit (3.1 rules, 3.2 structure, 3.3 edge cases, 3.4 tests, 3.5 i18n, 3.6 evolution) |
| 4 | Fix all issues |
| 5 | Update refactor progress |
| 6 | Commit |

**Opt-out flags**:

| Flag | Skips | Best for |
|------|-------|----------|
| `quick` | Stages 2, 3.5, 3.6, 5 | Hotfixes, small changes, styling |
| `no-commit` | Stage 6 | Exploration, review before commit |
| `skip-tests` | Stage 3.4 | Pure visual/styling changes |

Flags can be combined: `quick no-commit skip-tests` for minimal pipeline with manual review.

### `/archon-audit`

Full project health check. Read-only — does not modify code.

| Field | Value |
|-------|-------|
| Agent | `archon-audit.md` |
| Skill | `archon-audit/SKILL.md` |
| Mode | Read-only |
| Preloads | archon-code-quality, archon-test-sync |

Produces a scored report (0-100) across 5 dimensions: lint, tests, rule compliance, architecture, documentation.

### `/archon-refactor`

Generate a progressive refactoring plan with milestones.

| Field | Value |
|-------|-------|
| Agent | `archon-refactor.md` |
| Skill | `archon-refactor/SKILL.md` |

Saves plan to `docs/refactor-plan.md`. Future `/archon-demand` calls automatically align with the plan.

### `/archon-verifier`

Independent validation of claimed work.

| Field | Value |
|-------|-------|
| Agent | `archon-verifier.md` |
| Skill | `archon-verifier/SKILL.md` |
| Mode | Read-only |

Skeptically verifies: code exists, tests pass, no TODOs left, no regressions.

## Internal Workflows

These are called by `/archon-demand`, not directly by users:

| Workflow | Agent | Skill | Called by |
|----------|-------|-------|----------|
| Self-audit | `archon-self-auditor.md` | `archon-self-auditor/SKILL.md` | demand Stage 3 |
| Test runner | `archon-test-runner.md` | `archon-test-runner/SKILL.md` | demand Stage 3.4 |
