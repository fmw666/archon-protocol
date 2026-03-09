# Getting Started

Archon Protocol is a constraint system that turns AI coding agents into reliable architects. It provides agents, skills, and constraints that guide AI behavior during development.

## Prerequisites

- An AI coding tool: Cursor, Claude Code, Codex, VS Code with Copilot, or any tool supporting SKILL.md
- A project with source code

## Quick Install

```bash
bash archon-protocol/templates/install.sh
```

This deploys:
- **Agents** → `.cursor/agents/`, `.claude/agents/`
- **Skills** → `.cursor/skills/`, `.claude/skills/`, `.codex/skills/`
- **Config** → `archon.config.yaml`

## First Run

In your AI tool, type:

```
/archon-init
```

The init command scans your project, detects the tech stack, and confirms everything is deployed correctly.

## Daily Usage

### Feature development

```
/archon-demand Add dark mode toggle to settings
```

This triggers the full delivery pipeline: implement → performance audit → 6-dimension self-audit → fix → test sync → knowledge evolution → commit.

### Health check

```
/archon-audit
```

Read-only project-wide audit with a scored report (0-100).

### Architecture planning

```
/archon-refactor
```

Generates a progressive refactoring plan. Future `/archon-demand` calls automatically align with the plan.

## How It Works

```
You say one line → Agent does everything

/archon-demand "add user settings page"
  │
  ├─ Stage 0: Read refactor plan (if exists)
  ├─ Stage 1: Implement (under constraint skills)
  ├─ Stage 1.5: Linter verification
  ├─ Stage 2: Performance audit
  ├─ Stage 3: 6-dimension self-audit
  ├─ Stage 4: Fix all issues
  ├─ Stage 5: Update refactor progress
  └─ Stage 6: Commit
```

## Choosing the Right Mode

Not every task needs the full pipeline. Use opt-out flags to match the task:

| Scenario | Command | What runs |
|----------|---------|-----------|
| Complex feature | `/archon-demand add user settings` | All stages (full pipeline) |
| Quick hotfix | `/archon-demand quick fix typo in header` | Stages 0, 1, 1.5, 3.1–3.4, 4, 6 |
| Exploration (no commit) | `/archon-demand no-commit try new layout` | All stages except commit |
| Styling only | `/archon-demand quick skip-tests update button colors` | Stages 0, 1, 1.5, 3.1–3.3, 4, 6 |

**Decision tree:**

```
Is this a complex feature or refactor?
  → Yes: use full pipeline (no flags)
  → No:
      Is this a quick fix or small change?
        → Yes: add `quick`
      Do you want to review before committing?
        → Yes: add `no-commit`
      Is this purely visual (no logic change)?
        → Yes: add `skip-tests`
```

## Tool Compatibility

| Tool | What you get |
|------|-------------|
| **Cursor** | Agents (primary) + Skills |
| **Claude Code** | Agents (primary) + Skills |
| **Codex, Copilot, VS Code** | Skills only |
| **Any SKILL.md tool** | Skills only |

Agents provide isolated context windows. Skills provide the same workflows in a portable format.
