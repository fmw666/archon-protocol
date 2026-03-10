# Archon Protocol — Init Prompt

> You are reading the Archon Protocol bootstrap prompt.
> Follow every step below to initialize the protocol in the user's project.
> Source: https://aaep.site | Repo: https://github.com/fmw666/archon-protocol

## Step 1: Detect Project State

Check if `archon.config.yaml` exists in the project root.

- **Not found** → fresh install (go to Step 2)
- **Found** → health check (go to Step 6)

## Step 2: Detect Execution Environment

Determine which AI tool is running this prompt.

### Auto-detection signals

| Signal | Indicates |
|--------|-----------|
| `.cursor/` directory exists at workspace root | Cursor |
| Running inside Claude Code (check your tool identity) | Claude Code |
| `.codex/` directory exists or Codex CLI detected | Codex |
| `.windsurfrules` file exists | Windsurf |
| None of the above | Ask user |

### If ambiguous or uncertain: ASK THE USER

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

| Tool | sub_agents | kernel_deploy | drivers_deploy | syscalls_deploy |
|------|-----------|---------------|----------------|-----------------|
| Cursor | ✅ | `.cursor/rules/archon-kernel.md` (NOT `AGENTS.md` — Cursor 对根目录 AGENTS.md 支持不稳定) | `.cursor/rules/archon-driver-*.md` | `.cursor/agents/archon-*.md` |
| Claude Code | ✅ | `CLAUDE.md` (append kernel section) | `.claude/skills/archon-*/SKILL.md` | `.claude/agents/archon-*.md` |
| Codex | ❌ | `AGENTS.md` | `.codex/skills/archon-*/SKILL.md` | `.codex/skills/archon-*/SKILL.md` |
| Copilot | ❌ | `.github/copilot-instructions.md` | `.cursor/skills/archon-*/SKILL.md` | `.cursor/skills/archon-*/SKILL.md` |
| Windsurf | ❌ | `.windsurfrules` (append) | `.cursor/skills/archon-*/SKILL.md` | `.cursor/skills/archon-*/SKILL.md` |
| Gemini CLI | ❌ | `AGENTS.md` | `.claude/skills/archon-*/SKILL.md` | `.claude/skills/archon-*/SKILL.md` |

## Step 3: Scan Project

Auto-detect the project's tech stack:

| What | How to detect |
|------|--------------|
| Language | File extensions (`.js`, `.ts`, `.py`, `.go`, `.rs`) |
| Framework | `package.json` deps (`next`, `react`, `vue`, `django`, `fastapi`) |
| i18n | `next-intl`, `react-intl`, `i18next` in deps |
| State | `redux`, `zustand`, `pinia` in deps |
| Test runner | `vitest`, `jest`, `pytest` in deps/config |

If multiple primary languages detected, warn the user and ask which is primary.

Scan for benchmark candidate modules (consistent structure + test coverage + type completeness). Suggest as `benchmarks.primary`, ask user to confirm.

## Step 4: Generate archon.config.yaml

Create `archon.config.yaml` in project root with detected values:

```yaml
environment:
  tool: ""          # detected tool name
  sub_agents: false # true for Cursor, Claude Code
  kernel_deploy: "" # path from capability matrix
  drivers_deploy: ""
  syscalls_deploy: ""

project:
  name: ""
  language: ""
  framework: ""

i18n:
  enabled: false
  library: ""
  locales: []

state:
  library: ""
  data_fetching: ""

testing:
  runner: ""
  test_dir_pattern: "__tests__"
  test_file_pattern: "*.test.{js,ts}"

benchmarks:
  primary: ""
  secondary: ""

conventions:
  commit_format: "conventional"
  max_file_lines:
    page: 350
    component: 300
    hook: 200
    utility: 200
    api_route: 150
```

## Step 5: Deploy Protocol Files

Based on detected environment, create all protocol files. Read each component's full content from the documentation site and deploy to the correct path.

### 5.1 Deploy Kernel

Read https://aaep.site/kernel/ and create the kernel file at `kernel_deploy` path.

**For Cursor** — create `.cursor/rules/archon-kernel.md` (NOT root `AGENTS.md` — Cursor 对根目录 AGENTS.md 支持不稳定):
```yaml
---
description: "Archon Protocol kernel — always loaded"
alwaysApply: true
---
```
Then append the kernel content (identity, memory map, drivers list, syscall interface, core loop). This uses Cursor's native rules mechanism which is reliable.

**For Claude Code** — append to `CLAUDE.md` (create if not exists).

**For other tools** — create `AGENTS.md` in project root.

### 5.2 Deploy Drivers (Constraint Skills)

Read each driver's content from `https://aaep.site/drivers/<name>` and deploy to `drivers_deploy` path.

Drivers to deploy:
1. `archon-code-quality` — file limits, type safety, prohibitions
2. `archon-test-sync` — test follows code, structural scans
3. `archon-async-loading` — skeleton, 3-state, retry, lazy load
4. `archon-error-handling` — structured errors, server/client patterns
5. `archon-handoff` — interface contracts, cross-boundary docs

**For Cursor** — create as `.cursor/rules/archon-driver-<name>.md` with frontmatter:
```yaml
---
description: "Archon driver: <name>"
globs: ["src/**"]
---
```

**For Claude Code / Codex / Other** — create as `<skills_dir>/archon-<name>/SKILL.md` with frontmatter:
```yaml
---
name: archon-<name>
description: "<driver description>"
---
```

**Framework-specific drivers**: If the detected framework matches, also deploy:
- `next` → `archon-nextjs-ssr`
- `react` or `next` → `archon-react-hydration`

### 5.3 Deploy Syscalls (Commands)

Read each syscall from `https://aaep.site/syscalls/<name>` and deploy to `syscalls_deploy` path.

Syscalls to deploy:
1. `archon-demand` — full delivery pipeline (preloads: code-quality, test-sync, async-loading, error-handling, handoff)
2. `archon-audit` — project health check (preloads: code-quality, test-sync) [readonly]
3. `archon-refactor` — progressive restructuring plan
4. `archon-verifier` — independent validation [readonly]

**For Cursor** — create as `.cursor/agents/archon-<name>.md` with frontmatter:
```yaml
---
name: archon-<name>
description: "<syscall description>"
# For audit/verifier:
# readonly: true
# For demand:
# skills:
#   - archon-code-quality
#   - archon-test-sync
#   - archon-async-loading
#   - archon-error-handling
#   - archon-handoff
---
```

**For Claude Code** — create as `.claude/agents/archon-<name>.md` with same frontmatter.

**For skill-only tools** — create as `<skills_dir>/archon-<name>/SKILL.md`.

### 5.4 Deploy Daemons (Internal Services)

Read each daemon from `https://aaep.site/daemons/<name>` and deploy alongside syscalls.

Daemons to deploy:
1. `archon-self-auditor` — 6-dim code audit (preloads all drivers) [readonly]
2. `archon-test-runner` — test sync and execution (preloads: test-sync)

Deploy format is the same as syscalls — subagent for Cursor/Claude Code, skill for others.

## Step 6: Health Check (if already installed)

Read `archon.config.yaml`, then verify:

1. **Environment match**: Does current tool match `environment.tool`? If not, warn and offer to reconfigure.
2. **Kernel**: Does the kernel file exist at `kernel_deploy` path?
3. **Drivers**: Do all 5 driver files exist at `drivers_deploy` paths?
4. **Syscalls**: Do all 4 syscall files exist at `syscalls_deploy` paths?
5. **Daemons**: Do all 2 daemon files exist?
6. **Config freshness**: Does config match actual project state?
7. Report any gaps.

## Output

```
Archon Protocol Init:
  Status: [FRESH INSTALL | HEALTH CHECK]
  Environment: <tool> (sub-agents: yes/no)
  Kernel: deployed to <path>
  Drivers: 5 deployed to <path>
  Syscalls: 4 deployed to <path>
  Daemons: 2 deployed to <path>
  Stack: <language> + <framework>
  Config: [CREATED | UP TO DATE]
  Result: [READY ✅ | NEEDS ATTENTION ⚠️]
```

---

*Archon Protocol — powered by AAEP (AI Architect Evolution Protocol)*
*Documentation: https://aaep.site | Source: https://github.com/fmw666/archon-protocol*
