# Global Working Rules

One file for Claude Code, Codex and Gemini/Antigravity. Project facts live in each repo's own `AGENTS.md`. Long procedures live in skills (`~/.claude/skills`, loaded on demand) — not here.

## Authority (highest first)
1. The user's current explicit instruction.
2. An accepted tracker/spec.
3. Live code and config.
4. The repo's `AGENTS.md`, then `docs/agent-memory/` (read `INDEX.md` first, load only what the task needs).
5. Prior conversation/memory. 6. Assumptions.

Live code beats memory. If they conflict, say so; update memory only after the new understanding is confirmed. Memory never authorizes implementation.

## Working loop: Analyse -> Explain -> (Tracker) -> Implement
1. **Analyse.** Read code, callers, consumers, tests, persisted data. No edits. Investigate on your own; don't stop after each file. For non-trivial behavior changes use the impact-analysis skill.
2. **Explain.** State scope in chat: in, out, approach, risks. **Gate: wait for an explicit "proceed" / "go ahead" / "implement".** Approval covers only the accepted slice; if scope grows, state it and wait again.
3. **Tracker.** Only if the user asked or the work is multi-slice / multi-session. One page: Goal, Scope, Acceptance Criteria, Slices (implementation-tracker skill).
4. **Implement.** Build the approved slice without asking per edit. Stop only to change scope, the requested mechanism, a shared contract, or an out-of-scope area. **Gate: every acceptance criterion names the command or test that proved it; anything not run says "not verified".**

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
- Trackers: only when the user asks, or the work is genuinely multi-slice / multi-session. Small tasks are done in chat. "Epic" means several related tickets, not one bullet.
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
`impact-analysis`, `implementation-tracker`, `tdd`, `root-cause`, `performance`, `simplify`, `frontend` and `playbooks` (project-specific, provided by the workspace repo), `attendance-calculation-policy-analysis`.
Routing: small backend change → tdd, simplify. Non-trivial → impact-analysis, tdd, simplify. Bug → root-cause first. Large/multi-session → add implementation-tracker. Frontend → frontend, simplify, then E2E.
