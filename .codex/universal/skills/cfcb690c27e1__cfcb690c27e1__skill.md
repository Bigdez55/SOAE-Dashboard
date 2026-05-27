---
name: schema-check
description: Detect schema drift between SQLAlchemy models and the deployed database. Use when adding new model columns, before deploying, or when the user says check schema, schema drift, or did we add new columns.
model: claude-sonnet-4-6
---

# Schema Drift Detection

**Critical:** Adding model columns without ALTER TABLE causes instant production crashes. This check prevents that.

---

## Step 1 — Find New Columns in Recent Commits

```bash
git diff HEAD~10 -- backend/app/models/ | grep "^\+" | grep "Column("
```

If output is empty → no new columns in last 10 commits → ✅ safe.

## Step 2 — Compare Models to Known Schema

List all columns defined in SQLAlchemy models:
```bash
grep -rn "= Column(" backend/app/models/ | grep -v "#" | sort
```

## Step 3 — Connect to Cloud SQL (if proxy running on 15432)

```bash
psql "host=127.0.0.1 port=15432 dbname=elson_db user=elson_user" -c "
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
"
```

## Step 4 — Compare Critical Tables

Check key tables for drift:
```bash
# Users table
psql "host=127.0.0.1 port=15432 dbname=elson_db user=elson_user" -c "\d users"
psql "host=127.0.0.1 port=15432 dbname=elson_db user=elson_user" -c "\d portfolios"
psql "host=127.0.0.1 port=15432 dbname=elson_db user=elson_user" -c "\d trades"
psql "host=127.0.0.1 port=15432 dbname=elson_db user=elson_user" -c "\d trade_decision_logs"
```

---

## Step 5 — Generate ALTER TABLE (if drift found)

For each new column found in models but not in DB, generate:
```sql
ALTER TABLE {table_name} ADD COLUMN {column_name} {type} DEFAULT {default};
```

**Run on Cloud SQL BEFORE deploying code.**

---

## Verdict

| Table | Model Columns | DB Columns | Drift |
|-------|--------------|------------|-------|
| users | N | N | ✅/❌ |
| portfolios | N | N | ✅/❌ |
| trades | N | N | ✅/❌ |

**SAFE TO DEPLOY: YES / NO**

If NO: Provide the exact ALTER TABLE statements to run first.
