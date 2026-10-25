---
name: fix-bug
description: Use for a bug report, regression, wrong value, failing request, or unexpected behaviour. Finds the first point where behaviour goes wrong, proves it with a failing test, then fixes the cause.
---

# Fix a bug

Don't start by editing suspicious code. Find where correct becomes incorrect.

1. **Symptom.** Observed vs expected, with the exact input, state, and environment.
   "Payroll broken" is not a symptom; "employee E1, June 2026: Review returns 400 'monthly summary not found' while the register shows the row Ready" is.
2. **Reproduce.** Request, test, query, or log line that shows it. If it can't be reproduced, say so and stop guessing.
3. **First divergence.** Walk back from the symptom (UI → API → service → data) to the earliest point where the value is wrong. That point, not the screen, is where the cause lives. Check swallowed errors, defaults after failure, stale derived/cached data, and which effective-dated record wins.
   Label the cause: **CONFIRMED** (seen in code + reproduced) / **SUPPORTED** (evidence, not reproduced) / **SPECULATIVE**. Never present speculative as the cause.
4. **Failing test.** Write one that reproduces the bug through behaviour, and see it fail for the expected reason.
5. **Fix the cause, smallest change.** Not the output: no compensating adjustments downstream. Test goes green; run the related tests.
6. **Report, five lines:**
   - Symptom:
   - Cause (label):
   - Fix:
   - Proof: <test name + result, command output>
   - Not verified:

If step 3 never reaches CONFIRMED, report the strongest hypothesis, its evidence, and what's still unknown, then ask before fixing.
For multi-step fixes, use the plan skill with these steps as the plan.
