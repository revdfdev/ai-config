#!/usr/bin/env bash
# Links this repo's AGENTS.md and skills into Claude Code, Codex and Gemini/Antigravity.
# Dry-run by default; pass --apply to change anything. Existing regular files are moved (existing symlinks are just replaced) to *.bak-ai-config first.
set -euo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APPLY=0; [ "${1:-}" = "--apply" ] && APPLY=1

link() { # link <source> <target>
  local src="$1" dst="$2"
  if [ -L "$dst" ] && [ "$(readlink "$dst")" = "$src" ]; then echo "ok      $dst"; return; fi
  echo "link    $dst -> $src"
  [ $APPLY -eq 1 ] || return 0
  mkdir -p "$(dirname "$dst")"
  if [ -L "$dst" ]; then rm "$dst"; elif [ -e "$dst" ]; then mv "$dst" "$dst.bak-ai-config"; fi
  ln -s "$src" "$dst"
}

link "$HERE/AGENTS.md" "$HOME/.claude/CLAUDE.md"
link "$HERE/AGENTS.md" "$HOME/.codex/AGENTS.md"
link "$HERE/AGENTS.md" "$HOME/.gemini/GEMINI.md"

for dir in "$HERE"/skills/*/; do
  name="$(grep -m1 '^name:' "$dir/SKILL.md" | sed 's/^name:[[:space:]]*//' || true)"
  [ -n "$name" ] && link "${dir%/}" "$HOME/.claude/skills/$name"
done
[ $APPLY -eq 1 ] || echo "(dry run - re-run with --apply)"
