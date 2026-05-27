---
name: health
description: Check production health status of elsontrade.com — API, frontend, database, trading bot, and vLLM. Use when the user asks about production status, is the site up, check health, or platform status.
model: claude-sonnet-4-6
---

# Platform Health Check

Run all checks and report a unified status dashboard.

---

## 1. API Health

```bash
curl -s https://api.elsontrade.com/health | python3 -m json.tool
```

✅ Expected: `{"status": "healthy", "fallback_mode": false}`
❌ Alert if: `"degraded"`, `"fallback_mode": true`, or connection refused

## 2. Frontend Availability

```bash
curl -s -o /dev/null -w "Frontend HTTP status: %{http_code}\n" https://elsontrade.com
```

## 3. Cloud Run Service Status

```bash
gcloud run services describe elson-backend \
  --region=us-west1 \
  --project=elson-33a95 \
  --format="table(status.conditions[0].status,status.latestReadyRevisionName,status.traffic[0].percent)"
```

## 4. Cloud SQL Status

```bash
gcloud sql instances describe elson-postgres \
  --project=elson-33a95 \
  --format="value(state,settings.tier)"
```

## 5. Auto-Trading Status

```bash
curl -s https://api.elsontrade.com/api/v1/auto-trading/status \
  -H "Authorization: Bearer $(cat ~/.elson_test_token 2>/dev/null || echo 'NO_TOKEN')" \
  | python3 -m json.tool 2>/dev/null | head -20
```

## 6. Recent Errors (Cloud Run Logs)

```bash
gcloud logging read \
  'resource.type="cloud_run_revision" AND resource.labels.service_name="elson-backend" AND severity>=ERROR' \
  --project=elson-33a95 \
  --limit=10 \
  --format="table(timestamp,textPayload)" \
  2>/dev/null | head -30
```

## 7. vLLM VM Status

```bash
gcloud compute instances describe elson-dvora-training-l4-2 \
  --zone=us-west1-a \
  --project=elson-33a95 \
  --format="value(status)" 2>/dev/null
```

---

## Health Report Format

Provide a dashboard summary:

```
╔══════════════════════════════════════╗
║        ELSON TB2 HEALTH REPORT      ║
╠══════════════════════════════════════╣
║ API:           [HEALTHY / DEGRADED] ║
║ Frontend:      [UP / DOWN]          ║
║ Cloud Run:     [READY / ERROR]      ║
║ Cloud SQL:     [RUNNABLE / STOPPED] ║
║ Trading Bot:   [RUNNING / STOPPED]  ║
║ vLLM VM:       [RUNNING / STOPPED]  ║
╠══════════════════════════════════════╣
║ Recent Errors: [count]              ║
║ Last Checked:  [timestamp]          ║
╚══════════════════════════════════════╝
```

Flag any anomalies with remediation suggestions.
