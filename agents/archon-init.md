---
name: archon-init
description: >
  Bootstrap Archon Protocol (AAEP). Detects project tech stack, generates config,
  deploys agents and skills, runs health check. Use at the start of a new project
  or session. Invoke with: /archon-init
---

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

1. Verify all agent files exist in `.cursor/agents/` or `.claude/agents/`
2. Verify all skill files exist in `.cursor/skills/` or `.claude/skills/`
3. Check config matches actual project
4. Report any gaps

## Ecosystem Overview

### Agents (primary — isolated context, Cursor + Claude Code)

| Agent | Trigger | Purpose |
|-------|---------|---------|
| `archon-demand` | `/archon-demand <req>` | Full delivery pipeline |
| `archon-audit` | `/archon-audit` | Project health check (read-only) |
| `archon-refactor` | `/archon-refactor` | Progressive refactoring plan |
| `archon-self-auditor` | Called by demand | 6-dim code audit (read-only) |
| `archon-test-runner` | Called by demand | Test sync and execution |
| `archon-verifier` | `/archon-verifier` | Independent validation |

### Skills (fallback — 27+ tools)

Same functionality as agents, for tools that don't support subagents. Plus constraint skills that define hard boundaries:

| Constraint Skill | When to activate |
|------------------|-----------------|
| `archon-code-quality` | Every code change |
| `archon-test-sync` | Every code change |
| `archon-async-loading` | Editing UI components |
| `archon-error-handling` | Editing API routes or components |

Agents preload relevant constraint skills via the `skills` field — constraints are automatically injected into agent context.

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
