# Archon Protocol — AI Navigation

> **For AI agents.** This file is a machine-readable sitemap of aaep.site.
> Every link below points to raw Markdown source — no HTML rendering.
> Entry point: `https://aaep.site/ai.md`

## How to Use This File

1. **Quick start**: Read `/init.md` to bootstrap the protocol
2. **Full docs in one file**: Fetch `/llms-full.txt` (all pages concatenated)
3. **Section index**: Fetch `/llms.txt` (structured table of contents)
4. **Individual pages**: Use the links below — each `*.md` URL returns clean Markdown

---

## Quick Access

| Resource | URL | Description |
|----------|-----|-------------|
| This navigation | `https://aaep.site/ai.md` | AI-readable sitemap (you are here) |
| Init prompt | `https://aaep.site/init.md` | Bootstrap prompt for installing the protocol |
| Full docs bundle | `https://aaep.site/llms-full.txt` | All documentation in one file |
| Docs index | `https://aaep.site/llms.txt` | Structured table of contents |

---

## Kernel

The always-resident core — identity, memory map, core loop.

| Page | Raw Markdown URL |
|------|-----------------|
| Kernel Overview | `https://aaep.site/kernel.md` |
| Doc Integrity | `https://aaep.site/kernel/doc-integrity.md` |

## Drivers (Constraint Skills)

Loaded on demand. Each driver defines ❌ prohibitions and ✅ requirements.

| Page | Raw Markdown URL |
|------|-----------------|
| Drivers Overview | `https://aaep.site/drivers.md` |
| Code Quality | `https://aaep.site/drivers/code-quality.md` |
| Test Sync | `https://aaep.site/drivers/test-sync.md` |
| Async Loading | `https://aaep.site/drivers/async-loading.md` |
| Error Handling | `https://aaep.site/drivers/error-handling.md` |
| Handoff | `https://aaep.site/drivers/handoff.md` |

## Syscalls (User-Invoked Commands)

Commands users trigger via `/archon-*` syntax.

| Page | Raw Markdown URL |
|------|-----------------|
| Syscalls Overview | `https://aaep.site/syscalls.md` |
| /archon-init | `https://aaep.site/syscalls/init.md` |
| /archon-demand | `https://aaep.site/syscalls/demand.md` |
| /archon-audit | `https://aaep.site/syscalls/audit.md` |
| /archon-refactor | `https://aaep.site/syscalls/refactor.md` |
| /archon-verifier | `https://aaep.site/syscalls/verifier.md` |
| /archon-lint | `https://aaep.site/syscalls/lint.md` |

## Daemons (Internal Services)

Background processes — never user-invoked.

| Page | Raw Markdown URL |
|------|-----------------|
| Daemons Overview | `https://aaep.site/daemons.md` |
| Self-Auditor | `https://aaep.site/daemons/self-auditor.md` |
| Test Runner | `https://aaep.site/daemons/test-runner.md` |

## Architecture

Design philosophy, mental models, and structural decisions.

| Page | Raw Markdown URL |
|------|-----------------|
| Core Principles | `https://aaep.site/architecture/core-principles.md` |
| Architecture Overview | `https://aaep.site/architecture/overview.md` |
| The OS Model | `https://aaep.site/architecture/os-model.md` |
| Single-Agent Design | `https://aaep.site/architecture/single-agent.md` |
| Feedback Loop | `https://aaep.site/architecture/feedback-loop.md` |
| Naming & AAEP | `https://aaep.site/architecture/naming-protocol.md` |

## Guide

User-facing documentation for getting started and daily usage.

| Page | Raw Markdown URL |
|------|-----------------|
| Getting Started | `https://aaep.site/guide/getting-started.md` |
| User Journeys | `https://aaep.site/guide/user-journeys.md` |
| Design Philosophy | `https://aaep.site/guide/design-philosophy.md` |
| Installation | `https://aaep.site/guide/installation.md` |
| Migration Guide | `https://aaep.site/guide/migration.md` |
| FAQ | `https://aaep.site/guide/faq.md` |

## Reference

Comprehensive command and agent specifications.

| Page | Raw Markdown URL |
|------|-----------------|
| Commands | `https://aaep.site/reference/commands.md` |
| Agents | `https://aaep.site/reference/agents.md` |
| Constraint Skills | `https://aaep.site/reference/constraints.md` |

## Architecture Decision Records (ADRs)

Immutable records of key design decisions.

| Page | Raw Markdown URL |
|------|-----------------|
| ADR-001: Response to Critiques | `https://aaep.site/decisions/ADR-001-response-to-external-critiques.md` |
| ADR-002: EvoMap Experience Absorption | `https://aaep.site/decisions/ADR-002-evomap-experience-absorption.md` |
| ADR-003: Executable Enforcement | `https://aaep.site/decisions/ADR-003-executable-enforcement.md` |

## Chinese Documentation (中文)

| Page | Raw Markdown URL |
|------|-----------------|
| 首页 | `https://aaep.site/zh.md` |
| 快速上手 | `https://aaep.site/zh/guide/getting-started.md` |
| 用户旅途 | `https://aaep.site/zh/guide/user-journeys.md` |
| 设计哲学 | `https://aaep.site/zh/guide/design-philosophy.md` |
| 常见问题 | `https://aaep.site/zh/guide/faq.md` |
| 架构总览 | `https://aaep.site/zh/architecture/overview.md` |
| 核心原则 | `https://aaep.site/zh/architecture/core-principles.md` |
| 单代理架构 | `https://aaep.site/zh/architecture/single-agent.md` |
| 自动化反馈循环 | `https://aaep.site/zh/architecture/feedback-loop.md` |
| 命名与协议 | `https://aaep.site/zh/architecture/naming-protocol.md` |
| 操作系统模型 | `https://aaep.site/zh/architecture/os-model.md` |
| 命令与工作流 | `https://aaep.site/zh/reference/commands.md` |

---

## URL Pattern

All documentation pages follow the pattern:

```
https://aaep.site/{path}.md
```

Where `{path}` matches the sidebar navigation structure. The `.md` suffix returns raw Markdown source processed by vitepress-plugin-llms — clean text with no HTML artifacts.

**Special case**: Section index pages use `{section}.md` (not `{section}/index.md`). For example:
- Kernel overview → `/kernel.md` (not `/kernel/index.md`)
- Drivers overview → `/drivers.md` (not `/drivers/index.md`)

## Recommended Reading Order for AI Agents

1. `/init.md` — Bootstrap prompt (if installing the protocol)
2. `/kernel.md` — Core identity and loop
3. `/architecture/core-principles.md` — The 8 first principles
4. `/architecture/os-model.md` — How every file maps to an OS role
5. `/drivers.md` → individual drivers — Constraint skills
6. `/syscalls.md` → individual syscalls — Available commands
7. `/reference/commands.md` — Complete command reference

---

*Archon Protocol v1.1.0 — AI Architect Evolution Protocol (AAEP)*
*Human docs: https://aaep.site | AI entry: https://aaep.site/ai.md*
