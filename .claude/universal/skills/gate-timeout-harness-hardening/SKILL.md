---
name: gate-timeout-harness-hardening
description: Use when hardening shell test gates, timeout wrappers, CI aggregators, or compiler/JIT test harnesses against orphan children, signal-vs-exit masking, hidden FAIL lines, retry masking, and recursive slow gate timeouts.
---

# Gate Timeout Harness Hardening

## Required Properties

- Spawn each timed command into its own process group.
- On timeout, send SIGKILL to the process group, not only the parent shell.
- Preserve signal exits as `128 + signal`.
- Fail on nonzero RC even if expected text appears.
- Fail on hidden internal markers: `FAIL`, `XPASS`, `XFAIL`, `BLOCKED`, `SKIP`, `TRACKED-DEFER`.
- Keep retries explicit and local to documented flakes.

## Audit Steps

1. Test timeout: `kill_after 2 sleep 10` should exit 137 promptly.
2. Test signal: child `SIGSEGV` should exit 139, never 0.
3. Test hidden failure text through the shared gate helper.
4. Ensure aggregators do not recursively invoke full historical campaigns.
5. Save logs/CSV paths for slow gates and failed gates.

## Closure

Close a harness DEF only after a regression gate proves nonzero RC, hidden FAIL, and clean expected output behavior.
