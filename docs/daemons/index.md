# Daemons

> **Internal services, never directly invoked by users. Spawned by syscalls as child processes.**

Daemons run in isolated context windows, keeping their internal reasoning separate from the main conversation. Like OS daemons that run in their own address space, these agents' work doesn't pollute the main process's working memory.

## All Daemons

| Daemon | OS Equivalent | Spawned By | Mode | Purpose |
|--------|--------------|-----------|------|---------|
| [self-auditor](/daemons/self-auditor) | `watchdogd` | `/archon-demand` Stage 3 | Read-only | 6-dimension code audit |
| [test-runner](/daemons/test-runner) | `testd` | `/archon-demand` Stage 3.4 | Read-write | Test sync and execution |

## Why Isolated Context

The audit daemon may scan 200 prohibitions across 50 files. The test runner may execute dozens of test suites. Running these in the main conversation would consume the context window budget. By spawning them as isolated processes (subagents), the main process only receives the summary output.

## Subagent Support

| Environment | Daemons run as... |
|------------|-------------------|
| Cursor | Subagents (isolated context) ✅ |
| Claude Code | Subagents (isolated context) ✅ |
| Other tools | Inline execution (shared context) |

When the environment doesn't support subagents, daemon workflows run inline within the parent syscall. The stages still execute in order, but share the same context window.
