---
name: tdd
description: Mandatory for every backend implementation and backend bug fix that changes behavior, including small tasks.
---

# Shared AI Engineering Contract

These rules apply to backend implementation performed by any AI coding agent working in this repository.

Claude, Codex, or any other agent must follow the same engineering process.

The agent is an implementation assistant operating inside the existing architecture.

It is NOT authorized to redesign the system, expand scope, replace existing solutions, or reinterpret requirements without explicit approval.

---

# 1. Mandatory Workflow

For backend implementation work, follow:

```text
REQUEST
↓
UNDERSTAND
↓
TRACE CURRENT BEHAVIOR
↓
IMPACT ANALYSIS
↓
DEFINE ACCEPTANCE CRITERIA
↓
TDD — RED
↓
IMPLEMENT MINIMAL CHANGE
↓
TDD — GREEN
↓
REFACTOR
↓
REGRESSION TEST
↓
VERIFY IMPACT SURFACE
↓
REPORT
```

Do not jump directly from request to implementation.

---

# 2. Cause and Effect Before Coding

Before changing code, determine:

```text
What calls this?
What does this call?
What data does this read?
What data does this write?
What consumes that data?
What event/API/database contracts are involved?
What could this change break?
```

Trace actual code.

Do not infer relationships solely from filenames or function names.

Create a simple dependency chain:

```text
A
→ B
→ C
→ D
```

Then identify what happens if `B` changes.

---

# 3. Root Cause Before Fix

For bugs distinguish:

```text
SYMPTOM
≠
ROOT CAUSE
```

Do not patch the visible symptom unless investigation shows that it is the actual source of the problem.

Document:

```text
Observed behavior:
Expected behavior:
Root-cause hypothesis:
Evidence:
```

If root cause is not confirmed, state that clearly.

---

# 4. TDD Is Mandatory for Backend Work

Every backend behavior change follows:

```text
RED
→
GREEN
→
REFACTOR
→
REGRESSION
```

## RED

Write or identify a test demonstrating the missing or broken behavior.

Run it.

Confirm that it fails for the expected reason.

## GREEN

Implement the smallest correct change required to make the test pass.

## REFACTOR

Improve the implementation only after behavior is passing.

## REGRESSION

Run related tests and verify known downstream effects.

Do not weaken a test merely to make implementation pass.

---

# 5. Bug Fixes

Bug fixes should normally follow:

```text
Reproduce bug
↓
Regression test
↓
RED
↓
Root cause
↓
Fix
↓
GREEN
↓
Related regression tests
```

If an existing test already reproduces the bug, reuse it.

Do not create meaningless duplicate tests just to satisfy the process.

---

# 6. Scope Control

Every discovered issue must be classified as:

```text
BLOCKER
RELATED
UNRELATED
```

### BLOCKER

Must be addressed for the requested work to function.

### RELATED

May be changed only if required for correctness.

### UNRELATED

Do not modify.

Record it as a follow-up if useful.

Finding better architecture does not authorize implementing it.

---

# 7. Minimal Change Principle

Ask:

> What is the smallest correct change that solves the root cause while preserving existing contracts?

Prefer that solution.

Do not perform unrelated cleanup while implementing a feature or fixing a bug.

Do not replace existing components, endpoints, libraries, APIs, or abstractions merely because another option appears cleaner.

---

# 8. Existing Architecture Is a Constraint

Before adding something new, inspect how the repository currently solves comparable problems.

Prefer:

```text
existing pattern
>
new abstraction
```

unless the existing architecture cannot satisfy the requirement.

Do not introduce:

* new directories;
* new architectural layers;
* new frameworks;
* new shared packages;
* new dependencies;

unless required by the task or explicitly approved.

---

# 9. Contract Safety

Before modifying a public contract inspect all known consumers.

Contracts include:

```text
API request
API response
function signature
database structure
Kafka/NATS event
shared DTO
frontend model
configuration key
environment variable
```

Do not make breaking changes silently.

---

# 10. Data Changes

When changing persistence behavior inspect:

```text
writers
readers
existing records
missing-field behavior
migration needs
indexes
backward compatibility
```

Never assume existing persisted data already follows the newest schema.

---

# 11. Event-Driven Systems

Before changing an event:

```text
producer
→ topic/subject
→ consumer(s)
→ side effects
```

Verify:

* payload compatibility;
* duplicate delivery;
* retries;
* idempotency;
* error handling.

---

# 12. Concurrency

Do not introduce goroutines or parallel processing simply because something is slow.

When concurrency is necessary verify:

```text
bounded concurrency
context cancellation
error propagation
database pressure
race conditions
resource cleanup
```

Correctness comes before throughput.

---

# 13. Frontend Rules

Frontend work must preserve existing UX and component conventions.

Before creating a new component check whether an equivalent component already exists.

Prefer existing:

```text
Button
Input
Select
Drawer
DataTable
Switch
shared layout
shared hooks
```

Test behavior from the user's perspective.

Prefer:

```text
user action
→ observable result
```

over testing private React implementation details.

Do not introduce another state-management, styling, or component framework without explicit approval.

---

# 14. Backend Rules

Maintain existing service boundaries.

Trace:

```text
handler
→ service
→ domain logic
→ repository
→ persistence/events
```

Do not move logic between services merely for convenience.

Do not bypass established repository/service abstractions without a documented reason.

---

# 15. Test Quality

Tests must prove behavior.

Avoid tests that only prove mocks were called.

Good:

```text
input
→ behavior
→ observable result
```

Weak:

```text
mock A called mock B twice
```

unless the interaction itself is contractually important.

Tests should be deterministic.

Control or inject:

```text
time
randomness
external services
filesystem
network dependencies
```

when required.

---

# 16. Do Not Modify Tests to Hide Bugs

The following is prohibited:

```text
test fails
↓
implementation is incorrect
↓
agent changes expected result
↓
test passes
```

If the requirement conflicts with an
