---
name: stop-bot
description: Stop the autonomous trading bot gracefully. Use when the user says stop the bot, pause trading, disable auto-trading, or halt the trading loop.
model: claude-sonnet-4-6
---

# Stop Autonomous Trading Bot

Gracefully halt the trading loop and confirm all positions are safe.

---

## Step 1 — Authenticate

```bash
TOKEN=$(curl -s -X POST https://api.elsontrade.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"claude.test@example.com","password":"ElsonTest2026!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")
```

## Step 2 — Check Current State

```bash
curl -s https://api.elsontrade.com/api/v1/auto-trading/status \
  -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('Running:', d.get('is_running'))
print('Open positions:', d.get('open_positions', 0))
"
```

If already `false` → bot already stopped, nothing to do.

## Step 3 — Stop the Bot

```bash
curl -s -X POST https://api.elsontrade.com/api/v1/auto-trading/stop \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | python3 -m json.tool 2>/dev/null
```

Expected: `{"status": "stopped"}` or `{"message": "Bot stopped successfully"}`

## Step 4 — Confirm Stopped

```bash
sleep 3
curl -s https://api.elsontrade.com/api/v1/auto-trading/status \
  -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('Running:', d.get('is_running'))
print('Stopped at:', d.get('stopped_at', 'n/a'))
"
```

`is_running` must be `false`.

## Step 5 — Check Open Positions (if any)

```bash
curl -s https://api.elsontrade.com/api/v1/portfolio/positions \
  -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
positions = d if isinstance(d, list) else d.get('positions', [])
if positions:
    print(f'WARNING: {len(positions)} open positions remain')
    for p in positions[:5]:
        print(f'  {p.get(\"symbol\")}: {p.get(\"qty\")} shares @ \${p.get(\"avg_entry_price\", 0):.2f}')
else:
    print('No open positions — safe to stop vLLM if needed')
" 2>/dev/null
```

---

## Bot Stop Summary

```
BOT STOP REPORT
══════════════════════
Bot Running:      [false]
Open Positions:   [N] — [safe / review needed]
Next Step:        [Stop vLLM with /vllm-stop to save costs?]
Status:           [STOPPED / ALREADY STOPPED]
```

**If open positions exist:** The bot stops accepting NEW signals. Existing positions remain open until manually closed or stop-loss triggers.

**Cost tip:** Once bot is stopped, run `/vllm-stop` to shut down the L4 GPU VM (~$1.50/hr).
