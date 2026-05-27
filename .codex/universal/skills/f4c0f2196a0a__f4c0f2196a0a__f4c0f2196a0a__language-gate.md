# GEN.OS Language Policy Gate

Hard constraint: Python, TypeScript, C ONLY. Enforced by `platform/check_language_policy.py`.

## Run the Gate

```bash
python platform/check_language_policy.py
# Exit 0 = PASS.  Exit 2 = VIOLATIONS (list printed to stdout).
```

## Allowed Source Extensions

| Extension | Language | GEN.OS use |
|-----------|----------|-----------|
| `.c`, `.h` | C | Kernel, GENSD, PAL, XDISP, XCOMP, XFRAME |
| `.py` | Python | Platform services, AI, tools, build scripts |
| `.ts`, `.tsx` | TypeScript | Compositor shell, Orange Suite |
| `.asm` | NASM x86_64 | Kernel assembly (entry, isr, syscall, stage1) |
| `.js` | JavaScript | Transitional only — prefer TypeScript |
| `.swift` | Swift | `mobile/` ONLY — excluded from policy scope |

## Blocked Languages (Any other extension -> fail)

```
.go .rs .cpp .cxx .cc .hpp .cs .kt .zig .rb .php .lua
```

## Fixing a Violation

```
VIOLATION: path/to/file.go
-> Rewrite: services -> Python/FastAPI, UI -> TypeScript, system -> C

VIOLATION: path/to/file.rs
-> Rewrite: system level -> C (freestanding), tooling -> Python

VIOLATION: path/to/file.cpp
-> Rewrite: use -std=c11, remove C++ features (classes, references, exceptions)
   Add extern "C" wrappers if interfacing with C++ library is unavoidable
```

## Mobile Exception

Swift files in `mobile/ios/` and `mobile/watchos/` are excluded.
If `check_language_policy.py` flags `.swift`, verify the script's
`IGNORE_DIRS` includes `"mobile"`.

## Adding a New Allowed Extension (Exceptional)

1. Open `platform/check_language_policy.py`
2. Add to `ALWAYS_ALLOWED_EXTS` (config/data) or `ALLOWED_SOURCE_EXTS` (source)
3. Justify in PR description
4. Requires `master-orchestrator` approval before merge
