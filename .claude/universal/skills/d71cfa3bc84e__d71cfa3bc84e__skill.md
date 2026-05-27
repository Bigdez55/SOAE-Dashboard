---
name: bot-status
description: Check the autonomous trading bot status — running state, active strategies, recent signals, P&L, and circuit breaker state. Use when the user asks about the trading bot, is the bot running, bot status, or trading activity.
model: claude-sonnet-4-6
---

# Autonomous Trading Bot Status

Check the complete state of the trading bot via the API.

---

## Step 1 — Auth Token

```bash
# Get auth token for test account
TOKEN=$(curl -s -X POST https://api.elsontrade.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"claude.test@example.com","password":"ElsonTest2026!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token','NO_TOKEN'))")
echo "Token acquired: ${TOKEN:0:20}..."
```

## Step 2 — Bot Running State

```bash
curl -s https://api.elsontrade.com/api/v1/auto-trading/status \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool
```

## Step 3 — Active Symbols & Strategies

```bash
curl -s https://api.elsontrade.com/api/v1/auto-trading/symbols \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool 2>/dev/null | head -30
```

## Step 4 — Recent Trade Decisions

```bash
curl -s "https://api.elsontrade.com/api/v1/auto-trading/decisions?limit=10" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool 2>/dev/null | head -50
```

## Step 5 — Circuit Breaker State

```bash
curl -s https://api.elsontrade.com/api/v1/monitoring/circuit-breakers \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool 2>/dev/null
```

## Step 6 — Today's P&L

```bash
curl -s "https://api.elsontrade.com/api/v1/portfolio/performance?period=1d" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -m json.tool 2>/dev/null | head -20
```

---

## Status Report Format

```
╔══════════════════════════════════════════╗
║       TRADING BOT STATUS                ║
╠══════════════════════════════════════════╣
║ Bot State:     [RUNNING / STOPPED]      ║
║ Active Symbols: [list]                  ║
║ Active Strategy: [name]                 ║
║ Signal Source: [ai / rule_based]        ║
╠══════════════════════════════════════════╣
║ Today's Trades: [N]                     ║
║ Today's P&L:   [$X.XX]                 ║
║ Win Rate (today): [X%]                  ║
╠══════════════════════════════════════════╣
║ Circuit Breaker: [CLOSED / OPEN]        ║
║ vLLM: [REACHABLE / DOWN]               ║
╚══════════════════════════════════════════╝
```

Flag any anomalies (open circuit breakers, zero trades during market hours, negative P&L exceeding -$150).
