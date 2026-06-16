---
name: zero-open-ledger-closure
description: Use when converting a defect ledger, audit ledger, or resilience DEF-ID list into a verifiable closure plan and final status where no active in-scope OPEN, CLOSING, TRACKED-DEFER, TODO, stub, scaffold, or skipped item is hidden by wording.
---

# Zero-Open Ledger Closure

## Process

1. Define the exact seal scope.
2. Query every ledger row in that scope for:
   - `OPEN`
   - `CLOSING`
   - `TRACKED-DEFER`
   - `BISECTING`
   - `BLOCKED`
   - `TODO`
   - `stub` / `scaffold`
3. For each row, require one of:
   - Implementation patch.
   - New or updated gate.
   - Evidence log showing the gate passed.
   - Explicit scope removal with user-approved wording.

## Forbidden Moves

- Do not rename a blocker to `tracked` and call the seal done.
- Do not remove fail markers from gates to make a sweep green.
- Do not mark generated drift closed without running the generator.
- Do not commit a final seal tag while a seal-scope row still has no passing gate.

## Output

Produce a compact matrix:

`DEF-ID | previous status | new status | implementation evidence | gate evidence | remaining risk`
