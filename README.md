# merkmod

Lightweight rules and skills for coding agents: Claude Code, Codex and Gemini/Antigravity.

One idea runs through all of it: **reward finished, proven work, not documents about work.**
No trackers, no status files, no progress reports. A step counts as done only when the test or
command that proves it is written next to it.

```sh
npx merkmod install
```

---

## How it works

merkmod installs two kinds of files into each agent's config folder.

**1. Rules (`AGENTS.md`), always loaded.** Every session starts with these. They set the
working loop and the honesty rules:

```
Analyse  →  Plan  →  you say "proceed"  →  Implement and prove
```

- **Analyse:** the agent reads the code, callers, consumers and tests. No edits yet.
- **Plan:** a small change is explained in chat. A bigger one gets a short plan file (see `plan` below).
- **Gate:** nothing is built until you reply "proceed", "go ahead" or "implement".
- **Implement and prove:** each step is done only when the agent names the test or command that
  proved it, with its result. Anything it couldn't run is marked "not verified". An unverified
  "done" is never allowed.

**2. Skills, loaded only when needed.** A skill is a folder with a `SKILL.md`. The agent reads
each skill's one-line description and loads the full text only when the task matches, so skills
cost almost nothing until used. You can also call one directly (see [Commands](#commands)).

| Skill | Use it for | What it makes the agent do |
|---|---|---|
| `plan` | Any change bigger than a few lines | Writes one short `docs/plans/<slug>.md` listing the steps and how each will be proven, waits for "proceed", then works step by step. A step is ticked only as `- [x] step — proof: go test ./x -run TestY → PASS`. When all steps are proven, the plan file is **deleted** in the final commit. The commit and its tests are the record. |
| `fix-bug` | Bug reports, regressions, wrong values, failing requests | 1. States the symptom exactly. 2. Reproduces it. 3. Walks back to the **first divergence**, the earliest point the value goes wrong, and labels the cause CONFIRMED / SUPPORTED / SPECULATIVE. 4. Writes a failing test. 5. Fixes the cause, not the output. 6. Reports in five lines. |
| `tdd` | Backend changes | Lists test scenarios first, writes a test and sees it fail, makes the smallest change that passes, and never edits an expected value just to go green. |
| `agent-memory` | Starting work in a repo, or after learning something durable | Reads `docs/agent-memory/INDEX.md` before work. Writes only verified, lasting facts (architecture, traps, decisions). Never session logs or status. |
| `simplify` | Before committing | Cleans up the diff only: duplication, dead code, needless helpers. No behaviour change, tests re-run after. |
| `performance` | Slow endpoints, timeouts, heavy batch jobs | Measures first, finds the real bottleneck (N+1 queries, serial work, missing index) before changing anything. |

---

## Install

Requires Node 18+.

```sh
npx merkmod install            # install or update everything
npx merkmod install --dry-run  # show what would change, change nothing
npx merkmod status             # show what is installed and whether each file is still there
npx merkmod uninstall          # remove exactly what merkmod installed
```

Where things go:

| Tool | Rules file | Skills folder |
|---|---|---|
| Claude Code | `~/.claude/CLAUDE.md` | `~/.claude/skills/` |
| Codex | `~/.codex/AGENTS.md` | `~/.codex/skills/` |
| Gemini / Antigravity | `~/.gemini/GEMINI.md` | `~/.gemini/config/skills/` |

Safe to run on a machine that already has config:

- A rules file you wrote yourself is **moved** to `<file>.bak-merkmod`, never overwritten.
  `uninstall` leaves those backups in place, so you can restore them.
- Skills you already have in those folders (your own, or a tool's built-in ones) are left alone.
- Running `install` again updates merkmod's skills and removes any that a newer version dropped.
  It knows what it owns from `~/.merkmod/manifest.json`.

Restart the agent (or open a new session) after installing so it picks up the rules and skills.

---

## Commands

You usually don't need any. The rules tell the agent which skill fits the task, and each
skill's description makes the agent load it automatically. To call one yourself:

| Skill | Claude Code | Codex | Gemini / Antigravity |
|---|---|---|---|
| plan | `/plan` | `$plan` | "use the plan skill" |
| fix-bug | `/fix-bug` | `$fix-bug` | "use the fix-bug skill" |
| tdd | `/tdd` | `$tdd` | "use the tdd skill" |
| agent-memory | `/agent-memory` | `$agent-memory` | "use the agent-memory skill" |
| simplify | `/simplify` | `$simplify` | "use the simplify skill" |
| performance | `/performance` | `$performance` | "use the performance skill" |

Antigravity activates skills from their descriptions and has no explicit skill command, so ask in
plain words. If a name clashes with a built-in command in your version of a tool, asking in
plain words always works.

---

## The process, step by step

### A feature or change

1. **Ask for it** normally: "Add a CSV export to the invoices page."
2. The agent **analyses** the code and writes `docs/plans/invoice-csv-export.md`:

   ```markdown
   # Invoice CSV export
   Problem: users can't export invoices; finance copies rows by hand.
   Touches: InvoicesPage, GET /invoices (filters), invoice serializer
   Out of scope: PDF export

   - [ ] export endpoint reuses list filters — api/invoices.go — proof: go test ./api -run TestExportCSV
   - [ ] Export button opens dialog — InvoicesPage.tsx — proof: vitest InvoicesPage.test.tsx
   - [ ] E2E: filter, export, file has filtered rows — proof: playwright invoices-export.spec.ts
   ```

3. **You review it** in chat and reply **"proceed"**. Nothing is built before this.
4. The agent works **one step at a time**: implement, run the proof, tick the step with the real
   result, move on.

   ```markdown
   - [x] export endpoint reuses list filters — proof: go test ./api -run TestExportCSV → PASS
   - [ ] E2E: filter, export, file has filtered rows — not verified: staging not deployed
   ```

5. **Finish.** Once every step has proof, the agent moves anything worth remembering into
   `docs/agent-memory/`, deletes the plan file, and commits. Its final report lists files changed,
   proof lines, and anything not verified.

If the scope grows mid-way, the agent stops, says so, and waits for another "proceed".

### A bug

1. **Report it** with what you saw: "Review button returns 400 for some employees in June."
2. The agent follows `fix-bug` and stops before fixing if the cause isn't confirmed:

   ```
   Symptom:      Review → 400 "summary not found" for employees the list shows as Ready
   Cause:        CONFIRMED. List treats a missing summary as all-zero; Review requires one.
   Fix:          list marks those rows "summary missing" and disables Review
   Proof:        go test ./register -run TestMissingSummaryBlocksReview → PASS
   Not verified: browser check on staging
   ```

### Repo memory

Give each repo a `docs/agent-memory/INDEX.md`. A few lines saying what the repo owns and how to
test it is enough to start. Agents read it at the start of work and add to it only after
something is verified. Commit it like code. It's the project's memory, shared by everyone and
every tool.

---

## Customising

- **Your own rules:** fork the repo, edit `AGENTS.md` or a `SKILL.md`, then run `./install.sh --apply`
  from the clone. That **symlinks** instead of copying, so your edits are live immediately.
  (`./install.sh` without `--apply` is a dry run.)
- **Project-specific rules** go in each repo's own `AGENTS.md`. merkmod's global rules stay general.
- **Adding a skill:** make `skills/<NAME>/SKILL.md` with `name:` and `description:` frontmatter.
  The description is what agents read to decide when to use it, so say exactly when it applies.

MIT licensed.
