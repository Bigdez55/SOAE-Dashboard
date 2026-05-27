---
name: fine-tune
description: Assess fine-tuning readiness, prepare training data, and trigger the DoRA fine-tuning pipeline for elson-finance-14b. Use when the user asks about fine-tuning, model retraining, improving AI accuracy, or updating the model.
model: claude-opus-4-6
---

# Fine-Tuning Pipeline — elson-finance-14b (DoRA)

Assess readiness, curate data, and trigger the weekly fine-tuning cycle.

---

## Step 1 — Training Data Inventory

```bash
TOKEN=$(curl -s -X POST https://api.elsontrade.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"claude.test@example.com","password":"ElsonTest2026!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token',''))")

curl -s "https://api.elsontrade.com/api/v1/analytics/training-data-summary" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool 2>/dev/null
```

Manual check:
```bash
cd backend
python3 -c "
import sys; sys.path.insert(0,'.')
from app.db.session import SessionLocal
from app.models import TradeDecisionLog
db = SessionLocal()
total = db.query(TradeDecisionLog).count()
with_outcome = db.query(TradeDecisionLog).filter(TradeDecisionLog.price_at_1h != None).count()
ai_decisions = db.query(TradeDecisionLog).filter(TradeDecisionLog.signal_source == 'ai').count()
print(f'Total decisions: {total}')
print(f'With outcomes: {with_outcome} ({with_outcome/total*100:.1f}%)')
print(f'AI decisions: {ai_decisions}')
db.close()
" 2>/dev/null
```

**Fine-tuning readiness threshold:** ≥500 outcomes with price data.

## Step 2 — Run Outcome Fill Worker

If outcome coverage is low, backfill historical prices:
```bash
cd backend
python3 -m app.services.outcome_fill_worker --days 30 2>&1 | tail -20
```

## Step 3 — Generate Training Data

```bash
cd backend
python3 scripts/weekly_finetune.py --dry-run 2>&1 | tail -30
```

Review output: checks data quality, class balance, and feature coverage.

## Step 4 — Trigger Fine-Tuning (when VM is running)

```bash
# Run on the L4 VM via SSH or as a background job
cd backend
python3 scripts/weekly_finetune.py \
  --model elson-finance-14b \
  --method mora \
  --epochs 3 \
  --output /mnt/models/elson-finance-14b-$(date +%Y%m%d) \
  2>&1 | tee /tmp/finetune_$(date +%Y%m%d).log
```

## Step 5 — Validate New Model

After fine-tuning completes:
```bash
python3 backend/scripts/compute_golden_vectors.py \
  --model /mnt/models/elson-finance-14b-$(date +%Y%m%d) \
  --baseline /mnt/models/elson-finance-14b \
  2>&1 | tail -20
```

Check: new model R² and hit rate on holdout set vs baseline.

---

## Readiness Report

```
FINE-TUNING READINESS CHECK
════════════════════════════
Total TradeDecisionLog entries:  [N]
AI decisions:                    [N]
Entries with outcomes:           [N] ([X%])
Ready to fine-tune:              [YES if ≥500 / NO]

If NO: Run outcome_fill_worker to backfill [N] more outcomes needed.
If YES: Proceed with weekly_finetune.py
```
