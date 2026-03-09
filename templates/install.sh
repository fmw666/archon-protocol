#!/usr/bin/env bash
# Archon Protocol Installer — environment-aware, agent-first, skill-fallback.
# Usage:
#   bash archon-protocol/templates/install.sh [target_dir] [tool]
#
# tool: cursor | claude-code | codex | copilot | windsurf | gemini-cli | all (default)
# Examples:
#   bash install.sh .                  # deploy to all platforms
#   bash install.sh . cursor           # deploy only Cursor files
#   bash install.sh . claude-code      # deploy only Claude Code files

set -euo pipefail

TARGET="${1:-.}"
TOOL="${2:-all}"
AP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Archon Protocol Installer ==="
echo "Source:      $AP_DIR"
echo "Target:      $(cd "$TARGET" && pwd)"
echo "Environment: $TOOL"
echo ""

# ──────────────────────────────────────────────
# Environment → path mapping
# ──────────────────────────────────────────────
deploy_agents() {
  local dir="$1"
  local tool_label="$2"
  local count=0
  for agent_file in "$AP_DIR/agents"/*.md; do
    [ -f "$agent_file" ] || continue
    mkdir -p "$TARGET/$dir"
    cp "$agent_file" "$TARGET/$dir/"
    count=$((count + 1))
  done
  echo "  [agents] → $dir/ ($tool_label) — $count files"
}

deploy_skills() {
  local dir="$1"
  local tool_label="$2"
  local count=0
  for skill_dir in "$AP_DIR/skills"/*/; do
    [ -d "$skill_dir" ] || continue
    skill_name=$(basename "$skill_dir")
    mkdir -p "$TARGET/$dir/$skill_name"
    cp "$skill_dir/SKILL.md" "$TARGET/$dir/$skill_name/SKILL.md"
    count=$((count + 1))
  done
  echo "  [skills] → $dir/ ($tool_label) — $count files"
}

case "$TOOL" in
  cursor)
    deploy_agents ".cursor/agents" "Cursor"
    deploy_skills ".cursor/skills" "Cursor"
    ;;
  claude-code)
    deploy_agents ".claude/agents" "Claude Code"
    deploy_skills ".claude/skills" "Claude Code"
    ;;
  codex)
    deploy_skills ".codex/skills" "Codex"
    echo "  [agents] SKIPPED — Codex does not support agents"
    ;;
  copilot)
    deploy_skills ".cursor/skills" "Copilot"
    echo "  [agents] SKIPPED — Copilot does not support agents"
    ;;
  windsurf)
    deploy_skills ".cursor/skills" "Windsurf"
    echo "  [agents] SKIPPED — Windsurf does not support agents"
    ;;
  gemini-cli)
    deploy_skills ".claude/skills" "Gemini CLI"
    echo "  [agents] SKIPPED — Gemini CLI does not support agents"
    ;;
  all)
    deploy_agents ".cursor/agents" "Cursor"
    deploy_agents ".claude/agents" "Claude Code"
    deploy_skills ".cursor/skills" "Cursor"
    deploy_skills ".claude/skills" "Claude Code"
    deploy_skills ".codex/skills" "Codex"
    ;;
  *)
    echo "ERROR: Unknown tool '$TOOL'"
    echo "Valid options: cursor | claude-code | codex | copilot | windsurf | gemini-cli | all"
    exit 1
    ;;
esac

# ──────────────────────────────────────────────
# Project config template
# ──────────────────────────────────────────────
CONFIG="$TARGET/archon.config.yaml"
if [ ! -f "$CONFIG" ]; then
  cp "$AP_DIR/templates/archon.config.yaml" "$CONFIG"
  echo ""
  echo "  [config] → archon.config.yaml (created from template)"
else
  echo ""
  echo "  [config] → archon.config.yaml (already exists, skipped)"
fi

echo ""
echo "Done. Next: type /archon-init in your AI tool to complete setup."
echo "The init process will detect your environment and finalize configuration."
