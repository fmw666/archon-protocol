# Agents Reference

> In the new OS-model architecture, agents are organized by their OS role: **syscalls** (user-invoked) and **daemons** (internal). Source of truth lives in `docs/`.

## Subagent Format

For environments that support subagents (Cursor, Claude Code), protocol components are deployed as agent files:

```yaml
---
name: archon-example
description: When to use this agent.
readonly: true              # optional: restricts write permissions
skills:                     # optional: preload constraint drivers
  - archon-code-quality
---

System prompt / instructions in Markdown.
```

## Syscalls (User-Invoked)

| Name | Source | OS Equivalent | Preloads |
|------|--------|--------------|----------|
| archon-init | [`/syscalls/init`](/syscalls/init) | `boot()` | — |
| archon-demand | [`/syscalls/demand`](/syscalls/demand) | `exec()` | all 5 drivers |
| archon-audit | [`/syscalls/audit`](/syscalls/audit) | `stat()` | code-quality, test-sync |
| archon-refactor | [`/syscalls/refactor`](/syscalls/refactor) | `defrag()` | — |
| archon-verifier | [`/syscalls/verifier`](/syscalls/verifier) | `fsck()` | — |

## Daemons (Internal Services)

| Name | Source | OS Equivalent | Spawned By | Preloads |
|------|--------|--------------|-----------|----------|
| archon-self-auditor | [`/daemons/self-auditor`](/daemons/self-auditor) | `watchdogd` | demand Stage 3 | all 5 drivers |
| archon-test-runner | [`/daemons/test-runner`](/daemons/test-runner) | `testd` | demand Stage 3.4 | test-sync |

## Subagent vs Skill Deployment

| Capability | Subagent (Cursor/Claude Code) | Skill (Other tools) |
|-----------|------|-------|
| Isolated context | ✅ | ❌ |
| Preload constraints | ✅ | ❌ |
| Read-only mode | ✅ | ❌ |
| Model selection | ✅ | ❌ |
| 27+ tool support | ❌ | ✅ |

During [`/archon-init`](/syscalls/init), the protocol auto-detects which deployment format to use. See the [Migration Guide](/guide/migration) for details.
