---
name: simplify
description: Code simplification pass on the current diff only - remove duplication and dead code, reuse existing helpers, never change behavior. Run as the last step before push.
---
# Code Simplification Workflow

Use this workflow to keep generated and human-written code aligned with repository standards while avoiding unnecessary rewrites and token usage.

Simplification has two modes:

```text
BASELINE
INCREMENTAL
```

---

# 1. Goals

Simplification should:

- remove unnecessary complexity;
- remove duplicate code;
- reuse existing helpers/components;
- reduce unnecessary abstraction;
- improve naming;
- remove dead code;
- reduce excessive nesting;
- match surrounding repository style;
- remove AI-generated clutter;
- identify inefficient patterns;
- preserve existing behavior.

Simplification must NOT become a refactor project.

---

# 2. Golden Rule

Prefer:

```text
DELETE
SIMPLIFY
REUSE
```

before:

```text
ABSTRACT
WRAP
GENERALIZE
```

Do not add more code merely to organize unnecessary code.

---

# 3. BASELINE MODE

Baseline simplification is performed once for an existing service or major module.

Example:

```text
payroll-service
attendance-service
auth-service
frontend/payroll
```

The goal is to establish a clean baseline.

Do NOT simplify the entire repository at once.

Process one service/module at a time.

---

# 4. Baseline Workflow

For each service:

```text
SELECT SERVICE
↓
UNDERSTAND STRUCTURE
↓
RUN TESTS
↓
ANALYSE CODE QUALITY
↓
CREATE FINDINGS
↓
SIMPLIFY SAFE ISSUES
↓
RUN TESTS
↓
REVIEW DIFF
↓
MARK SERVICE BASELINED
```

---

# 5. Baseline Analysis

Before editing, inspect:

- service architecture;
- handlers/controllers;
- services/domain logic;
- repositories;
- models;
- shared helpers;
- tests;
- configuration;
- database access;
- external-service clients.

Do not start by formatting arbitrary files.

Understand the patterns used by the service first.

---

# 6. Baseline Checks

Inspect for:

## Duplication

Look for:

- repeated validation;
- repeated database lookups;
- duplicated transformations;
- duplicated error handling;
- repeated response construction;
- duplicated frontend components.

Prefer existing reusable code before creating new abstractions.

---

## Excessive Abstraction

Look for:

- wrapper around wrapper;
- interfaces with only one implementation and no architectural reason;
- generic helpers used once;
- unnecessary factories;
- unnecessary manager/provider/service layers;
- tiny functions that make code harder to follow.

Do not remove abstraction that represents a real architectural boundary.

---

## Excessive Nesting

Prefer early returns where they improve readability.

Avoid:

```text
if ...
    if ...
        if ...
            if ...
```

when equivalent logic can be clearer.

---

## Dead Code

Identify:

- unused functions;
- unreachable branches;
- obsolete compatibility code;
- unused constants;
- unused types;
- commented-out implementation.

Do not delete code solely because static search finds no direct caller.

Check:

- reflection;
- interfaces;
- framework registration;
- events;
- generated references.

---

# 7. AI-Generated Clutter

AI agents commonly introduce unnecessary:

- helpers;
- wrappers;
- comments;
- abstractions;
- fallback paths;
- defensive branches;
- duplicate validation;
- temporary compatibility code.

Remove them when they provide no real value.

Avoid comments such as:

```text
// Set the value
value = x
```

Keep comments that explain:

```text
WHY
```

rather than obvious:

```text
WHAT
```

---

# 8. Repository Standards

The surrounding repository is the primary coding-style reference.

Before changing a pattern ask:

```text
How does this repository normally solve this?
```

Prefer consistency over generic AI "best practices."

Do not introduce a new pattern merely because it is theoretically cleaner.

---

# 9. Performance Smells

During simplification identify:

- N+1 queries;
- queries inside loops;
- repeated API calls;
- repeated parsing/computation;
- repeated map/list scans;
- excessive allocations;
- unnecessary copies;
- unnecessary serialization;
- unbounded concurrency.

If a meaningful performance issue is found, follow `PERFORMANCE.md`.

Do not silently turn simplification into a large performance rewrite.

---

# 10. Behavioral Safety

Simplification must preserve observable behavior.

Do not change:

- API contracts;
- event payloads;
- database semantics;
- authorization;
- tenant filtering;
- calculations;
- ordering;
- business rules;

unless explicitly required by another task.

When behavioral changes are needed, follow:

```text
IMPACT_ANALYSIS.md
TDD.md
```

instead of treating them as simplification.

---

# 11. Baseline Findings First

For large services, first generate:

```text
SAFE TO SIMPLIFY
NEEDS REVIEW
OUT OF SCOPE
```

Example:

```text
SAFE
- duplicate local conversion helper
- redundant nested conditional
- dead private function

REVIEW
- repository abstraction duplicated
- query pattern may be N+1

OUT OF SCOPE
- service architecture redesign
```

Only implement safe findings automatically.

---

# 12. Keep Baseline Changes Bounded

Do not generate one enormous cleanup diff.

Prefer:

```text
service
→ package/module
→ bounded simplification
→ tests
→ next package/module
```

Large baseline simplifications should be split into reviewable changes.

---

# 13. Baseline Completion

A service is considered baselined when:

```text
[ ] existing tests pass
[ ] major obvious duplication reviewed
[ ] unnecessary abstractions reviewed
[ ] dead code reviewed
[ ] coding style matches repository
[ ] obvious N+1/repeated-access patterns reviewed
[ ] generated clutter reduced
[ ] final tests pass
[ ] simplification diff reviewed
```

Record:

```text
SIMPLIFICATION BASELINE: COMPLETE
```

for that service in project memory or service metadata.

---

# 14. INCREMENTAL MODE

After a service has a baseline, do NOT repeatedly inspect all service code.

Use incremental simplification.

Incremental mode reviews only:

```text
current branch changes
+
directly affected surrounding code
```

---

# 15. Incremental Input

Prefer reviewing:

```text
git diff <base-branch>...HEAD
```

or, before push:

```text
git diff <upstream>...HEAD
```

If only staged changes matter:

```text
git diff --cached
```

The exact Git command may vary by repository workflow.

---

# 16. Incremental Simplification Workflow

Before pushing:

```text
LATEST CHANGES
↓
IDENTIFY AFFECTED FILES
↓
READ NECESSARY SURROUNDING CODE
↓
SIMPLIFY DIFF
↓
RUN TARGETED TESTS
↓
RUN REQUIRED REGRESSION TESTS
↓
RECHECK DIFF
↓
PUSH
```

Do not scan unrelated services.

---

# 17. Incremental Review Questions

For every changed area ask:

```text
Did we duplicate something existing?

Did we create an unnecessary helper?

Did we introduce a new pattern unnecessarily?

Can a branch be simplified?

Is any code now dead?

Did AI add excessive comments?

Are names consistent with surrounding code?

Did we create repeated DB/API operations?

Did we add unnecessary goroutines?

Did we add unnecessary state?

Did we add fallback logic hiding errors?

Did we expand scope?
```

---

# 18. Review Changed Code in Context

Do not review the diff in isolation.

Read enough surrounding code to determine:

- existing conventions;
- reusable helpers;
- expected patterns;
- contract implications.

But do not recursively load unrelated code.

---

# 19. Do Not Rewrite Correct Code for Style

Incremental simplification should prioritize newly introduced problems.

Do not modify unrelated pre-existing code merely because it could be cleaner.

If discovered, record it as:

```text
BASELINE CLEANUP CANDIDATE
```

and leave it unchanged.

---

# 20. Before-Push Gate

No push should occur until:

```text
IMPLEMENTATION
↓
TESTS GREEN
↓
INCREMENTAL SIMPLIFY
↓
TESTS GREEN AGAIN
↓
IMPACT CHECK
↓
PUSH
```

If simplification changes code, tests must run again.

---

# 21. Required Before-Push Checklist

```text
[ ] requested implementation complete
[ ] targeted tests pass
[ ] TDD requirements satisfied where applicable
[ ] latest diff reviewed
[ ] duplicated code checked
[ ] unnecessary abstractions checked
[ ] dead code checked
[ ] coding standards checked
[ ] N+1/repeated access checked
[ ] scope expansion checked
[ ] simplification complete
[ ] tests rerun after simplification
[ ] impact analysis verification complete
```

Only then should the change be considered ready to push.

---

# 22. Push Safety

Simplification must not automatically:

```text
git push
```

unless the user/workflow has explicitly authorized pushing.

The simplification stage determines:

```text
READY TO PUSH
```

It does not independently grant permission to publish code.

---

# 23. Interaction With TDD

Use:

```text
RED
↓
GREEN
↓
SIMPLIFY
↓
GREEN
↓
REGRESSION
```

Simplification effectively replaces/refines the normal TDD refactor stage.

Do not simplify during RED.

Do not perform broad cleanup while trying to make the test pass.

---

# 24. Interaction With Impact Analysis

Before changing behavior:

```text
IMPACT ANALYSIS
```

Before push:

```text
VERIFY ORIGINAL IMPACT SURFACE
```

Simplification must not create a new impact surface unnecessarily.

---

# 25. Interaction With Implementation Tracker

The tracker should record:

```text
Simplification:
BASELINE / INCREMENTAL

Status:
PENDING / COMPLETE

Findings:
...

Changes made:
...

Tests after simplification:
...

Remaining cleanup:
...
```

Do not store verbose simplification logs.

---

# 26. Baseline Memory

Once baseline simplification is complete for a service, record durable information such as:

```text
Service: payroll-service

Simplification baseline:
2026-09-xx

Important conventions:
- ...
- ...

Known intentional complexity:
- ...

Known cleanup candidates:
- ...
```

Do not make future agents rediscover this every session.

---

# 27. Token-Efficiency Rule

After baseline completion:

```text
DO NOT
re-read entire service for every change.
```

Default to:

```text
diff
+
affected functions
+
necessary dependencies
```

Expand context only when impact analysis shows it is necessary.

---

# 28. Final Simplification Report

Before push report:

```text
## Simplification

Mode:
INCREMENTAL

Reviewed:
- ...

Removed/Simplified:
- ...

Existing code reused:
- ...

Performance issues:
- NONE / ...

Behavior changed:
NO

Tests after simplification:
PASS

Remaining cleanup:
- ...

Push readiness:
READY / NOT READY
```

Keep this short.

---

# Golden Rule

The initial goal is:

```text
CLEAN EACH SERVICE ONCE
```

Afterwards the goal is:

```text
KEEP IT CLEAN INCREMENTALLY
```

Do not repeatedly pay the cost of rediscovering and simplifying the entire service.