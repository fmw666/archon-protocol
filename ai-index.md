# Archon Protocol — AI Document Index

> This file is the **page table** of the Archon OS. It maps every file to its OS role, loading semantics, and purpose. Read this first to locate relevant knowledge.

## Kernel (Always Resident)

| File | OS Role | Purpose |
|------|---------|---------|
| `AGENTS.md` | Kernel image | Identity, prime directive, core loop, driver/syscall reference |
| `archon.config.yaml` | `/etc/` config | Project-specific parameters: language, framework, environment |
| `ai-index.md` | Page table | This file — maps all documents to their roles |

## Drivers (Loaded via `skills:` field)

| File | OS Role | Activated |
|------|---------|-----------|
| `skills/archon-code-quality/SKILL.md` | Storage driver | Every code change |
| `skills/archon-test-sync/SKILL.md` | FS integrity driver | Every code change |
| `skills/archon-async-loading/SKILL.md` | Display driver | UI component edits |
| `skills/archon-error-handling/SKILL.md` | Network driver | API/component edits |
| `skills/archon-handoff/SKILL.md` | IPC driver | Cross-boundary changes |

## System Calls (User-Invoked Commands)

| Agent | Skill (fallback) | Syscall | Purpose |
|-------|-------------------|---------|---------|
| `agents/archon-init.md` | `skills/archon-init/SKILL.md` | `boot()` | Detect env, deploy drivers, mount FS |
| `agents/archon-demand.md` | `skills/archon-demand/SKILL.md` | `exec()` | Full delivery pipeline |
| `agents/archon-audit.md` | `skills/archon-audit/SKILL.md` | `stat()` | Read-only health check |
| `agents/archon-refactor.md` | `skills/archon-refactor/SKILL.md` | `defrag()` | Progressive restructure |
| `agents/archon-verifier.md` | `skills/archon-verifier/SKILL.md` | `fsck()` | Independent validation |

## Daemons (Internal, Never User-Invoked)

| Agent | Skill (fallback) | Daemon | Spawned By |
|-------|-------------------|--------|-----------|
| `agents/archon-self-auditor.md` | `skills/archon-self-auditor/SKILL.md` | `watchdogd` | demand Stage 3 |
| `agents/archon-test-runner.md` | `skills/archon-test-runner/SKILL.md` | `testd` | demand Stage 3.4 |

## Filesystem (Persistent Storage — English)

| File | Mount | Mode | Topic |
|------|-------|------|-------|
| `docs/architecture/overview.md` | `/usr/src/` | read-only | Dual-layer model, cross-tool compat |
| `docs/architecture/single-agent.md` | `/usr/src/` | read-only | Why single agent beats multi-agent |
| `docs/architecture/feedback-loop.md` | `/usr/src/` | read-only | Self-reinforcing evolution mechanism |
| `docs/architecture/naming-protocol.md` | `/usr/src/` | read-only | "Archon" etymology, AAEP spec |
| `docs/architecture/os-model.md` | `/usr/src/` | read-only | OS model: every file's role and loading semantics |
| `docs/guide/getting-started.md` | `/usr/share/man/` | read-only | Quick start, daily usage |
| `docs/guide/installation.md` | `/usr/share/man/` | read-only | Install, config, verify |
| `docs/guide/design-philosophy.md` | `/usr/share/man/` | read-only | Design philosophy, response to critiques |
| `docs/guide/faq.md` | `/usr/share/man/` | read-only | Common questions |
| `docs/reference/commands.md` | `/usr/share/info/` | read-only | All commands with stages, flags |
| `docs/reference/agents.md` | `/usr/share/info/` | read-only | Agent format, all agent specs |
| `docs/reference/constraints.md` | `/usr/share/info/` | read-only | All constraint skills with prohibitions |
| `docs/decisions/ADR-001-response-to-external-critiques.md` | `/var/log/` | append-only | ADR: external critique response |
| `docs/decisions/ADR-002-evomap-experience-absorption.md` | `/var/log/` | append-only | ADR: EvoMap experience absorption |

## Filesystem (Persistent Storage — Chinese)

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

## Staging & Job Queue

| File | OS Role | Mode | Purpose |
|------|---------|------|---------|
| `proposed-rules.md` | `/tmp/staging/` | read-write | Rules awaiting approval |
| `todo/debt_radar.md` | `/var/spool/` | read-write | Tech debt backlog |

## Installer & Package Manager

| File | OS Role | Purpose |
|------|---------|---------|
| `templates/install.sh` | OS installer | Deploy agents + skills to correct paths |
| `templates/archon.config.yaml` | Default `/etc/` | Config template |
| `templates/constraints/archon-nextjs-ssr.md` | Driver package | Next.js SSR/hydration constraints |
| `templates/constraints/archon-react-hydration.md` | Driver package | React state/hydration constraints |

## POST (Power-On Self-Test)

| File | Verifies |
|------|----------|
| `tests/agent-format.test.js` | Agent YAML frontmatter, naming, content |
| `tests/skill-format.test.js` | Skill YAML frontmatter, naming, size limits |
| `tests/prohibition-quality.test.js` | Every ❌ is specific and grep-verifiable |
| `tests/demand-completeness.test.js` | Demand pipeline has all stages |
| `tests/ecosystem-integrity.test.js` | Cross-references, prefixes, contradictions |
