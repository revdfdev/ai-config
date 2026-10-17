---
name: performance
description: Use for latency, throughput, CPU or memory usage, database timeouts, bulk operations, scalability work, and evidence-based performance optimization.
---

# Performance Engineering Rules

Use this workflow for slow endpoints, bulk operations, high CPU/memory usage, database timeouts, latency spikes, throughput issues, or scalability work.

## 1. Measure Before Optimizing

Do not optimize based only on intuition.

First identify where time/resources are being spent:

```text
Request
→ Application Logic
→ Database
→ Network
→ Serialization
→ External Services
→ Response
```

Collect evidence where possible:

- request latency;
- query count;
- query duration;
- CPU usage;
- memory usage;
- allocation pressure;
- goroutine count;
- DB connection usage;
- external call count;
- batch size;
- payload size.

Do not introduce optimization until a likely bottleneck is identified.

---

## 2. Detect N+1 Access Patterns

Inspect loops for database, repository, API, or service calls.

Bad pattern:

```text
fetch employees
↓
for each employee
    fetch salary
    fetch roster
    fetch attendance
```

This may turn:

```text
1 request
```

into:

```text
1 + N + N + N queries
```

Prefer:

```text
fetch employees
↓
collect required IDs
↓
batch fetch salary
↓
batch fetch roster
↓
batch fetch attendance
↓
build lookup maps
↓
process employees in memory
```

Possible strategies:

- MongoDB `$in`;
- aggregation pipeline;
- batch repository methods;
- preload required records;
- bulk API calls;
- map/index results in memory;
- join/lookup where appropriate.

Do not add goroutines merely to make N+1 execute faster.

Fix the access pattern first.

---

## 3. Avoid Query-in-Loop Patterns

Treat these as suspicious:

```go
for _, item := range items {
    repo.GetByID(ctx, item.ID)
}
```

and:

```go
for _, employee := range employees {
    client.GetSomething(employee.Code)
}
```

Before accepting such code ask:

```text
Can this data be fetched once?
Can this call accept multiple IDs?
Can results be grouped/indexed?
```

A query inside a loop is not automatically wrong, but must be justified when the collection can become large.

---

## 4. Batch Correctly

Batching must be bounded.

Do not replace:

```text
N queries
```

with:

```text
one unbounded query containing every record in the system
```

For large datasets use controlled batch sizes.

Example:

```text
10,000 employees

→ batches of manageable size
→ fetch/process
→ continue
```

Choose the batch size based on measured behavior and backend limits, not arbitrary assumptions.

---

## 5. Check Query Shape and Indexes

Reducing query count is not enough if the resulting query is inefficient.

Verify:

- filter fields;
- indexes;
- sort fields;
- compound-index ordering;
- projection;
- query cardinality;
- document size.

Avoid fetching complete documents when only a few fields are needed.

Prefer:

```text
required fields only
```

when practical.

---

## 6. Avoid Over-Fetching

Do not fetch:

```text
all employees
all attendance
all salary records
```

when the operation only needs a bounded subset.

Push filtering down to the database when appropriate.

Prefer:

```text
database filters data
```

over:

```text
load everything
→ filter in application
```

unless there is a specific reason.

---

## 7. Avoid Repeated Computation

Inside large loops identify repeated work such as:

- parsing configuration repeatedly;
- compiling expressions repeatedly;
- decoding the same data repeatedly;
- repeated date calculations;
- repeated map construction;
- repeated permission checks that can safely be resolved once.

Move invariant work outside the loop.

Example:

```text
BAD

for employee:
    parse formula
    evaluate formula

BETTER

parse formula once
for employee:
    evaluate compiled formula
```

Only hoist work when the result is truly invariant.

---

## 8. Algorithmic Complexity

Before micro-optimizing, inspect complexity.

Watch for:

```text
nested loops
repeated linear search
repeated sorting
repeated map rebuilding
```

Example:

```text
for employee:
    for salary:
        find employee salary
```

Prefer:

```text
salaryByEmployee := map[EmployeeCode]Salary
```

then:

```text
O(1)
```

lookup per employee.

---

## 9. Concurrency Is Not the First Optimization

Do not automatically solve latency with goroutines.

First ask:

```text
Is this CPU-bound?
DB-bound?
network-bound?
N+1?
lock-bound?
```

Concurrency can increase:

- DB connection pressure;
- memory;
- scheduler overhead;
- lock contention;
- API load;
- timeout frequency.

Use it only after the access pattern is reasonable.

---

## 10. Bounded Concurrency

When concurrency is justified:

- use bounded workers/semaphores;
- propagate context;
- stop work on cancellation;
- propagate errors;
- avoid goroutine leaks;
- consider downstream capacity.

Never spawn an unbounded goroutine per record for potentially large input.

Bad:

```text
3000 employees
→ 3000 goroutines
→ 3000 simultaneous DB operations
```

Prefer controlled parallelism.

---

## 11. Context and Timeout Handling

A `context deadline exceeded` error is not automatically a signal to increase the timeout.

Investigate first:

```text
query count
query latency
connection pool saturation
batch size
locks
external calls
serial processing
```

Increasing a timeout can hide the underlying performance problem.

Change timeouts only when the operation legitimately requires more time after inefficiencies have been addressed.

---

## 12. Database Connection Pressure

When adding parallel database work consider:

```text
application concurrency
×
number of DB operations per worker
×
number of running instances
```

Do not optimize one request in isolation while overwhelming the database across the deployment.

---

## 13. Memory

Watch for:

- loading large collections at once;
- retaining full documents unnecessarily;
- large intermediate slices;
- copying large structures;
- unbounded caches;
- buffering complete files/responses.

Prefer streaming or bounded batches where practical.

Do not trade an N+1 problem for an out-of-memory problem.

---

## 14. Cache Carefully

Caching is not a default fix for poor queries.

Before adding cache determine:

```text
data volatility
acceptable staleness
invalidation strategy
tenant isolation
memory cost
```

Do not cache incorrect or authorization-sensitive results merely for performance.

---

## 15. Bulk Operations

For bulk changes prefer native bulk APIs where appropriate.

Examples:

```text
MongoDB bulk write
batch inserts
batch updates
multi-ID reads
```

Avoid performing independent write requests one-by-one when equivalent safe bulk functionality already exists.

Preserve per-record error handling when the business operation requires it.

---

## 16. External Services

N+1 also applies outside databases.

Example:

```text
for employee:
    call auth service
```

may be as problematic as DB N+1.

Look for:

- batch APIs;
- local data already available;
- safe reuse;
- deduplicating repeated requests.

Do not bypass service boundaries just for speed.

---

## 17. Pagination

Large list endpoints should not load unbounded data.

Check:

- server-side pagination;
- filter-before-pagination;
- stable sort;
- reasonable projection.

Avoid client-side pagination of a massive dataset when the backend can paginate.

---

## 18. Frontend Performance

Before frontend optimization inspect:

- repeated API calls;
- large list rendering;
- unnecessary rerenders;
- expensive derived state;
- unnecessary effects;
- duplicate data requests;
- oversized bundles/assets.

Do not add `memo`, `useMemo`, or `useCallback` everywhere by default.

Optimize observed or structurally obvious hot paths.

---

## 19. Preserve Correctness

Performance optimization must not silently change:

- ordering;
- filtering;
- authorization;
- tenant isolation;
- missing-record behavior;
- error handling;
- transactional semantics;
- calculation results.

Performance is not successful if behavior changes incorrectly.

---

## 20. Required Performance Report

Before implementation document:

```text
Observed problem:
...

Measured/suspected bottleneck:
...

Current complexity/access pattern:
...

Example:
1 + 3N database calls

Proposed change:
...

Expected impact:
...

Correctness risks:
...
```

After implementation document:

```text
Before:
- query count:
- latency:
- memory:
- concurrency:

After:
- query count:
- latency:
- memory:
- concurrency:

Regression tests:
...

Remaining bottlenecks:
...
```

Do not claim a performance improvement without evidence where measurement is available.
