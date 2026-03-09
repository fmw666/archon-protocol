#!/usr/bin/env bash
# Archon Protocol Installer — agent-first, skill-fallback.
# Usage: bash archon-protocol/templates/install.sh [target_dir]

set -euo pipefail

TARGET="${1:-.}"
AP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== Archon Protocol Installer ==="
echo "Source:  $AP_DIR"
echo "Target:  $(cd "$TARGET" && pwd)"
echo ""

# ──────────────────────────────────────────────
# 1. Deploy agents (Cursor + Claude Code)
# ──────────────────────────────────────────────
AGENT_DIRS=(".cursor/agents" ".claude/agents")
agent_count=0

for agent_root in "${AGENT_DIRS[@]}"; do
  for agent_file in "$AP_DIR/agents"/*.md; do
    [ -f "$agent_file" ] || continue
    target_dir="$TARGET/$agent_root"
    mkdir -p "$target_dir"
    cp "$agent_file" "$target_dir/"
    agent_count=$((agent_count + 1))
  done
  tool=$(echo "$agent_root" | cut -d/ -f1 | tr -d '.')
  echo "  [agents] → $agent_root/ ($tool)"
done

total_agents=$((agent_count / ${#AGENT_DIRS[@]}))

# ──────────────────────────────────────────────
# 2. Deploy skills (27+ tools)
# ──────────────────────────────────────────────
SKILLS_DIRS=(".cursor/skills" ".claude/skills" ".codex/skills")
skill_count=0

for skills_root in "${SKILLS_DIRS[@]}"; do
  for skill_dir in "$AP_DIR/skills"/*/; do
    [ -d "$skill_dir" ] || continue
    skill_name=$(basename "$skill_dir")
    target_skill="$TARGET/$skills_root/$skill_name"
    mkdir -p "$target_skill"
    cp "$skill_dir/SKILL.md" "$target_skill/SKILL.md"
    skill_count=$((skill_count + 1))
  done
  tool=$(echo "$skills_root" | cut -d/ -f1 | tr -d '.')
  echo "  [skills] → $skills_root/ ($tool)"
done

total_skills=$((skill_count / ${#SKILLS_DIRS[@]}))

# ──────────────────────────────────────────────
# 3. Project config template
# ──────────────────────────────────────────────
CONFIG="$TARGET/archon.config.yaml"
if [ ! -f "$CONFIG" ]; then
  cp "$AP_DIR/templates/archon.config.yaml" "$CONFIG"
  echo "  [config] → archon.config.yaml"
fi

echo ""
echo "Installed $total_agents agents + $total_skills skills:"
echo "  ✅ Cursor      — .cursor/agents/ + .cursor/skills/"
echo "  ✅ Claude Code  — .claude/agents/ + .claude/skills/"
echo "  ✅ Codex/others — .codex/skills/ (+ any SKILL.md-compatible tool)"
echo ""
echo "Next: type /archon-init in your AI tool to bootstrap the ecosystem."
