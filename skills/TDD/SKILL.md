---
name: tdd
description: Use for every backend change or backend bug fix that alters behaviour, including small ones. Test first, seen failing, then the smallest change that passes.
---

# TDD

1. **Scenarios first.** Before writing tests, list them like a tester and show the list: happy path, boundaries, empty/missing data, each role, state changes, double submit, persisted record read back. Cover negative cases, not just positive.
2. **Red.** Write the test for the first scenario. Run it. It must fail, and fail for the expected reason (not a compile error or a broken fixture). Paste the failing line.
3. **Green.** Smallest production change that passes. No extra features, no cleanup.
4. **Refactor** only with tests green.
5. **Regression.** Run the package's tests and anything that consumes what you changed.

Rules:
- A test proves behaviour: input → observable result. Asserting that mock A called mock B is weak unless the call itself is the contract.
- Control time, randomness, network, and filesystem so tests are deterministic.
- **Never change an expected value to make a failing test pass** unless the requirement changed and the user said so. A test that disagrees with the code is a finding to report.
- Before changing a shared contract (API response, event payload, DTO, DB field), find its real consumers; don't break them silently.
- A pre-existing failure may be excluded only after checking it fails without your change too.

Proof for the plan's tick: the test name and the run result, e.g. `go test ./internal/processing/service -run TestRegisterMissingSummary → PASS`.
