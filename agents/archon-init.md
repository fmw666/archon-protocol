---
name: archon-init
description: >
  Bootstrap Archon Protocol (AAEP). Detects execution environment and project
  tech stack, generates config, deploys agents and skills to the correct paths,
  runs health check. Use at the start of a new project or session.
  Invoke with: /archon-init
---

You are initializing the Archon Protocol ecosystem powered by **AAEP** (AI Architect Evolution Protocol).

## Step 1: Detect Project State

Check if `archon.config.yaml` exists in the project root.

- **Not found** → fresh install (go to Step 2)
- **Found** → health check (go to Step 5)

## Step 2: Detect Execution Environment

Determine which AI tool is running this agent. This decides deploy paths, available capabilities, and workflow behavior.

### Auto-detection signals

| Signal | Indicates |
|--------|-----------|
| `.cursor/` directory exists at workspace root | Cursor |
| Running inside Claude Code (check tool identity) | Claude Code |
| `.codex/` directory exists or Codex CLI detected | Codex |
| `.windsurfrules` file exists | Windsurf |
| None of the above | Ask user |

### If ambiguous or uncertain: ASK THE USER

Present the options and let the user confirm:

```
Which AI tool are you using?
  1. Cursor
  2. Claude Code (claude-code)
  3. Codex
  4. Copilot
  5. Windsurf
  6. Gemini CLI
  7. Other (specify)
```

### Environment Capability Matrix

Once confirmed, record these values into `archon.config.yaml`:

| Tool | agents_supported | agents_dir | skills_dir | rules_file | sub_agents | constraint_preload |
|------|-----------------|------------|------------|------------|------------|-------------------|
| Cursor | true | `.cursor/agents` | `.cursor/skills` | `.cursor/rules/*.md` | true | true |
| Claude Code | true | `.claude/agents` | `.claude/skills` | `CLAUDE.md` | true | true |
| Codex | false | — | `.codex/skills` | — | false | false |
| Copilot | false | — | `.cursor/skills` | — | false | false |
| Windsurf | false | — | `.cursor/skills` | `.windsurfrules` | false | false |
| Gemini CLI | false | — | `.claude/skills` | — | false | false |
| Other | false | — | `.cursor/skills` | — | false | false |

### Capability implications

When `agents_supported = false`:
- Skip agent deployment entirely
- All workflows execute via SKILL.md discovery
- Constraint skills are read manually (no automatic preload)
- Inform user: "Your tool uses skill-only mode. Invoke workflows by mentioning the skill name."

When `sub_agents = false`:
- `archon-demand` stages 3.1–3.6 run inline (not as isolated sub-agents)
- Context window management becomes the user's responsibility

When `constraint_preload = false`:
- Agent cannot use `skills:` field in frontmatter
- Constraints must be read explicitly at the start of each task

## Step 3: Scan Project

Auto-detect the project's tech stack:

| What | How to detect |
|------|--------------|
| Language | File extensions (`.js`, `.ts`, `.py`, `.go`, `.rs`) |
| Framework | `package.json` deps (`next`, `react`, `vue`, `django`, `fastapi`) |
| i18n | `next-intl`, `react-intl`, `i18next` in deps; locale files |
| State management | `redux`, `zustand`, `pinia` in deps |
| Test runner | `vitest`, `jest`, `pytest` in deps/config |

### Multi-language detection

If multiple primary languages are detected (e.g., TypeScript + Python), warn the user:

```
⚠️ Multi-language project detected: TypeScript + Python
   Constraint skills are currently optimized for a single primary language.
   Recommendation: set `project.language` to your primary language in archon.config.yaml.
   Constraints will apply project-wide. Language-specific rules may need manual adjustment.
```

Record all detected languages in config. The primary language drives constraint selection; secondary languages are noted for awareness.

### Benchmark detection

Scan for candidate benchmark modules — directories with the highest combination of:
- Consistent structure (components, hooks, utils, types, tests all present)
- Test coverage (most test files relative to source files)
- Type completeness (all exports annotated)

Suggest the best candidate as `benchmarks.primary` in config. Ask the user to confirm or override:

```
📐 Benchmark candidate: src/features/account/
   Structure: components/ hooks/ utils/ types/ __tests__/ (5/5)
   Tests: 12 test files, 103 assertions
   Confirm as primary benchmark? [Y/n]
```

If no clear candidate exists, leave `benchmarks.primary` empty and note: "No benchmark module detected. Set manually in archon.config.yaml when a module reaches reference quality."

## Step 4: Generate Config & Deploy

1. Create `archon.config.yaml` with detected environment + stack values (including benchmarks)
2. Confirm ambiguous detections with user
3. Deploy files to environment-specific paths:
   - If `agents_supported`: copy agents to `agents_dir`
   - Always: copy skills to `skills_dir`
   - Only deploy constraint skills if tool can use them
4. **Framework-specific constraints**: If a matching template exists in `templates/constraints/`, deploy it as an additional constraint skill:
   - `next` → deploy `archon-nextjs-ssr` constraint skill
   - `react` or `next` → deploy `archon-react-hydration` constraint skill
   - Inform user which framework constraints were activated

## Step 5: Health Check (if already installed)

Read `archon.config.yaml` to determine environment, then verify:

1. **Environment match**: Does the current tool match `environment.tool`? If not, warn and offer to reconfigure.
2. **Agent files** (only if `agents_supported`): Verify all agent files exist in `agents_dir`
3. **Skill files**: Verify all skill files exist in `skills_dir`
4. **Config freshness**: Check config matches actual project state
5. Report any gaps

## Ecosystem Overview

### Agents (primary — Cursor + Claude Code only)

| Agent | Trigger | Purpose |
|-------|---------|---------|
| `archon-demand` | `/archon-demand <req>` | Full delivery pipeline |
| `archon-audit` | `/archon-audit` | Project health check (read-only) |
| `archon-refactor` | `/archon-refactor` | Progressive refactoring plan |
| `archon-self-auditor` | Called by demand | 6-dim code audit (read-only) |
| `archon-test-runner` | Called by demand | Test sync and execution |
| `archon-verifier` | `/archon-verifier` | Independent validation |

### Skills (fallback — all tools)

Same functionality as agents, for tools that don't support subagents. Plus constraint skills that define hard boundaries:

| Constraint Skill | When to activate |
|------------------|-----------------|
| `archon-code-quality` | Every code change |
| `archon-test-sync` | Every code change |
| `archon-async-loading` | Editing UI components |
| `archon-error-handling` | Editing API routes or components |
| `archon-handoff` | Cross-boundary changes (frontend↔backend, service↔service) |

Agents preload relevant constraint skills via the `skills` field — constraints are automatically injected into agent context.

## Output

```
Archon Protocol Init:
  Status: [FRESH INSTALL | HEALTH CHECK]
  Environment: <tool> (agents: yes/no, sub-agents: yes/no, preload: yes/no)
  Deploy: <agents_dir> + <skills_dir>
  Stack: <language> + <framework>
  Config: [CREATED | UP TO DATE | NEEDS UPDATE]
  Agents: N deployed (or SKIPPED — tool does not support agents)
  Skills: M deployed (N constraint + K workflow)
  Result: [READY ✅ | NEEDS ATTENTION ⚠️]
```
