---
name: archon-init
description: >
  Bootstrap for Archon Protocol (AAEP). Detects project tech stack, generates config,
  deploys agents and skills. Agents are primary (isolated context); skills are portable
  fallback. Run this first in any new session or project. Invoke with: /archon-init
---

# Archon Protocol — Init

You are initializing the Archon Protocol ecosystem powered by **AAEP** (AI Architect Evolution Protocol).

## Step 1: Detect Project State

Check if `archon.config.yaml` exists in the project root.

- **Not found** → fresh install (go to Step 2)
- **Found** → health check (go to Step 4)

## Step 2: Scan Project

Auto-detect the project's tech stack:

| What | How to detect |
|------|--------------|
| Language | File extensions (`.js`, `.ts`, `.py`, `.go`, `.rs`) |
| Framework | `package.json` deps (`next`, `react`, `vue`, `django`, `fastapi`) |
| i18n | `next-intl`, `react-intl`, `i18next` in deps; locale files |
| State management | `redux`, `zustand`, `pinia` in deps |
| Test runner | `vitest`, `jest`, `pytest` in deps/config |

## Step 3: Generate Config

Create `archon.config.yaml` with detected values. Confirm ambiguous detections with user.

## Step 4: Health Check (if already installed)

1. Verify agent files exist in `.cursor/agents/` or `.claude/agents/`
2. Verify skill files exist in `.cursor/skills/` or `.claude/skills/`
3. Check config matches actual project
4. Report any gaps

## Ecosystem: Agent-First, Skill-Fallback

### Strategy

```
Tool supports agents? (Cursor, Claude Code)
  → Use agents (isolated context, can preload constraint skills)
  → /archon-demand, /archon-audit, /archon-refactor, etc.

Tool only supports skills? (Codex, Copilot, VS Code, Gemini CLI, etc.)
  → Use skills (same content, portable SKILL.md format)
```

### Agents (primary — Cursor + Claude Code)

| Agent | Trigger | Purpose |
|-------|---------|---------|
| `archon-demand` | `/archon-demand <req>` | Full delivery pipeline |
| `archon-audit` | `/archon-audit` | Project health check (read-only) |
| `archon-refactor` | `/archon-refactor` | Progressive refactoring plan |
| `archon-self-auditor` | Called by demand | 6-dim code audit (read-only) |
| `archon-test-runner` | Called by demand | Test sync and execution |
| `archon-verifier` | `/archon-verifier` | Independent validation |

### Skills (fallback — 27+ tools)

Same workflow content as agents, in portable SKILL.md format:

| Skill | Mirrors Agent |
|-------|--------------|
| `archon-demand` | `archon-demand` agent |
| `archon-audit` | `archon-audit` agent |
| `archon-refactor` | `archon-refactor` agent |
| `archon-self-auditor` | `archon-self-auditor` agent |
| `archon-test-runner` | `archon-test-runner` agent |
| `archon-verifier` | `archon-verifier` agent |

### Constraint Skills (no agent equivalent — preloaded into agents)

| Skill | When to activate |
|-------|-----------------|
| `archon-code-quality` | Every code change |
| `archon-test-sync` | Every code change |
| `archon-async-loading` | Editing UI components |
| `archon-error-handling` | Editing API routes or components |

Agents preload relevant constraints via `skills` field in frontmatter.

## Output

```
Archon Protocol Init:
  Status: [FRESH INSTALL | HEALTH CHECK]
  Stack: <language> + <framework>
  Config: [CREATED | UP TO DATE | NEEDS UPDATE]
  Agents: N deployed
  Skills: M deployed (N constraint + K workflow)
  Result: [READY ✅ | NEEDS ATTENTION ⚠️]
```
