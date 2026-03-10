# AGENTS.md — Kernel Fallback

> This file exists for Claude Code, Codex, Gemini CLI and other tools that read `AGENTS.md` as their kernel entry point.
> **Cursor users**: The kernel is at `.cursor/rules/archon-kernel.md` (alwaysApply: true).

For the full kernel specification, read `.cursor/rules/archon-kernel.md` or `docs/kernel/index.md`.

## Quick Reference

- **Kernel**: `.cursor/rules/archon-kernel.md` (Cursor) | `CLAUDE.md` (Claude Code)
- **Drivers**: `docs/drivers/` — constraint skills with ❌ prohibitions
- **Syscalls**: `docs/syscalls/` — user-invoked commands
- **Daemons**: `docs/daemons/` — internal services
- **Init**: `/archon-init` or `curl -s https://aaep.site/init.md`
- **Config**: `archon.config.yaml`

## Core Loop

1. **AUDIT** — Check constraints before acting
2. **PLAN** — Conflict? → Update spec or create exception
3. **EXECUTE** — Write code, enforce every driver
4. **EVOLVE** — Spot debt → fix or queue. New pattern → propose rule.

## Runtime

- `pnpm test` — run tests
- `pnpm docs:build` — build documentation
- `pnpm docs:dev` — dev server
