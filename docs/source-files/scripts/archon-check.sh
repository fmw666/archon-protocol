#!/usr/bin/env sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
ROOT_DIR=${1:-"$SCRIPT_DIR/.."}

if command -v python3 >/dev/null 2>&1; then
  exec python3 "$SCRIPT_DIR/archon-check.py" --root "$ROOT_DIR"
fi

exec python "$SCRIPT_DIR/archon-check.py" --root "$ROOT_DIR"
