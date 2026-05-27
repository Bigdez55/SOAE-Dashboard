---
name: signal-audit
description: Audit the autonomous trading signal gate — AI vs rule-based accuracy, confidence calibration, gate rejection rates, and strategy performance. Use when the user asks about signal quality, is the AI beating rules, signal gate tuning, or trading accuracy.
model: claude-opus-4-6
---

# Signal Gate Audit — Elson Trading Bot

Analyze signal quality and gate performance. Identify calibration issues.

---

## Step 1 — Authenticate

```bash
TOKEN=$(curl -s -X POST https://api.elsontrade.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"claude.test@example.com","password":"ElsonTest2026!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")
```

## Step 2 — Signal Source Distribution (last 30 days)

```bash
curl -s "https://api.elsontrade.com/api/v1/analytics/signal-sources?days=30" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null
```

Key ratios to check:
- AI signals: target 40-60% of total
- Rule-based fallback: target <60%
- Gate rejections: target <30% (if >80%, confidence threshold too high)

## Step 3 — AI Accuracy vs Rule-Based

```bash
curl -s "https://api.elsontrade.com/api/v1/analytics/model-performance?days=30" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null
```

Check:
- `ai_hit_rate`: target >55% (beats random)
- `rule_based_hit_rate`: baseline comparison
- `confidence_calibration`: isotonic curve R² (target >0.7)

## Step 4 — Strategy Performance Breakdown

```bash
curl -s "https://api.elsontrade.com/api/v1/analytics/strategy-performance?days=30" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null
```

## Step 5 — Signal Gate Config Review

```bash
# Check current gate thresholds
grep -n "confidence_threshold\|min_confidence\|gate_threshold\|CONFIDENCE" \
  backend/app/services/signal_gate_service.py | head -20
```

## Step 6 — Circuit Breaker Trips

```bash
curl -s "https://api.elsontrade.com/api/v1/monitoring/circuit-breakers" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null
```

---

## Signal Audit Report Format

```
╔════════════════════════════════════════════════╗
║          SIGNAL GATE AUDIT REPORT             ║
╠════════════════════════════════════════════════╣
║ Period: Last 30 days                          ║
╠════════════════════════════════════════════════╣
║ SIGNAL SOURCES                                ║
║   AI Signals:        [N] ([X%])               ║
║   Rule-Based:        [N] ([Y%])               ║
║   Gate Rejections:   [N] ([Z%])               ║
╠════════════════════════════════════════════════╣
║ ACCURACY                                      ║
║   AI Hit Rate:       [X%] (target: >55%)      ║
║   Rule Hit Rate:     [Y%]                     ║
║   AI vs Rules:       [BETTER / WORSE / TIE]   ║
╠════════════════════════════════════════════════╣
║ CALIBRATION                                   ║
║   Confidence R²:     [X.XX] (target: >0.70)  ║
║   Avg Confidence:    [X%]                     ║
╠════════════════════════════════════════════════╣
║ TOP STRATEGIES (by Sharpe)                    ║
║   1. [name]: Sharpe [X.X], WR [Y%]           ║
║   2. [name]: Sharpe [X.X], WR [Y%]           ║
╚════════════════════════════════════════════════╝
```

**Recommendations:** If AI underperforms rules → trigger fine-tune check. If gate rejects >80% → lower confidence threshold.
