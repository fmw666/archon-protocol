---
outline: deep
---

# /archon-init

> **`boot()` — Detect environment, load drivers, mount filesystem.**

Bootstrap the Archon Protocol ecosystem or run a health check on an existing installation.

**Invoke**: `/archon-init` or tell AI to read `curl -s https://aaep.site/init.md`

## Step 1: Detect Project State

Check if `archon.config.yaml` exists in the project root.

- **Not found** → fresh install (go to Step 2)
- **Found** → health check (go to Step 5)

## Step 2: Detect Execution Environment

Determine which AI tool is running. This decides deploy paths, capabilities, and workflow behavior.

### Auto-detection signals

| Signal | Indicates |
|--------|-----------|
| `.cursor/` directory exists at workspace root | Cursor |
| Running inside Claude Code (check tool identity) | Claude Code |
| `.codex/` directory exists or Codex CLI detected | Codex |
| `.windsurfrules` file exists | Windsurf |
| None of the above | Ask user |

### If ambiguous: ASK THE USER

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

| Tool | agents_supported | sub_agents | constraint_preload | kernel_target | drivers_target | syscalls_target |
|------|-----------------|------------|-------------------|---------------|----------------|-----------------|
| Cursor | ✅ | ✅ | ✅ | `.cursor/rules/archon-kernel.md` (NOT `AGENTS.md`) | `.cursor/rules/archon-driver-*.md` | `.cursor/agents/archon-*.md` |
| Claude Code | ✅ | ✅ | ✅ | `CLAUDE.md` | `.claude/skills/archon-*/SKILL.md` | `.claude/agents/archon-*.md` |
| Codex | ❌ | ❌ | ❌ | `AGENTS.md` | `.codex/skills/archon-*/SKILL.md` | `.codex/skills/archon-*/SKILL.md` |
| Copilot | ❌ | ❌ | ❌ | `.github/copilot-instructions.md` | `.cursor/skills/archon-*/SKILL.md` | `.cursor/skills/archon-*/SKILL.md` |
| Windsurf | ❌ | ❌ | ❌ | `.windsurfrules` | `.cursor/skills/archon-*/SKILL.md` | `.cursor/skills/archon-*/SKILL.md` |
| Gemini CLI | ❌ | ❌ | ❌ | `AGENTS.md` | `.claude/skills/archon-*/SKILL.md` | `.claude/skills/archon-*/SKILL.md` |

### Capability implications

When `agents_supported = false`:
- Skip subagent deployment entirely
- All workflows execute via skill discovery
- Constraint skills are read manually (no automatic preload)

When `sub_agents = false`:
- `/archon-demand` stages 3.1–3.6 run inline (not as isolated sub-agents)
- Context window management is the user's responsibility

When `constraint_preload = false`:
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

If multiple primary languages are detected, warn the user:

```
⚠️ Multi-language project detected: TypeScript + Python
   Constraint skills are currently optimized for a single primary language.
   Recommendation: set `project.language` to your primary language.
```

### Benchmark detection

Scan for candidate benchmark modules — directories with consistent structure, test coverage, and type completeness. Suggest as `benchmarks.primary`. Ask user to confirm.

## Step 4: Generate Config & Deploy

1. Create `archon.config.yaml` with detected environment + stack values
2. Confirm ambiguous detections with user
3. Deploy files to environment-specific paths (see [Migration Guide](/guide/migration)):
   - **Kernel** → deploy to `kernel_target`
   - **Drivers** → deploy to `drivers_target`
   - **Syscalls** → deploy to `syscalls_target` (subagent or skill format)
   - **Daemons** → deploy alongside syscalls
4. **Framework-specific drivers**: If a matching template exists, deploy it:
   - `next` → deploy `archon-nextjs-ssr`
   - `react` or `next` → deploy `archon-react-hydration`

## Step 5: Health Check (if already installed)

Read `archon.config.yaml` to determine environment, then verify:

1. **Environment match**: Does the current tool match `environment.tool`?
2. **Kernel**: Is the kernel file present at the expected path?
3. **Drivers**: Are all constraint skill files present?
4. **Syscalls**: Are all command files present?
5. **Config freshness**: Does config match actual project state?
6. Report any gaps

## Ecosystem Overview

### Syscalls (user-invoked)

| Syscall | Trigger | Purpose |
|---------|---------|---------|
| [`demand`](/syscalls/demand) | `/archon-demand <req>` | Full delivery pipeline |
| [`audit`](/syscalls/audit) | `/archon-audit` | Project health check (read-only) |
| [`refactor`](/syscalls/refactor) | `/archon-refactor` | Progressive refactoring plan |
| [`verifier`](/syscalls/verifier) | `/archon-verifier` | Independent validation |
| [`lint`](/syscalls/lint) | `/archon-lint` | Protocol integrity checks |

### Daemons (internal)

| Daemon | Spawned By | Purpose |
|--------|-----------|---------|
| [`self-auditor`](/daemons/self-auditor) | demand Stage 3 | 6-dim code audit |
| [`test-runner`](/daemons/test-runner) | demand Stage 3.4 | Test sync and execution |

### Drivers (constraints)

| Driver | Activated |
|--------|-----------|
| [`code-quality`](/drivers/code-quality) | Every code change |
| [`test-sync`](/drivers/test-sync) | Every code change |
| [`async-loading`](/drivers/async-loading) | UI component edits |
| [`error-handling`](/drivers/error-handling) | API/component edits |
| [`handoff`](/drivers/handoff) | Cross-boundary changes |

## Output

```
Archon Protocol Init:
  Status: [FRESH INSTALL | HEALTH CHECK]
  Environment: <tool> (agents: yes/no, sub-agents: yes/no, preload: yes/no)
  Kernel: deployed to <path>
  Drivers: N deployed to <path>
  Syscalls: N deployed to <path>
  Daemons: N deployed to <path>
  Stack: <language> + <framework>
  Config: [CREATED | UP TO DATE | NEEDS UPDATE]
  Result: [READY ✅ | NEEDS ATTENTION ⚠️]
```
