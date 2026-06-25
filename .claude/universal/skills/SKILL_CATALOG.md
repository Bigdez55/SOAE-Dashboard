# SKILL CATALOG
Generated: 2026-05-27 | Total skills: 275 | Numbered-suffix duplicates: 42

---

## CORE-SUPER-C
Skills authored for or evolved during SUPER C v1 compiler / GEN.OS sovereignty work.
These are the skills most likely to be invoked in a `superc-v1/` session.

- agent-execution-order — SUPER C ordering contract for parallel agents; prevents race conditions in seal cycles
- agent-worktree-discipline — Pre/post-flight discipline for any agent creating a git worktree; prevents stale-state corruption
- apex-directory-discipline — Governs all file/directory operations inside GENOSCOPY; enforces path discipline
- apex-parallel-deploy — Parallel multi-agent deployment strategy for large-scale compiler/systems projects
- apex-status-promotion-rules — Rules for when a sub-seal can promote to a parent tag; prevents premature promotion
- apex-verified-machine-encoding — Prevents silent compiler defects from hand-computed machine-code constants
- back-link-reuse-over-cache — Metadata economy: reuse parser back-links rather than re-caching AST lookups
- carveout-def-id-discipline — Every carve-out in a seal report must have a tracked DEF-* ID and detection signal (NEW 2026-05-27)
- compile-output-size-diff-probe — Diagnoses which TU is saturating a 64K section; companion to sc-empirical-surface-probe
- compiler-discipline — Empirical discipline for evolving seedc → scc without breaking bootstrap; codifies Stage I-III lessons
- dependency-sovereignty — SUPER C dependency sovereignty; no C FFI, no upstream format drift
- dynamic-rule-ledger — Tracks active governance rules across a seal cycle; single source of truth for in-flight constraints
- failure-mode-first-authoring — Author per-feature failure-mode list before writing code (NEW 2026-05-27)
- find-before-create — Mandates grep-before-add to prevent duplicate symbol/function authoring
- gate-auto-bootstrap-discipline — Forbids silent-pass when a gate's prereq artifact is missing
- gate-contention-isolation — Triage discipline for flaky gate failures driven by resource contention vs real bugs
- gate-dump-vs-runtime — Distinguishes IR dump evidence (scc_o1_dump) from live runtime evidence; prevents mis-diagnosis
- gate-harness-process-isolation — Process isolation for test harnesses that might spin; SIGKILL discipline
- git-remote-discipline — Pre-push remote verification; mandatory before every `git push`
- improvement-loop — SUPER C continuous skill improvement loop; patches skills after regression findings
- intent-compilation — Compiles user intent into a structured execution plan before any source modification
- internal-consensus-testing — Self-consistency protocol: multiple independent reads of the same artifact must agree before acting
- language-gate — Hard constraint: SC only in `superc-v1/`; rejects Python/TS/C drift (GEN.OS variant enforces P/TS/C)
- ledger-to-skill-merge-policy — Policy for when a dynamic-rule-ledger entry graduates to a permanent skill
- milestone-gate-design — SUPER C milestone gate design; structures the gate chain for a seal cycle
- multi-wave-audit-cadence — Cadence rules for multi-wave audit sessions; wave sequencing and merge discipline (NEW 2026-05-27)
- no-surprise-planning — Forces honest dependency and budget estimation before any compiler implementation begins
- one-shot-execution-planning — Deep preflight before any milestone touching parser/sema/linker/optimizer/boot
- pre-flight-ledger-injection — Injects active ledger entries into the context of a new compiler session
- process-group-kill-discipline — SIGKILL discipline for child processes that spin; perl-alarm is insufficient
- proof-matrix — Structures the evidence matrix for a seal (gate IDs, pass/fail, artifacts)
- red-team-preflight — Adversarial pre-review of a seal plan; surfaces hidden blockers before implementation
- response-accuracy-corrective — Self-correcting accuracy protocol; invoke before any audit/inventory/status claim
- sc-empirical-surface-probe — Empirical Surface Probe Mandate; probe BEFORE designing any compiler patch
- sc-field-lowering-discipline — Empirical discipline for sessions touching struct fields, field READ/WRITE lowering
- seal-reconciliation-discipline — Reconcile conflicting parallel-agent verdicts before declaring SEAL
- slice-planning — Plans a single SUPER C language slice (parser + sema + emit) as an atomic unit
- spec-authoring — Authors a binding spec document before implementation; prevents scope drift
- super-c-ai-governance-citadel — AI governance and citadel architecture for GEN.OS (40-skill bundle reference)
- super-c-build-toolchain-ci — Build system, toolchain, CI/CD for GEN.OS (45-skill bundle reference)
- super-c-compiler-discipline — Alias/mirror of compiler-discipline; SUPER C–prefixed variant
- super-c-desktop-ui-accessibility — Desktop shell, UI, accessibility, and applications (46-skill bundle reference)
- super-c-freestanding-c-kernel — Freestanding C kernel development for GEN.OS (57-skill bundle reference)
- super-c-one-shot-execution-planning — Alias/mirror of one-shot-execution-planning; SUPER C–prefixed variant
- super-c-security-crypto-engineering — Security and cryptographic engineering for GEN.OS (37-skill bundle reference)
- super-c-subsystems-from-scratch — From-scratch subsystem engineering (45-skill bundle reference)
- truth-state-check — Source-ranking protocol: git HEAD > IR dump > memory > prose assertion
- verify-validate — Pre-commit verification gate; run BEFORE every commit

---

## CORE-PROJECT-AGNOSTIC
Reusable engineering skills with no project-specific hard-coding.

- 26-low-level-kernel-and-boot-proof — Kernel and boot proof methodology for any freestanding target
- 27-ml-fine-tuning-and-distillation — ML fine-tuning and distillation pipeline patterns
- 28-fullstack-react-electron-threejs — Full-stack React + Electron + Three.js integration
- 29-mcp-tooling-and-automation-templates — MCP tooling and automation template patterns
- 30-trigger-router-and-auto-invocation — Trigger router and auto-invocation patterns
- 31-platform-build-starter-pack — Platform build starter pack
- 32-existing-repo-deep-audit — Deep audit methodology for any existing repo
- 33-source-of-truth-reconciliation — Source-of-truth reconciliation across divergent state
- 34-refactor-planning-and-repo-organization — Refactor planning and repo organization
- 35-ui-interaction-and-feature-wiring — UI interaction and feature wiring patterns
- 36-frontend-backend-dataflow-connection-map — Frontend-backend dataflow connection mapping
- 37-docs-architecture-diagram-sync — Docs and architecture diagram synchronization
- 38-section-by-section-refactor-execution — Section-by-section refactor execution discipline
- 39-runtime-test-and-regression-verification — Runtime test and regression verification
- adr — Architecture Decision Record authoring (generic)
- adr-authoring — ADR authoring discipline (structured variant)
- agent-dispatch — Generic agent dispatch orchestration
- agent surface normalization — Normalizes agent output surface before downstream consumption
- audit — Code quality audit protocol (generic)
- audit-assess-analyze — Maximum-depth audit, assessment, and analysis framework
- automated-regression-testing — Automated regression testing patterns
- build-toolchain-ci — Build toolchain and CI/CD patterns (generic)
- ci-preflight — CI pre-flight validation checklist (generic)
- compile-check — Compile check gate (generic)
- compliance-check — Compliance check protocol (generic)
- context-compilation — Context compilation and compression (v2)
- context-packet — Coding agent context packet generation
- context merging — Mergeable context engine for multi-system context
- continuous-integration-pipeline — CI pipeline design patterns
- debug api — API debugging protocol: trace request through auth/router/service
- deploy — Iron Gate deployment protocol (GCP Cloud Run)
- deploy-pipeline — CI/CD deployment pipeline patterns
- desktop-ui-accessibility — Desktop UI accessibility patterns (generic variant)
- diagram-render — Diagram rendering skill
- docs-sync — Documentation sync protocol (generic)
- drift-detection — Drift detection across config/schema/state
- e2e-audit-dispatch — End-to-end audit dispatch (generic)
- error-logging-engine — Error logging engine patterns
- freestanding-c-kernel — Freestanding C kernel patterns (generic variant)
- full-test-matrix — Full test matrix protocol (generic)
- fuzz-module — Fuzz module harness patterns (generic)
- gitops-apex-loop — GitOps apex loop for continuous deployment
- ideation — Planning and ideation trace
- intent-compilation — see CORE-SUPER-C (dual-listed: generic form)
- observability — SRE observability, logs, metrics, traces, SLO design
- onboarding — Tenant/user provisioning and lifecycle
- orchestration — Runtime orchestration and deployment design
- perf-profiler — Dashboard performance profiling and optimization
- pipeline-connection-map-authoring — Forces a written connection map before any pipeline change
- preview-deployment — Preview deployment patterns
- proof-matrix — see CORE-SUPER-C (dual-listed: generic form)
- readme — README generation patterns
- red-team-preflight — see CORE-SUPER-C (dual-listed: generic form)
- registry-sync — Registry synchronization patterns
- release-prep — Release preparation protocol (generic)
- repo-onboarding — Repository onboarding protocol
- repo-twin-ingest — Repo twin ingestion for context mirroring
- responsive chrome — Viewport responsive chrome and layout integrity
- scalability — Scalability, resilience, and disaster recovery design
- security — Security, compliance, and governance design
- security-audit — Security audit checklist (generic)
- security-crypto-engineering — Security cryptographic engineering (generic)
- skill-continuous-improvement-loop — Meta: codifies authoring and refining skills over time
- skill-refinement-simulator — Meta: simulates skill refinement scenarios
- static-analysis — Static analysis protocol (generic)
- subsystems-from-scratch — Subsystems from scratch (generic variant)
- tutorial-authoring-discipline — Binding discipline for authoring tutorial content
- ui-feature-audit — UI feature audit protocol

---

## META
Skills about skills: improvement, authoring, merging, routing.

- improve the skill — Multi-tenant continuous skill improvement (multi-tenant scoped)
- improvement-loop — see CORE-SUPER-C (SC-scoped form)
- ledger-to-skill-merge-policy — see CORE-SUPER-C (graduation policy)
- skill — Generic skill template / original identifier
- skill-continuous-improvement-loop — see CORE-PROJECT-AGNOSTIC
- skill-refinement-simulator — see CORE-PROJECT-AGNOSTIC
- thread skill refinery — Thread-to-skill refinery closure protocol

---

## DOMAIN-GENOS
Skills for GEN.OS platform engineering (Electron apps, XFRAME, kernel modules, sprint work).

- genos-adr — GEN.OS ADR authoring (numbered sequence, project conventions)
- genos-agent-dispatch — GEN.OS 27-agent orchestration protocol
- genos-api-contract — GEN.OS IPC/D-Bus/REST API contract specification
- genos-ci-preflight — GEN.OS CI pre-flight (pre-push validation)
- genos-compile-check — GEN.OS compile check (full sprint gate)
- genos-compliance-check — GEN.OS compliance check (full platform validation)
- genos-docs-sync — GEN.OS documentation sync protocol
- genos-e2e-audit-dispatch — GEN.OS E2E audit dispatch (full 27-agent)
- genos-full-test-matrix — GEN.OS full test matrix (mandatory E2E protocol)
- genos-fuzz-module — GEN.OS AFL++/libFuzzer fuzz harnesses
- hw-driver-verify — GEN.OS HP EliteBook x360 hardware driver verification
- iso-build — GEN.OS ISO build pipeline (phases 0-9)
- kernel-debug — GEN.OS QEMU+GDB kernel debug protocol
- language-gate — see CORE-SUPER-C (GEN.OS variant: Python/TS/C constraint)
- new-gensd-service — GEN.OS new GENSD service (descriptor + registration)
- new-kernel-module — GEN.OS new XENOS kernel module template
- new-platform-service — GEN.OS new platform service (Python FastAPI template)
- new-xframe-widget — GEN.OS new XFRAME widget (C template)
- qemu-boot-test — GEN.OS QEMU boot verification before flashing
- release-prep — GEN.OS release preparation protocol (sprint-close variant)
- security-audit — GEN.OS security audit checklist (guardian-sentinel)
- sprint-ci-gen — GEN.OS sprint CI workflow generation
- sprint-kickoff — GEN.OS sprint kickoff protocol
- sprint-retro — GEN.OS sprint retrospective protocol
- sprint3-xnet — GEN.OS Sprint 3 XNET networking module
- sprint3-xpkg — GEN.OS Sprint 3 XPKG package manager
- sprint3-xsec — GEN.OS Sprint 3 XSEC security module
- static-analysis — GEN.OS static analysis (all 4 tools, 0-warning target)
- wal-debug — GEN.OS XSTORE WAL crash recovery diagnosis
- xkabi-capability — GEN.OS XKABI capability definition and registration
- xmind-test — GEN.OS XMIND inference correctness verification
- xisc-cloud-toolchain — XISC runtime, cloud platform, and custom toolchain (60-skill bundle)
- xOrchestra — xOrchestra future sovereign orchestration adapter

---

## DOMAIN-IPOS
Skills for IPOS paratransit dashboard platform (Transdev client).

- ipos-ai-insights — IPOS AI-powered KPI analysis and health scoring
- ipos-alert-system — IPOS threshold-based alert system
- ipos-auth-guard — IPOS JWT authentication and authorization
- ipos-beacon — IPOS WCAG 2.1 AA accessibility implementation
- ipos-canvas — IPOS D3.js custom visualization (Codename CANVAS)
- ipos-chart-builder — IPOS universal chart configuration generator
- ipos-courier — IPOS PDF/Excel/CSV data export
- ipos-dashboard-scaffold — IPOS universal dashboard scaffolding
- ipos-data-pipeline — IPOS Bronze/Silver/Gold medallion data pipeline
- ipos-deploy-pipeline — IPOS GitHub Actions CI/CD deployment
- ipos-export-suite — IPOS complete export capability
- ipos-fortress — IPOS Angular 17+ dashboard (Codename FORTRESS)
- jupyter — IPOS Python/Plotly Dash dashboard (Codename JUPYTER)
- kpi-card-factory — IPOS KPI card component factory
- mosaic — IPOS Vue 3/Nuxt 3 dashboard (Codename MOSAIC)
- oracle — IPOS Claude API / AI integration
- perf-profiler — IPOS dashboard performance profiling
- pipeline — IPOS ETL pipeline for paratransit data
- prestige — IPOS UI/UX design system (Transdev brand)
- prism — IPOS React 18+/Next.js 14+ dashboard (Codename PRISM)
- pulse — IPOS real-time WebSocket/SSE dashboard updates
- responsive-layout — IPOS mobile-first responsive layout
- sentinel — IPOS Jest test strategy
- spfx-dashboard-builder — IPOS SharePoint Framework dashboard builder
- table-master — IPOS TanStack Table / AG Grid data tables
- test-harness — IPOS Jest/Vitest test harness
- theme-engine — IPOS CSS custom-properties design system generator
- turbo — IPOS React.memo/useMemo performance optimization
- vault — IPOS SPFx tenant-wide deployment patterns
- velocity — IPOS Svelte 5/SvelteKit dashboard (Codename VELOCITY)
- canvas — Generic D3.js/SVG/Canvas visualization (non-IPOS variant)
- chart-builder — Generic chart configuration generator
- courier — Generic data export (PDF/Excel)
- dashboard-scaffold — Generic dashboard scaffolding
- data-pipeline — Generic medallion data pipeline
- deploy-pipeline — Generic CI/CD pipeline
- export-suite — Generic export suite
- fortress — Generic Angular 17+ engineering
- responsive chrome — see CORE-PROJECT-AGNOSTIC
- responsive-layout — see above (IPOS variant)
- table-master — see above (IPOS variant)
- test-harness — see above (IPOS variant)

---

## DOMAIN-ATLAS
Skills for ATLAS multi-tenant AI workspace platform.

- ATLAS MCP — ATLAS MCP server (Claude Code and Codex integration)
- atlas logo — ATLAS orbital visual identity
- atlas shell — ATLAS workspace shell and command palette
- atlas ui — ATLAS multi-tenant UI/UX buildout
- atlas workspace — ATLAS operational workspace shell
- architecture-atlas — Architecture atlas generation
- graph intelligence workbench — Atlas graph engine visual intelligence workbench
- ideation — ATLAS ideation and planning trace
- knowledge depot — ATLAS knowledge depot operating model
- repo ingest — ATLAS repo ingestion loop

---

## DOMAIN-ELSON
Skills for Elson TB2 autonomous trading platform (elsontrade.com).

- audit — Elson TB2 code quality audit
- bot status — Autonomous trading bot status check
- elson fine tune — Fine-tuning pipeline for elson-finance-14b (DoRA)
- elson go build — Go microservices build verification
- elson health — Production health check (elsontrade.com)
- elson kill list — Dead code manifest generation
- elson logs — Cloud Run production log viewer
- elson market pulse — Market event impact analysis
- elson migrate — Alembic database migration protocol
- elson model health — vLLM + elson-finance-14b health check
- elson perf report — Trading performance report (P&L, Sharpe, etc.)
- elson plan feature — Feature planning and decomposition protocol
- elson pre deploy — Pre-deployment readiness check
- elson rollback — Cloud Run emergency rollback
- elson schema check — SQLAlchemy schema drift detection
- elson security scan — CVE/SAST/secrets security scan
- elson signal audit — Autonomous trading signal gate audit
- elson sprint init — Sprint initialization protocol
- elson sprint review — Sprint retrospective protocol
- elson start bot — Start autonomous trading bot
- elson stop bot — Stop autonomous trading bot gracefully
- elson test — Full pytest + TypeScript test suite
- elson vllm start — Start vLLM VM (elson-dvora-training-l4-2)
- elson vllm stop — Stop vLLM VM (cost saver)

---

## DOMAIN-PRISM-MOSAIC
Skills for PRISM and MOSAIC dashboard platforms (see IPOS section — these are the standalone variants).

- prism — see DOMAIN-IPOS (ipos-prism)
- mosaic — see DOMAIN-IPOS (ipos-mosaic)

---

## DOMAIN-MULTI-TENANT-PLATFORM
Skills for generic multi-tenant SaaS architecture.

- AI automation — AI-native tenant automation and agent workflows
- API gateway — Tenant-aware API routing, rate limiting, service mesh
- admin console — Platform operator console and tenant operations
- auth-guard — JWT authentication and authorization (generic)
- authentication — Enterprise-grade identity, auth, RBAC, ABAC
- before public release — Auth, rate, and audit gate before any multi-tenant public release
- beacon — WCAG 2.1 AA accessibility (generic)
- billing — Tenant billing, metering, and quotas
- build a multi-tenant platform — Full multi-tenant platform architect skill
- consensus — Distributed consensus and replication design
- context merging — Mergeable context engine for multi-system state
- gitops-apex-loop — GitOps apex loop for continuous deployment
- improve the skill — Multi-tenant continuous skill improvement
- observability — SRE observability design
- onboarding — Tenant provisioning and lifecycle
- orchestration — Runtime orchestration for multi-tenant
- scalability — Scaling, resilience, disaster recovery
- security — Security, compliance, governance design
- tenant data isolation — Tenant-aware storage and database isolation
- tenant model — Tenant boundary and model design
- test gates — Proof system design for multi-tenant platforms

---

## NUMBERED-SUFFIX DUPLICATES (42 entries)
These are versioned/migrated copies of canonical skills. Prefer the non-suffixed version unless explicitly directed otherwise.

| Canonical | Duplicate (archived) |
|-----------|---------------------|
| hw-driver-verify | hw-driver-verify-1014 |
| iso-build | iso-build-1015 |
| kernel-debug | kernel-debug-1016 |
| language-gate | language-gate-1017 |
| new-gensd-service | new-gensd-service-1018 |
| new-kernel-module | new-kernel-module-1019 |
| new-platform-service | new-platform-service-1020 |
| new-xframe-widget | new-xframe-widget-1021 |
| qemu-boot-test | qemu-boot-test-1022 |
| oracle | oracle-524 |
| release-prep | release-prep-1024 |
| response-accuracy-corrective | response-accuracy-corrective-1025 |
| security-audit | security-audit-1026 |
| prism | prism-529 |
| prestige | prestige-528 |
| pulse | pulse-530 |
| responsive-layout | responsive-layout-531 |
| sentinel | sentinel-534 |
| spfx-dashboard-builder | spfx-dashboard-builder-536 |
| table-master | table-master-537 |
| test-harness | test-harness-538 |
| theme-engine | theme-engine-539 |
| turbo | turbo-540 |
| tutorial-authoring-discipline | tutorial-authoring-discipline-541 |
| vault | vault-542 |
| velocity | velocity-543 |
| wal-debug | wal-debug-1037 |
| xisc-cloud-toolchain | xisc-cloud-toolchain-1038 |
| xkabi-capability | xkabi-capability-1039 |
| xmind-test | xmind-test-1040 |
| sprint-ci-gen | sprint-ci-gen-1029 |
| sprint-kickoff | sprint-kickoff-1030 |
| sprint-retro | sprint-retro-1031 |
| sprint3-xnet | sprint3-xnet-1032 |
| sprint3-xpkg | sprint3-xpkg-1033 |
| sprint3-xsec | sprint3-xsec-1034 |
| static-analysis | static-analysis-1035 |
| jupyter | jupyter-520 |
| kpi-card-factory | kpi-card-factory-521 |
| mosaic | mosaic-522 |
| perf-profiler | perf-profiler-525 |
| pipeline | pipeline-526 |

---

## SUPER-C-PREFIXED ALIASES (4 entries)
These mirror skills in CORE-SUPER-C under a `super-c-` prefix.

| Canonical | Alias |
|-----------|-------|
| compiler-discipline | super-c-compiler-discipline |
| one-shot-execution-planning | super-c-one-shot-execution-planning |
| freestanding-c-kernel | super-c-freestanding-c-kernel |
| subsystems-from-scratch | super-c-subsystems-from-scratch |
| ai-governance-citadel | super-c-ai-governance-citadel |
| build-toolchain-ci | super-c-build-toolchain-ci |
| desktop-ui-accessibility | super-c-desktop-ui-accessibility |
| security-crypto-engineering | super-c-security-crypto-engineering |

---

## SPACE-NAMED SKILLS (47 entries)
These skill directory names contain spaces. They CANNOT be naturally cross-referenced via prose
(`See also: back-link-reuse-over-cache` works; `See also: elson kill list` does not grep-match).
Consider renaming to kebab-case in a future cleanup pass.

Elson (24): elson fine tune, elson go build, elson health, elson kill list, elson logs, elson market pulse,
elson migrate, elson model health, elson perf report, elson plan feature, elson pre deploy, elson rollback,
elson schema check, elson security scan, elson signal audit, elson sprint init, elson sprint review,
elson start bot, elson stop bot, elson test, elson vllm start, elson vllm stop, bot status

Atlas (5): ATLAS MCP, atlas logo, atlas shell, atlas ui, atlas workspace

Other (18): AI automation, API gateway, admin console, agent surface normalization, before public release,
build a multi-tenant platform, codex gemini acquisition, context merging, debug api, global claude acquisition,
graph intelligence workbench, improve the skill, knowledge depot, repo ingest, responsive chrome,
tenant data isolation, tenant model, test gates, thread skill refinery
