---
name: root-cause
description: Use for bugs, regressions, failures, timeouts, inconsistent data, and unexpected behavior that require evidence-based root cause diagnosis before fixing.
---

# Root Cause Analysis Rules

Use this workflow for bugs, incorrect behavior, regressions, intermittent failures, timeouts, data inconsistencies, and unexpected system behavior.

Do not begin by editing suspicious code.

The objective is:

> Find the first point where actual behavior diverges from correct behavior.

---

# 1. Define the Symptom Precisely

Document:

```text
Observed:
...

Expected:
...

Conditions:
...

Frequency:
Always / Intermittent / Unknown
```

Avoid vague descriptions such as:

```text
Payroll is broken.
```

Prefer:

```text
For employees with an overridden July roster,
Review Page Shift_Hrs remains 8.3 instead of 8.0
after recalculation.
```

---

# 2. Reproduce Before Fixing

Attempt to establish a deterministic reproduction.

Identify:

```text
Input
State
Action
Actual Result
Expected Result
```

If the issue cannot be reproduced, do not invent a cause.

Record what evidence is available.

---

# 3. Establish the Last Correct State

Trace backwards from the symptom.

Ask:

```text
Where is the value first wrong?
```

Example:

```text
UI displays 8.3
       ↑
API returns 8.3
       ↑
service returns 8.3
       ↑
stored month master contains 8.3
       ↑
recalculation did not refresh roster value
```

The UI is the symptom.

The stale recalculation behavior may be the cause.

---

# 4. Find the First Divergence Point

Trace:

```text
Expected data flow
vs
Actual data flow
```

Identify the earliest point where they differ.

This is usually more valuable than the last component showing the problem.

Document:

```text
First divergence:
...

Expected at this point:
...

Actual:
...
```

---

# 5. Separate Symptom, Trigger and Root Cause

These are different.

Example:

```text
SYMPTOM:
Review page displays stale shift hours.

TRIGGER:
Roster was overridden after payroll calculation.

ROOT CAUSE:
Recalculation reads persisted shift hours instead of
resolving the current effective roster.
```

Do not mistake the trigger for the cause.

---

# 6. Build Hypotheses

If the cause is uncertain, create a small hypothesis set.

Example:

```text
H1: stale database value
H2: frontend cache
H3: roster lookup returns wrong effective record
H4: recalculation does not execute
```

Investigate the most plausible/high-value hypotheses first.

Do not change code for every hypothesis.

---

# 7. Require Evidence

Evidence may include:

- failing test;
- logs;
- database state;
- debugger result;
- traced code path;
- request/response;
- query result;
- reproducible input;
- metric/profile.

Distinguish:

```text
CONFIRMED
SUPPORTED
SPECULATIVE
```

Do not present speculation as root cause.

---

# 8. Falsify Competing Explanations

Try to disprove hypotheses.

Example:

```text
Hypothesis:
frontend cache is stale.

Evidence:
API itself returns stale value.

Result:
frontend cache ruled out.
```

Finding evidence against an explanation is useful.

---

# 9. Search Recent and Related Changes

For regressions inspect relevant:

- recent commits/diffs;
- changed contracts;
- migrations;
- dependency updates;
- configuration changes;
- environment changes.

Do not assume the newest change is automatically responsible.

Correlation is not proof.

---

# 10. Inspect Data State

For data-related bugs determine:

```text
Is source data wrong?
Is derived data wrong?
Is persisted derived data stale?
Is the query selecting the wrong record?
```

Inspect actual records where possible.

Do not patch code if corrupted/migrated data is the actual problem without understanding both.

---

# 11. Inspect Effective-Date and Version Logic

For systems with temporal data inspect:

- effective_from;
- effective_to;
- created_at;
- version;
- current/active flags;
- override precedence;
- month/year boundaries.

Ask:

```text
Which record should win?
Which record actually wins?
```

---

# 12. Inspect Cache and Derived State

Determine whether values come from:

```text
source of truth
or
stored/cached/derived copy
```

Stale derived state is a common root cause.

Do not add another synchronization workaround before establishing ownership.

---

# 13. Inspect Error Handling

A visible downstream failure may originate from an ignored upstream error.

Look for:

- swallowed errors;
- default values after failure;
- ignored return values;
- fallback logic;
- partial results;
- retries hiding failures.

Do not treat fallback output as valid data automatically.

---

# 14. Timing and Concurrency Bugs

For intermittent problems consider:

- races;
- asynchronous ordering;
- eventual consistency;
- duplicate events;
- transaction boundaries;
- retries;
- stale reads;
- context cancellation.

Do not add arbitrary sleeps as a fix.

---

# 15. Timeout Root Cause

For timeout errors do not immediately increase timeout duration.

Trace:

```text
how many operations?
which operation is slow?
is there N+1?
is there pool saturation?
is work serial?
is query indexed?
is external dependency slow?
```

Use `PERFORMANCE.md` when appropriate.

---

# 16. Create a Regression Test

Once the failure mechanism is understood, create a test reproducing it where technically feasible.

Required sequence:

```text
Bug reproduction
→ failing test
→ confirm failure reason
→ implementation
→ passing test
```

The test should represent the behavior, not the implementation.

---

# 17. Fix the Cause, Not the Output

Bad:

```text
wrong total displayed
→ manually adjust total
```

Better:

```text
identify incorrect component calculation
→ fix calculation
→ total becomes correct naturally
```

Avoid compensating logic that hides upstream errors.

---

# 18. Minimal Correct Fix

After confirming root cause ask:

> What is the smallest change that corrects the cause without altering unrelated behavior?

Do not use a bug as permission for broad refactoring.

---

# 19. Five Whys — Use Carefully

The Five Whys technique may help but is not mandatory.

Do not manufacture increasingly abstract answers simply to reach five levels.

Stop when there is a concrete, actionable system cause supported by evidence.

---

# 20. Root Cause Categories

Useful categories include:

```text
LOGIC
DATA
STATE
CONTRACT
INTEGRATION
CONCURRENCY
PERFORMANCE
CONFIGURATION
ENVIRONMENT
MIGRATION
AUTHORIZATION
UI STATE
```

Classification helps determine which additional workflow should be loaded.

---

# 21. Required Root Cause Report

Before implementation provide:

```text
## Symptom

...

## Expected Behavior

...

## Reproduction

...

## Execution Path

A
→ B
→ C

## First Divergence

...

## Hypotheses

1. ...
2. ...

## Evidence

...

## Root Cause

CONFIRMED / SUPPORTED / NOT YET CONFIRMED

...

## Alternatives Ruled Out

- ...

## Proposed Minimal Fix

...

## Regression Test

...
```

Keep this proportional to complexity.

---

# 22. If Root Cause Is Not Confirmed

Do not pretend certainty.

Use:

```text
Root cause not yet confirmed.

Strongest hypothesis:
...

Evidence:
...

Remaining uncertainty:
...
```

A safe, evidence-backed partial conclusion is better than an invented diagnosis.

---

# 23. After the Fix

Verify:

```text
[ ] original symptom no longer reproduces
[ ] regression test passes
[ ] related tests pass
[ ] root cause is actually addressed
[ ] workaround was not added over incorrect behavior
[ ] impact surface reviewed
```

---

# Golden Rule

Do not ask:

```text
What code can I change to make this symptom disappear?
```

Ask:

```text
Where does correct behavior first become incorrect,
why does that happen,
and what is the smallest change that corrects it?
```
