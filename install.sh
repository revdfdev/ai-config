#!/usr/bin/env bash
# Local-checkout install: symlinks this repo's AGENTS.md and skills into Claude Code, Codex and
# Gemini/Antigravity so edits here are live. Dry-run by default; pass --apply to change anything.
# Other machines: npx merkmod install (copies instead of linking).
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ "${1:-}" = "--apply" ]; then
  node "$HERE/bin/merkmod.js" install --link
else
  node "$HERE/bin/merkmod.js" install --link --dry-run
  echo "(re-run with --apply)"
fi
