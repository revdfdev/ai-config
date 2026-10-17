#!/usr/bin/env bash
# For each repo under the given dir that has AGENTS.md but no CLAUDE.md: add a one-line CLAUDE.md importing it and commit only that file locally.
set -u
root="${1:-.}"
for d in "$root"/*/; do
  [ -d "$d/.git" ] && [ -f "$d/AGENTS.md" ] && [ ! -e "$d/CLAUDE.md" ] || continue
  printf '@AGENTS.md\n' > "$d/CLAUDE.md"
  git -C "$d" add CLAUDE.md
  if git -C "$d" commit -q -m "Add CLAUDE.md importing AGENTS.md so Claude Code reads the repo rules" -- CLAUDE.md 2>/tmp/claude-md-err; then echo "ok   $d"; else echo "FAIL $d: $(head -c 150 /tmp/claude-md-err)"; fi
done
