---
name: deploy
description: Full Iron Gate deployment to GCP Cloud Run. Use when the user asks to deploy, ship, push to production, or release to elsontrade.com.
model: claude-sonnet-4-6
---

# Iron Gate Deployment Protocol

You are executing a **full production deployment** to elsontrade.com. Run every gate in order. Abort at the first failure — do NOT skip gates.

**Project:** `elson-33a95` | **Region:** `us-west1` | **Service:** `elson-backend`

---

## GATE 0 — Schema Drift (CRITICAL)

```bash
git diff HEAD~5 -- backend/app/models/ | grep "Column("
```

If ANY new `Column(` entries appear → **STOP**. Run `ALTER TABLE` on Cloud SQL before proceeding:
```bash
# Connect via proxy on port 15432
psql "host=127.0.0.1 port=15432 dbname=elson_db user=elson_user" -c "ALTER TABLE ..."
```

## GATE 1 — Dependency Sync

```bash
diff backend/requirements.txt backend/requirements-docker.txt
```

Zero diff required. Any divergence → sync files, then continue.

> NOTE: `requirements-docker.txt` does NOT exist in this project. Dockerfile uses `requirements.txt` directly. Skip this gate.

## GATE 2 — Secret Inventory

```bash
grep -r "os.getenv\|os.environ" backend/app/ | grep -v "#" | grep -v ".pyc"
```

Verify every required env var exists in GCP Secret Manager AND in `cloudbuild.yaml --update-secrets`.

## GATE 3 — Frontend Type Check

```bash
cd frontend && npx tsc --noEmit
```

Zero TypeScript errors required.

## GATE 4 — Backend Tests

```bash
cd backend && python -m pytest --tb=short -q 2>&1 | tail -20
```

Must maintain: 1101+ passed, 0 failures.

## GATE 5 — Docker Build

```bash
cd backend && docker build -t elson-backend-test . --quiet && echo "BUILD OK"
```

## GATE 6 — Deploy

```bash
export COMMIT_SHA=$(git rev-parse --short HEAD)
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=COMMIT_SHA=$COMMIT_SHA \
  --timeout=1200s \
  --project=elson-33a95
```

## GATE 7 — Smoke Test (Post-Deploy)

```bash
sleep 15  # Allow cold start
curl -s https://api.elsontrade.com/health | python3 -m json.tool
```

**ONLY ACCEPT:** `{"status": "healthy", "fallback_mode": false}`
**REJECT AND ROLLBACK:** Any `"degraded"`, `"fallback_mode": true`, or non-200 response.

### If smoke test fails — Rollback immediately:
```bash
PREV=$(gcloud run revisions list --service=elson-backend --region=us-west1 --project=elson-33a95 --format='value(name)' | sed -n '2p')
gcloud run services update-traffic elson-backend \
  --to-revisions=$PREV=100 \
  --region=us-west1 \
  --project=elson-33a95
```

---

## Post-Deploy Checklist

Report the following after deployment:
- [ ] Commit SHA deployed
- [ ] New Cloud Run revision name
- [ ] Health check result
- [ ] Frontend accessible at https://elsontrade.com
- [ ] Any warnings from Cloud Build logs

**NEVER deploy on a Friday afternoon.**
