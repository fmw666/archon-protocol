# Archon Protocol — AI Document Index

> This file is a machine-readable index of all Archon Protocol documentation.
> AI agents should read this file first to locate relevant knowledge.

## Protocol Components

### Agents (subagent definitions for Cursor + Claude Code)

| File | Purpose |
|------|---------|
| `agents/archon-init.md` | Bootstrap ecosystem, detect tech stack, health check |
| `agents/archon-demand.md` | Full delivery: implement → audit → fix → evolve → commit |
| `agents/archon-audit.md` | Read-only project health check, scored 0-100 |
| `agents/archon-refactor.md` | Progressive refactoring plan with milestones |
| `agents/archon-self-auditor.md` | 6-dimension code audit (rule, structure, edge, test, i18n, evolution) |
| `agents/archon-test-runner.md` | Test discovery, assertion update, execution |
| `agents/archon-verifier.md` | Independent validation of claimed work |

### Skills (portable SKILL.md for 27+ tools)

| File | Category | Purpose |
|------|----------|---------|
| `skills/archon-init/SKILL.md` | Command | Same as archon-init agent |
| `skills/archon-demand/SKILL.md` | Command | Same as archon-demand agent |
| `skills/archon-audit/SKILL.md` | Command | Same as archon-audit agent |
| `skills/archon-refactor/SKILL.md` | Command | Same as archon-refactor agent |
| `skills/archon-self-auditor/SKILL.md` | Internal | Same as archon-self-auditor agent |
| `skills/archon-test-runner/SKILL.md` | Internal | Same as archon-test-runner agent |
| `skills/archon-verifier/SKILL.md` | Internal | Same as archon-verifier agent |
| `skills/archon-code-quality/SKILL.md` | Constraint | File size limits, type safety, prohibitions |
| `skills/archon-test-sync/SKILL.md` | Constraint | Tests must follow code changes |
| `skills/archon-async-loading/SKILL.md` | Constraint | Skeleton, retry, viewport lazy load |
| `skills/archon-error-handling/SKILL.md` | Constraint | Structured errors, no stack traces |
| `skills/archon-handoff/SKILL.md` | Constraint | Interface contracts, cross-boundary handoff |

### Documentation (English — for AI execution and human reading)

| File | Topic |
|------|-------|
| `docs/guide/getting-started.md` | Quick start, daily usage, tool compatibility |
| `docs/guide/installation.md` | Install, config, verify |
| `docs/guide/faq.md` | Common questions |
| `docs/architecture/overview.md` | Dual-layer model, component categories, cross-tool compat |
| `docs/architecture/single-agent.md` | Why single agent beats multi-agent |
| `docs/architecture/feedback-loop.md` | Self-reinforcing evolution mechanism |
| `docs/architecture/naming-protocol.md` | "Archon" etymology, AAEP spec |
| `docs/reference/commands.md` | All commands with stages, flags, options |
| `docs/reference/agents.md` | Agent format, all agent specs |
| `docs/reference/constraints.md` | All constraint skills with prohibitions |
| `docs/guide/design-philosophy.md` | Design philosophy, response to critiques |
| `docs/decisions/ADR-001-response-to-external-critiques.md` | ADR: response to external AI critiques |
| `docs/decisions/ADR-002-evomap-experience-absorption.md` | ADR: EvoMap experience absorption |

### Documentation (Chinese — for human reading)

| File | Topic |
|------|-------|
| `docs/zh/guide/getting-started.md` | 快速上手 |
| `docs/zh/guide/design-philosophy.md` | 设计哲学 |
| `docs/zh/guide/faq.md` | 常见问题 |
| `docs/zh/architecture/overview.md` | 架构总览 |
| `docs/zh/architecture/single-agent.md` | 单代理架构 |
| `docs/zh/architecture/feedback-loop.md` | 自动化反馈循环 |
| `docs/zh/architecture/naming-protocol.md` | 命名与协议（AAEP） |
| `docs/zh/reference/commands.md` | 命令与工作流 |

### Configuration

| File | Purpose |
|------|---------|
| `archon.config.yaml` | Project-specific config (tech stack, enabled skills, test command) |
| `templates/install.sh` | Deployment script |
| `templates/archon.config.yaml` | Config template |
| `templates/constraints/archon-nextjs-ssr.md` | Framework constraint: Next.js SSR/hydration |
| `templates/constraints/archon-react-hydration.md` | Framework constraint: React state/hydration |

### Tests

| File | What it verifies |
|------|-----------------|
| `tests/agent-format.test.js` | Agent YAML frontmatter, naming, content |
| `tests/skill-format.test.js` | Skill YAML frontmatter, naming, size limits |
| `tests/prohibition-quality.test.js` | Every ❌ is specific and grep-verifiable |
| `tests/demand-completeness.test.js` | Demand pipeline has all stages |
| `tests/ecosystem-integrity.test.js` | Cross-references, prefixes, contradictions |
