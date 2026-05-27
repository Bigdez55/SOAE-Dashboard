# GEN.OS New Kernel Module — XENOS Freestanding C Template

Creates a production-ready freestanding C kernel module following the
exact patterns of `kernel/xenos/core/main.c`.

## Step 1 — Decide Location

| Module type        | Directory                    | Include path              |
|--------------------|------------------------------|---------------------------|
| Core (boot/init)   | `kernel/xenos/core/`         | `-Ikernel/xenos/include`  |
| Memory management  | `kernel/xenos/mm/`           | `-Ikernel/xenos/include`  |
| Device driver      | `kernel/xenos/drv/`          | `-Ikernel/xenos/include`  |
| Capability/XKABI   | `kernel/xenos/cap/`          | `-Ikernel/xenos/include`  |
| Scheduler          | `kernel/xenos/sched/`        | `-Ikernel/xenos/include`  |
| PAL extension      | `pal/src/`                   | `-Ipal/include`           |
| GENSD service      | `init/gensd/`                | `-Ipal/include`           |
| AetherBoot         | `aetherboot/src/`            | `-Iaetherboot/include`    |

## Step 2 — Header File Template

File: `kernel/xenos/include/[MODULE].h`

```c
/*
 * kernel/xenos/include/[MODULE].h — [One-line description]
 *
 * Copyright (c) 2026 GEN.OS Project. All rights reserved.
 * SPDX-License-Identifier: LicenseRef-Proprietary
 *
 * Task: S[N]-[COMPONENT]-[ID]
 *
 * PURPOSE:
 *   [2–4 sentences: what this module provides, which kernel init step
 *    initialises it, what callers depend on it.]
 *
 * FREESTANDING CONTRACT:
 *   No libc. No Linux headers. Types from xenos.h / pal.h only.
 *   No heap allocation — use static pools or caller-provided buffers.
 */

#ifndef GENOS_[MODULE]_H
#define GENOS_[MODULE]_H

#ifndef PAL_FREESTANDING
#define PAL_FREESTANDING
#endif
#include "../include/xenos.h"
#include "../../../pal/include/pal.h"

/* ===== Public API ===== */

/*
 * [module]_init -- initialise [MODULE] subsystem.
 *
 * Call once from kmain() at step N.
 * Returns 0 on success, -1 on fatal error.
 */
int [module]_init(void);

/*
 * [module]_[operation] -- [brief imperative description].
 *
 * @param [param]  [description]
 *
 * Returns: [description]
 * Thread safety: [UI thread only / spinlock protected / lock-free / ring-0 only]
 */
int [module]_[operation]([type] [param]);

#endif /* GENOS_[MODULE]_H */
```

## Step 3 — Source File Template

File: `kernel/xenos/[dir]/[module].c`

```c
/*
 * kernel/xenos/[dir]/[module].c — [One-line description]
 *
 * Copyright (c) 2026 GEN.OS Project. All rights reserved.
 * SPDX-License-Identifier: LicenseRef-Proprietary
 *
 * Task: S[N]-[COMPONENT]-[ID]
 *
 * PURPOSE:
 *   [2–4 sentences explaining what this module does and why.]
 *
 * COMPILE:
 *   clang -target x86_64-unknown-none-elf -ffreestanding -fno-stack-protector \
 *         -fno-pie -mno-red-zone -mno-mmx -mno-sse -mno-sse2 \
 *         -Wall -Wextra -Werror -O2 -std=c11 -fsyntax-only \
 *         -Ipal/include -Ikernel/xenos/include -D__x86_64__ \
 *         kernel/xenos/[dir]/[module].c
 *
 * FREESTANDING CONTRACT:
 *   No libc. No Linux headers. PAL API only. Static pools only.
 */

#define PAL_FREESTANDING
#include "../include/xenos.h"
#include "../../../pal/include/pal.h"
#include "../include/[module].h"

/* ===================================================================
 * CONSTANTS
 * =================================================================== */

#define [MODULE]_POOL_SIZE  64U    /* Tuned for HP EliteBook x360 RAM budget */

/* ===================================================================
 * STATIC STATE
 * =================================================================== */

static pal_spinlock_t g_[module]_lock;
static int            g_[module]_initialized = 0;

/* ===================================================================
 * §0  INTERNAL HELPERS
 * =================================================================== */

static void [module]_reset_state(void)
{
    /* Zero all module state — called from [module]_init() only */
    g_[module]_lock = (pal_spinlock_t)PAL_SPINLOCK_INIT;
}

/* ===================================================================
 * §1  PUBLIC API
 * =================================================================== */

int [module]_init(void)
{
    if (g_[module]_initialized) {
        return 0;  /* Idempotent */
    }
    [module]_reset_state();
    pal_console_printf("[module]: initialized\n");
    g_[module]_initialized = 1;
    return 0;
}

int [module]_[operation]([type] [param])
{
    if (!g_[module]_initialized) {
        return -1;
    }
    pal_spin_lock(&g_[module]_lock);
    /* TODO: implement */
    pal_spin_unlock(&g_[module]_lock);
    return 0;
}
```

## Step 4 — Register in CI

Add the new file to `.github/workflows/xenos.yml` under the cppcheck and compile-check steps.

## Step 5 — Verify

```bash
clang -target x86_64-unknown-none-elf -ffreestanding -fno-stack-protector \
      -fno-pie -mno-red-zone -mno-mmx -mno-sse -mno-sse2 \
      -Wall -Wextra -Werror -O2 -std=c11 -fsyntax-only \
      -Ipal/include -Ikernel/xenos/include -D__x86_64__ \
      kernel/xenos/[dir]/[module].c
echo "Exit: $? (must be 0)"
```

## Constraints Checklist

- [ ] `#define PAL_FREESTANDING` before any include
- [ ] No `malloc`, `free`, `calloc`, `realloc`
- [ ] No `<stdio.h>`, `<stdlib.h>`, `<string.h>`, or any libc header
- [ ] All output via `pal_console_printf()` only
- [ ] All locking via `pal_spin_lock()` / `pal_spin_unlock()`
- [ ] Static pool with fixed upper bound (document RAM cost)
- [ ] `_initialized` guard for idempotent init
- [ ] Copyright + SPDX + Task ID + COMPILE comment in header
- [ ] Function added to public header with docstring
- [ ] File added to xenos.yml CI compile list
