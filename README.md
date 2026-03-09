# Archon Protocol

> The single-ruler governance system for AI-driven development, powered by **AAEP** (AI Architect Evolution Protocol).

Agent-first, skill-fallback. Zero conflicts.

## Problem

AI has no persistent memory. Without constraints, the same concept gets 5 different implementations across 60,000 lines of code. Archon Protocol solves this with a dual-layer ecosystem: **agents** for tools that support them (isolated context), **skills** as portable fallback (27+ tools).

## Architecture

```
archon-protocol/
├── agents/                              # Subagents (Cursor + Claude Code)
│   ├── archon-init.md                   # Bootstrap ecosystem
│   ├── archon-demand.md                 # Full delivery pipeline
│   ├── archon-audit.md                  # Project health check (read-only)
│   ├── archon-refactor.md               # Progressive refactoring plan
│   ├── archon-self-auditor.md           # 6-dim code audit (read-only)
│   ├── archon-test-runner.md            # Test sync and execution
│   └── archon-verifier.md              # Independent validation
│
├── skills/                              # SKILL.md (27+ tools)
│   ├── archon-init/SKILL.md             # Same as agents, portable format
│   ├── archon-demand/SKILL.md
│   ├── archon-audit/SKILL.md
│   ├── archon-refactor/SKILL.md
│   ├── archon-self-auditor/SKILL.md
│   ├── archon-test-runner/SKILL.md
│   ├── archon-verifier/SKILL.md
│   │
│   ├── archon-code-quality/SKILL.md     # Constraint: file limits, type safety
│   ├── archon-test-sync/SKILL.md        # Constraint: tests follow code
│   ├── archon-async-loading/SKILL.md    # Constraint: skeleton, retry, lazy load
│   └── archon-error-handling/SKILL.md   # Constraint: structured errors
│
├── docs/                                # Chinese docs for humans
├── tests/                               # Integrity tests
└── templates/
    ├── install.sh                       # Deploys agents + skills
    └── archon.config.yaml               # Project config template
```

### Agent-First, Skill-Fallback

| Layer | Format | Tools | Purpose |
|-------|--------|-------|---------|
| **Agents** (primary) | `.md` with YAML frontmatter | Cursor, Claude Code | Isolated context, can preload constraint skills |
| **Skills** (fallback) | `SKILL.md` | 27+ tools | Same content, portable format |
| **Constraint Skills** | `SKILL.md` | 27+ tools | Hard boundaries, preloaded into agents |

Agents are preferred because they provide **isolated context windows** — audit, test, and verification tasks don't pollute the main conversation. For tools without agent support, the same workflows are available as skills.

### All names prefixed `archon-`

No collisions with existing project agents/skills. Your project's `demand` skill and Archon's `archon-demand` coexist cleanly.

## Commands

| Command | Agent | Skill (fallback) |
|---------|-------|-------------------|
| `/archon-init` | `archon-init.md` | `archon-init/SKILL.md` |
| `/archon-demand <req>` | `archon-demand.md` | `archon-demand/SKILL.md` |
| `/archon-audit` | `archon-audit.md` | `archon-audit/SKILL.md` |
| `/archon-refactor` | `archon-refactor.md` | `archon-refactor/SKILL.md` |
| `/archon-verifier` | `archon-verifier.md` | `archon-verifier/SKILL.md` |

Internal (called by demand, not user-invoked):

| Workflow | Agent | Skill |
|----------|-------|-------|
| Self-audit | `archon-self-auditor.md` | `archon-self-auditor/SKILL.md` |
| Test runner | `archon-test-runner.md` | `archon-test-runner/SKILL.md` |

## Constraint Skills

Hard boundaries preloaded into agents via `skills` field, or auto-discovered by skill-only tools:

| Skill | Enforces |
|-------|----------|
| `archon-code-quality` | File size limits, type safety, universal prohibitions |
| `archon-test-sync` | Code changed → tests must follow |
| `archon-async-loading` | Skeleton screens, error retry, viewport lazy loading |
| `archon-error-handling` | Structured error patterns |

## Self-Evolution

The `archon-demand` agent's Stage 3.6 asks: "did this task produce a new pattern worth codifying?"

| Discovery | Action |
|-----------|--------|
| New anti-pattern | Add `❌` prohibition to constraint skill |
| Reusable technique | Update constraint skill or docs |
| Architecture decision | Update knowledge doc |

## Installation

```bash
bash archon-protocol/templates/install.sh
# Deploys agents to .cursor/agents/, .claude/agents/
# Deploys skills to .cursor/skills/, .claude/skills/, .codex/skills/

npx vitest run --config archon-protocol/vitest.config.js  # verify integrity
```

## Documentation

Full documentation with bilingual support (English + 中文), powered by VitePress:

```bash
cd archon-protocol && npm install && npm run docs:dev
```

| Section | English | 中文 |
|---------|---------|------|
| Getting Started | [guide/getting-started](docs/guide/getting-started.md) | [快速上手](docs/zh/guide/getting-started.md) |
| Architecture | [architecture/overview](docs/architecture/overview.md) | [架构总览](docs/zh/architecture/overview.md) |
| Single-Agent Design | [architecture/single-agent](docs/architecture/single-agent.md) | [单代理架构](docs/zh/architecture/single-agent.md) |
| Feedback Loop | [architecture/feedback-loop](docs/architecture/feedback-loop.md) | [自动化反馈循环](docs/zh/architecture/feedback-loop.md) |
| Commands Reference | [reference/commands](docs/reference/commands.md) | [命令与工作流](docs/zh/reference/commands.md) |
| Naming & AAEP | [architecture/naming-protocol](docs/architecture/naming-protocol.md) | [命名与协议](docs/zh/architecture/naming-protocol.md) |

AI agents: read [`ai-index.md`](ai-index.md) for a machine-readable sitemap of all protocol files.

## Design Principles

1. **Agent-first, skill-fallback** — best experience on capable tools, portable everywhere
2. **`archon-` prefix** — zero namespace collisions
3. **Prohibitions > instructions** — `❌` is verifiable; "do it well" is not
4. **Constraint preloading** — agents inject constraint skills via `skills` field
5. **Self-evolution** — every task can strengthen the constraint system
6. **Dual audience** — same doc executed by AI and read by humans

---

*Archon Protocol v1.2 — Agent-first architecture with VitePress documentation, powered by AAEP.*
