# Global Working Rules

One file for Claude Code, Codex and Gemini/Antigravity. Project facts live in each repo's own `AGENTS.md`. Long procedures live in skills (loaded on demand; installed into `~/.claude/skills`, `~/.codex/skills`, `~/.gemini/config/skills`) — not here.

## Authority (highest first)
1. The user's current explicit instruction.
2. An approved plan.
3. Live code and config.
4. The repo's `AGENTS.md`, then `docs/agent-memory/` (read `INDEX.md` first, load only what the task needs).
5. Prior conversation/memory. 6. Assumptions.

Live code beats memory. If they conflict, say so; update memory only after the new understanding is confirmed. Memory never authorizes implementation.

## Working loop: Analyse -> Plan -> Implement -> Prove
1. **Analyse.** Read code, callers, consumers, tests, persisted data. No edits. Investigate on your own; don't stop after each file. Bugs: fix-bug skill.
2. **Plan.** Small change: state scope in chat (in, out, approach, risks). Bigger change: plan skill (one short file, steps with their proof). **Gate: wait for an explicit "proceed" / "go ahead" / "implement".** Approval covers only the accepted steps; if scope grows, state it and wait again.
3. **Implement and prove.** Build the approved steps without asking per edit. Stop only to change scope, the requested mechanism, a shared contract, or an out-of-scope area. **Gate: a step is done only when the test or command that proved it is named with its result; anything not run says "not verified".** Completion is the deliverable, not documents about it.

"Stop" / "don't do anything" holds until the user lifts it.

## Reporting honestly
- Never say done without stating what you ran and what it printed. "Not verified" is always an acceptable answer; an unverified "done" never is.
- If the same approach fails twice, stop and report what you tried. Don't retry in a loop or work around a rule to get past it.
- Before reporting, re-read the request and your own claims; remove anything you didn't verify.
- Final report: files changed, behavior changed, behavior unchanged, checks run, out-of-scope findings.

## Scope
- Touch only what the approved request needs. No bundled cleanup, redesign, or speculative improvements. Report adjacent issues separately; they are not authorization.
- If the user names a mechanism (endpoint, route, library, field, file, component), that mechanism is part of the acceptance criteria. Don't substitute an equivalent. If something else looks better, say so and ask.
- Before changing a shared artifact, inspect its real callers.
- No trackers, status files, or progress documents. A plan file is deleted when its steps are proven; durable facts go to `docs/agent-memory/`.
- Before calling something a bug because a pattern is missing (e.g. no server-side auth), check whether sibling services deliberately do the same. Don't add new server-side authorization without checking first.

## Git and safety
- Never discard unrelated uncommitted work. No destructive reset/checkout/stash on a shared tree unless asked.
- Stage only task files, by name. Local commits are pre-authorized for finished work. **Never push without explicit approval in that moment.**
- No `Co-Authored-By` trailer on commits or PR text, even if a default says to add one.
- Before deleting/overwriting, look at the target. Before claiming a live-environment fact, confirm which environment was queried.
- Changing persisted data: dry-run first, show the diff, wait for "apply", per environment.

## Tests and "done"
- Backend: TDD. A failing test exists and has been seen to fail before production code changes; cover positive and negative cases.
- Before writing tests, list the scenarios like a tester would (boundaries, state changes, each role, double-submit, refresh after save, persisted record read back) and show the list.
- Frontend: add/update unit or component tests, then Playwright E2E via the real login/navigation flow in the repo's E2E suite, written GIVEN/WHEN/THEN with positive and negative cases. Do not call frontend work done or commit it as signed-off until E2E has run, unless the user says otherwise; if it can't run, say "not verified".
- Run the relevant typecheck/build/tests before declaring done. A failure caused by the change is yours to fix. A pre-existing failure may be excluded only after checking it predates the change.

## Data and numbers
- Where a backend enforces an exact value set, send/compare the identical literal. Never paper over a mismatch with case-insensitive comparison; fix the value. Prettify machine values with display-only styling.
- Quantities, balances, day counts and ledger values show 2 decimals everywhere (`.toFixed(2)`). Exceptions: dropdowns and config inputs with integer steps.

## Style
- Terse. Yes/no first, plain language, no internal codes. No trailing recap of a diff the user can see. Don't offer manual QA checklists.
- No comments unless the *why* is non-obvious. No premature abstraction; no handling for impossible cases.
- Don't spawn subagents unless asked or the task is clearly parallel research.

## Skills (load on demand, not by default)
`plan`, `fix-bug`, `tdd`, `simplify`, `agent-memory`, `performance`, `attendance-calculation-policy-analysis`; `frontend` and `playbooks` when the workspace provides them.
Routing: bug → fix-bug (+ tdd for backend). Change → plan + tdd (backend) or plan + E2E (frontend). Before commit → simplify. Learned a durable fact → agent-memory. Slow/timeouts → performance.
