---
layout: home
hero:
  name: Archon Protocol
  text: AI Architect Evolution Protocol
  tagline: "The governance system that turns AI agents into reliable architects — through constraints, self-audit, and directed evolution."
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
  - icon: 🧬
    title: "AAEP: Directed Evolution"
    details: "Every task strengthens the constraint system. Anti-patterns become prohibitions. Best practices become defaults. Quality monotonically increases."
  - icon: 🏛️
    title: "Single-Agent Governance"
    details: "One agent, full authority, complete accountability. No multi-agent coordination overhead. Constraint skills replace supervision."
  - icon: 🚫
    title: "Verifiable Prohibitions"
    details: "Every rule uses ❌ markers with grep-able patterns and positive alternatives. Tested by CI — not vague best practices."
  - icon: 🔧
    title: "Environment-Aware"
    details: "Auto-detects Cursor, Claude Code, Codex, Copilot, Windsurf, Gemini CLI. Deploys the right files to the right paths."
  - icon: 🛡️
    title: "Protocol + Tools"
    details: "Constraints catch architecture. Linters catch syntax. Stage 1.5 runs your linter automatically. Neither layer alone is sufficient."
  - icon: 🔄
    title: "4 Commands, Full Lifecycle"
    details: "/archon-init → /archon-demand → /archon-audit → /archon-refactor. One-line requirement, full delivery with 6-dimension audit."
---

<div class="vp-doc" style="max-width: 800px; margin: 0 auto; padding: 2rem;">

## What Is AAEP?

**AAEP** (AI Architect Evolution Protocol) defines how an AI agent evolves into a project's architect through continuous **constraint → execution → evolution** cycles.

AI coding tools provide **capability** — code generation, file operations, terminal execution. They don't provide **methodology** — workflow governance, quality assurance, experience accumulation.

AAEP is the methodology layer.

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

### Why Not Just Use ESLint?

| Dimension | ESLint | AAEP |
|-----------|--------|------|
| No `any` type | ✅ | ✅ |
| File size limits | ⚠️ | ✅ |
| Async: skeleton + error + retry per section | ❌ | ✅ |
| Tests updated for changed signatures | ❌ | ✅ |
| Module boundary violations | ❌ | ✅ |
| Off-screen deferred with IntersectionObserver | ❌ | ✅ |

ESLint catches syntax. AAEP catches architecture. **Both layers active — Stage 1.5 runs your linter automatically.**

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
