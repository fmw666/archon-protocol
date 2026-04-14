# Archon Protocol

> The AI Agent Operating System, powered by **AAEP** (AI Architect Evolution Protocol).

Kernel → Drivers → Syscalls → Daemons. One architecture, every AI tool.

## Problem

AI has no persistent memory. Without constraints, the same concept gets 5 different implementations across 60,000 lines of code. Archon Protocol solves this with an **operating system model** — a layered architecture where every component has precise loading semantics, and constraints are enforced as law.

## Architecture

The protocol is organized as an OS with 4 layers, all stored as documentation:

```
archon-protocol/
├── docs/
│   ├── kernel/                    # Layer 1: Always resident in AI context
│   │   └── index.md              # Kernel overview + AGENTS.md template
│   │
│   ├── drivers/                   # Layer 2: Constraint skills (hard boundaries)
│   │   ├── code-quality.md       # File limits, type safety, prohibitions
│   │   ├── test-sync.md          # Tests follow code changes
│   │   ├── async-loading.md      # Skeleton, retry, lazy load
│   │   ├── error-handling.md     # Structured errors
│   │   └── handoff.md            # Interface contracts
│   │
│   ├── syscalls/                  # Layer 3: User-invoked commands
│   │   ├── init.md               # boot() — Bootstrap + environment detection
│   │   ├── demand.md             # exec() — Full delivery pipeline
│   │   ├── audit.md              # stat() — Health check (0-100)
│   │   ├── refactor.md           # defrag() — Progressive restructure
│   │   └── verifier.md           # fsck() — Independent validation
│   │
│   ├── daemons/                   # Layer 4: Internal services
│   │   ├── self-auditor.md       # watchdogd — 6-dim code audit
│   │   └── test-runner.md        # testd — Test sync + execution
│   │
│   ├── architecture/              # How the system works
│   ├── guide/                     # Getting started, migration, FAQ
│   │   └── migration.md          # Environment-specific deployment guide
│   ├── reference/                 # Complete specs
│   └── decisions/                 # ADRs (append-only)
│
├── docs/public/
│   └── init.md                    # Raw init prompt (curl -s https://aaep.site/init.md)
│
├── templates/
│   ├── archon.config.yaml        # Project config template
│   └── constraints/               # Framework-specific driver templates
│
├── tests/                         # POST (Power-On Self-Test)
├── AGENTS.md                      # Kernel image (for direct use)
└── ai-index.md                    # Page table (AI document locator)
```

## Quick Start

### Option 1: Tell your AI

```
Read this and follow the instructions: curl -s https://aaep.site/init.md
```

The AI reads the init prompt, detects your environment (Cursor, Claude Code, Codex, etc.), and deploys the protocol to the correct locations.

### Option 2: Clone + init

```bash
git clone https://github.com/fmw666/archon-protocol.git
# Then in your AI tool:
/archon-init
```

## OS Layer Model

| Layer | Content | Loading | Analogy |
|-------|---------|---------|---------|
| **Kernel** | Identity, core loop, memory map | Always resident (~2% context) | `/boot/vmlinuz` |
| **Drivers** | ❌ prohibitions, hard limits | Preloaded per command (~5% context) | `modprobe` |
| **Syscalls** | User commands (init, demand, audit...) | On user invocation | `exec()` |
| **Daemons** | Internal services (auditor, test runner) | Spawned by syscalls | `systemd` services |

## Commands

| Command | Layer | Purpose |
|---------|-------|---------|
| `/archon-init` | Syscall | Bootstrap ecosystem or health check |
| `/archon-demand <req>` | Syscall | Full delivery pipeline |
| `/archon-audit` | Syscall | Project health check (read-only, 0-100) |
| `/archon-refactor` | Syscall | Progressive refactoring plan |
| `/archon-verifier` | Syscall | Independent validation |
| `/archon-lint` | Syscall | Protocol integrity checks (links + invariants + tests) |

## Drivers (Constraints)

| Driver | Enforces |
|--------|----------|
| `archon-code-quality` | File size limits, type safety, universal prohibitions |
| `archon-test-sync` | Code changed → tests must follow |
| `archon-async-loading` | Skeleton screens, error retry, viewport lazy loading |
| `archon-error-handling` | Structured error patterns |
| `archon-handoff` | Interface contracts & cross-boundary handoff |

## Environment Support

| Feature | Cursor | Claude Code | Codex | Copilot | Windsurf | Gemini CLI |
|---------|--------|-------------|-------|---------|----------|------------|
| Subagents | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Skill preloading | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Always-loaded kernel | ✅ | ✅ | Partial | Partial | ✅ | Partial |

See the full [Migration Guide](docs/guide/migration.md) for environment-specific deployment details.

## Self-Evolution

Every `/archon-demand` call includes a knowledge evolution step (Stage 3.6): new anti-patterns become prohibitions, reusable techniques become constraints. Rules are staged in `proposed-rules.md` and graduate to drivers after human approval.

## Documentation

Full documentation with bilingual support (English + 中文), powered by VitePress:

```bash
cd archon-protocol && npm install && npm run docs:dev
# Validate protocol integrity:
npm run lint
```

| Section | Link |
|---------|------|
| Getting Started | [guide/getting-started](docs/guide/getting-started.md) |
| Migration Guide | [guide/migration](docs/guide/migration.md) |
| OS Model | [architecture/os-model](docs/architecture/os-model.md) |
| Kernel | [kernel/](docs/kernel/index.md) |
| Drivers | [drivers/](docs/drivers/index.md) |
| Syscalls | [syscalls/](docs/syscalls/index.md) |
| Daemons | [daemons/](docs/daemons/index.md) |

AI agents: read [`ai-index.md`](ai-index.md) for a machine-readable sitemap of all protocol files.

## Design Principles

1. **OS model** — every file has precise loading semantics (kernel, driver, syscall, daemon)
2. **Single source of truth** — docs ARE the protocol, deployed to environments during init
3. **`archon-` prefix** — zero namespace collisions with user's own code
4. **Prohibitions > instructions** — `❌` is verifiable; "do it well" is not
5. **Self-evolution** — every task can strengthen the constraint system
6. **Every environment** — Cursor, Claude Code, Codex, Copilot, Windsurf, Gemini CLI

## License

MIT

---

*Archon Protocol v2.0 — OS-model architecture with unified documentation. Powered by AAEP.*
