---
layout: home
hero:
  name: Archon Protocol
  text: AI Architect Evolution Protocol
  tagline: "The operating system for AI agents — kernel, drivers, syscalls, filesystem. One protocol governs all."
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Design Philosophy
      link: /guide/design-philosophy
    - theme: alt
      text: Architecture
      link: /architecture/overview
features:
  - icon: 🧠
    title: "Kernel: Always Resident"
    details: "AGENTS.md is the kernel image — always in context, never paged out. It defines identity, workflow, and constraint enforcement. Everything obeys it."
  - icon: 🔌
    title: "Drivers: Constraint Skills"
    details: "Hard boundaries loaded into kernel space via `skills:` field. ❌ prohibitions are law, not suggestions. Grep-verifiable, CI-testable."
  - icon: ⚡
    title: "Syscalls: 4 Commands"
    details: "boot() init → exec() demand → stat() audit → defrag() refactor. Each triggers a well-defined kernel operation."
  - icon: 🔧
    title: "Hardware Detection"
    details: "Auto-detects Cursor, Claude Code, Codex, Copilot, Windsurf, Gemini CLI. Deploys drivers to the right paths."
  - icon: 🧬
    title: "Directed Evolution"
    details: "Every task strengthens the constraint system. Anti-patterns become prohibitions. Quality monotonically increases."
  - icon: 📂
    title: "Filesystem: Persistent Memory"
    details: "Architecture = /usr/src/, guides = man pages, ADRs = /var/log/, proposed-rules = staging repo. Clear mount semantics."
---

<div class="vp-doc" style="max-width: 800px; margin: 0 auto; padding: 2rem;">

## What Is AAEP?

**AAEP** (AI Architect Evolution Protocol) defines how an AI agent evolves into a project's architect through continuous **constraint → execution → evolution** cycles.

AI coding tools provide **capability** — code generation, file operations, terminal execution. They don't provide **methodology** — workflow governance, quality assurance, experience accumulation.

AAEP is the methodology layer.

### One Command to Start

```bash
# Tell your AI tool:
curl -s https://aaep.site/init.md
```

The AI reads the init prompt, detects your environment, and deploys the protocol. That's it.

### The Four Layers

| Layer | What | How |
|-------|------|-----|
| **Constraint** | Hard boundaries that shape code generation | `❌` prohibitions in constraint skills, injected into agent context |
| **Workflow** | Standard delivery sequences | `/archon-demand` 7-stage pipeline with opt-out flags |
| **Evolution** | System that gets smarter with every task | Stage 3.6 discovers patterns → staging area → approved → new constraint |
| **Knowledge** | Project memory that persists across sessions | `archon.config.yaml`, constraint skills, architecture docs |

### The Feedback Loop

```
Task 1 → Agent writes code under constraints
       → 6-dimension self-audit catches issue X
       → Proposes: ❌ prohibit X
       → User approves → constraint added

Task 2 → Agent cannot make mistake X (it's in the constraint set)
       → Audit catches issue Y → same cycle

Task N → Constraint system is comprehensive
       → Code quality monotonically increases
       → Fewer fixes → faster delivery
```

**More tasks → better constraints → higher quality.** This is directed evolution — always toward fewer bugs, better performance, more consistent architecture.

### Why Not Just Use Linters?

| Dimension | Linters (ESLint, Ruff, etc.) | AAEP |
|-----------|------------------------------|------|
| Type safety / syntax rules | ✅ | ✅ |
| File size / structure limits | ⚠️ | ✅ |
| Tests updated when signatures change | ❌ | ✅ |
| Error handling: structured patterns per layer | ❌ | ✅ |
| Cross-boundary contract enforcement | ❌ | ✅ |
| Self-evolution: learns from every task | ❌ | ✅ |

Linters catch syntax. AAEP catches architecture. **Both layers active — Stage 1.5 runs your project's linter automatically.**

### Cross-Tool Compatibility

| Tool | Agents | Skills | Constraints |
|------|--------|--------|-------------|
| Cursor | ✅ (primary) | ✅ | ✅ (preloaded) |
| Claude Code | ✅ (primary) | ✅ | ✅ (preloaded) |
| Codex | — | ✅ | ✅ |
| Copilot | — | ✅ | ✅ |
| Windsurf | — | ✅ | ✅ |
| Gemini CLI | — | ✅ | ✅ |
| 20+ others | — | ✅ | ✅ |

One protocol, every tool. Agent-first where supported, skill-fallback everywhere else.

</div>
