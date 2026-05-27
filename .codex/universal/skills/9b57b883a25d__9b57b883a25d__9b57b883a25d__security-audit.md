# GEN.OS Security Audit Checklist

Run with `guardian-sentinel` + `reliability-security-sentinel` agents.
Classify findings: P0 (critical/blocking), P1 (fix before release), P2 (fix this sprint), P3 (backlog).

## 1 — XKABI Capability Review

```bash
# List all Capabilities= values in GENSD descriptors
grep -r "Capabilities" init/gensd/services/*.gsd 2>/dev/null

# Verify ONLY XK_RIGHT_* aliases used (never raw hex)
grep -rn "rights.*0x\|Capabilities.*0x" init/gensd/ kernel/ \
  --include="*.c" --include="*.gsd"
# Expected: 0 matches
```

Principle of least privilege: each service gets ONLY the rights it needs.

## 2 — Memory Safety (Kernel + Display + XFRAME)

```bash
# No dynamic allocation
grep -rn "malloc\|calloc\|realloc\|free(" \
  kernel/ display/ ui/xframe/ --include="*.c" --include="*.h" \
  | grep -v "^.*//.*malloc"
# Expected: 0 matches

# No dangerous string ops
grep -rn "sprintf\|strcpy\|gets\|strcat" \
  kernel/ display/ ui/xframe/ init/ --include="*.c"
# Expected: 0 matches (use pal_console_printf + manual copy)
```

## 3 — Platform Services Security (Python)

```bash
# SAST
bandit -r platform/ ai/ -ll
echo "bandit: $?"

# Dependency CVEs
pip-audit --desc --fix=no
echo "pip-audit: $?"

# No hardcoded secrets
grep -rn "password\s*=\s*['\"].\+['\"\|secret\s*=\s*['\"].\+['\"]" \
  platform/ ai/ --include="*.py" \
  | grep -v "test_\|conftest\|#.*example"
# Expected: 0 matches (all secrets from env vars)
```

## 4 — JWT / Auth Review

For every FastAPI route with user data:

```python
# Verify: all non-health endpoints protected
# Pattern to check — every route must have:
@router.get("/protected")
async def protected(current_user = Depends(get_current_user)):
    ...

# Verify: no route accidentally missing Depends(get_current_user)
grep -rn "@router\.\(get\|post\|put\|delete\)" platform/services/ \
  | grep -v "health\|Depends"
```

## 5 — Container + Infrastructure Security

```bash
# Filesystem CVE scan
trivy fs . --severity CRITICAL,HIGH --exit-code 1 --ignore-unfixed \
  --skip-dirs .claude,node_modules,build/rootfs

# Node dependency scan
npm audit --audit-level=high

# Dockerfile lint (Hadolint if available)
which hadolint && find platform/docker -name "Dockerfile*" \
  -exec hadolint {} \; || echo "hadolint not installed"
```

## 6 — Threat Model Template

```
THREAT MODEL — [Component] — Sprint N

Assets:
  - [Asset 1]: [sensitivity level]
  - [Asset 2]: [sensitivity level]

Trust Boundaries:
  - [Boundary 1]: [what crosses it]

Threats (STRIDE):
  | Threat | Component | Vector | Impact | Mitigation | Status |
  |--------|-----------|--------|--------|------------|--------|
  | Spoofing | [comp] | [how] | P[N] | [control] | [done/todo] |
  | Tampering | ... | ... | ... | ... | ... |
  | Repudiation | ... | ... | ... | ... | ... |
  | Info Disclosure | ... | ... | ... | ... | ... |
  | DoS | ... | ... | ... | ... | ... |
  | Elevation | ... | ... | ... | ... | ... |

Residual Risk: [description]
Accepted by: guardian-sentinel, Sprint N
```

## 7 — Audit Report Output

```
SECURITY AUDIT REPORT — [Component] — Sprint N
Date: [YYYY-MM-DD]
Auditors: guardian-sentinel, reliability-security-sentinel

P0 (Critical — block release): [N findings]
P1 (High — fix before release): [N findings]
P2 (Medium — fix this sprint): [N findings]
P3 (Low — backlog): [N findings]

Findings:
  [ID]  [P-level]  [Title]
  [GS-N]-[area]-NN-[code]: [description]
  File: [path:line]
  Fix: [remediation]
  Status: [OPEN / RESOLVED in commit HASH]

VERDICT: [CLEARED / BLOCKED]
```
