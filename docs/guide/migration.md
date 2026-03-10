---
outline: deep
---

# Environment Migration Guide

Archon Protocol adapts to each AI development environment. This guide explains the deployment strategy for each supported tool and how the OS model maps to environment-specific file structures.

## Quick Start

Tell your AI tool:

```
Read this and follow the instructions: curl -s https://aaep.site/init.md
```

Or if you've cloned the repo:

```
/archon-init
```

The init process auto-detects your environment and deploys everything to the right location.

## OS Layer → File Mapping

The protocol has 4 layers. Each maps differently based on your environment:

| OS Layer | What It Contains | Role |
|----------|-----------------|------|
| **Kernel** | Identity, core loop, memory map | Always resident in AI context |
| **Drivers** | Constraint skills (❌ prohibitions) | Loaded per-command |
| **Syscalls** | User commands (init, demand, audit...) | Invoked by user |
| **Daemons** | Internal services (self-auditor, test-runner) | Spawned by syscalls |

---

## Cursor

Cursor supports **subagents** (isolated context) and **rules** (always-loaded context). This is the richest deployment target.

### File Layout

```
your-project/
├── .cursor/
│   ├── rules/
│   │   ├── archon-kernel.md              # Kernel (alwaysApply: true)
│   │   ├── archon-driver-code-quality.md # Driver
│   │   ├── archon-driver-test-sync.md    # Driver
│   │   ├── archon-driver-async-loading.md# Driver
│   │   ├── archon-driver-error-handling.md# Driver
│   │   └── archon-driver-handoff.md      # Driver
│   └── agents/
│       ├── archon-demand.md              # Syscall (subagent)
│       ├── archon-audit.md               # Syscall (subagent, readonly)
│       ├── archon-refactor.md            # Syscall (subagent)
│       ├── archon-verifier.md            # Syscall (subagent, readonly)
│       ├── archon-self-auditor.md        # Daemon (subagent, readonly)
│       └── archon-test-runner.md         # Daemon (subagent)
└── archon.config.yaml
```

### How It Works

1. **Kernel** → `.cursor/rules/archon-kernel.md` with `alwaysApply: true`
   - Always loaded into every conversation
   - Defines identity, core loop, constraint list

2. **Drivers** → `.cursor/rules/archon-driver-*.md`
   - Loaded as rules with `globs` matching source files
   - Also referenced via `skills:` field in subagent frontmatter

3. **Syscalls** → `.cursor/agents/archon-*.md`
   - Run as subagents with isolated context windows
   - Can preload drivers via `skills:` field in frontmatter
   - User invokes with `/archon-demand`, `/archon-audit`, etc.

4. **Daemons** → `.cursor/agents/archon-*.md`
   - Same format as syscalls, but invoked by other agents (not by user)
   - `archon-self-auditor` spawned by demand Stage 3
   - `archon-test-runner` spawned by demand Stage 3.4

### Subagent Features (Cursor-specific)

- **Isolated context**: Each subagent gets its own context window
- **Skill preloading**: Agents can declare `skills:` to preload constraint drivers
- **Read-only mode**: Audit agents use `readonly: true` to prevent modifications
- **Model selection**: Can specify `model:` in frontmatter for cost optimization

---

## Claude Code

Claude Code supports **agents** and **skills** with a similar model to Cursor.

### File Layout

```
your-project/
├── CLAUDE.md                             # Kernel (always loaded by Claude Code)
├── .claude/
│   ├── agents/
│   │   ├── archon-demand.md              # Syscall (subagent)
│   │   ├── archon-audit.md               # Syscall (subagent, readonly)
│   │   ├── archon-refactor.md            # Syscall (subagent)
│   │   ├── archon-verifier.md            # Syscall (subagent, readonly)
│   │   ├── archon-self-auditor.md        # Daemon (subagent, readonly)
│   │   └── archon-test-runner.md         # Daemon (subagent)
│   └── skills/
│       ├── archon-code-quality/SKILL.md  # Driver
│       ├── archon-test-sync/SKILL.md     # Driver
│       ├── archon-async-loading/SKILL.md # Driver
│       ├── archon-error-handling/SKILL.md# Driver
│       └── archon-handoff/SKILL.md       # Driver
└── archon.config.yaml
```

### How It Works

1. **Kernel** → `CLAUDE.md` — Claude Code's native always-loaded file
2. **Drivers** → `.claude/skills/` — preloaded via `skills:` in agent frontmatter
3. **Syscalls** → `.claude/agents/` — subagents with isolated context
4. **Daemons** → `.claude/agents/` — internal subagents

### Subagent Features (Claude Code-specific)

- **Skill preloading**: Native `skills:` field in YAML frontmatter
- **Isolated context**: Each agent runs independently
- **Read-only mode**: Supported via `readonly: true`

---

## Codex

Codex is skill-only — no subagent support.

### File Layout

```
your-project/
├── AGENTS.md                             # Kernel
├── .codex/
│   └── skills/
│       ├── archon-code-quality/SKILL.md  # Driver
│       ├── archon-test-sync/SKILL.md     # Driver
│       ├── archon-async-loading/SKILL.md # Driver
│       ├── archon-error-handling/SKILL.md# Driver
│       ├── archon-handoff/SKILL.md       # Driver
│       ├── archon-demand/SKILL.md        # Syscall (as skill)
│       ├── archon-audit/SKILL.md         # Syscall (as skill)
│       ├── archon-refactor/SKILL.md      # Syscall (as skill)
│       ├── archon-verifier/SKILL.md      # Syscall (as skill)
│       ├── archon-self-auditor/SKILL.md  # Daemon (as skill)
│       └── archon-test-runner/SKILL.md   # Daemon (as skill)
└── archon.config.yaml
```

### Limitations

- No subagent isolation — all workflows share the main context window
- No skill preloading — drivers must be read explicitly
- Demand stages 3.1-3.6 run inline instead of spawning daemons

---

## Copilot

### File Layout

```
your-project/
├── .github/
│   └── copilot-instructions.md           # Kernel
├── .cursor/
│   └── skills/
│       ├── archon-*/SKILL.md             # All drivers, syscalls, daemons as skills
└── archon.config.yaml
```

### Notes

- Kernel goes to `.github/copilot-instructions.md` (Copilot's native instruction file)
- All components deployed as skills in `.cursor/skills/` (compatible format)

---

## Windsurf

### File Layout

```
your-project/
├── .windsurfrules                        # Kernel (append)
├── .cursor/
│   └── skills/
│       ├── archon-*/SKILL.md             # All drivers, syscalls, daemons as skills
└── archon.config.yaml
```

### Notes

- Kernel appended to `.windsurfrules` (Windsurf's native rules file)
- All components deployed as skills

---

## Gemini CLI

### File Layout

```
your-project/
├── AGENTS.md                             # Kernel
├── .claude/
│   └── skills/
│       ├── archon-*/SKILL.md             # All drivers, syscalls, daemons as skills
└── archon.config.yaml
```

### Notes

- Uses `AGENTS.md` as kernel (compatible format)
- Skills deployed to `.claude/skills/` (compatible discovery)

---

## Comparison Matrix

| Feature | Cursor | Claude Code | Codex | Copilot | Windsurf | Gemini CLI |
|---------|--------|-------------|-------|---------|----------|------------|
| Subagents | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Skill preloading | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Read-only mode | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Always-loaded kernel | ✅ rules | ✅ CLAUDE.md | Partial | Partial | ✅ rules | Partial |
| Isolated daemon context | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

## Updating

When the protocol updates, re-run `/archon-init` or `curl -s https://aaep.site/init.md`. The init process detects existing installations and updates files while preserving your `archon.config.yaml` project settings.
