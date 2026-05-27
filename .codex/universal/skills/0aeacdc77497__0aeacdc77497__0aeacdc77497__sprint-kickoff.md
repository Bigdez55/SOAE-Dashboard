# GEN.OS Sprint Kickoff Protocol

## Step 1 — Sprint Charter (master-orchestrator)

```
Sprint N Goal: [One sentence — what system capability is added]
Build Phases affected: [e.g., Phase 4-5]
Target compile check count: [current + N new files]
Target test count: [RFC-002: 80, pytest: N, new: M]

Deliverables:
  A. [Module A] — [agent responsible] — [files to create]
  B. [Module B] — [agent responsible] — [files to create]

Hard constraints:
  - Language: Python / TypeScript / C only
  - Zero libc in kernel/display/XFRAME code
  - All new C files: clang -Werror -fsyntax-only passes before commit
  - guardian-sentinel reviews all new XKABI rights
  - test-forge writes tests for all new modules
```

## Step 2 — Agent Dispatch Sequence

Invoke agents in this order (use `/agent-dispatch` for full roster):

```
1. the-architect         → ADR + public interface (headers/API contracts)
2. apex-systems-architect → Implementation (C modules)
3. [domain agents]       → Parallel: hardware-integration-engineer,
                           event-horizon-agent, data-infra-engineer
4. guardian-sentinel     → Security review (XKABI rights, threat model)
5. platform-integrity-auditor → Compile check gate (N/N count)
6. test-forge            → All 10 test types (see /full-test-matrix)
7. knowledge-weaver      → ADR finalization + docs sync
8. master-orchestrator   → Sprint sign-off + commit
```

## Step 3 — Acceptance Criteria Template

```
ACCEPTANCE CRITERIA — Sprint N

Compile gates:
  [ ] N/N C files pass: clang -target x86_64-unknown-none-elf -Werror -fsyntax-only
  [ ] N/N ASM files pass: nasm -f elf64

Test gates:
  [ ] RFC-002: 80/80 pass
  [ ] pytest: N/N pass
  [ ] New module tests: M/M pass

Static analysis:
  [ ] cppcheck: 0 warnings
  [ ] ruff: 0 violations
  [ ] ESLint: 0 warnings (if TS touched)
  [ ] bandit: 0 HIGH/CRITICAL

Security:
  [ ] guardian-sentinel cleared all new XKABI rights
  [ ] trivy: 0 CRITICAL/HIGH CVEs
  [ ] No raw hex rights (only XK_RIGHT_* aliases)

Quality:
  [ ] All new .c/.h files have copyright + SPDX + PURPOSE header
  [ ] All public functions have docstring comments
  [ ] No malloc/calloc/free in kernel/display/XFRAME code
  [ ] Language policy passes

Documentation:
  [ ] ADR written for each major architectural decision
  [ ] All agent MEMORY.md files updated
  [ ] Sprint synthesis doc created in master-orchestrator memory
```

## Step 4 — Commit Message (on sprint close)

```
feat: Sprint N — [goal description] (N/N compile checks pass)

Sprint N deliverables:
- [Module A]: [description] — N files, N lines
- [Module B]: [description] — N files, N lines

Test gates:
- RFC-002: 80/80 pass
- pytest: N/N pass
- cppcheck: 0 warnings
- bandit: 0 HIGH/CRITICAL
```
