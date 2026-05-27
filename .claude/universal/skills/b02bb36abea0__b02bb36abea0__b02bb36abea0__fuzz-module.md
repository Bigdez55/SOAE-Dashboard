# GEN.OS Fuzz Module — AFL++ / libFuzzer Harnesses for GEN.OS

Write and run fuzz test harnesses for GEN.OS freestanding C modules.

## When to use

- After implementing a new parser (GGUF, XPKG format, X.509 DER, AML)
- When a module processes untrusted external input (network, files, ACPI tables)
- After a security audit flags an input-parsing function as high-risk
- For any function accepting a `uint8_t *buf, size_t len` from an external source

## High-Priority Fuzz Targets

| Target | File | Why |
|--------|------|-----|
| GGUF loader | `ai/xmind/src/weights_loader.c` | Parses untrusted model files |
| XPKG format | `pkg/xpkg/src/pkg_format.c` | Parses untrusted package archives |
| X.509 DER parser | `sec/xsec/crypto/x509.c` | Parses untrusted TLS certificates |
| DNS response | `net/xnet/src/dns.c` | Parses untrusted DNS responses |
| ACPI AML | `kernel/xenos/drv/xacpi.c` | Parses firmware-provided AML opcodes |
| XPKG refusal_gate | `pkg/xpkg/src/refusal_gate.c` | Policy input validation |
| TLS record recv | `sec/xsec/tls/tls13.c` | Parses untrusted TLS records |

## libFuzzer Harness Template

```c
/*
 * fuzz_[module].c — libFuzzer harness for [MODULE]
 *
 * Build:
 *   clang-18 -fsanitize=address,fuzzer -O1 \
 *     -Isec/xsec/include -Ipal/include \
 *     fuzz_[module].c [module].c \
 *     -o fuzz_[module]
 *
 * Run:
 *   ./fuzz_[module] -max_len=65536 -runs=1000000 corpus/[module]/
 */

#include <stdint.h>
#include <stddef.h>
/* NOTE: fuzz harness runs on host (Linux) — NOT freestanding */
/* The module under test must be compiled with host stdlib available */
/* Use #ifdef FUZZ_HARNESS to stub PAL functions */

#define FUZZ_HARNESS 1
#include "[module].h"

/* Stub PAL functions not available on host */
#ifdef FUZZ_HARNESS
void pal_console_puts(const char *s) { (void)s; }
uint64_t pal_time_now_ns(void) { return 0; }
void pal_spin_lock(pal_spinlock_t *l) { (void)l; }
void pal_spin_unlock(pal_spinlock_t *l) { (void)l; }
#endif

/* libFuzzer entry point */
int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    if (size < 4) return 0; /* skip trivially small inputs */

    /* Call the target function with fuzz data */
    [module_result_t] result;
    [module_parse]((const uint8_t *)data, size, &result);

    /* No assertion needed — sanitizers catch memory errors */
    /* Optionally: assert no crash on valid-looking magic */
    return 0;
}
```

Reference: LLVM libFuzzer documentation — `llvm.org/docs/LibFuzzer.html`

## AFL++ Harness Template

```c
/*
 * fuzz_afl_[module].c — AFL++ persistent mode harness for [MODULE]
 *
 * Build:
 *   afl-clang-fast -O1 \
 *     -Isec/xsec/include -Ipal/include \
 *     fuzz_afl_[module].c [module].c \
 *     -o fuzz_afl_[module]
 *
 * Run:
 *   afl-fuzz -i corpus/[module]/ -o findings/[module]/ \
 *     -m 512 -- ./fuzz_afl_[module] @@
 */
#include <stdio.h>
#include <stdlib.h>
#include "[module].h"

/* AFL++ persistent mode: __AFL_FUZZ_INIT, __AFL_LOOP */
__AFL_FUZZ_INIT();

int main(void) {
    __AFL_INIT();
    unsigned char *buf = __AFL_FUZZ_TESTCASE_BUF;
    while (__AFL_LOOP(10000)) {
        size_t len = __AFL_FUZZ_TESTCASE_LEN;
        [module_result_t] result;
        [module_parse](buf, len, &result);
    }
    return 0;
}
```

Reference: AFL++ documentation — `aflplus.plus/docs/`
AFL++ persistent mode — `github.com/AFLplusplus/AFLplusplus/blob/stable/instrumentation/README.persistent_mode.md`

## GGUF Fuzzer (Concrete Example)

```c
/* tests/fuzz/fuzz_gguf_loader.c */
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#define FUZZ_HARNESS 1
#include "xmind.h"

/* Minimal PAL stubs for host build */
void *pal_page_alloc(uint32_t n) { return calloc(n, 4096); }
void  pal_page_free(void *p, uint32_t n) { (void)n; free(p); }

int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    if (size < 16) return 0;

    /* Feed raw bytes to GGUF header parser */
    xmind_weights_ctx_t wctx;
    /* xmind_weights_load expects a pal_file_t; use in-memory stub */
    xmind_weights_load_mem(&wctx, data, size);
    xmind_weights_unload(&wctx);
    return 0;
}
```

Seed corpus: create minimal valid GGUF header:
```python
# gen_seed.py — generate minimal GGUF v3 seed
import struct
magic   = b'GGUF'          # 0x46554747 LE
version = struct.pack('<I', 3)
n_tensors = struct.pack('<Q', 0)
n_kv = struct.pack('<Q', 0)
with open('corpus/gguf/seed_v3_empty.gguf', 'wb') as f:
    f.write(magic + version + n_tensors + n_kv)
```

## X.509 Fuzzer (Concrete Example)

```c
/* tests/fuzz/fuzz_x509.c */
#include <stdint.h>
#include <stddef.h>
#define FUZZ_HARNESS 1
#include "xsec.h"

int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {
    if (size < 8) return 0;
    xsec_x509_cert_t cert;
    /* Parse DER-encoded certificate — must not crash/OOB on any input */
    xsec_x509_parse_der(data, size, &cert);
    return 0;
}
```

## Sanitizer Build Flags

```bash
# AddressSanitizer + libFuzzer (recommended for parsing code)
clang-18 -fsanitize=address,fuzzer -O1 -g \
  -fno-omit-frame-pointer \
  -Isec/xsec/include -Ipal/include \
  fuzz_x509.c sec/xsec/crypto/x509.c

# UndefinedBehaviorSanitizer (catch integer overflow, OOB array index)
clang-18 -fsanitize=undefined,fuzzer -O1 -g \
  fuzz_gguf.c ai/xmind/src/weights_loader.c

# MemorySanitizer (uninitialized reads — requires clang-only build)
clang-18 -fsanitize=memory,fuzzer -O1 -g \
  fuzz_dns.c net/xnet/src/dns.c
```

## Corpus Management

```bash
# Minimize corpus after fuzzing run
llvm-cov-18 mergecov -show-counts -Recurse \
  corpus/x509/ findings/x509/queue/ -output-dir corpus_min/x509/

# Reproduce a crash
./fuzz_x509 findings/x509/crashes/id:000001,sig:06,...
# Then run under lldb to get full stack trace
lldb ./fuzz_x509 -- findings/x509/crashes/id:000001,...
```

## CI Integration

Add to `.github/workflows/fuzz.yml` (sprint10+ gate):
```yaml
  fuzz-smoke:
    name: Fuzz smoke (10k runs each)
    runs-on: ubuntu-24.04
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683
      - run: sudo apt-get install -y --no-install-recommends clang-18
      - run: |
          clang-18 -fsanitize=address,fuzzer -O1 \
            -Isec/xsec/include -Ipal/include \
            tests/fuzz/fuzz_x509.c sec/xsec/crypto/x509.c \
            -o fuzz_x509
          ./fuzz_x509 -runs=10000 tests/fuzz/corpus/x509/
```

## Finding Triage

| Finding Type | Severity | Action |
|-------------|----------|--------|
| Heap buffer overflow | P0 — push blocker | Fix bounds check immediately |
| Stack overflow in parser | P0 — push blocker | Add depth/size limit |
| Assertion failure | P1 | Fix invariant |
| Integer overflow → OOB | P1 | Add overflow check |
| Uninitialized read | P1 | Zero-initialize struct |
| Slow input (>100ms/run) | P2 | Add input size limit |
