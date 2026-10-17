# ai-config
Single source of global agent rules + skills for Claude Code, Codex and Gemini/Antigravity.
- `AGENTS.md` - the only global rules file (linked into each tool).
- `skills/` - on-demand procedures.
- `./install.sh` (dry run) then `./install.sh --apply` on any machine.
Secrets never go here: MCP tokens stay in each machine's local config / env.
