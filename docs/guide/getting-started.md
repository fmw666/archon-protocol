# Getting Started

Archon Protocol is a constraint system that turns AI coding agents into reliable architects. It provides agents, skills, and constraints that guide AI behavior during development.

## What Changes in Your Project?

Before AAEP, your project is just source code. After AAEP, it gains a complete AI governance layer — documents guide AI decisions (SHOULD), lint & tests enforce compliance (MUST).

```mermaid
graph LR
  subgraph before["<b>Before AAEP</b>"]
    direction TB
    B1["📁 src/"]
    B2["📄 package.json"]
    B3["📄 tsconfig.json"]
    B4["📄 .eslintrc.js"]
    B5["📁 tests/"]
    B6["📁 .github/workflows/"]
  end

  before -- "<b>/archon-init</b>" --> after

  subgraph after["<b>After AAEP</b>"]
    direction TB

    subgraph existing["Your Code <i>(unchanged)</i>"]
      A1["📁 src/"]
      A2["📄 tsconfig.json"]
    end

    subgraph kernel["🧠 Kernel <i>(NEW — always in AI context)</i>"]
      A3["📄 .cursor/rules/archon-kernel.md"]
      A4["📄 archon.config.yaml"]
      A5["📄 ai-index.md"]
    end

    subgraph docs["📂 Filesystem <i>(NEW — SHOULD layer)</i>"]
      A6["📁 docs/drivers/ — ❌ prohibitions"]
      A7["📁 docs/syscalls/ — commands"]
      A8["📁 docs/architecture/ — design docs"]
      A9["📁 docs/decisions/ — ADRs"]
    end

    subgraph enforce["⚡ Enforcement <i>(ENHANCED — MUST layer)</i>"]
      A10["📄 .eslintrc.js <b>+ AAEP lint rules</b>"]
      A11["📁 tests/ <b>+ structural scans</b>"]
      A12["📁 .github/workflows/ <b>+ lint & test gates</b>"]
      A13["📄 package.json <b>+ lint/test scripts</b>"]
    end
  end

  style existing fill:#f0f0f0,stroke:#999,color:#333
  style kernel fill:#fff3cd,stroke:#ffc107,color:#333
  style docs fill:#d1ecf1,stroke:#0dcaf0,color:#333
  style enforce fill:#d4edda,stroke:#198754,color:#333
```

**Legend**: <span style="color:#ffc107">**Yellow**</span> = new kernel files (always resident in AI context) · <span style="color:#0dcaf0">**Blue**</span> = new document layer (SHOULD — guides AI generation) · <span style="color:#198754">**Green**</span> = enhanced enforcement layer (MUST — lint rules, structural tests, CI gates)

> Documents achieve **SHOULD** — they guide AI but can be compressed in long conversations.
> Processes achieve **MUST** — lint and tests run in their own process, unbypassable. ([ADR-003](/decisions/ADR-003-executable-enforcement))

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

```mermaid
graph TD
  User["🧑 /archon-demand &lt;requirement&gt;"]

  User --> S0
  S0["<b>Stage 0</b>: Read refactor plan"]
  S0 --> S1

  subgraph should["SHOULD layer — document guidance"]
    S1["<b>Stage 1</b>: Implement under ❌ constraint skills"]
    S2["<b>Stage 2</b>: Performance audit"]
    S3["<b>Stage 3</b>: 7-dimension self-audit"]
  end

  S1 --> S15

  subgraph must["MUST layer — process enforcement"]
    S15["<b>Stage 1.5</b>: Run lint + test ✅❌"]
  end

  S15 --> S2
  S2 --> S3
  S3 --> S4

  S4["<b>Stage 4</b>: Fix all issues found"]
  S4 --> S36

  subgraph evolve["Evolution — SHOULD → MUST"]
    S36["<b>Stage 3.6</b>: New pattern? → proposed-rules.md<br/>Can it be a lint rule or test? → harden to MUST"]
  end

  S36 --> S5
  S5["<b>Stage 5</b>: Update refactor progress"]
  S5 --> S6
  S6["<b>Stage 6</b>: Commit ✅"]

  style should fill:#d1ecf1,stroke:#0dcaf0,color:#333
  style must fill:#d4edda,stroke:#198754,color:#333
  style evolve fill:#fff3cd,stroke:#ffc107,color:#333
```

- <span style="color:#0dcaf0">**Blue**</span> = SHOULD (document constraints guide generation)
- <span style="color:#198754">**Green**</span> = MUST (lint & test — unbypassable process enforcement)
- <span style="color:#ffc107">**Yellow**</span> = Evolution (new constraints graduate from SHOULD to MUST)

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
