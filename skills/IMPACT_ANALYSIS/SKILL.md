---
name: impact-analysis
description: Use before non-trivial behavioral changes to trace upstream causes, downstream consumers, persistence, invalidation, and regression impact.
---

# Impact Analysis Rules

Use this workflow before implementing any non-trivial feature, bug fix, refactor, API change, database change, event change, or performance optimization.

The purpose is to understand:

> If this changes, what else can break?

Do not start implementation before understanding the relevant impact surface.

---

# 1. Start From the Requested Change

Identify exactly what behavior is being requested.

Document:

```text
Requested change:
...

Current behavior:
...

Expected behavior:
...

Primary component/module:
...
```

Do not expand the scope while investigating.

---

# 2. Trace the Actual Execution Path

Trace actual code rather than assuming architecture from filenames.

Typical backend flow:

```text
Route
→ Handler
→ Service
→ Domain Logic
→ Repository
→ Database
```

Typical frontend flow:

```text
User Action
→ Component
→ State / Hook
→ Redux / Saga
→ API Client
→ Backend
→ Response
→ UI State
```

Event-driven flow:

```text
Producer
→ Event
→ Topic / Subject
→ Consumer
→ Service
→ Side Effect
```

Record the relevant execution path.

---

# 3. Trace Upstream Dependencies

Ask:

```text
Who calls this?
Who creates this data?
Where does this input originate?
What assumptions do callers make?
```

Search for:

- function callers;
- interface implementations;
- API callers;
- frontend consumers;
- scheduled jobs;
- event producers;
- other services;
- tests.

Do not assume a function is isolated because it has only one obvious caller.

---

# 4. Trace Downstream Dependencies

Ask:

```text
What does this call?
What does it modify?
What consumes its output?
What happens after this succeeds?
```

Inspect:

- repositories;
- database writes;
- events;
- external APIs;
- caches;
- asynchronous jobs;
- derived calculations;
- UI consumers.

---

# 5. Data Impact

Identify data being:

```text
READ
WRITTEN
UPDATED
DELETED
DERIVED
CACHED
PUBLISHED
```

For each relevant data structure determine:

- who owns it;
- who writes it;
- who reads it;
- whether historical records exist;
- whether old records have different shapes;
- whether values are persisted or calculated;
- whether another flow depends on stale/current values.

Pay particular attention to persisted derived values.

A calculation change may affect more than the calculation itself if its result is stored and reused later.

---

# 6. Contract Impact

Identify whether the change affects a contract.

Contracts include:

```text
API request
API response
HTTP headers
function signature
interface
DTO
database schema
event payload
Kafka topic
NATS subject
configuration
environment variable
shared package
frontend model
```

For every changed contract identify known consumers.

Do not silently change a contract because all current code compiles.

---

# 7. Cause-and-Effect Chain

For important changes explicitly model cause and effect.

Example:

```text
Roster Override
→ Shift Hours Resolution
→ Attendance Calculation
→ Payroll Calculation
→ Review Page
→ Payslip
```

Then ask:

```text
If this value changes here,
what changes downstream?
```

Do not inspect only the component where the symptom appears.

---

# 8. Shared Code Has Larger Blast Radius

Treat changes to shared code as higher risk.

Examples:

- shared libraries;
- utilities;
- middleware;
- authentication;
- authorization;
- formula engines;
- common repositories;
- shared UI components;
- common DTOs.

Search all usages before modifying shared behavior.

---

# 9. Database Impact

When persistence is involved inspect:

```text
query
→ repository
→ collection/table
→ indexes
→ readers
→ writers
```

Determine whether the change affects:

- existing records;
- missing fields;
- default values;
- indexes;
- migrations;
- old application versions;
- aggregation pipelines;
- bulk operations.

Do not assume all data is in the newest format.

---

# 10. Event Impact

For Kafka, NATS, queues, webhooks, or asynchronous processing inspect:

```text
producer
→ event contract
→ broker
→ all consumers
→ side effects
```

Check:

- payload fields;
- event names;
- versioning;
- duplicate handling;
- retry behavior;
- ordering assumptions;
- idempotency.

A producer change is incomplete until consumer impact is known.

---

# 11. Frontend Impact

If backend behavior changes, identify affected UI surfaces.

Check:

- pages;
- dialogs;
- tables;
- forms;
- Redux state;
- Saga behavior;
- cached values;
- validation;
- error handling;
- loading states.

Likewise, frontend changes that modify request contracts require backend analysis.

---

# 12. Authorization and Tenant Impact

Always check authorization when changes affect:

- data access;
- employee/user selection;
- administrative actions;
- bulk operations;
- APIs;
- caching.

Verify that optimization or refactoring does not bypass:

```text
tenant filtering
company filtering
user filtering
role checks
permission checks
```

Performance improvements must not weaken isolation.

---

# 13. Temporal Impact

Check whether behavior depends on time.

Examples:

- effective dates;
- historical payroll;
- attendance periods;
- month boundaries;
- versioned assignments;
- future-dated records;
- timezone handling.

Ask:

```text
Does the change affect only new data,
or historical data too?
```

---

# 14. Transactional Impact

For multi-step operations determine:

```text
What happens if step 3 fails after steps 1 and 2 succeed?
```

Check:

- partial writes;
- rollback behavior;
- retries;
- idempotency;
- duplicate execution;
- inconsistent state.

Do not introduce partial-update behavior unintentionally.

---

# 15. Performance Impact

Even when performance is not the main task, check whether the change introduces:

- query-in-loop;
- N+1 access;
- repeated external calls;
- unbounded loading;
- unnecessary serialization;
- additional event traffic;
- expensive calculations in hot paths.

Use `PERFORMANCE.md` when performance risk is material.

---

# 16. Concurrency Impact

If shared state or parallel execution is involved inspect:

- races;
- ordering;
- locks;
- duplicate processing;
- context cancellation;
- goroutine lifecycle;
- database pressure.

Do not assume previously serial code remains correct when parallelized.

---

# 17. Failure-Path Impact

Analyse both:

```text
success path
AND
failure path
```

Check:

- validation failure;
- database failure;
- timeout;
- downstream service failure;
- partial success;
- retry;
- cancellation.

A change that works only in the happy path is incomplete.

---

# 18. Regression Surface

Create an explicit regression surface.

Example:

```text
DIRECT
- salary calculation

DOWNSTREAM
- payroll review
- payslip
- payroll register

CONTRACT
- salary component DTO

DATA
- employee month master

NOT AFFECTED
- leave approval workflow
```

Every important impacted area should later be:

```text
VERIFIED
NOT AFFECTED
NOT VERIFIED
```

Do not silently treat `NOT VERIFIED` as safe.

---

# 19. Scope Classification

During analysis classify discovered issues:

```text
BLOCKER
RELATED
UNRELATED
```

## BLOCKER

The requested change cannot be completed correctly without addressing it.

## RELATED

Directly affects correctness of the requested change.

## UNRELATED

Interesting but not required.

Do not implement unrelated discoveries.

Record them separately.

---

# 20. Impact Does Not Authorize Scope Expansion

Impact analysis discovers consequences.

It does NOT grant permission to modify everything discovered.

Example:

```text
Change A affects B, C and D.
```

This means:

```text
verify B, C and D
```

not automatically:

```text
rewrite B, C and D
```

Modify only what is necessary.

---

# 21. Required Pre-Implementation Impact Report

Before implementation, produce:

```text
## Requested Change

...

## Execution Path

A
→ B
→ C

## Direct Impact

- ...

## Downstream Impact

- ...

## Data Impact

- ...

## API / Contract Impact

- ...

## Event Impact

- ...

## Frontend Impact

- ...

## Performance / Concurrency Impact

- ...

## Regression Surface

- ...

## Scope

IN:
- ...

OUT:
- ...

## Risks

- ...

## Verification Plan

- ...
```

Keep the report proportional to the task.

A small bug does not require a giant architecture document.

---

# 22. Post-Implementation Verification

After implementation revisit the impact analysis.

For each identified area report:

```text
VERIFIED
NOT AFFECTED
NOT VERIFIED
```

Example:

| Area | Result | Evidence |
|---|---|---|
| Payroll calculation | VERIFIED | unit tests |
| Payroll review | VERIFIED | service test |
| Payslip | NOT AFFECTED | output contract unchanged |
| Historical payroll | NOT VERIFIED | staging data required |

---

# Golden Rule

Never reason only:

```text
What file should I change?
```

Always reason:

```text
What behavior am I changing?
        ↓
Where does it originate?
        ↓
Where does it flow?
        ↓
Who depends on it?
        ↓
What could break?
        ↓
How will I prove it did not?
```

---

# Initial Impact Report (non-trivial behavioral work)

Report this before asking for approval:

```markdown
## Initial Impact Report
### Requested Change
### Requested Artifact / Mechanism
### Root Cause / Trigger
### Current Cause -> Effect Flow   (A -> B -> C -> D)
### Proposed Change Point
### Direct Effects
### Downstream Consumers
### Persistence / Snapshot / Cache Effects
### Recalculation / Invalidation
### Regression Surface
### Must Remain Unchanged
### Confirmed Effects
### Potential Effects Requiring Verification
### Scope Boundary   (effects found in analysis are not automatically authorized work)
```

Explain why A affects B; a caller list alone is not enough. Cover: upstream triggers, direct effect, downstream consumers, persisted/copied/cached/aggregated data, recalculation, regression surface (bulk flows, imports/exports, manual overrides, locked/historical records), and evidence (confirmed / potential / inspected-unaffected).
