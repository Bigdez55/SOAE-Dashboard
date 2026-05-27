---
name: security-scan
description: Run a security scan — CVE checks, SAST analysis, secrets detection, and dependency audit. Use when the user asks for a security scan, CVE check, vulnerability scan, or security review.
model: claude-opus-4-6
---

# Security Scan — Elson TB2

Run SAST, dependency CVE checks, secrets detection, and financial safety review.

---

## Step 1 — Python Dependency CVE Scan

```bash
cd backend

# Check with pip-audit (install if needed)
pip install pip-audit -q 2>/dev/null
pip-audit --requirement requirements.txt --format=json 2>/dev/null \
  | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    vulns = [d for d in data.get('dependencies', []) if d.get('vulns')]
    if vulns:
        print(f'CRITICAL: {len(vulns)} vulnerable packages found')
        for dep in vulns:
            for v in dep['vulns']:
                print(f'  {dep[\"name\"]}=={dep[\"version\"]}: {v[\"id\"]} [{v.get(\"fix_versions\",[])}]')
    else:
        print('OK: No known CVEs found')
except Exception as e:
    print('pip-audit output:', e)
" 2>/dev/null
```

## Step 2 — SAST: Bandit (Python Security)

```bash
cd backend

pip install bandit -q 2>/dev/null
bandit -r app/ -f json -ll 2>/dev/null \
  | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    issues = data.get('results', [])
    highs = [i for i in issues if i.get('issue_severity') == 'HIGH']
    meds  = [i for i in issues if i.get('issue_severity') == 'MEDIUM']
    print(f'HIGH severity: {len(highs)}')
    print(f'MEDIUM severity: {len(meds)}')
    for i in highs[:5]:
        print(f'  {i[\"filename\"]}:{i[\"line_number\"]} — {i[\"issue_text\"]}')
except Exception as e:
    print('Bandit error:', e)
" 2>/dev/null
```

## Step 3 — Secrets Detection

```bash
# Scan for hardcoded secrets, API keys, passwords
grep -rn \
  -e "password\s*=\s*['\"][^'\"]\+" \
  -e "api_key\s*=\s*['\"][^'\"]\+" \
  -e "secret\s*=\s*['\"][^'\"]\+" \
  -e "token\s*=\s*['\"][^'\"]\+" \
  --include='*.py' --include='*.ts' --include='*.tsx' --include='*.env' \
  --exclude-dir='.git' --exclude-dir='node_modules' --exclude-dir='venv' \
  --exclude-dir='__pycache__' \
  . 2>/dev/null | grep -v 'test\|example\|template\|placeholder\|os\.getenv\|environ' | head -20

# Check for .env files committed to git
git ls-files | grep -E '\.env$|\.env\.' | grep -v '.example' | head -5
```

## Step 4 — npm Dependency Audit

```bash
cd frontend
npm audit --json 2>/dev/null \
  | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    meta = data.get('metadata', {}).get('vulnerabilities', {})
    print(f'Critical: {meta.get(\"critical\", 0)}')
    print(f'High: {meta.get(\"high\", 0)}')
    print(f'Moderate: {meta.get(\"moderate\", 0)}')
    advs = data.get('advisories', {})
    for k, v in list(advs.items())[:5]:
        if v.get('severity') in ('critical', 'high'):
            print(f'  {v[\"module_name\"]}: {v[\"title\"]} ({v[\"severity\"]})')
except Exception as e:
    print('npm audit error:', e)
" 2>/dev/null
```

## Step 5 — Financial Safety Checks

```bash
cd backend

echo "=== Float used for money (should use Numeric) ==="
grep -rn "Column(Float" app/models/ --include='*.py' | head -10

echo "=== PII potentially sent to LLM ==="
grep -rn "email\|password\|ssn\|tax_id" app/services/eft*.py \
  app/services/proactive*.py 2>/dev/null | grep -v "#" | head -10

echo "=== Direct SQL (injection risk) ==="
grep -rn "execute.*f\".*SELECT\|execute.*%.*SELECT" app/ --include='*.py' 2>/dev/null | head -5

echo "=== Unguarded Redis calls ==="
grep -rn "redis\." app/ --include='*.py' 2>/dev/null \
  | grep -v "if.*redis\|try\|except" | head -5
```

## Step 6 — Secret Manager Compliance

```bash
# Verify all required secrets exist in GCP Secret Manager
REQUIRED_SECRETS=(
  "elson-db-password"
  "elson-secret-key"
  "elson-encryption-salt"
  "alpaca-api-key"
  "alpaca-secret-key"
)

for secret in "${REQUIRED_SECRETS[@]}"; do
  result=$(gcloud secrets describe "$secret" --project=elson-33a95 2>&1)
  if echo "$result" | grep -q "name:"; then
    echo "OK: $secret"
  else
    echo "MISSING: $secret"
  fi
done 2>/dev/null
```

---

## Security Scan Report

```
╔══════════════════════════════════════════════════╗
║           SECURITY SCAN REPORT                   ║
╠══════════════════════════════════════════════════╣
║ CVE SCAN (Python)                                ║
║   Vulnerable packages: [N] — [OK / CRITICAL]    ║
║                                                  ║
║ SAST (Bandit)                                    ║
║   HIGH: [N]  MEDIUM: [N]                        ║
║                                                  ║
║ SECRETS DETECTION                                ║
║   Hardcoded secrets: [N] — [OK / REVIEW]        ║
║   .env committed: [NO / YES — CRITICAL]         ║
║                                                  ║
║ npm AUDIT                                        ║
║   Critical: [N]  High: [N]  Moderate: [N]       ║
║                                                  ║
║ FINANCIAL SAFETY                                 ║
║   Float for money: [N issues]                   ║
║   PII to LLM: [N issues]                        ║
║   SQL injection: [N issues]                     ║
║                                                  ║
║ SECRET MANAGER                                   ║
║   All required secrets: [OK / N missing]        ║
╠══════════════════════════════════════════════════╣
║ VERDICT: [PASS / FAIL — block deploy]            ║
╚══════════════════════════════════════════════════╝
```

**Block deploy if:** any CRITICAL CVE, hardcoded secrets committed, HIGH bandit issue in auth/payments code, or missing required GCP secrets.
