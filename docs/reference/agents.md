# Agents Reference

Agents are subagent definitions for Cursor and Claude Code. Each runs in an isolated context window.

## Format

```yaml
---
name: archon-example
description: When to use this agent.
model: inherit              # optional: fast, inherit, or specific model
readonly: true              # optional: restricts write permissions
skills:                     # optional (Claude Code): preload skills
  - archon-code-quality
---

System prompt / instructions in Markdown.
```

## All Agents

### archon-init

| Field | Value |
|-------|-------|
| File | `agents/archon-init.md` |
| Trigger | `/archon-init` |
| Purpose | Bootstrap ecosystem or health check |

### archon-demand

| Field | Value |
|-------|-------|
| File | `agents/archon-demand.md` |
| Trigger | `/archon-demand <requirement>` |
| Purpose | Full 7-stage delivery pipeline |
| Preloads | archon-code-quality, archon-test-sync, archon-async-loading, archon-error-handling |

### archon-audit

| Field | Value |
|-------|-------|
| File | `agents/archon-audit.md` |
| Trigger | `/archon-audit` |
| Purpose | Project health check (0-100 score) |
| Mode | Read-only |

### archon-refactor

| Field | Value |
|-------|-------|
| File | `agents/archon-refactor.md` |
| Trigger | `/archon-refactor` |
| Purpose | Progressive refactoring plan |

### archon-self-auditor

| Field | Value |
|-------|-------|
| File | `agents/archon-self-auditor.md` |
| Called by | archon-demand Stage 3 |
| Purpose | 6-dimension code audit |
| Mode | Read-only |
| Preloads | All 4 constraint skills |

### archon-test-runner

| Field | Value |
|-------|-------|
| File | `agents/archon-test-runner.md` |
| Called by | archon-demand Stage 3.4 |
| Purpose | Test sync and execution |
| Preloads | archon-test-sync |

### archon-verifier

| Field | Value |
|-------|-------|
| File | `agents/archon-verifier.md` |
| Trigger | `/archon-verifier` |
| Purpose | Independent work validation |
| Mode | Read-only |

## Agent vs Skill

| Capability | Agent | Skill |
|-----------|-------|-------|
| Isolated context | ✅ | ❌ |
| Preload constraints | ✅ (Claude Code) | ❌ |
| Read-only mode | ✅ | ❌ |
| Model selection | ✅ | ❌ |
| 27+ tool support | ❌ | ✅ |

Use agents when available. Fall back to skills for tools that don't support subagents.
