# GENOSCOPY Canonical Directory Map
## Reference for apex-directory-discipline skill
## Update this file when the Chief Architect legitimately creates a new directory

---

## Last verified: 2026-04-27

## Top-level structure

```
GENOSCOPY/
├── xisc/                          STATUS: ACTIVE C11 → being rewritten to SUPER C
├── devices/                       STATUS: ACTIVE — contains XEMU and other device code
├── superc/ (compiler root)        STATUS: ACTIVE — SUPER C compiler
├── docs/                          STATUS: ACTIVE — project documentation
├── RMEC_AMENDMENTS_*.md           STATUS: SINGLE FILE at root
└── [other root-level governance docs]
```

---

## xisc/ — XISC Cross Instruction Set Computing

```
xisc/
├── README.md                      (13,490 LOC total, Sprint 39 complete)
├── adr/                           Architecture Decision Records (4 files)
│   ├── ADR-001-ISA-SUPPORT-TIERS.md
│   ├── ADR-002-TRANSFORMER-CLOUD-FABRIC.md
│   ├── ADR-003-FIRMWARE-STRATEGY.md
│   └── ADR-004-MASTER-ARCHITECTURE.md
│
├── spec/                          ← ALL XISC SPECS GO HERE (11 existing)
│   ├── XISC_COMPUTATIONAL_MODEL_SPEC.md
│   ├── XKABI_OBJECT_MODEL.md
│   ├── XKABI_SYSCALL_TABLE.md
│   ├── XISC_MEMORY_MODEL.md
│   ├── XISC_IPC_MODEL.md
│   ├── XISC_SCHEDULING_MODEL.md
│   ├── XISC_DRIVER_POD_CONTRACTS.md
│   ├── XISC_ABI_VERSIONING.md
│   ├── XISC_GUEST_PERSONALITY_CONTRACT.md
│   ├── POLICIES.md
│   └── XISC_APEX_SPEC_v0.1.md    ← New XISC-Apex spec GOES HERE (alongside existing)
│
├── include/                       16 C headers, 1,767 LOC
│   ├── xisc.h
│   ├── xcog.h
│   ├── xkabi.h
│   └── [13 more headers]
│   └── xkabi.m7s                  ← Future SUPER C mint spec GOES HERE
│
├── runtime/
│   ├── xkabi_native/              ← 5,883 LOC C11 native layer (Sprint 39)
│   │   ├── CMakeLists.txt
│   │   ├── native_internal.h
│   │   ├── native_main.c
│   │   └── [17 more .c files]
│   │   └── xkabi_objects.sc       ← SUPER C rewrite files GO HERE alongside .c
│   │
│   ├── personality_linux/         2,166 LOC Linux ABI translation
│   │   ├── linux_loader.c         ⚠️ P0 known issue: dead include
│   │   └── linux_syscall_dispatch.c
│   │
│   ├── wasm_personality/          204 LOC WASM shim
│   ├── translator_service/        988 LOC Python orchestrator
│   └── xisc_xjit_bridge.c        258 LOC XISC→XJIT bridge
│
├── conformance/                   1,417 LOC — 32/32 tests via linux_shim oracle
│   ├── conftest.py
│   ├── test_objects.py
│   ├── test_memory.py
│   ├── xkabi_conformance.c
│   └── backends/
│       └── linux_shim.py
│       └── native_kernel.py       ← MISSING (P1 known issue) — create here when ready
│
└── benchmarks/                    807 LOC
    └── bench_native_layer.c
```

---

## devices/ — Device Implementations

```
devices/
└── desktop/
    └── vm/
        └── xemu/                  ← ALL XEMU CODE GOES HERE
            └── src/
                └── wasm_interp.c  (2,655 LOC — WASM bytecode engine)
                └── [future .sc files go here]
```

Do NOT create:
- `GENOSCOPY/emulation/`           ← WRONG
- `GENOSCOPY/xemu/`                ← WRONG
- Any top-level emulation directory ← WRONG

---

## SUPER C Compiler

```
superc/ (or compiler root — confirm exact name with project)
├── compiler/
│   ├── seedc/                     22,955 LOC C11 seed compiler
│   └── scc/                       ~15,357 LOC SUPER C self-host
│       ├── src/
│       │   ├── sema_complete.sc
│       │   ├── lower_complete.sc
│       │   ├── codegen_x86.sc
│       │   └── scc_entry.c
│       └── tests/
└── [lexicon, spec docs at this level or in docs/]
```

---

## Documentation

```
docs/                              ← ALL PROJECT DOCS GO HERE
├── XEMU_SPEC_v1.1.md
├── XEMU_NES_TIMING_MODEL.md
└── [other project docs]
```

---

## Root-level governance

```
GENOSCOPY/
├── RMEC_AMENDMENTS_6_THROUGH_9.md  ← SINGLE amendments file (no subdirectory)
├── XEMU_SPEC_v1.1.md               ← May also be here (confirm with project)
└── [other canonical root docs]
```

---

## New Legitimate Directories (add here when Chief Architect creates one)

| Date | Directory | Who created | Reason |
|---|---|---|---|
| (none yet) | | | |
