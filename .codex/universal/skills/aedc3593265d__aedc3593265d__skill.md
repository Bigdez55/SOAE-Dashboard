---
name: kill-list
description: Generate a dead code manifest — identify unused files, zombie functions, orphaned imports, and bloated utilities in the Elson TB2 codebase. Use when the user says find dead code, kill list, clean up the codebase, or what can we remove.
model: claude-opus-4-6
---

# Kill List Protocol — Dead Code Manifest

Identify dead code candidates for removal. Present findings for user approval before any deletion.

---

## Phase 1 — Unused Python Files

```bash
cd backend

# Find Python files with no imports from other files
python3 -c "
import os, ast, sys
from pathlib import Path

app_files = list(Path('app').rglob('*.py'))
all_imports = set()

for f in app_files:
    try:
        tree = ast.parse(f.read_text())
        for node in ast.walk(tree):
            if isinstance(node, (ast.Import, ast.ImportFrom)):
                if isinstance(node, ast.ImportFrom) and node.module:
                    all_imports.add(node.module.replace('.', '/'))
    except: pass

candidates = []
for f in app_files:
    module_path = str(f).replace('.py', '').replace('/', '.')
    short = str(f).replace('.py', '').replace('/', '.')
    if '__init__' not in str(f) and not any(short in imp for imp in all_imports):
        candidates.append(str(f))

for c in sorted(candidates)[:30]:
    print(c)
" 2>/dev/null | head -30
```

## Phase 2 — Unused Frontend Exports

```bash
cd frontend/src

# Components not imported anywhere
for f in $(find components -name '*.tsx' -o -name '*.ts' | grep -v '.test.' | grep -v index); do
  name=$(basename $f .tsx)
  name=${name%.ts}
  count=$(grep -r "import.*$name" --include='*.ts' --include='*.tsx' . 2>/dev/null | grep -v "$f" | wc -l)
  if [ "$count" -eq 0 ]; then
    echo "ORPHANED: $f"
  fi
done 2>/dev/null | head -20
```

## Phase 3 — Dead API Endpoints (no frontend calls)

```bash
cd backend

# Extract all route paths
python3 -c "
import subprocess, re
result = subprocess.run(['grep', '-rn', '@router\\.', 'app/api/', '--include=*.py'], capture_output=True, text=True)
routes = re.findall(r'\"(/[^\"]+)\"', result.stdout)
for r in set(routes):
    print(r)
" 2>/dev/null | sort

# Check which are called from frontend
echo '---'
grep -rn 'api/v1' frontend/src --include='*.ts' --include='*.tsx' 2>/dev/null \
  | grep -oP '/api/v1[^"'\'']+' | sort -u | head -30
```

## Phase 4 — Unused Dependencies

```bash
# Python: packages installed but not imported
cd backend
pip list --format=columns 2>/dev/null | tail -n +3 | awk '{print $1}' | while read pkg; do
  normalized=$(echo $pkg | tr '[:upper:]' '[:lower:]' | tr '-' '_')
  count=$(grep -r "import $normalized\|from $normalized" app/ 2>/dev/null | wc -l)
  if [ "$count" -eq 0 ]; then
    echo "UNUSED PKG: $pkg"
  fi
done 2>/dev/null | head -20

# Frontend: packages in package.json not imported
cd ../frontend
node -e "
const pkg = require('./package.json');
const deps = Object.keys({...pkg.dependencies, ...pkg.devDependencies});
const {execSync} = require('child_process');
deps.forEach(d => {
  try {
    const count = execSync(\`grep -r '${d}' src/ --include='*.ts' --include='*.tsx' 2>/dev/null | wc -l\`).toString().trim();
    if (parseInt(count) === 0) console.log('UNUSED NPM:', d);
  } catch(e) {}
});
" 2>/dev/null | head -15
```

## Phase 5 — Duplicate / Redundant Files

```bash
# Look for files with similar names (potential duplicates)
find . -name '*.py' -o -name '*.ts' -o -name '*.tsx' 2>/dev/null \
  | xargs basename 2>/dev/null | sort | uniq -d | head -20

# Old/backup files
find . \( -name '*.bak' -o -name '*.old' -o -name '*_backup*' -o -name '*_old*' \) \
  -not -path '*/node_modules/*' -not -path '*/.git/*' 2>/dev/null | head -10

# Empty files
find . -name '*.py' -size 0 -not -path '*/__pycache__/*' 2>/dev/null | head -10
```

---

## Kill List Report Format

```
╔══════════════════════════════════════════════════╗
║              KILL LIST MANIFEST                  ║
╠══════════════════════════════════════════════════╣
║ ZOMBIE FILES (no imports found)                  ║
║   backend/app/services/[name].py     [N lines]  ║
║   frontend/src/components/[name].tsx [N lines]  ║
╠══════════════════════════════════════════════════╣
║ DEAD API ENDPOINTS (no frontend calls)           ║
║   GET /api/v1/[path]                            ║
╠══════════════════════════════════════════════════╣
║ UNUSED PACKAGES                                  ║
║   Python: [pkg1], [pkg2]                        ║
║   NPM: [pkg1], [pkg2]                           ║
╠══════════════════════════════════════════════════╣
║ TOTAL CANDIDATES: [N] files, ~[N] lines          ║
╚══════════════════════════════════════════════════╝

⚠ All removals require explicit user approval.
  Confirm each item before deletion.
```

**Do NOT delete anything automatically. Present the list and ask: "Which items should be removed?"**
