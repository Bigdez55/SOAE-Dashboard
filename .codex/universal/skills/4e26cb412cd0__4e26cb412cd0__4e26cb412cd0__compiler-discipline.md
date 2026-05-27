# compiler-discipline

Empirical discipline for evolving the SUPER C v1 self-hosted compiler (seedc → scc) without breaking bootstrap. Codifies lessons from Stage I (slices 1–5z) and the STOP-6 codegen audits.

Scope: `superc-v1/` tree only. Authority: project memory `project_superc_v1_authorized_scope.md` + audits under `audits/`.

Trigger: invoke before ANY change to `frontend/src/*.sc`, `compiler/scc/src/*.sc`, `compiler/scc/src/*.c`, SCIR opcode tables, or codegen byte-emission paths.

---

## 1. Convention 9: enum-tail-append

**Rule.** Every new variant added to `TokenKind`, `AstKind`, or SCIR opcode enums MUST be appended AFTER the last existing variant. No mid-enum insertion. Ever.

**Why.** Discriminants are positional integers. Parsers, sema walkers, and codegen dispatch tables across the seedc/scc bootstrap chain use hardcoded `k == N` checks (and switch arms keyed on literal integers). Inserting a variant mid-enum shifts every subsequent discriminant by +1, silently miscompiling every downstream consumer.

**Citation.** Slice 1 reclassification — commit `0a06e6f`. The naive insertion of a new TokenKind variant in the middle of the enum block flipped 6 downstream `k == N` checks in `parser.sc` and produced a green-but-wrong scc that emitted reordered opcodes. Lesson: append-only.

**Enforcement.** During code review, diff the enum block. If any line above the new variant moved, REJECT and re-author at tail.

---

## 2. Bootstrap-safety class taxonomy

Classify every change BEFORE editing. Pick the strictest matching class.

### SAFE
- Token-only additions AT END of enum.
- AST-additive variants AT END, with no sema/lower consumer yet.
- New helper functions not yet called from existing demo paths.
- **Verification:** `make test-bootstrap` post-build. Single green run sufficient.

### CAUTIOUS
- New sema walker for a new AST kind that EXECUTES on existing demo paths.
- Lowering additions touching shared IR builders.
- New parser productions reachable from existing source.
- **Verification:** Pre-change G6 sha snapshot. Post-change G6 sha snapshot. Squash-merge only after BOTH sha sets are green and DDC re-passes.

### HIGH-RISK
- Codegen byte-output changes (any opcode emission, any RA tweak).
- Emit-fork retire / unify operations.
- Register allocator changes.
- Calling-convention adjustments (>32-bit return paths, spill changes).
- **Verification:** STOP-6 protocol — G6 sha + DDC v2 + dual-build (seedc-built scc vs scc-built scc) + per-demo byte-identity diff + smoke suite + `ret64` regression. ALL green or revert.

### BOOTSTRAP-CRITICAL
- Any change to parser/sema where existing scc source paths execute under the new code.
- Any new keyword OR identifier promotion.
- **Verification:** Identifier-collision pre-check (Section 3) MANDATORY. Then HIGH-RISK protocol applies on top.

---

## 3. Identifier-collision pre-check protocol

Before adding any new keyword to the lexer, run:

```sh
grep -rwE "\b<keyword>\b" frontend/src/*.sc compiler/scc/src/*.{sc,c}
```

**Decision rule:**
- **Zero matches** → SAFE to promote to keyword. Proceed.
- **Any matches** → HIGH-RISK. The keyword collides with an existing identifier in scc source. **Rename the colliding identifiers in scc source FIRST**, in a separate squash-merged change, with full G6 + DDC pass. Only after the source is collision-free may the keyword be added.

Never add a keyword and rename in the same commit. The rename must land and stabilize first.

---

## 4. Discriminant audit protocol

Before merging any new TokenKind/AstKind variant, verify discriminants `0..N` for prior variants are unchanged.

```sh
grep -n "k == [0-9]" frontend/src/parser.sc | wc -l
```

The count MUST be identical pre- and post-change. If it differs, a `k == N` check was added/removed/shifted — halt and audit. Additions of new `k == N` checks for the new variant are allowed ONLY at tail discriminant; they must reference the highest integer present.

Cross-check: same grep against `compiler/scc/src/*.sc` for sema/lower dispatch.

---

## 5. The 6 seedc bug catalog reference

Authoritative list: `audits/codegen_silent_drop_finding.md`.

Every new compiler change MUST be cross-checked against the 4 active workarounds:
- **Bug 2** — silent drop on certain expression forms; workaround active in lowering.
- **Bug 3** — calling-convention return-slot edge case.
- **Bug 4** — discriminant compare miscompile under specific seedc opt path.
- **Bug 6** — emit-fork divergence on nested control flow.

Bugs 1 and 5 are closed. Do not regress workarounds. If a change appears to make a workaround unnecessary, do NOT remove it in the same change — file a follow-up slice with explicit DDC v2 + STOP-6 evidence.

---

## 6. v1.0.1 out-of-scope items + status mapping

The four deferred items from the v1.0.1 charter:

| # | Item | Status | Stage |
|---|------|--------|-------|
| 1 | Native if/else/while in scc | PARTIAL — slice 2 in flight | Stage I |
| 2 | Strings, arrays, structs | DEFERRED | Stage III |
| 3 | >32-bit return values | DONE — slice 5z landed | Stage I (closed) |
| 4 | scc emit-fork unification | DEFERRED | Stage II |

Any work touching these areas must reference this table and the corresponding slice/stage. Do not silently expand scope.

---

## 7. Stage gate map (G1–G18)

Preconditions are strict; a gate cannot open until ALL upstream gates are green and all artifacts are squash-merged.

- **Stage I (Stage I closes at G14):** G1 lexer parity → G2 parser parity → G3 AST schema lock → G4 sema parity → G5 lower parity → G6 codegen byte-identity baseline → G7 DDC v1 → G8 dual-build → G9 ret64 regression → G10 emit-fork audit → G11 slice 1 reclassification (`0a06e6f`) → G12 slice 2 native control flow → G13 slice 5z >32-bit returns → G14 Stage I close (per `audits/STAGE_I_PROGRESS_2026-05-04.md`).
- **Stage II (closes at G15):** G15 = scc emit-fork unification. **G15 closes Stage II, not Stage I.** This is the most common misread; the audit STAGE_I_PROGRESS_2026-05-04.md is explicit.
- **Stage III:** G16 strings → G17 arrays → G18 structs.

No gate may be skipped. No gate may close on a yellow CI.

---

## 8. Skill revision log

- **v1.0** — 2026-05-04, post-slice-1a. Initial codification of Stage I empirical discipline. Authored from STAGE_I_PROGRESS_2026-05-04.md, codegen_silent_drop_finding.md, and the slice 1 reclassification post-mortem.
