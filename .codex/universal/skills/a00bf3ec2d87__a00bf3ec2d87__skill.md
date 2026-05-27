---
name: sprint-review
description: Run a sprint retrospective — compare completed vs planned work, measure quality gate outcomes, identify blockers, and propose next sprint priorities. Use when the user says sprint review, retrospective, end of sprint, or what did we accomplish.
model: claude-opus-4-6
---

# Sprint Retrospective

Structured review of what was accomplished, what broke, and what's next.

---

## Phase 1 — Baseline Snapshot (current state)

```bash
# Test status
cd backend && python -m pytest --tb=no -q 2>&1 | tail -3

# TypeScript
cd frontend && npx tsc --noEmit 2>&1 | tail -3

# Git log (sprint commits)
git log --oneline --since="2 weeks ago" 2>/dev/null | head -20

# Uncommitted changes
git status --short 2>/dev/null | head -20
```

## Phase 2 — Sprint Commits Analysis

```bash
# All commits since sprint start (adjust date as needed)
git log --oneline --since="2 weeks ago" --format="%h %s" 2>/dev/null

# Files changed
git diff HEAD~10 --name-only 2>/dev/null | sort | head -30

# Lines changed
git diff HEAD~10 --stat 2>/dev/null | tail -5
```

## Phase 3 — Quality Gate Results

Review each gate from the sprint definition:

| Gate | Target | Status |
|------|--------|--------|
| Tests | ≥ baseline pass, 0 new failures | [PASS/FAIL] |
| TypeScript | 0 errors | [PASS/FAIL] |
| API Health | "healthy" | [PASS/FAIL] |
| Schema | No drift | [PASS/FAIL] |
| Security | 0 CRITICAL CVEs | [PASS/FAIL] |
| Go builds | All 3 services pass | [PASS/FAIL] |

```bash
# Quick health check
curl -s https://api.elsontrade.com/api/v1/health \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('Health:', d.get('status'))" 2>/dev/null
```

## Phase 4 — Retrospective Questions

Ask the user:

1. **What did we ship?** (compare to sprint card goals)
2. **What didn't get done?** (carry forward to next sprint)
3. **What broke?** (any production incidents, test regressions)
4. **What slowed us down?** (blockers, dependencies, surprises)
5. **What worked well?** (processes, tools, patterns to keep)

## Phase 5 — Metrics Review

```bash
# AI model performance drift
TOKEN=$(curl -s -X POST https://api.elsontrade.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"claude.test@example.com","password":"ElsonTest2026!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")

curl -s "https://api.elsontrade.com/api/v1/analytics/model-performance?days=14" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null | head -20
```

---

## Sprint Review Report Format

```
╔═══════════════════════════════════════════════════╗
║        SPRINT RETROSPECTIVE                       ║
║        Sprint: [N] | [dates]                      ║
╠═══════════════════════════════════════════════════╣
║ COMPLETED (shipped)                               ║
║   ✓ [feature/fix 1]                              ║
║   ✓ [feature/fix 2]                              ║
╠═══════════════════════════════════════════════════╣
║ NOT COMPLETED (carry forward)                     ║
║   → [item 1] — reason: [blocker]                 ║
║   → [item 2] — reason: [depriority]              ║
╠═══════════════════════════════════════════════════╣
║ INCIDENTS / BUGS                                  ║
║   ⚠ [incident 1]                                 ║
╠═══════════════════════════════════════════════════╣
║ QUALITY GATES                                     ║
║   Tests: [PASS] | TypeScript: [PASS]             ║
║   Health: [healthy] | Schema: [clean]            ║
╠═══════════════════════════════════════════════════╣
║ NEXT SPRINT PRIORITIES                            ║
║   P0: [must-do]                                  ║
║   P1: [should-do]                                ║
║   P2: [nice-to-have]                             ║
╚═══════════════════════════════════════════════════╝
```

After the review: ask the user if they want to `/sprint-init` the next sprint.
