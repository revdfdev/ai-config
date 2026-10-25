---
name: agent-memory
description: Use when starting work in a repo (read its memory) or after finishing work that taught a durable fact about it (write memory). Per-repo docs/agent-memory/ is the canonical memory.
---

# Agent memory

Each repo keeps its memory in `docs/agent-memory/`, entry point `INDEX.md`.

## Read
At the start of work in a repo, read `docs/agent-memory/INDEX.md`, then only the files it links that the task needs. Memory describes how things were when written; live code wins. If they conflict, say so.

## Write
Only after the fact is verified (test passed, code read, user confirmed). Write:
- architecture, ownership, contracts between services;
- non-obvious traps (a command that silently does nothing, a value set a backend enforces exactly);
- decisions the user made and why.

Never write: session logs, command output, progress/status, plans, speculation, anything git history or the code already says.

One topic per file, a few lines each. Add a one-line link in `INDEX.md`. Update or delete a wrong entry instead of adding a contradicting one. Commit memory changes with the work that taught them.
