# Architecture Overview

Archon Protocol uses a dual-layer architecture: **agents** as the primary interface (isolated context), **skills** as the portable fallback (27+ tools).

## Dual-Layer Model

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Agents (primary)                                          │
│  ──────────────                                            │
│  .cursor/agents/ + .claude/agents/                         │
│  Cursor and Claude Code only.                              │
│                                                            │
│  ✅ Isolated context window (no main conversation bloat)   │
│  ✅ Can preload constraint skills via `skills` field       │
│  ✅ Support readonly mode, model selection                 │
│  ✅ Invoked via /archon-demand, /archon-audit, etc.        │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Skills (fallback)                                         │
│  ────────────────                                          │
│  .cursor/skills/ + .claude/skills/ + .codex/skills/        │
│  27+ tools (Codex, Copilot, VS Code, Gemini CLI, etc.)    │
│                                                            │
│  ✅ Same workflow content as agents                        │
│  ✅ Portable SKILL.md format (open standard)               │
│  ✅ Auto-discovered by compatible tools                    │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Constraint Skills (preloaded into agents)                 │
│  ────────────────────────────────────────                  │
│  archon-code-quality, archon-test-sync,                    │
│  archon-async-loading, archon-error-handling               │
│                                                            │
│  ✅ Define hard boundaries (❌ prohibitions)                │
│  ✅ Injected into agent context at startup                 │
│  ✅ Auto-discovered by skill-only tools                    │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Namespace: `archon-` Prefix

All agents and skills are prefixed with `archon-` to avoid collisions with existing project files:

- `archon-demand` won't clash with a project's `demand` agent
- `archon-code-quality` won't clash with a project's `code-quality` skill

## Component Categories

### Command agents/skills (user-invoked)

| Name | Purpose |
|------|---------|
| `archon-init` | Bootstrap ecosystem, health check |
| `archon-demand` | Full delivery pipeline |
| `archon-audit` | Project health check (read-only) |
| `archon-refactor` | Progressive refactoring plan |
| `archon-verifier` | Independent validation |

### Internal agents/skills (called by commands)

| Name | Called by | Purpose |
|------|----------|---------|
| `archon-self-auditor` | demand Stage 3 | 6-dimension code audit |
| `archon-test-runner` | demand Stage 3.4 | Test sync and execution |

### Constraint skills (no agent equivalent)

| Name | Activated when |
|------|---------------|
| `archon-code-quality` | Every code change |
| `archon-test-sync` | Every code change |
| `archon-async-loading` | Editing UI components |
| `archon-error-handling` | Editing API routes |

## Cross-Tool Compatibility

| Tool | Agents | Skills | Constraints |
|------|--------|--------|-------------|
| Cursor | ✅ | ✅ | ✅ (preloaded) |
| Claude Code | ✅ | ✅ | ✅ (preloaded) |
| Codex | — | ✅ | ✅ |
| Copilot | — | ✅ | ✅ |
| VS Code | — | ✅ | ✅ |
| Gemini CLI | — | ✅ | ✅ |

## Environment-Aware Deployment

`/archon-init` detects the execution environment and deploys files to the correct paths. If detection is ambiguous, it asks the user to confirm.

### Environment Capability Matrix

| Capability | Cursor | Claude Code | Codex | Copilot | Windsurf | Gemini CLI |
|------------|--------|-------------|-------|---------|----------|------------|
| Agents | `.cursor/agents` | `.claude/agents` | — | — | — | — |
| Skills | `.cursor/skills` | `.claude/skills` | `.codex/skills` | `.cursor/skills` | `.cursor/skills` | `.claude/skills` |
| Rules file | `.cursor/rules/` | `CLAUDE.md` | — | — | `.windsurfrules` | — |
| Sub-agents | ✅ | ✅ | — | — | — | — |
| Constraint preload | ✅ (`skills:` field) | ✅ (`skills:` field) | — | — | — | — |

### What changes per environment

- **Agents supported** (Cursor, Claude Code): Full dual-layer architecture. Agents invoke sub-agents for isolated audit stages. Constraint skills preloaded via `skills:` frontmatter field.
- **Skills only** (Codex, Copilot, Windsurf, Gemini CLI): Skill-only mode. Workflows discovered as SKILL.md files. Constraints read explicitly at task start. No isolated sub-agent context — all stages run inline.

This is stored in `archon.config.yaml` under the `environment:` section and used by health checks and subsequent commands.
