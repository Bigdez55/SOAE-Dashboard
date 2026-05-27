# GEN.OS E2E Audit Dispatch — All 27 Agents Simultaneously

Dispatch the full 27-agent Apex Engineering Corps for a complete end-to-end audit
across all GEN.OS sprints. Use when approaching a major push gate or sprint milestone.

## When to use

- Before pushing 10+ commits to origin/main
- At the end of each sprint to gate merge
- After a P0 security incident to verify no regressions
- When 3+ agent domains were modified in a single session

## Audit Taxonomy

Every audit covers 6 dimensions:

| Dimension | Description |
|-----------|-------------|
| **Correctness** | Logic, math, protocol compliance |
| **Safety** | Memory safety, bounds, no UB |
| **Security** | Auth, crypto, secrets, XKABI rights |
| **Resilience** | Fault tolerance, crash recovery, timeouts |
| **Performance** | Latency, memory footprint, throughput |
| **Observability** | Audit trails, metrics, error propagation |

## Full 27-Agent Dispatch Message

```
TO: ALL 27 AGENTS (simultaneous dispatch)
FROM: master-orchestrator
TASK: E2E-AUDIT  SPRINT: [N]  DATE: [YYYY-MM-DD]

MANDATE: Conduct a complete E2E audit of GEN.OS Sprints 0-[N].
Each agent audits their domain across ALL 6 dimensions.
Report format: VERDICT + findings by severity (P0/P1/P2).
Push gate: GO if zero P0/P1 open. CONDITIONAL GO if P1s have fixes.

AGENTS BY TIER:

  T1 — ORCHESTRATION
    master-orchestrator:       Sprint plan integrity, MoSCoW alignment, commit history
    apex-coordinator:          Cross-agent dependency graph, unresolved findings
    the-architect:             ADR compliance, API contract consistency, architecture drift

  T2 — SYSTEMS & INFRASTRUCTURE
    apex-systems-architect:    All kernel/C freestanding code: XENOS, XSEC, XNET, XPKG,
                               XSTORE, XBLOB, XSHELL, XBUILD, XEMU, XJIT, XMIND
    data-infra-engineer:       XSTORE WAL/MVCC/btree, XBLOB gc, telemetry schemas
    data-infrastructure-lead:  XORCHESTRA service registry, health checks, svc wiring
    devops-catalyst:           All CI workflows (.github/workflows/), Makefiles,
                               SHA pin freshness, timeout coverage, no mutable tags
    hardware-integration-engineer: XPCI, XHPET, XLAPIC, XACPI, NVMe, iGPU drivers

  T3 — ANALYSIS & INTELLIGENCE
    system-signal-engine:      PAL telemetry hooks, signal coverage, dark metrics
    event-horizon-agent:       XNET TCP state machines, CRDT ops, protocol edge cases
    intelligence-lead:         XMIND inference correctness, GGUF loader safety, Q4_0 math
    intelligence-lead-v2:      Causal failure graph across sprints 0-[N]
    edge-ai-optimizer:         XMIND quantization accuracy, memory layout, scalar perf

  T4 — QUALITY & RELIABILITY
    platform-integrity-auditor: File count per sprint, include paths, cppcheck clean,
                                 no libc violations, PAL API compliance
    guardian-sentinel:          XKABI rights, TLS 1.3 compliance, crypto correctness,
                                 x509 chain verification, audit log completeness
    reliability-security-sentinel: P0/P1 findings status, hardening completeness,
                                    push gate verdict (GO/NO-GO/CONDITIONAL)
    test-forge:                 Test coverage: all 10 types × all sprint modules,
                                3 methodologies (white/black/grey box)
    resilience-architect:       Fault injection coverage, boot chain resilience,
                                watchdog wiring, graceful degradation paths

  T5 — EXPERIENCE & DESIGN
    product-experience-engineer: XSHELL UX flow, Orange Suite accessibility,
                                  boot animation, context menu completeness
    design-systems-forge:        design_tokens.h token usage, widget consistency,
                                 XFRAME visual regression
    knowledge-weaver:            MEMORY.md accuracy, ADR completeness, docs sync
    developer-experience-lead:   Skills coverage, .clangd completeness, DX gaps

  T6 — INNOVATION & DISRUPTION
    vanguard-disruptive-alchemist: Architecture assumptions to challenge for Sprint [N+1]
    vanguard-disruptor:            Red-team: what could an attacker do with current state?
    vanguard-innovation-scout:     SOTA gap analysis vs Sprints 0-[N] implementation

  T7 — PERFORMANCE & OBSERVABILITY
    performance-forge:    CPU/memory perf budgets: XMIND latency, XSTORE throughput,
                          boot time, XFRAME paint latency
    observability-nexus:  Audit event coverage, dark telemetry, SLO definitions

DELIVERABLE PER AGENT:
  1. VERDICT: GO | CONDITIONAL GO | NO-GO
  2. P0 findings (push blockers): [list or NONE]
  3. P1 findings (fix before GA): [list or NONE]
  4. P2 advisories (Sprint N+1): [list or NONE]
  5. Write report to: .claude/agent-memory/[agent-name]/[date]-audit.md

CONSTRAINTS:
  - Zero hallucination: cite exact file:line for each finding
  - No speculative findings without reading the file
  - Report in <30min wall time

PUSH GATE:
  master-orchestrator aggregates all verdicts.
  Push proceeds iff: reliability-security-sentinel = GO or CONDITIONAL GO
                     AND all P0s resolved
                     AND P1 fixes either applied or deferred with written rationale.
```

## Aggregation Protocol

After all 27 agents report:

1. **reliability-security-sentinel** issues the final push gate verdict
2. **apex-coordinator** resolves any conflicting findings between agents
3. **master-orchestrator** signs off with commit message and push command

## Severity Definitions

| Level | Criteria | Gate Impact |
|-------|---------|-------------|
| P0 | Data loss, security exploit, crash on boot | BLOCKS push |
| P1 | Protocol non-compliance, correctness bug, silent data error | BLOCKS push unless deferred with rationale |
| P2 | Performance regression, code smell, missing test | Does NOT block push |
| Advisory | Future risk, architectural concern | Does NOT block push |

## Post-Audit Commit Structure

```
fix: [agent] P0/P1 findings — [summary]

[Per-finding description with file:line citations]

Audited-by: 27-agent Apex Engineering Corps
Date: [YYYY-MM-DD]
```

## Reference

- Agent colors and tiers: `.claude/skills/agent-dispatch.md`
- Memory files: `.claude/agent-memory/[agent-name]/MEMORY.md`
- MEMORY.md auto-memory: `/Users/desmondearly/.claude/projects/.../memory/MEMORY.md`
