# Syscalls

> **User-invoked commands that trigger kernel-level operations.**

Syscalls are the primary interface between the user and the Archon Protocol. Each maps to an OS-level operation.

## All Syscalls

| Command | OS Equivalent | Mode | Purpose |
|---------|--------------|------|---------|
| [`/archon-init`](/syscalls/init) | `boot()` | Read-write | Detect environment, deploy protocol, health check |
| [`/archon-demand`](/syscalls/demand) | `exec()` | Read-write | Full delivery pipeline for a requirement |
| [`/archon-audit`](/syscalls/audit) | `stat()` | Read-only | Project health check, scored 0-100 |
| [`/archon-refactor`](/syscalls/refactor) | `defrag()` | Read-write | Progressive restructuring plan |
| [`/archon-verifier`](/syscalls/verifier) | `fsck()` | Read-only | Independent integrity verification |

## Invocation

### In supported environments (Cursor, Claude Code)

Syscalls run as **subagents** with isolated context windows:

```
/archon-demand "add dark mode toggle"
```

The subagent gets its own context, preloads relevant [drivers](/drivers/), and executes the full pipeline without polluting the main conversation.

### In skill-only environments

Syscalls run as inline skills:

```
Please run the archon-demand workflow for: add dark mode toggle
```

### Remote bootstrap

For first-time setup without a local protocol copy:

```
curl -s https://aaep.site/init.md
```

The AI reads the init prompt and bootstraps the protocol in your project.

## Process Lifecycle

The primary syscall `/archon-demand` follows this lifecycle:

```
User: /archon-demand "add dark mode"
  │
  ├── Stage 0: Read refactor plan         (check process environment)
  ├── Stage 1: Implement                  (exec: write code)
  ├── Stage 1.5: Linter verification      (syscall: lint)
  ├── Stage 2: Performance audit          (check perf docs)
  ├── Stage 3: Self-audit                 (fork: spawn watchdog daemon)
  │   ├── 3.1 Rule scan                   (driver: code-quality)
  │   ├── 3.2 Structure check             (driver: code-quality)
  │   ├── 3.3 Edge cases                  (driver: error-handling)
  │   ├── 3.4 Test sync                   (fork: spawn test daemon)
  │   ├── 3.5 i18n check                  (driver: code-quality)
  │   └── 3.6 Knowledge evolution         (write: proposed-rules.md)
  ├── Stage 4: Fix issues found           (self-heal)
  ├── Stage 5: Update refactor progress   (sync)
  └── Stage 6: Commit                     (persist to disk)
```

## Daemons

Some syscalls spawn [daemons](/daemons/) — internal services that run in isolated context:

| Daemon | Spawned By | Purpose |
|--------|-----------|---------|
| [self-auditor](/daemons/self-auditor) | demand Stage 3 | 6-dimension code audit |
| [test-runner](/daemons/test-runner) | demand Stage 3.4 | Test discovery and execution |
