# merkmod

Skills for Claude Code, Codex and Gemini/Antigravity that make coding agents finish and prove
their work instead of writing documents about it.

```sh
npx merkmod setup
```

Restart your agent. The skills are available. Run the same command again to update.

## The skills

| Skill | What the agent does |
|---|---|
| `plan` | For bigger changes: writes a short plan, waits for you to say **"proceed"**, then works one step at a time. A step is ticked only with proof next to it (`go test ./x → PASS`) or marked "not verified". The plan file is deleted when everything is proven. |
| `fix-bug` | For bugs: states the symptom, reproduces it, finds the **first point the value goes wrong**, says how sure it is (CONFIRMED / SUPPORTED / SPECULATIVE), writes a failing test, fixes the cause, reports in five lines. |
| `tdd` | For backend changes: lists test cases, sees a test fail first, makes the smallest change that passes. |
| `agent-memory` | Keeps `docs/agent-memory/` in your repo: reads it before work, adds only verified facts after. |
| `simplify` | Before committing: cleans up the diff without changing behaviour. |
| `performance` | For slow code: measures first, then fixes the real bottleneck. |

The agent picks the right skill from your request. To ask for one directly:

| | Claude Code | Codex | Gemini / Antigravity |
|---|---|---|---|
| example | `/fix-bug` | `$fix-bug` | "use the fix-bug skill" |

## What setup changes

- Copies the skills into `~/.claude/skills`, `~/.codex/skills` and `~/.gemini/config/skills`.
- Nothing else. Your `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` and your projects are not touched.
- If you already have a skill with the same name, yours is kept and merkmod's is skipped.

```sh
npx merkmod setup --dry-run   # show what would change
npx merkmod uninstall         # remove merkmod's skills, leave yours
```

Requires Node 18+. MIT licensed.
