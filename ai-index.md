# Archon Protocol — AI Document Index

> This file is the **page table** of the Archon OS. It maps every file to its OS role, loading semantics, and purpose. Read this first to locate relevant knowledge.

## Kernel (Always Resident)

| File | OS Role | Purpose |
|------|---------|---------|
| `.cursor/rules/archon-kernel.md` | Kernel image (Cursor) | Identity, core loop, component registry |
| `.cursor/rules/archon-doc-integrity.md` | Kernel module (Cursor) | Document consistency, ripple propagation |
| `archon.config.yaml` | `/etc/` config | Project-specific parameters: language, framework, environment |
| `ai-index.md` | Page table | This file — maps all documents to their roles |
| `AGENTS.md` | Kernel fallback | For Claude Code / Codex / other tools |

### Kernel Source Docs

| File | Purpose |
|------|---------|
| `docs/kernel/index.md` | Kernel overview, module list, templates |
| `docs/kernel/doc-integrity.md` | Document integrity protocol (source of truth for the rule) |

## Drivers (Constraint Skills)

| File | OS Role | Activated |
|------|---------|-----------|
| `docs/drivers/code-quality.md` | Storage driver | Every code change |
| `docs/drivers/test-sync.md` | FS integrity driver | Every code change |
| `docs/drivers/async-loading.md` | Display driver | UI component edits |
| `docs/drivers/error-handling.md` | Network driver | API/component edits |
| `docs/drivers/handoff.md` | IPC driver | Cross-boundary changes |

## Syscalls (User-Invoked Commands)

| File | Syscall | Purpose |
|------|---------|---------|
| `docs/syscalls/init.md` | `boot()` | Detect env, deploy drivers, mount FS |
| `docs/syscalls/demand.md` | `exec()` | Full delivery pipeline |
| `docs/syscalls/audit.md` | `stat()` | Read-only health check |
| `docs/syscalls/refactor.md` | `defrag()` | Progressive restructure |
| `docs/syscalls/verifier.md` | `fsck()` | Independent validation |
| `docs/syscalls/lint.md` | `check()` | Protocol integrity, link audit, consistency |

## Daemons (Internal, Never User-Invoked)

| File | Daemon | Spawned By |
|------|--------|-----------|
| `docs/daemons/self-auditor.md` | `watchdogd` | demand Stage 3 |
| `docs/daemons/test-runner.md` | `testd` | demand Stage 3.4 |

## Filesystem (Persistent Storage — English)

| File | Mount | Mode | Topic |
|------|-------|------|-------|
| `docs/kernel/index.md` | `/boot/` | read-only | Kernel overview and templates |
| `docs/drivers/index.md` | `/lib/modules/` | read-only | Drivers overview |
| `docs/syscalls/index.md` | `/usr/bin/` | read-only | Syscalls overview |
| `docs/daemons/index.md` | `/usr/sbin/` | read-only | Daemons overview |
| `docs/architecture/core-principles.md` | `/usr/src/` | read-only | 7 first principles |
| `docs/architecture/overview.md` | `/usr/src/` | read-only | Dual-layer model |
| `docs/architecture/single-agent.md` | `/usr/src/` | read-only | Why single agent beats multi-agent |
| `docs/architecture/feedback-loop.md` | `/usr/src/` | read-only | Self-reinforcing evolution |
| `docs/architecture/naming-protocol.md` | `/usr/src/` | read-only | "Archon" etymology, AAEP spec |
| `docs/architecture/os-model.md` | `/usr/src/` | read-only | OS model: every file's role |
| `docs/guide/getting-started.md` | `/usr/share/man/` | read-only | Quick start, daily usage |
| `docs/guide/installation.md` | `/usr/share/man/` | read-only | Install, config, verify |
| `docs/guide/migration.md` | `/usr/share/man/` | read-only | Environment migration guide |
| `docs/guide/design-philosophy.md` | `/usr/share/man/` | read-only | Design philosophy |
| `docs/guide/faq.md` | `/usr/share/man/` | read-only | Common questions |
| `docs/reference/commands.md` | `/usr/share/info/` | read-only | All commands with stages, flags |
| `docs/reference/agents.md` | `/usr/share/info/` | read-only | Agent format, all agent specs |
| `docs/reference/constraints.md` | `/usr/share/info/` | read-only | All constraint skills with prohibitions |
| `docs/decisions/ADR-001-response-to-external-critiques.md` | `/var/log/` | append-only | ADR: external critique response |
| `docs/decisions/ADR-002-evomap-experience-absorption.md` | `/var/log/` | append-only | ADR: EvoMap experience absorption |
| `docs/refactor-reports/` | `/var/log/audit/` | append-only | Refactor reports: immune memory |

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

## Init Prompt (Bootstrap)

| File | Purpose |
|------|---------|
| `docs/public/init.md` | Raw init prompt served at `https://aaep.site/init.md` |

## Installer & Templates

| File | OS Role | Purpose |
|------|---------|---------|
| `templates/archon.config.yaml` | Default `/etc/` | Config template |
| `templates/constraints/archon-nextjs-ssr.md` | Driver package | Next.js SSR constraints |
| `templates/constraints/archon-react-hydration.md` | Driver package | React hydration constraints |

## Lint Scripts

| File | Purpose |
|------|---------|
| `scripts/lint-links.mjs` | Internal link auditor for docs/ markdown files |
| `scripts/lint-integrity.mjs` | CI-1~CI-9 consistency invariant checker |

## POST (Power-On Self-Test)

| File | Verifies |
|------|----------|
| `tests/doc-format.test.js` | Document structure, naming, content |
| `tests/prohibition-quality.test.js` | Every ❌ is specific and verifiable |
| `tests/ecosystem-integrity.test.js` | Cross-references, prefixes, contradictions |
