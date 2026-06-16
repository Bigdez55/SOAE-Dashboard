---
name: language-accuracy-seal
description: Use when sealing or auditing a programming language implementation against its canonical spec, especially when source-of-truth docs, generated canon packs, compiler behavior, gates, and DEF ledgers must agree with no hidden defers or masked failures.
---

# Language Accuracy Seal

## Workflow

1. Establish truth roots:
   - Spec lock / manifest.
   - Grammar, keyword/operator/attribute inventories.
   - Compiler/parser/lowering surfaces.
   - Generated packs and editor/tooling projections.
   - DEF ledger and reconciliation reports.

2. Split every finding into one of four states:
   - `CLOSED`: implementation landed and gate evidence exists.
   - `OPEN`: live blocker.
   - `TRACKED-DEFER`: honest future milestone, not part of the seal claim.
   - `SUPERSEDED`: historical finding replaced by a newer evidence source.

3. Refuse broad seal claims while any seal-scope row is `OPEN`, `CLOSING`, `TRACKED-DEFER`, `BLOCKED`, `XFAIL`, `SKIP`, or `TODO`.

4. Validate through generator paths:
   - Regenerate generated artifacts with their owning tool.
   - Never hand-edit generated JSON or manifests.
   - Add a gate that fails if regeneration changes tracked outputs.

5. Produce a proof matrix:
   - Source file changed.
   - Behavior changed.
   - Gate evidence.
   - Remaining blocker, if any.

## Seal Language

Use `sealed` only when the relevant gate inventory is green and the ledger has no active seal-scope blockers. Otherwise say `partial closure`, `current-lane green`, or `blocked by <DEF-ID>`.
