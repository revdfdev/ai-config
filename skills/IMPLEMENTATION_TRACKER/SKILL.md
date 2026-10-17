---
name: implementation-tracker
description: Use only when the user asks for a tracker or the work is multi-slice, cross-service, or spans sessions. Keeps one page of durable scope, acceptance criteria, and evidence.
---

# Implementation Tracker (one page)

Create a tracker only when asked or when the work is genuinely multi-slice. Small tasks are done in chat. "Epic" means several related tickets, not one bullet.

Location: `trackers/` in the workspace. One file per piece of work.

```markdown
# <Title>
Status: planned | in progress | done        Active slice: <n>

## Goal
What outcome the user asked for, in their words, and the mechanism they named.

## Scope
In:  ...
Out: ...

## Acceptance Criteria
Each is one testable statement. Fill Evidence only with what was actually run.
- [ ] AC1 <statement> - Evidence: <command / test / record read back>
- [ ] AC2 ...

## Slices
1. <slice> - status - commits
2. ...

## Notes
Decisions and open questions only. No logs.
```

Rules:
- "Ready" = the user said proceed on this scope. "Done" = every AC has evidence. There are no separate DoR/DoD sections.
- A tracker is the durable state; a new session resumes from it plus git history, not from the old conversation.
- Never mark an item done without evidence. If it could not be run, write "not verified".
- Effects found during analysis are findings, not scope. Add them only with the user's go-ahead.
