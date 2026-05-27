# GEN.OS HW Driver Verify — HP EliteBook x360 Driver Verification

Verify hardware driver correctness for the HP EliteBook x360 target (Sprint 7-9 drivers).

## Target Hardware

| Component | PCI ID | Driver File |
|-----------|--------|-------------|
| Intel UHD 620 iGPU | 0x8086:0x3EA0 | `kernel/xenos/drv/intel_igpu.c` |
| Intel xHCI USB 3.x | 0x8086:0x9D2F | (PAL USB stubs) |
| Intel AX201 WiFi 6 | 0x8086:0x02F0 | (XNET netif layer) |
| NVMe SSD | 0x8086:class 0x010802 | `kernel/xenos/drv/nvme.c` |
| HPET timer | ACPI HPET table | `kernel/xenos/drv/hpet.c` |
| xAPIC | MSR 0x1B | `kernel/xenos/drv/lapic.c` |
| PCI config | I/O 0xCF8/0xCFC | `kernel/xenos/drv/pci.c` |
| HP WMI BIOS | AML `\_SB_.WMID` | `kernel/xenos/drv/xacpi.c` |

## XPCI Driver Verification (Sprint 9)

```c
/* Config Mechanism #1 — verify address construction */
/* addr = (1<<31) | (bus<<16) | (dev<<11) | (fn<<8) | (reg & 0xFC) */
uint32_t addr = (1u << 31) | (0u << 16) | (2u << 11) | (0u << 8) | 0x00;
outl(0xCF8, addr);
uint32_t id = inl(0xCFC);
/* Expected for HP EliteBook UHD 620: id = 0x3EA08086 */
assert(id == 0x3EA08086u || id == 0xFFFFFFFFu /*slot empty*/);
```

Reference: OSDev PCI wiki — `wiki.osdev.org/PCI` (Config Mechanism #1)

## HPET Driver Verification (Sprint 9)

```c
/* HPET base: ACPI HPET table at phys → HHDM (0xFFFF888000000000 + phys) */
/* GCV (General Capabilities and ID register): offset 0x000 */
/* GCFG (General Configuration): offset 0x010 — bit 0 = ENABLE_CNF */
/* Counter: offset 0x0F0 */

uint64_t gcap = xhpet_read64(ctx, XHPET_REG_GCAP);
uint32_t period_fs = (uint32_t)(gcap >> 32); /* femtoseconds per tick */
/* HP EliteBook: period_fs typically 69841279 (14.318 MHz) */
assert(period_fs > 0 && period_fs < 100000000u); /* sanity: 10 MHz - 1 GHz */

/* Verify counter advances */
uint64_t t0 = xhpet_read64(ctx, XHPET_REG_COUNTER);
xhpet_udelay(ctx, 1000); /* 1ms busy-spin */
uint64_t t1 = xhpet_read64(ctx, XHPET_REG_COUNTER);
assert(t1 > t0); /* counter must advance */
```

Reference: IA-PC HPET Specification v1.0a; OSDev `wiki.osdev.org/HPET`

## xAPIC Driver Verification (Sprint 9)

```c
/* Read LAPIC base from IA32_APIC_BASE MSR (0x1B) */
/* Bits 12-35: APIC base physical address (usually 0xFEE00000) */
uint64_t msr_val;
__asm__ volatile("rdmsr" : "=A"(msr_val) : "c"(0x1Bu));
uint64_t apic_base_phys = msr_val & 0xFFFFFFFFF000ULL;
assert(apic_base_phys == 0xFEE00000u); /* standard IA-32 reset value */

/* LAPIC ID register: offset 0x20, bits 31:24 */
uint32_t lapic_id = xlapic_read(ctx, XLAPIC_REG_ID) >> 24;
/* BSP is always LAPIC ID 0 on single-core boot */
assert(lapic_id == 0u);

/* SIVR (Spurious Interrupt Vector Register): bit 8 = software enable */
uint32_t sivr = xlapic_read(ctx, XLAPIC_REG_SVR);
assert(sivr & (1u << 8)); /* must be software-enabled after xlapic_init() */
assert((sivr & 0xFF) == 0xFF); /* spurious vector = 0xFF */
```

Reference: Intel SDM Vol 3A, Chapter 10 "Advanced Programmable Interrupt Controller";
OSDev `wiki.osdev.org/APIC`

## XACPI Driver Verification (Sprint 8)

```c
/* RSDP scan: physical addresses 0x000E0000-0x000FFFFF (EBDA) */
/* Signature: "RSD PTR " (8 bytes), revision >= 2 for XSDT */
xacpi_ctx_t acpi;
xsec_status_t s = xacpi_init(&acpi);
assert(s == XACPI_OK);
assert(acpi.rsdp != NULL);
assert(acpi.rsdp->revision >= 2); /* ACPI 2.0+ required for XSDT */

/* FADT: verify S5 sleep type present */
assert(acpi.fadt.pm1a_cnt_blk != 0);
/* S5 = "\_S5_" object in AML namespace */
/* xacpi_sleep(XACPI_SLEEP_S5) must write SLP_TYP to PM1a_CNT */
```

Reference: ACPI Specification 6.5, §5.2; OSDev `wiki.osdev.org/ACPI`

## HP WMI BIOS Verification

```c
/* HP WMI: AML method \_SB_.WMID.GBSG (Get BIOS Setting) */
/* HP EliteBook BIOS features accessible via WMI: */
/*   - Thermal policy (Balanced/Performance/Cool) */
/*   - Fast charge enable */
/*   - Wake on LAN */
uint32_t thermal_policy;
xacpi_status_t s = xacpi_hp_wmi_get(&acpi, HP_WMI_THERMAL_POLICY,
                                      &thermal_policy);
assert(s == XACPI_OK);
assert(thermal_policy <= 2u); /* 0=Balanced, 1=Performance, 2=Cool */
```

Reference: HP WMI documentation (HP BIOS Interface Specification v4.06);
Linux kernel `drivers/platform/x86/hp-wmi.c` (reference only — XENOS uses original impl)

## NVMe Driver Verification (Sprint 1)

```c
/* NVMe identify controller — Admin SQ/CQ doorbell at BAR0 offset 0x1000 */
/* CAP (Controller Capabilities): offset 0x00 */
/* VS (Version): offset 0x08 — expected 0x00010400 (NVMe 1.4) */
uint32_t vs = nvme_read32(ctx, NVME_REG_VS);
assert((vs >> 16) == 1u); /* major version 1 */

/* Identify Namespace (CNS=0): LBA format 0 should be 512B or 4096B sectors */
uint32_t lba_format = ns_data.lbaf[0].ds; /* 9=512B, 12=4096B */
assert(lba_format == 9u || lba_format == 12u);
```

Reference: NVMe Base Specification 1.4c, §3.1; OSDev `wiki.osdev.org/NVMe`

## Verification Checklist

```
[ ] xpci_find_device(0x8086, 0x3EA0) returns valid pci_device_t
[ ] xhpet_init() succeeds; counter advances in xhpet_udelay(1000)
[ ] xlapic_init() sets SIVR bit 8; LAPIC ID == 0 on BSP
[ ] xacpi_init() finds RSDP; XSDT valid; FADT present
[ ] nvme_init() reports NVMe 1.x; LBA format 512B or 4096B
[ ] xpci_enable_bus_master() sets PCI CMD bit 2 for each device
[ ] No MMIO reads/writes to unmapped regions (verify HHDM bounds)
```

## Common Failure Modes

| Driver | Failure | Root Cause | Fix |
|--------|---------|-----------|-----|
| XPCI | `0xFFFFFFFF` vendor ID | Slot not present | Check bus:dev:fn via `xpci_enumerate_bus()` |
| XHPET | Counter stuck at 0 | ENABLE_CNF not set in GCFG | `xhpet_write64(GCFG, 1)` before reading counter |
| xAPIC | Spurious IRQs flood | SVR not programmed | Ensure `xlapic_init()` called before `sti` |
| XACPI | NULL fadt.pm1a_cnt | DSDT parse failed | Enable `XACPI_DEBUG_AML` to trace AML eval |
| NVMe | Admin queue stuck | Doorbell stride miscalculated | Use `CAP.DSTRD` field: stride = 4 << DSTRD |
