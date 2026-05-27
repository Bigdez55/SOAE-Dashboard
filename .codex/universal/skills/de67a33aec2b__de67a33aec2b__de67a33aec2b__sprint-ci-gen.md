# GEN.OS Sprint CI Gen — Generate Sprint CI Workflows

Generate a new GitHub Actions workflow for a GEN.OS sprint, following the canonical
secure pattern used by sprint2.yml–sprint9.yml.

## When to use

- Starting a new sprint that introduces C source files needing CI coverage
- Adding new subsystems to an existing sprint CI gate
- Auditing an existing workflow for security compliance

## Canonical Workflow Pattern

All GEN.OS sprint workflows MUST follow this pattern (SLSA L1 compliant):

```yaml
name: GEN.OS Sprint N — [SUBSYSTEM1] + [SUBSYSTEM2]

on:
  push:
    branches: ["main", "master"]
    paths:
      - "[subsystem/path/**]"
      - ".github/workflows/sprintN.yml"
  pull_request:
    paths:
      - "[subsystem/path/**]"
      - ".github/workflows/sprintN.yml"

permissions:
  contents: read          # MANDATORY — no write permissions

jobs:
  sprintN-static-analysis:
    name: Sprint N — Static Analysis (cppcheck)
    runs-on: ubuntu-24.04  # PINNED — never ubuntu-latest
    timeout-minutes: 15    # MANDATORY — every job must have timeout

    steps:
      - name: Checkout
        uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683  # SHA-PINNED

      - name: Install cppcheck
        run: |
          sudo apt-get update -qq
          sudo apt-get install -y --no-install-recommends cppcheck  # --no-install-recommends

      - name: cppcheck — [SUBSYSTEM]
        run: |
          cppcheck --enable=warning,performance,portability \
            --std=c11 \
            --error-exitcode=1 \
            --suppress=missingIncludeSystem \
            -I [subsystem/include] \
            -I pal/include \
            [file1.c] [file2.c] ...

  sprintN-[subsystem]:
    name: [SUBSYSTEM] — Freestanding Compile Check (Sprint N Gate)
    runs-on: ubuntu-24.04
    timeout-minutes: 10

    steps:
      - name: Checkout
        uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683

      - name: Install clang-18
        run: |
          sudo apt-get update -qq
          sudo apt-get install -y --no-install-recommends clang-18

      - name: Compile [SUBSYSTEM] — N source files
        run: |
          PASS=0; FAIL=0
          for f in \
            [file1.c] \
            [file2.c]; do
            if clang-18 -target x86_64-unknown-none-elf \
                        -ffreestanding -fno-stack-protector -fno-pie \
                        -mno-red-zone -mno-mmx -mno-sse -mno-sse2 \
                        -Werror -Wall -Wextra -Wno-unused-parameter \
                        -O2 -std=c11 -fsyntax-only \
                        -I[subsystem/include] \
                        -Ipal/include \
                        "$f" 2>&1; then
              echo "  PASS: $f"; PASS=$((PASS+1))
            else
              echo "  FAIL: $f"; FAIL=$((FAIL+1))
            fi
          done
          echo "[SUBSYSTEM]: ${PASS}/N PASS | ${FAIL}/N FAIL"
          test $FAIL -eq 0

  sprintN-libc-scan:
    name: Sprint N — Zero libc includes scan
    runs-on: ubuntu-24.04
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
      - name: Verify zero libc includes
        run: |
          VIOLATIONS=0
          for f in $(find [subsystem/path/] -name "*.c" -o -name "*.h"); do
            if grep -qE '^\s*#\s*include\s*<(stdio|stdlib|string|unistd|sys/)' "$f"; then
              echo "[LIBC VIOLATION] $f"
              VIOLATIONS=$((VIOLATIONS+1))
            fi
          done
          echo "Libc violations: $VIOLATIONS"
          [ $VIOLATIONS -eq 0 ] || exit 1

  sprintN-gate:
    name: Sprint N — Gate Summary (M/M required)
    runs-on: ubuntu-24.04
    timeout-minutes: 5
    needs:
      - sprintN-static-analysis
      - sprintN-[subsystem]
      - sprintN-libc-scan
    steps:
      - name: Sprint N gate passed
        run: |
          echo "=================================================="
          echo " GEN.OS Sprint N Gate — ALL CHECKS PASSED"
          echo "=================================================="
```

## Security Requirements (SLSA L1)

| Requirement | Implementation |
|-------------|---------------|
| No mutable action tags | All `uses:` must be `@SHA` not `@v*` |
| Least privilege | `permissions: contents: read` at workflow level |
| Pinned runner | `ubuntu-24.04` (never `ubuntu-latest`) |
| Job timeouts | Every job must have `timeout-minutes` |
| No self-hosted runners | Use GitHub-hosted only |
| Minimal packages | `--no-install-recommends` on all apt-get |
| No secrets in logs | Never echo secrets; use `2>&1` not `2>/dev/null` |

Reference: GitHub Actions Security Hardening Guide —
`docs.github.com/en/actions/security-guides/security-hardening-for-github-actions`
SLSA Specification v1.0 — `slsa.dev/spec/v1.0/`

## SHA Pins (current — update when bumping versions)

```yaml
actions/checkout v4.2.2:  @11bd71901bbe5b1630ceea73d27597364c9af683
actions/upload-artifact v4.6.2: @ea165f8d65b6e75b540449e92b4886f43607fa02
```

To refresh a SHA pin:
```bash
gh api repos/actions/checkout/git/ref/tags/v4.2.2 --jq '.object.sha'
```

## Freestanding Compiler Flags (canonical)

```
clang-18 -target x86_64-unknown-none-elf
  -ffreestanding -fno-stack-protector -fno-pie
  -mno-red-zone -mno-mmx -mno-sse -mno-sse2
  -Werror -Wall -Wextra -Wno-unused-parameter
  -O2 -std=c11 -fsyntax-only
```

**Never use:** `gcc`, `g++`, `cc`, `$(CC)`, `-march=native`, `-msse4`

## Include Path Rules

| Subsystem | Include Flags |
|-----------|--------------|
| XENOS kernel | `-Ikernel/xenos/include -Ipal/include -D__x86_64__` |
| XSEC | `-Isec/xsec/include -Ipal/include` |
| XNET | `-Inet/xnet/include -Isec/xsec/include -Ipal/include` |
| XPKG | `-Ipkg/xpkg/include -Ipal/include` |
| XSTORE | `-Istore/xstore/include -Ipal/include` |
| XBLOB | `-Istore/xblob/include -Ipal/include` |
| XSHELL | `-Ishell/xshell/include -Iui/xframe/runtime -Ipal/include` |
| XMIND | `-Iai/xmind/include -Ipal/include` |
| XJIT | `-Ijit/xjit/include -Ipal/include` |
| XBUILD | `-Itools/xbuild/include -Ipal/include` |
| XEMU | `-Ivm/xemu/include -Ijit/xjit/include -Ipal/include` |
| GENISO | `-Itools/iso/include -Isec/xsec/include -Ipal/include` |

## Generation Checklist

```
[ ] One compile job per logical subsystem (max 15 files per job)
[ ] Gate job `needs:` lists ALL subsystem jobs + static-analysis + libc-scan
[ ] paths: trigger includes subsystem glob AND .github/workflows/sprintN.yml
[ ] All actions SHA-pinned (run `gh api` to verify)
[ ] permissions: contents: read at workflow level
[ ] Every job has timeout-minutes
[ ] ubuntu-24.04 on all jobs
[ ] clang-18 (not gcc, not clang-16, not clang)
[ ] --no-install-recommends on apt-get
[ ] PASS/FAIL counter with `test $FAIL -eq 0` exit check
[ ] Gate summary echoes per-subsystem counts
```
