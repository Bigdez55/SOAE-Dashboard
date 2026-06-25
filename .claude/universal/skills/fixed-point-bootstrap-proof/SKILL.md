---
name: fixed-point-bootstrap-proof
description: Use when proving a compiler bootstrap fixed point such as scc1 to scc2 to scc2-prime, including behavioral equivalence, object/codegen equivalence, deterministic build inputs, and fail-closed handling of emit-direct hangs or silent truncation.
---

# Fixed-Point Bootstrap Proof

## Required Proof

1. Build `compiler1` from the trusted path.
2. Build `compiler2` with `compiler1`.
3. Build `compiler2-prime` with `compiler2`.
4. Require deterministic equality for the chosen seal:
   - Binary hash equality for fixed-point seal.
   - Object/codegen corpus equality for compiler behavior seal.
   - Command output equality is not enough.

## Guardrails

- Set deterministic env: `SOURCE_DATE_EPOCH=0`, `TZ=UTC`, `LC_ALL=C`, and single-job build mode when supported.
- Run potentially wedging compiler children through a process-group timeout harness.
- Treat `BLOCKED`, `SKIP`, `XFAIL`, `XPASS`, nonzero RC, signal death, size drift, or missing artifact as failure.
- Do not enable known-wedging lanes interactively unless the timeout harness has been verified in the same turn.

## Evidence Checklist

- `scc_via_scc_h4_gate.sh`
- `scc1_scc2_chain_gate.sh`
- `scc1_scc2_equivalence_gate.sh`
- Fixed-point gate with `compiler2 == compiler2-prime`
- Per-TU `nm`/size diff if silent code drops were previously observed
