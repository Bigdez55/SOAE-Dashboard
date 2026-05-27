# GEN.OS XMIND Test — Inference Correctness Verification

Verify XMIND inference correctness: tensor math, Q4_0 dequantization, transformer
forward pass, sampler output, and tokenizer round-trips.

## When to use

- After modifying `ai/xmind/src/` (transformer.c, quantize.c, sampler.c, tokenizer.c)
- Before loading a new GGUF model file
- When `xmind_generate()` produces garbled or non-terminating output
- When quantization accuracy regression is suspected

## XMIND Architecture (Sprint 6)

**Files:**
- `ai/xmind/src/tensor.c` — xm_tensor_t: shape, stride, data pointer
- `ai/xmind/src/quantize.c` — Q4_0 pack/dequant (32-element blocks, 16-bit scale)
- `ai/xmind/src/transformer.c` — GQA attention + SwiGLU FFN + RMSNorm
- `ai/xmind/src/sampler.c` — xorshift64 PRNG + top-p (nucleus) sampling
- `ai/xmind/src/tokenizer.c` — BPE tokenizer stub (XSTORE integration path)
- `ai/xmind/src/xmind.c` — public API: xmind_init, xmind_generate, xmind_free
- `ai/xmind/src/weights_loader.c` — GGUF loader (magic 0x46554747, versions 1-3)

**Llama 3.2 3B preset** (Sprint 8):
```c
layers=28, heads=32, kv_heads=8, head_dim=96,
hidden=3072, ffn=8192, vocab=32000, ctx=2048
```

## Q4_0 Dequantization — Ground Truth

Q4_0 format (GGUF spec, ggerganov/ggml):
- 32 int4 values per block (packed as 16 bytes)
- 1 float16 scale per block
- Dequant: `f = (int4 - 8) * scale`  (int4 range 0-15 → signed -8 to +7)

```c
/* Manual check for a known Q4_0 block */
/* block: scale = 0x3C00 (fp16 = 1.0), nibbles = [8,9,10,11,...] */
/* Expected dequant: [0.0, 1.0, 2.0, 3.0, ...] */
float expected[32] = {0.0f, 1.0f, 2.0f, 3.0f, ...};
xm_block_q4_0_t block = { .scale = 0x3C00, .qs = {0x98, 0xBA, ...} };
float out[32];
xm_dequantize_q4_0(&block, out, 1);
/* Compare out[] to expected[] within tolerance 1e-3 */
```

Reference: `github.com/ggerganov/ggml/blob/master/docs/gguf.md` — block quantization spec.

## Test Protocol (All 10 Types)

### 1. Smoke Tests
```c
/* xmind_init with NULL weights path → XMIND_ERR_INVAL */
xmind_ctx_t ctx;
assert(xmind_init(&ctx, NULL, NULL) == XMIND_ERR_INVAL);
/* xmind_init with valid preset (no weights file) → XMIND_OK */
assert(xmind_init(&ctx, &xmind_llama32_3b_preset, NULL) == XMIND_OK);
```

### 2. Functional Tests
```c
/* Q4_0 dequant identity: all-zero block → all-zero output */
xm_block_q4_0_t zero_block = {0};
float out[32];
xm_dequantize_q4_0(&zero_block, out, 1);
for (int i = 0; i < 32; i++) assert(out[i] == 0.0f);

/* RMSNorm: known input → known output */
/* RMSNorm(x) = x / sqrt(mean(x²) + eps) * weight */
float x[4] = {1.0f, 2.0f, 3.0f, 4.0f};
float w[4] = {1.0f, 1.0f, 1.0f, 1.0f};
float y[4];
xm_rmsnorm(x, w, y, 4, 1e-5f);
/* Expected: x / sqrt((1+4+9+16)/4 + 1e-5) = x / sqrt(7.5 + 1e-5) */
```

### 3. Integration Tests
```c
/* Tokenizer → transformer → sampler pipeline with synthetic weights */
xmind_ctx_t ctx;
xmind_init(&ctx, &xmind_llama32_3b_preset, NULL);
/* Inject identity weights (all 1.0f, Q4_0 scale=1.0) */
xmind_inject_test_weights(&ctx);
uint32_t tokens[8] = {1, 2, 3, 4, 5, 6, 7, 2}; /* BOS=1, EOS=2 */
xmind_result_t result;
xmind_generate(&ctx, tokens, 7, &result, 16 /*max_new*/);
assert(result.n_tokens > 0 && result.n_tokens <= 16);
```

### 4. Regression Tests
```c
/* Guard against Q4_0 off-by-one: nibble 0 must yield -8*scale, not 0 */
xm_block_q4_0_t b = { .scale = 0x3C00 /*1.0f*/ };
memset(b.qs, 0x00, 16); /* all nibbles = 0 */
float out[32];
xm_dequantize_q4_0(&b, out, 1);
assert(out[0] == -8.0f); /* (0 - 8) * 1.0 = -8 */

/* Guard: GQA kv_heads < heads must not OOB */
/* With kv_heads=8, heads=32: head_group = head_idx / (32/8) = head_idx / 4 */
```

### 5. Load Tests
```c
/* 100 consecutive generate() calls with 2048-token context */
for (int i = 0; i < 100; i++) {
    xmind_generate(&ctx, tokens, 2048, &result, 1);
    assert(result.status == XMIND_OK);
}
```

### 6. Stress Tests
```c
/* Generate with top-p=1.0 (no pruning) — exercise full vocab distribution */
/* Generate with top-p=0.0 (greedy) — always pick argmax */
xmind_sampler_config_t greedy = { .temperature = 0.0f, .top_p = 0.0f };
xmind_sampler_config_t full   = { .temperature = 1.0f, .top_p = 1.0f };
```

### 7. Security Tests
```c
/* Weights buffer: OOB read if n_layers > preset.layers */
/* Verify xmind_weights_load() rejects layers > XMIND_MAX_LAYERS (28) */
assert(xmind_weights_validate(&bad_header) == XMIND_ERR_INVAL);

/* Tokenizer: max token ID must be < vocab_size (32000) */
assert(tokens[i] < ctx.config.vocab_size);
```

### 8. UI Tests
- XMIND has no UI; verify `xmind_generate()` returns in < 5s for 16 tokens on host

### 9. Fuzz Tests
```bash
# Fuzz xmind_weights_load with malformed GGUF headers
# Target: ai/xmind/src/weights_loader.c:xmind_weights_load_file()
# Harness: tests/fuzz/fuzz_gguf_loader.c
# Seed corpus: valid GGUF header bytes (magic=0x46554747, version=1-3)
clang-18 -target x86_64-unknown-none-elf -ffreestanding \
  -fsanitize=address,fuzzer \
  tests/fuzz/fuzz_gguf_loader.c ai/xmind/src/weights_loader.c \
  -Iai/xmind/include -Ipal/include -o fuzz_gguf
./fuzz_gguf -max_len=65536 -runs=100000 tests/fuzz/corpus/gguf/
```

### 10. Reliability Tests
```c
/* xmind_free() after partial init must not crash */
xmind_ctx_t ctx = {0};
xmind_init(&ctx, &xmind_llama32_3b_preset, NULL);
/* Simulate OOM mid-init */
ctx.kv_cache = NULL; /* force NULL kv_cache */
xmind_free(&ctx);    /* must not dereference NULL */
```

## GGUF Loader Validation

```c
/* Validate GGUF header before loading */
/* magic: 0x46554747 ('FGGG' reversed = 'GGUF') */
/* version: 1, 2, or 3 */
/* n_tensors: > 0 and < 10000 */
/* n_kv: metadata key-value count */
assert(header.magic   == 0x46554747u);
assert(header.version >= 1 && header.version <= 3);
```

Reference: GGUF spec — `github.com/ggerganov/ggml/blob/master/docs/gguf.md`

## Files to Test

```
ai/xmind/src/tensor.c
ai/xmind/src/quantize.c        ← Q4_0 math correctness
ai/xmind/src/transformer.c     ← GQA, SwiGLU, RMSNorm
ai/xmind/src/sampler.c         ← xorshift64, top-p
ai/xmind/src/tokenizer.c       ← BPE round-trips
ai/xmind/src/weights_loader.c  ← GGUF parse safety
tests/test_sprint6.c           ← canonical test file (42 assertions)
```
