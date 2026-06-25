---
source: platform/sdlc/13_skills/active/SKILL_GATE_SWEEP_BUDGETING_DISCIPLINE_001.playbook.md
canonical_id: SKILL_GATE_SWEEP_BUDGETING_DISCIPLINE_001
generated: 2026-05-28
runtime: claude_code
name: gate-sweep-budgeting-discipline
description: Use when a repo has many shell gates, long-running compiler/JIT probes, mixed fast and slow lanes, false timeouts, or "all green" seal verification requirements. Produces an isolated timed sweep with per-gate budgets, internal-FAIL detection, and repeatable CSV/log evidence.
---

# Gate Sweep Budgeting Discipline

## When To Use

Use this skill when:

- A project has dozens of shell gates and one flat timeout causes false failures.
- Aggregator gates call other gates and need larger budgets than unit gates.
- A gate sweep must prove both `rc=0` and no internal `FAIL` lines.
- A previous sweep produced malformed entries because child gates inherited the inventory stream on stdin.
- The user asks for all-green seal evidence, gate optimization, or gate success efficiency.

## Rules

1. Use a manifest or inventory file as the source of truth for which gates run.
2. Run every gate through a process-group timeout wrapper, not `perl alarm` or single-PID `kill`.
3. Redirect each child gate stdin from `/dev/null`; never let child gates inherit the manifest stream.
4. Assign per-gate budgets. Aggregators and JIT-heavy compiler gates get explicit high budgets; fast unit gates get the default.
5. Treat internal `FAIL` lines as failures even when the outer rc is `0`.
6. Write one CSV row per gate and one log file per gate. Include `gate,status,rc,seconds,budget,fail_lines,summary`.
7. Do not call a seal all-green while a gate is missing, timed out, killed, or internally emitted `FAIL`.
8. If a gate passes standalone but fails inside the sweep, inspect process contention, inherited stdin, cwd, temporary files, and stale expected-absence tests.

## Implementation Pattern

```bash
bash scripts/gates/run_all_gates_timed.sh
```

The runner should:

- Read only the gate basename from the inventory's first CSV column.
- Run `bash scripts/gates/kill_after.sh "$budget" bash "$script" < /dev/null`.
- Count internal failures with a strict output pattern such as `(^|[[:space:]])FAIL([[:space:]/:]|$)`.
- Emit the output CSV and logs directory path at the end.

## Evidence Standard

Accept only a final summary shaped like:

```text
run_all_gates_timed: N passed, 0 failed, N total
```

Keep the CSV/log path in the closure report. For SUPER C v31.5.H, the reference run was:

```text
run_all_gates_timed: 101 passed, 0 failed, 101 total
```

## Common Fixes

- Malformed gate names mid-sweep: child process consumed the inventory stdin. Add `< /dev/null`.
- Aggregator timeout: add a gate-specific budget, do not raise the global default blindly.
- Internal `FAIL` with rc=0: either fix the underlying gate or reframe it as an informational audit that does not emit `FAIL`.
- Stale absence assertion: when a feature becomes real, flip tests from “must not advertise” to “must execute and pass.”
