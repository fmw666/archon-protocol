# Drivers

> **Loaded into kernel space via the `skills:` field. Drivers are not suggestions — they are law.**

Drivers are constraint skills that define hard boundaries (❌ prohibitions). Like hardware drivers that translate high-level intent into low-level enforcement, constraint skills translate "write good code" into "no `any` type, no empty `catch`."

## Loading Mechanism

Drivers are injected into the agent's context alongside the kernel via the `skills:` field in agent YAML frontmatter — the equivalent of `modprobe` in Linux:

```yaml
# archon-demand.md frontmatter
skills:
  - archon-code-quality
  - archon-test-sync
  - archon-async-loading
  - archon-error-handling
  - archon-handoff
```

## All Drivers

| Driver | OS Equivalent | Activated | Purpose |
|--------|--------------|-----------|---------|
| [code-quality](/drivers/code-quality) | Storage driver | Every code change | File limits, type safety, naming |
| [test-sync](/drivers/test-sync) | FS integrity driver | Every code change | Tests follow code changes |
| [async-loading](/drivers/async-loading) | Display driver | UI component edits | Skeleton, retry, lazy load |
| [error-handling](/drivers/error-handling) | Network driver | API/component edits | Structured error patterns |
| [handoff](/drivers/handoff) | IPC driver | Cross-boundary changes | Interface contracts |

## Framework-Specific Drivers (Optional)

Deployed by [`/archon-init`](/syscalls/init) when a matching framework is detected:

| Driver | Framework | Covers |
|--------|-----------|--------|
| `archon-nextjs-ssr` | Next.js | Server Components, hydration safety |
| `archon-react-hydration` | React, Next.js | State initialization, mutation sequencing |

## Deployment

During [`/archon-init`](/syscalls/init), drivers are deployed to environment-specific paths:

| Environment | Deploy Path | Preload Support |
|------------|-------------|-----------------|
| Cursor | `.cursor/rules/archon-*.md` or `.cursor/skills/archon-*/SKILL.md` | ✅ via `skills:` field |
| Claude Code | `.claude/skills/archon-*/SKILL.md` | ✅ via `skills:` field |
| Codex | `.codex/skills/archon-*/SKILL.md` | ❌ read manually |
| Other | Project-local skills directory | ❌ read manually |

## Evolution

Drivers evolve through a controlled lifecycle:

```
Discover problem → proposed-rules.md → User approval → Driver update
```

Stage 3.6 of [`/archon-demand`](/syscalls/demand) proposes new prohibitions. They are staged in `proposed-rules.md` and only graduate to drivers after human approval.
