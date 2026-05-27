---
name: start-bot
description: Start the autonomous trading bot. Use when the user says start the bot, enable auto-trading, start trading, or begin the trading loop.
model: claude-sonnet-4-6
---

# Start Autonomous Trading Bot

Verify prerequisites, then start the trading loop.

---

## Step 1 — Authenticate

```bash
TOKEN=$(curl -s -X POST https://api.elsontrade.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"claude.test@example.com","password":"ElsonTest2026!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")
echo "Auth: ${TOKEN:0:20}..."
```

## Step 2 — Verify vLLM Is Running

```bash
gcloud compute instances describe elson-dvora-training-l4-2 \
  --zone=us-west1-a --project=elson-33a95 \
  --format="value(status)" 2>/dev/null
```

If NOT `RUNNING` → start vLLM first with `/vllm-start`, then return.

## Step 3 — Check API Health

```bash
curl -s https://api.elsontrade.com/api/v1/health | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('Status:', d.get('status'))
print('vLLM:', d.get('vllm_status', 'unknown'))
print('DB:', d.get('database', 'unknown'))
"
```

All must be `healthy` before starting.

## Step 4 — Check Current Bot State

```bash
curl -s https://api.elsontrade.com/api/v1/auto-trading/status \
  -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('Running:', d.get('is_running'))
print('Symbols:', d.get('scanned_symbols', []))
"
```

If already `true` → bot is already running, nothing to do.

## Step 5 — Start the Bot

```bash
curl -s -X POST https://api.elsontrade.com/api/v1/auto-trading/start \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | python3 -m json.tool 2>/dev/null
```

Expected: `{"status": "started"}` or `{"message": "Bot started successfully"}`

## Step 6 — Confirm Running

```bash
sleep 5
curl -s https://api.elsontrade.com/api/v1/auto-trading/status \
  -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print('Running:', d.get('is_running'))
print('Symbols scanned:', d.get('scanned_symbols', [])[:5])
print('Last signal:', d.get('last_signal_time', 'none'))
"
```

---

## Bot Start Summary

```
BOT START REPORT
════════════════════
vLLM VM:        [RUNNING / NOT STARTED]
API Health:     [healthy / degraded]
Bot Running:    [true / false]
Signal Source:  [ai / rule_based / none yet]
Symbols:        [AAPL, MSFT, ...]
Status:         [STARTED / ALREADY RUNNING / FAILED]
```

**Note:** If vLLM is not running, the bot will fall back to rule-based signals (safe but less accurate). For AI signals, start vLLM first.
