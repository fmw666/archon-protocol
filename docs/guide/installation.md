# Installation

## Automatic Install

```bash
bash archon-protocol/templates/install.sh [target_dir]
```

The script copies agents and skills to all supported tool directories:

| Files | Destination |
|-------|-------------|
| `agents/*.md` | `.cursor/agents/`, `.claude/agents/` |
| `skills/*/SKILL.md` | `.cursor/skills/`, `.claude/skills/`, `.codex/skills/` |
| `archon.config.yaml` | Project root (if not exists) |

## Manual Install

Copy the files yourself:

```bash
# Agents (Cursor + Claude Code)
cp archon-protocol/agents/*.md .cursor/agents/
cp archon-protocol/agents/*.md .claude/agents/

# Skills (all tools)
cp -r archon-protocol/skills/archon-*/ .cursor/skills/
cp -r archon-protocol/skills/archon-*/ .claude/skills/
cp -r archon-protocol/skills/archon-*/ .codex/skills/
```

## Verify Installation

```bash
npx vitest run --config archon-protocol/vitest.config.js
```

All tests passing = internal consistency verified.

Then run in your AI tool:

```
/archon-init
```

The init command performs a health check: verifies all files exist, config matches the project, and reports any gaps.

## Configuration

Edit `archon.config.yaml` to customize:

```yaml
name: my-project
stack:
  language: javascript
  framework: next
  test_runner: vitest
  i18n: next-intl
enabled_skills:
  - archon-code-quality
  - archon-test-sync
  - archon-async-loading
  - archon-error-handling
test_command: "npx vitest run"
```

## Updating

When Archon Protocol releases a new version, re-run the install script. It overwrites existing files but preserves your `archon.config.yaml`.
