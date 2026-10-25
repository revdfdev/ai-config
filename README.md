# merkmod

Lightweight rules and skills for coding agents — Claude Code, Codex and Gemini/Antigravity — built around one idea:
**reward finished, proven work, not documents about work.**

```sh
npx merkmod install          # copy rules + skills into all three tools
npx merkmod install --dry-run
npx merkmod status
npx merkmod uninstall
```

## What you get

| Skill | What it does |
|---|---|
| `plan` | One short plan file. A step is ticked only with proof next to it (`go test … → PASS`) or marked "not verified". Deleted when done — the commit and its tests are the record. No trackers. |
| `fix-bug` | Symptom → reproduce → **first divergence** (earliest point the value goes wrong) → confidence label (CONFIRMED / SUPPORTED / SPECULATIVE) → failing test → fix the cause → five-line report. |
| `tdd` | Scenario list, test seen failing first, smallest change, never edit an expected value to go green. |
| `agent-memory` | Per-repo `docs/agent-memory/` (entry `INDEX.md`): read before work, write only verified, durable facts. No session logs. |
| `simplify` | Diff-only cleanup pass before commit; no behaviour change. |
| `performance` | Evidence-first latency/throughput work. |

Plus `AGENTS.md`, the global working rules: analyse → plan → wait for "proceed" → implement and prove.

## Where it installs

| Tool | Rules | Skills |
|---|---|---|
| Claude Code | `~/.claude/CLAUDE.md` | `~/.claude/skills/` |
| Codex | `~/.codex/AGENTS.md` | `~/.codex/skills/` |
| Gemini / Antigravity | `~/.gemini/GEMINI.md` | `~/.gemini/config/skills/` |

- Re-running `install` updates skills and removes ones dropped from the package (tracked in `~/.merkmod/manifest.json`).
- A file you already have at a target is moved to `*.bak-merkmod`, never overwritten. Other skills in those folders are left alone.
- Hacking on it: clone, then `./install.sh --apply` symlinks to the checkout so edits are live.

Requires Node 18+. MIT licensed.
