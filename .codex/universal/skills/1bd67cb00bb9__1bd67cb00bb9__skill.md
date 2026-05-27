---
name: rollback
description: Roll back Cloud Run to the previous stable revision. Use when the user says rollback, revert production, undo deploy, or the health check is failing after a deploy.
model: claude-sonnet-4-6
---

# Cloud Run Emergency Rollback

**Situation:** Production is broken. Execute immediately.

---

## Step 1 — Identify Previous Revision

```bash
gcloud run revisions list \
  --service=elson-backend \
  --region=us-west1 \
  --project=elson-33a95 \
  --format="table(name,creationTimestamp,status.conditions[0].status)" \
  --limit=5
```

## Step 2 — Capture Previous Revision Name

```bash
PREV=$(gcloud run revisions list \
  --service=elson-backend \
  --region=us-west1 \
  --project=elson-33a95 \
  --format='value(name)' | sed -n '2p')
echo "Rolling back to: $PREV"
```

## Step 3 — Execute Rollback

```bash
gcloud run services update-traffic elson-backend \
  --to-revisions=$PREV=100 \
  --region=us-west1 \
  --project=elson-33a95
```

## Step 4 — Verify Recovery

```bash
sleep 10
curl -s https://api.elsontrade.com/health | python3 -m json.tool
```

Expected: `{"status": "healthy", "fallback_mode": false}`

## Step 5 — Check Frontend

```bash
curl -s -o /dev/null -w "%{http_code}" https://elsontrade.com
```

Expected: `200`

---

## Step 6 — Incident Report Template

After rollback, document:

```
INCIDENT: [date/time]
SEVERITY: SEV-[1/2/3]
BROKEN REVISION: [name]
ROLLED BACK TO: [name]
ROOT CAUSE HYPOTHESIS:
1.
2.
3.
IMMEDIATE ACTION: Rollback executed at [time]
NEXT STEPS: Investigate and fix before re-deploying
POST-MORTEM: Schedule within 48 hours
```

---

**After rollback is stable:** Investigate the broken revision's Cloud Build logs before attempting to re-deploy.
