#!/usr/bin/env bash
# Install all /apex:* slash commands from 37_command_protocol/slash_commands/
# into ~/.claude/commands/ so Claude Code resolves them.
# Run this after any playbook update.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SRC="$REPO_ROOT/37_command_protocol/slash_commands"
DST="$HOME/.claude/commands"

mkdir -p "$DST"
count=0
for f in "$SRC"/apex_*.md; do
  name="$(basename "$f")"
  dest="${name/apex_/apex:}"
  cp "$f" "$DST/$dest"
  count=$((count + 1))
done
echo "Installed $count apex commands to $DST"
