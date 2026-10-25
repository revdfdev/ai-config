# ai-config
One set of global agent rules and skills for Claude Code, Codex and Gemini/Antigravity.

- `AGENTS.md` - global rules, installed as `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, `~/.gemini/GEMINI.md`.
- `skills/` - on-demand procedures, installed into `~/.claude/skills`, `~/.codex/skills`, `~/.gemini/config/skills`:
  `plan` (proof-gated steps, no trackers), `fix-bug` (first-divergence root cause), `tdd`, `agent-memory`
  (per-repo `docs/agent-memory/`), `simplify`, `performance`, `attendance-calculation-policy-analysis`.

## Install
- Any machine: `npx ai-config install` (copies; `--dry-run` to preview, `status`, `uninstall`).
- This checkout, live-editing: `./install.sh` (dry run) then `./install.sh --apply` (symlinks).

Re-running install prunes skills removed from the package. Files you own at a target are moved to `*.bak-ai-config`, never overwritten.
Secrets never go here: MCP tokens stay in each machine's local config / env.
