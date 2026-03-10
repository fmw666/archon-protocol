# Kernel

> **Always resident in the AI's context window. Loaded first, unloaded last.**

The kernel is the Archon Protocol's core identity. Unlike a single monolithic file, it consists of multiple **kernel modules** — each with a distinct responsibility:

## Kernel Modules

| Module | Source | Deploy Target (Cursor) | Responsibility |
|--------|--------|----------------------|----------------|
| **Identity** | this page + template below | `.cursor/rules/archon-kernel.md` (`alwaysApply: true`) | Who the agent is, core loop, component registry |
| **[Doc Integrity](/kernel/doc-integrity)** | `docs/kernel/doc-integrity.md` | `.cursor/rules/archon-doc-integrity.md` (`globs: docs/**`) | Document self-sync, ripple propagation, consistency invariants |

### Why multiple modules?

Single-file kernels mix concerns. The identity module answers "who am I and what do I control?" while the doc integrity module answers "how do I keep the system consistent?" Separating them means:

- Identity is always loaded (~2% context budget)
- Doc integrity only activates when touching documentation files
- Each can evolve independently
- Both are deployable as Cursor rules with different trigger conditions

## Components

| Component | OS Equivalent | Loading | Purpose |
|-----------|--------------|---------|---------|
| `AGENTS.md` / `CLAUDE.md` | Kernel image | Always resident | Identity, core loop |
| `archon.config.yaml` | `/etc/` config | Read per command | Project-specific parameters |
| `ai-index.md` | Page table | Read by AI to locate files | Document map |

## Deployment Per Environment

| Environment | Identity Deploy | Doc Integrity Deploy | Mechanism |
|------------|----------------|---------------------|-----------|
| **Cursor** | `.cursor/rules/archon-kernel.md` | `.cursor/rules/archon-doc-integrity.md` | Native rules, reliable |
| Claude Code | `CLAUDE.md` | `.claude/skills/archon-doc-integrity/SKILL.md` | Native entry + skill |
| Codex | `AGENTS.md` | `.codex/skills/archon-doc-integrity/SKILL.md` | Root file + skill |
| Other | `AGENTS.md` | Manual reference | Varies |

::: warning Cursor 用户
Cursor 对根目录 `AGENTS.md` 支持不稳定。始终使用 `.cursor/rules/archon-kernel.md` 作为内核部署目标。
:::

## Kernel Identity Template

::: details Full Identity Template (deployed as archon-kernel.md)

```markdown
# Kernel Image

> You are the kernel of this codebase's operating system.

## Identity
You are **Archon** — the single governing process.

## Kernel Parameters
Read `archon.config.yaml` at the start of every task.

## Kernel Modules
| Module | Source | Deploy | Purpose |
|--------|--------|--------|---------|
| Identity | docs/kernel/index.md | .cursor/rules/archon-kernel.md | Core loop, registry |
| Doc Integrity | docs/kernel/doc-integrity.md | .cursor/rules/archon-doc-integrity.md | Consistency |

## Memory Map
| Path | Mount Mode | Purpose |
|------|------------|---------|
| docs/kernel/ | read-only | Kernel modules |
| docs/drivers/ | read-only | Constraints |
| docs/syscalls/ | read-only | Commands |
| docs/daemons/ | read-only | Internal services |
| docs/architecture/ | read-only | System design |
| docs/guide/ | read-only | User manuals |
| docs/reference/ | read-only | Specs |
| docs/decisions/ | append-only | ADRs |
| proposed-rules.md | read-write | Staged rules |
| todo/debt_radar.md | read-write | Debt queue |

## Core Loop
1. AUDIT — Check constraints
2. PLAN — Conflict? Update spec or create exception
3. EXECUTE — Write code, enforce drivers
4. EVOLVE — Fix debt, propose rules, follow doc integrity ripple
```

:::

## Memory Model

```
┌────────────────────────────────────────────┐
│  ALWAYS RESIDENT (kernel space)            │  ~2% of context
│  archon-kernel.md + archon.config.yaml     │
├────────────────────────────────────────────┤
│  CONDITIONAL (kernel modules)              │  ~1% when active
│  archon-doc-integrity.md (on docs/ edits)  │
├────────────────────────────────────────────┤
│  PRELOADED (driver space)                  │  ~5% of context
│  Constraint skills via `skills:` field     │
├────────────────────────────────────────────┤
│  ON DEMAND (user space)                    │  ~92% of context
│  Source code, test output, docs, etc.      │
└────────────────────────────────────────────┘
```

## Next

- [Doc Integrity](/kernel/doc-integrity) — Self-sync, ripple propagation, consistency invariants
- [Drivers](/drivers/) — Hard boundary constraints loaded into kernel space
- [Syscalls](/syscalls/) — User-invoked commands
- [OS Model](/architecture/os-model) — Complete layer-by-layer breakdown
