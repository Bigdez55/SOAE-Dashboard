# Freestanding C Kernel Development — 57 Core Skills

Build a bare-metal x86-64 kernel with zero libc dependency.

## Foundational Skills

### SK-001: PAL_FREESTANDING Guard
Every kernel .c file begins with `#ifndef PAL_FREESTANDING` / `#define PAL_FREESTANDING` / `#endif`. Prevents libc headers from leaking through PAL.
- **File:** Every kernel source file, enforced by CI banned-include scan

### SK-002: Compiler Built-in Types for LP64 ABI
Use `__UINT64_TYPE__` / `__INT64_TYPE__` instead of `unsigned long long` for PCH compatibility. Clang LP64 uses `unsigned long` for uint64_t — mismatch breaks PCH.
- **File:** `pal/include/pal.h`, `kernel/xenos/include/xenos.h`

### SK-003: _Static_assert for Struct Layout
`_Static_assert(sizeof(page_frame_t) <= 64, "...")` — zero runtime cost, catches struct drift at compile time.
- **File:** `pmm.c:94`, `heap.c:97`, `nvme.c:169`

### SK-004: Self-Hosted Stack Canary via RDRAND
`rdrand %0; setc %b1` replaces `__stack_chk_guard` with hardware entropy (~150 cycles, one-time at boot). TSC fallback if RDRAND unavailable.
- **File:** `main.c:3544-3557`

### SK-005: Local memset/memcpy per TU
Each translation unit has its own `xa_memset()`, `vtd_memset()`, etc. Self-contained drivers with zero cross-TU dependency.
- **File:** `xacpi.c:61`, `iommu_vtd.c:41`, `tpm2_tis.c:72`

### SK-006: Opaque Handle System (64-bit PAL Handles)
Every PAL resource is a 64-bit `pal_handle_t`. Typed, non-forgeable, process-local. Double-close returns PAL_OK (idempotent).
- **File:** `pal/include/pal.h`

### SK-007: Freestanding Hex Formatting
`_hex_chars[(val >> (i*4)) & 0xF]` — no sprintf/snprintf. Panic handler needs hex output without libc.
- **File:** `panic.c:106-119`

### SK-008: Freestanding Atomics
`__sync_lock_test_and_set`, `__sync_val_compare_and_swap` — GCC/Clang built-in atomics, no `<stdatomic.h>`.
- **File:** `oom.c:241`, `panic.c:55`

## Boot Sequence Skills

### SK-009: 14-Step Kernel Init with RDTSC Telemetry
`_rdtsc()` before/after each of 14 init steps. Store in `g_boot_step_cycles[]`. Cycle-accurate boot profiling.
- **Steps:** BSS→PML4→IDT→GDT→PMM→NXE→CR4→VMM→heap→PAL→vDRAM→SYSCALL→APIC→GENSD
- **File:** `main.c:3481-3612`

### SK-010: Progressive Serial Signals ('X', 'S', 'K')
Three raw bytes via `_outb(0x3F8, byte)`: 'X' (entry.asm reached), 'S' (stack OK), 'K' (kmain entered). When everything is dead, serial is the only output.
- **File:** `main.c:3501-3507`

### SK-011: Boot Info Handoff Struct
`xenos_boot_info_t` in RDI. Magic `0x4145544845523031` ("AETHER01"). Append-only with `_reserved` padding. All pointers are physical addresses. `_Static_assert` on size.
- **File:** `xenos.h:110-160`

### SK-012: EFER.NXE Before First CR3
Enable NXE at step 4.5 (before VMM), not step 9. Closes 4-step window of no NX enforcement.
- **File:** `main.c:3635-3651`

### SK-013: CR4 Hardening (SMEP/SMAP/UMIP/OSXSAVE/OSFXSR)
CPUID-gated. SMEP prevents kernel executing user pages. SMAP blocks kernel user-data access. UMIP hides SGDT/SIDT from userspace.
- **File:** `main.c:3653-3677`

### SK-014: Spectre Mitigations (IBRS/STIBP/SSBD)
IA32_SPEC_CTRL: IBRS restricts branch prediction, STIBP prevents cross-thread speculation, SSBD prevents store bypass.
- **File:** `main.c` (step 4.6)

## Linker Script Skills

### SK-015: VMA/LMA Split (Higher-Half Kernel)
VMA at `0xFFFFFFFF80000000` (-2GB), LMA at `0x100000` (1MB physical). `AT(KERN_LMA)` on first segment only — subsequent LMAs auto-tracked.
- **File:** `link.ld:107-131`

### SK-016: KEEP(*(.text.entry)) Entry Anchoring
Ensures `_xenos_start` is at byte 0 of .text. e_entry = KERNEL_BASE exactly.
- **File:** `link.ld:124-131`

### SK-017: Section Boundary Symbols
`__bss_start`, `__bss_end`, `__kernel_end` exported via `PROVIDE()`. Used by C code for BSS zeroing.
- **File:** `link.ld:239-243`

### SK-018: BSS Budget Assertion
`ASSERT(__bss_size < 512M, "BSS exceeds budget")` catches growth at link time, not boot time.
- **File:** `link.ld:247` (recommended)

### SK-019: /DISCARD/ Unwanted Sections
Strip .eh_frame, .comment, .gnu*, .note.GNU-stack, .multiboot2 — not needed in bare-metal ELF.
- **File:** `link.ld:214-223`

## Memory Management Skills

### SK-020: HHDM Direct Map
`HHDM_BASE = 0xFFFF888000000000` (PML4[273]). `PHYS_TO_HHDM(pa)` is a single add. Eliminates temporary mappings.
- **File:** `vmm.c:11`, `pmm.c:28`

### SK-021: O(1) Buddy Order via __builtin_ctzll
`__builtin_ctzll(addr) - PAGE_SHIFT` for alignment order. PMM init: 25ms → 0.1ms (250x speedup).
- **File:** `pmm.c:278-324`

### SK-022: 2MB Large Pages for HHDM
PTE_PS at PD level. 128GB HHDM = 65,536 entries vs 33.5M with 4KB. 512x TLB coverage improvement.
- **File:** `vmm.c:273-310`

### SK-023: PTE_GLOBAL for Kernel
Kernel pages carry GLOBAL flag, survive CR3 write. Avoids re-walking kernel PTEs on context switch.
- **File:** `vmm.c:307,352`

### SK-024: Demand-Zero BSS
`vmm_bss_demand_zero_init()` splits 2MB BSS pages into 4KB, clears PRESENT beyond 64KB. #PF handler allocates + zeros on first access. Must be AFTER IDT is functional.
- **File:** `main.c:3681`, `vmm.c`

### SK-025: Slab Allocator O(1) with Move-to-Front
Freelist embedded in free slots. Pop = dereference, Push = store. Partial slab brought to list head on allocation. 10 size classes (8B-4KB).
- **File:** `heap.c:156-329`

### SK-026: Zone-Aware Allocation (DMA32 + NORMAL)
DMA32 (0-4GB) for device buffers, NORMAL (>4GB) for general use. Fallback from NORMAL to DMA32.
- **File:** `pmm.c:64-68,353-368`

### SK-027: In-Page Metadata
`page_frame_t` stored in first 64 bytes of each free 4KB page. No separate metadata array.
- **File:** `pmm.c:87-95`

## Hardware Driver Skills

### SK-028: Volatile MMIO Pointer Pattern
`ctx->mmio[off >> 2u]` via `volatile uint32_t*`. Prevents compiler reordering/elimination of hardware reads.
- **File:** `lapic.c:78`, `hpet.c:43`, `iommu_vtd.c:55`, `tpm2_tis.c:86`

### SK-029: CPUID LAPIC Calibration (Zero-Wait)
CPUID leaf 0x15 gives crystal Hz directly. Saves 10ms vs busy-loop calibration. Whiskey Lake: 25MHz crystal.
- **File:** `lapic.c:226-289`

### SK-030: PCI Config Mechanism #1
Write address to 0xCF8, data at 0xCFC. Sub-dword via shift-and-mask. Multi-function bit 7 check.
- **File:** `pci.c:40-100, 155-195`

### SK-031: TPM TIS FIFO State Machine
COMMAND_READY → DATA_FIFO write → EXPECT poll → GO → DATA_AVAIL → read response. All loops bounded.
- **File:** `tpm2_tis.c:147-200`

### SK-032: Big-Endian Wire Serialization
Manual byte-by-byte shift/mask for TPM commands. No type-punning — correct on all architectures.
- **File:** `tpm2_tis.c:28-30`

### SK-033: NVMe CQ Phase Bit Detection
Phase bit in CQE toggles on head wrap. No doorbell read needed for completion check (~100ns saved per I/O).
- **File:** `nvme.c:183-194`

### SK-034: HP EC IBF/OBF Polling
Wait IBF=0 → send cmd → wait IBF=0 → send reg → wait OBF=1 → read data. HP EC at 0x62/0x66.
- **File:** `elitebook_x360.c:62-100`

### SK-035: Thermal Fan Curve + P-State Throttle
Linear ramp 50-70C. Above 85C: `wrmsr(IA32_PERF_CTL)` forces 800MHz.
- **File:** `elitebook_x360.c:149-200`

## Scheduler Skills

### SK-036: Naked Context Switch
`__attribute__((naked))` on `xenos_fiber_switch()`. Pure asm: push 6 regs, swap RSP, optional CR3, pop, ret. Kernel: ~50 cycles. Process: ~250 cycles.
- **File:** `main.c:412-479`

### SK-037: Lazy Preemption
LAPIC ISR sets `need_resched` flag. Context switch only at `preempt_enable()` boundaries. ~2 cycles overhead on fast path.
- **File:** `contra_rotation.c:166-186`

### SK-038: Contra-Rotating Thermal Scheduler
3-phase: COMPUTE (60-80C) → COOLDOWN → LOAD. Devices phase-shifted to eliminate idle time on 15W TDP laptop.
- **File:** `contra_rotation.c:1-148`

## Debugging Skills

### SK-039: Zero-Dependency Panic Handler
Duplicated serial I/O in panic.c. No heap, no locks. Static buffers only. CLI → GPR capture → RBP walk → NMI broadcast → HLT.
- **File:** `panic.c:1-200`

### SK-040: Reentrant Panic Guard
`volatile s_panic_reentrant` prevents infinite fault spiral (panic → #PF → panic → ...).
- **File:** `panic.c:55`

### SK-041: TSC-Based Watchdog
Store `s_last_pet_tsc` from RDTSC. Timer ISR checks elapsed ticks. Warning at 80%, panic at 100%. Lockless, interrupt-safe.
- **File:** `watchdog.c:1-197`

### SK-042: Compiler Barrier for Ring Buffers
`__asm__ volatile("" ::: "memory")` ensures store ordering without generating instructions.
- **File:** `ps2.c:111`, `vdram_pf.c:66`

### SK-043: Exception CR2 Capture
`mov %%cr2, %0` immediately on vector 14 (#PF). CR2 is only valid until the next page fault.
- **File:** `exception.c:54-58`

### SK-044: IST1 for Double Fault
Dedicated 4KB stack for #DF handler. Prevents triple fault when kernel stack overflows.
- **File:** `main.c:147-154`

## Integration Skills

### SK-045: Weak Stub Progressive Integration
`__attribute__((weak))` stubs in boot_stubs.c. Real implementations override at link time. System boots at every sprint.
- **File:** `boot_stubs.c` (73 stubs, 18 sections)

### SK-046: Boot-Kernel Size Tiering via -D
Makefile passes `-DXBLOB_INDEX_SLOTS=4096u -DTCP_TCB_MAX=16u` etc. Source uses `#ifndef` guards. Boot kernel fits in RAM; production uses full sizes.
- **File:** `Makefile:32-40`

### SK-047: #ifndef Guards for Makefile -D Compatibility
Every overridable `#define` wrapped in `#ifndef`. Prevents macro redefinition warnings when Makefile passes -D flags.
- **File:** `xblob.h:85`, `tcp.c:89`, `xmind.h:39`, `spreadsheet.c:45-46`

### SK-048: Single-TU Inclusion (#include .c)
`xshell.c` includes `orange_store.c`, `settings_init.c`, `settings_dispatch.c` directly. Used when static BSS must co-locate. Abandon when 3+ consumers need the same functions (extract to standalone .o + header).
- **File:** `xshell.c:29-38`

### SK-049: W^X Enforcement
If VM_WRITE and VM_EXEC both set, silently drop VM_EXEC. Hardware NX via EFER.NXE.
- **File:** `vmm.c:171-175`

## UEFI Bootloader Skills

### SK-050: UEFI Without EDK2
Pure UEFI spec implementation. `uefi_types.h` defines all EFI types from scratch. PE32+ linking via lld-link-18. Zero Tianocore dependency.
- **File:** `aetherboot/include/uefi_types.h`, `aetherboot/src/aetherboot.c`

### SK-051: EFI HandleProtocol Cast Pattern
`BS->HandleProtocol` is typed as `VOID*`. Must cast: `EFI_HANDLE_PROTOCOL_FN hp = (EFI_HANDLE_PROTOCOL_FN)(UINTN)BS->HandleProtocol`.
- **File:** `aetherboot.c:737, 1196`

### SK-052: FAT32 Superfloppy (No GPT)
OVMF treats superfloppy-style FAT32 as single filesystem volume. Avoids PartitionDxe failure on simple USB images.
- **File:** `boot-test.sh:115-134`

### SK-053: Dynamic Dev Fingerprint from Kernel SHA-256
`sha256sum xenos.elf | awk '{print $1}'` → C array initializer → compile into dev_fingerprint.o → link into BOOTX64.EFI.
- **File:** `boot-test.sh:92-102`

### SK-054: KASLR via RDRAND with Graceful Fallback
10-retry loop checking CF flag per Intel SDM. Fallback to slide=0. Clamp [0,64MB), align 2MB. Apply BEFORE loading ELF (Sprint 21 bug: was after).
- **File:** `aetherboot.c` (KASLR section)

### SK-055: kern_span Diagnostic Logging
Print actual span in MB before the safety check. Eliminates mystery boot failures.
- **File:** `aetherboot.c:855-878`

### SK-056: rep stosq Bulk Zeroing
8 bytes per iteration via microcode-optimized string op. 12 GB/s vs 1.5 GB/s byte loop. Saves ~2.5ms for 4MB span.
- **File:** `aetherboot.c:920-937`

### SK-057: BSS Profiling with llvm-nm
`llvm-nm --size-sort -r xenos.elf | head -40` — identifies top BSS contributors by size. The single most useful diagnostic for BSS bloat.
- **Command:** Run inside Docker container on built xenos.elf
