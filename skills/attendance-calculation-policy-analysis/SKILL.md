---
name: attendance-calculation-policy-analysis
description: Analyse new or changed attendance calculation policies involving shifts, multiple punches, OT, cross-midnight work, segments, corrections, summaries, or payroll handoff. Use before designing or implementing such policy changes; do not use for routine attendance reports or isolated UI fixes.
---

# Attendance Calculation Policy Analysis

Use this skill before changing an attendance calculation model. The outcome is a concise, evidence-backed policy and compatibility analysis that a plan can be built from.

## Read-only analysis first

Read the active plan (if any), relevant repository rules, current diff, and only the directly related tests before proposing implementation. Trace the actual flow:

`device ingest → punch resolution → canonical punches → schedule/roster → date selection → pairing → attendance status/OT → corrections → live/register summaries → payroll handoff → UI`

Identify the owner at each boundary. Device ingestion retains raw events; resolver normalizes identity and direction; attendance owns evaluation; payroll consumes attendance-owned values; UI configures and presents contracts.

## Compare requirements precisely

For each material requirement, classify current code as one of:

- **Supported** — behaviour already exists in the required form.
- **Supported foundation** — reusable building block exists but does not satisfy the requested mechanism.
- **Partially supported** — some cases work but required cases do not.
- **Different policy** — existing behaviour intentionally implements another business rule.
- **Missing** — no relevant capability exists.
- **Business decision** — current code cannot determine the requested policy safely.

Do not treat an adjacent feature as equivalent. In particular, distinguish:

- pair-duration aggregation from persisted calculated segments;
- an overnight assigned-shift carry window from daytime extra-work cross-date ownership;
- threshold-based OT from shift-boundary regular/OT classification;
- raw punch timestamps from attendance-date ownership;
- correction/leave sessions from work segments;
- calculated OT from approved/payroll-eligible OT.

## Compatibility design

When the request introduces a special policy, make it a reusable tenant-configurable rule or mode. Define the compatibility condition explicitly: missing or unselected mode continues through the unchanged legacy path. Never hardcode a named tenant or silently replace an existing policy.

Before accepting the design, identify whether a new mode affects:

- attendance status eligibility;
- date ownership and next-shift punch collisions;
- persistence, idempotency and rebuild scope;
- corrections, monthly register snapshots and locks;
- OT approval and payroll reprocessing;
- UI contracts and visible-flow verification.

Record unresolved policy choices as decisions. Do not invent limits, rounding, special-day, directionless-pairing, approval, or payroll-revision policies.

## Plan output

Turn the analysis into a plan (plan skill) whose steps follow real ownership boundaries, typically:

1. Rule selection and segment calculation.
2. Persistence, corrections and recalculation.
3. OT lifecycle and payroll boundary.
4. Configuration, presentation and E2E.

Each step names the legacy behaviour that must stay unchanged and the test that proves it. Findings do not become steps until accepted.

## Completion boundary

End after delivering the evidence, compatibility boundary, pending decisions and a reviewable plan. Load `plan`, `tdd`, and E2E workflows only when the task advances into those stages.
