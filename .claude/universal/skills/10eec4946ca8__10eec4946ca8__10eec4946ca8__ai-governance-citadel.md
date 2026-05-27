# AI Governance & Citadel Architecture — 40 Skills

Council daemon architecture, gate chains, personality modeling, financial AI, and safety patterns.

## Council Daemon Architecture (6 skills)

### SK-199: Multi-Engine Sequential Pipeline with Mid-Pipeline Feedback
8 engines in strict sequence. Regime injected after step 2 for downstream context. Two-pass risk: preliminary with hardcoded allocation, re-run with actual weights.
- **File:** `Citadel/council/ruth/ruth/core.py`

### SK-200: Authority Mode Escalation (RECOMMENDATION → CONDITIONAL → FULL)
IntEnum with integer threshold comparison. FULL requires all 5 gates PASS plus external governance approval (defense in depth).
- **File:** `Citadel/council/ruth/ruth/authority.py`

### SK-201: Fail-Closed Governance Gate Default
Missing gate = DENY (safety-critical). Missing bridge = report unavailable (operational). Intentional asymmetry.
- **File:** `Citadel/council/ruth/ruth/authority.py`

### SK-202: IPC Gate Daemon with Fail-Closed Import
TCP 18612, length-prefixed JSON [4-byte BE uint32 + UTF-8]. ImportError → all artifacts rejected. MAX_PAYLOAD = 65536.
- **File:** `Citadel/council/substrate/gaterunnerd.py`

### SK-203: Async/Sync Governance Compatibility Layer
Detects coroutines via `asyncio.iscoroutine()`. Normalizes both GovernanceDecision and legacy bool return types.
- **File:** `Citadel/council/ruth/ruth/authority.py`

### SK-204: Dependency Injection for Testable Financial Bridges
Bridge and governance gate both Optional[Any], injected post-construction. Every path returns dict with required `action` key.
- **File:** `Citadel/council/ruth/ruth/authority.py`

## Gate Chain Design (4 skills)

### SK-205: Ordered Gate Chain with NOT_EVALUATED Status
Signal → Risk → Regime → Preservation → Execution. On FAIL+blocking: remaining gates = NOT_EVALUATED (explicit in audit).
- **File:** `Citadel/council/ruth/gates/gate_chain.py`

### SK-206: 7-Stage Council Gate Chain (Mixed Blocking)
Sarah/Esther/Magen/Ahki = blocking (DENY short-circuits). Abigail/Ruth/Ezri = advisory. Hard gate < 0.5 forces composite to 0.0.
- **File:** `Citadel/governance/decision_envelope.py`

### SK-207: Decision Envelope as Universal Contract
{intent, subject, risk_score, value_score, alignment_score, gate_results, final_verdict, provenance_hash}. ID = SHA-256[:16].
- **File:** `Citadel/governance/decision_envelope.py`

### SK-208: Financial Gate Sequence Encoding Domain Knowledge
Signal confidence → risk limits → regime → preservation → authority. Order is a machine-encoded risk decision tree.
- **File:** `Citadel/council/ruth/gates/gate_chain.py`

## Personality Modeling (5 skills)

### SK-209: Three-Tier Persona Adaptation with NLP Detection
NOVICE/INTERMEDIATE/EXPERT auto-detected from query history. 37-term frozenset for expert detection. Different rendering per tier.
- **File:** `Citadel/council/ruth/ruth/persona.py`

### SK-210: Biblical Embodiment as Frozen Personality Spec
`frozen=True` dataclass: core_virtues, governing_pattern, forbidden_drift, speech_law, pressure_behavior. Immutable at runtime.
- **File:** `Citadel/heptagon/registry.py`

### SK-211: Voice Archetype as Behavioral Anchor
Concrete voice descriptions (e.g. "Idris Elba depth") resist drift better than adjective lists.
- **File:** `Citadel/heptagon/registry.py`

### SK-212: Pressure Behavior as Stress-Mode Invariant
Explicit behavior specs for adversarial conditions — where personality drift most commonly occurs.
- **File:** `Citadel/heptagon/registry.py`

### SK-213: AI Companion Avatar FSM
idle→listening→thinking→acting→idle with VALID_TRANSITIONS table. Invalid = warn + no-op (no throw).
- **File:** `ai/companion/src/avatar.ts`

## Financial AI Subagent Patterns (6 skills)

### SK-214: 8-Engine Domain-Separated Analysis
Signal, regime, macro, microstructure, risk, allocation, wealth impact, performance scoring. Each independently testable.
- **File:** `Citadel/council/ruth/ruth/core.py`

### SK-215: Hard Risk Limits with Strict Inequality
VaR > 0.05, drawdown > 0.15, concentration > 0.60. At-limit = pass (correct financial convention).
- **File:** `Citadel/council/ruth/ruth/authority.py`

### SK-216: Brier Score Calibration
mean((p_i - o_i)^2). Measures calibration, not accuracy. 10-bin calibration curve. 10K history cap.
- **File:** `Citadel/council/ruth/ruth/metacognition.py`

### SK-217: Signed Decision Attribution
Regime risk-on = +0.5, high VaR = -0.4, stale data = -0.2. Sorted by abs(contribution) descending.
- **File:** `Citadel/council/ruth/ruth/metacognition.py`

### SK-218: Counterfactual Portfolio Comparison
Allocation deltas + risk deltas + regime alignment. 50bps minimum improvement threshold filters noise.
- **File:** `Citadel/council/ruth/ruth/metacognition.py`

### SK-219: Shannon Entropy Cognitive Bias Detection
Recency bias (last 25% >1.5x frequency), anchoring (>40% steps), low diversity (entropy <50% max).
- **File:** `Citadel/council/ruth/ruth/metacognition.py`

## Governance Enforcement (3 skills)

### SK-220: Three-Tier Covenant Enforcement
3 ABSOLUTE (harm, truth, manipulation) → hard_stop. 2 STRONG → block_alert. 3 STANDARD → warn/guide. Worst tier wins.
- **File:** `Citadel/governance/covenant_enforcer.py`

### SK-221: Tuple Pattern Database for Intent Classification
Literal phrase tuples (not regex). Fast, auditable. Coverage gaps visible by inspection.
- **File:** `Citadel/governance/covenant_enforcer.py`

### SK-222: Universal Governance Interceptor API
5 hooks: before_execute, before_persist, before_route, after_event, after_failure. Full event log for replay.
- **File:** `Citadel/governance/interceptors.py`

## Drift Detection (2 skills)

### SK-223: 7-Dimension Weighted Identity Drift Index
goal_divergence (0.25), policy_override (0.20), mode_mismatch (0.15), exception_rate (0.15), reversal (0.10), artifact (0.10), covenant (0.05). Alert ≥ 0.30, freeze ≥ 0.60.
- **File:** `Citadel/governance/drift_signal.py`

### SK-224: Quality Drift Tracking as Runtime Invariant
abs(quality_drift_delta) > 0.15 → VIOLATION. Plus QUALITY_FLOOR (< 0.3) and ERROR_RATE (> 5%) for defense-in-depth.
- **File:** `ai/genesys-ai/src/heptagon/enforcement.py`

## Heptagon 7-Layer Design (5 skills)

### SK-225: L3 Kernel with 7+1 Typed Sub-Engines
Admission, Workspace (7 nodes = Miller's Law), RouteSelector, Execution (10 actions/cycle max), Consolidation, Verification, BudgetGovernor (3-6-9), CognitiveEngine.
- **File:** `Citadel/heptagon/layers.py`

### SK-226: L5 Anti-Goodhart Metric Pairing
Every metric has `anti_goodhart_pair`. Divergence detected when A at target but B below target.
- **File:** `Citadel/heptagon/layers.py`

### SK-227: L6 Bounded Parameters with Stabilization Window
max_swing = 5% per cycle. stabilization_window = 3 cycles. Only L6 can write back to L3 parameters.
- **File:** `Citadel/heptagon/layers.py`

### SK-228: L4 Mandatory Trace Completeness Rule
Every admission/route/expansion/consolidation/halt must produce a trace. state_snapshot_hash enables replay.
- **File:** `Citadel/heptagon/layers.py`

### SK-229: L3.8 R1_PER Fidelity as Lossless Encoding
Parse failure → default_intent = "QUERY" (never "COMMAND"). Divergence is a BUG, not a tradeoff.
- **File:** `Citadel/heptagon/layers.py`

## AI Safety Patterns (6 skills)

### SK-230: Multi-Dimensional Response Verification
8-category safety check + weighted quality (40% relevance + 35% coherence + 25% completeness). Dual halt: score < 0.3 OR coherence < 0.5.
- **File:** `ai/genesys-ai/src/heptagon/verification.py`

### SK-231: 12-Invariant L7 Enforcement (Tiered Hard Stop)
4 CRITICAL → hard_stop (manual reset). 4 VIOLATION. 4 WARNING. PII_LEAKAGE and HALLUCINATION_GUARD are CRITICAL.
- **File:** `ai/genesys-ai/src/heptagon/enforcement.py`

### SK-232: Active Deception Labyrinth (Constitutional Authorization)
Requires 3-member quorum (Esther + Sarah + Ahki). Zero shared mutation with production. Evidence via HMAC-SHA256 hash chain.
- **File:** `Citadel/labyrinth/environment.py`, `Citadel/labyrinth/trap.py`

### SK-233: Memory Lineage Hash Chain
SHA-256(last_entry || member_id) for chain extension. Typed quorum for reconstitution prevents single-member spoofing.
- **File:** `Citadel/heptagon/attestation.py`

### SK-234: Authority Overclaim Detection
Pattern matching against agent_capabilities set. "I can access your files" without filesystem_access → VIOLATION.
- **File:** `ai/genesys-ai/src/heptagon/enforcement.py`

### SK-235: Citation-Format Hallucination Guard
DOI, ISBN, academic citation [N] Author, A. et al. structural detection. CRITICAL severity.
- **File:** `ai/genesys-ai/src/heptagon/enforcement.py`

## Tool Integration (3 skills)

### SK-236: Three-Layer Storage (Cache → JSONL → XSTORE)
Write: cache → JSONL (fsync'd) → B-tree. Startup: SQLite seeded → JSONL overlaid (crash window recovery).
- **File:** `Citadel/council/substrate/xstore_backend.py`

### SK-237: B-Tree Range Scan via \xff Upper Bound
`prefix_bytes + b"\xff"` captures all sequences above prefix. Per-namespace JSONL files isolate failure domains.
- **File:** `Citadel/council/substrate/xstore_backend.py`

### SK-238: Incompatible Wire Formats (Stub vs Production)
Dev stub uses `b"ENC:"` prefix. Production decrypt raises ValueError on `b"ENC:"` — makes migration failures loud.
- **File:** `Citadel/council/substrate/xsec_crypto_bridge.py`
