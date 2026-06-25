---
name: superc-language-accuracy-seal
description: Use for SUPER C language-accuracy seal work: spec/canon reconciliation, generated canon pack regeneration, scc1-scc2 fixed-point proof, DEF ledger closure, and all-green gate evidence without false carve-outs.
---

# SUPER C Language Accuracy Seal

## Rules

1. Start from repo truth: `git status`, current branch, DEF ledger rows, audit closeout, and gate inventory.
2. Never hand-edit `.superc/agent-canon/*.json`; fix `tools/canon-export/` and regenerate.
3. Treat behavioral equivalence and fixed-point closure as separate proof lanes.
4. A timeout or signal-killed compiler process (`rc=124` or `rc=137`) is always a FAIL, even if both compared sides match.
5. Do not tag a final seal while any language/spec/compiler/gate accuracy DEF-ID remains `OPEN`, `CLOSING`, or `TRACKED-DEFER`.

## Minimum Evidence

- `git diff --check`
- canon export and canon manifest gates
- `compiler/scc/tests/scc_smoke.sh` from `compiler/scc`
- H4, chain, equivalence, and fixed-point gates
- strict timed gate sweep with `N passed, 0 failed, N total`
- final report with exact commit, tag, hashes, CSV/log paths, and remaining blockers if any

## Fixed-Point Standard

The strict self-host proof is:

```text
seedc-built scc -> scc2
scc2 -> scc2'
sha256(scc2) == sha256(scc2')
```

If `scc2 emit-direct` hangs, silently drops code, or exits successfully without
producing the expected artifact, the seal is blocked. Record the blocker instead
of downgrading it to behavioral equivalence.
