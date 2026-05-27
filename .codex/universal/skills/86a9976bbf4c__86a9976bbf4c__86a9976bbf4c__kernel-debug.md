# GEN.OS Kernel Debug Protocol — QEMU + GDB

Debug XENOS kernel panics, boot failures, and ISR faults.

## Prerequisites

```bash
# Install on Ubuntu (CI host or VM)
sudo apt-get install qemu-system-x86_64 gdb nasm gcc make

# macOS (for local use — cross-debugging)
brew install qemu x86_64-elf-gdb
```

## Step 1 — Build Debug Kernel (with symbols)

```bash
# Debug build (NOT freestanding -fsyntax-only — needs full link)
# Run on Linux CI host:
make -f kernel/xenos/Makefile debug
# Produces: build/xenos/xenos.elf (with DWARF symbols, no strip)
```

## Step 2 — Launch QEMU with GDB Stub

```bash
qemu-system-x86_64 \
  -kernel build/xenos/xenos.elf \
  -m 512M \
  -serial stdio \
  -no-reboot \
  -no-shutdown \
  -s \
  -S
# -s: GDB server on tcp::1234
# -S: Pause at startup (wait for GDB connect)
```

## Step 3 — Connect GDB

```bash
# In a second terminal:
gdb build/xenos/xenos.elf

# Inside GDB:
(gdb) target remote :1234
(gdb) break kmain              # Break at kernel C entry
(gdb) break xenos_isr_dispatch # Break on any exception/IRQ
(gdb) continue
```

## Common Debug Scenarios

### Triple Fault (machine resets immediately)
```bash
# Enable restart logging
qemu-system-x86_64 [...] -d cpu_reset
# Common causes:
# - GDT base address wrong -> check _gdt64 alignment in entry.asm
# - TSS not loaded -> gdt_reload() called before TSS init?
# - Stack not 16-byte aligned at _xenos_start
```

### Page Fault (vector 14)
```gdb
(gdb) break xenos_isr_dispatch
(gdb) condition 1 frame->vector == 14
(gdb) commands 1
  print/x frame->error_code
  # Bit 0=1 protection, 0=not present
  # Bit 1=1 write, 0=read
  # Bit 2=1 user, 0=supervisor
  x/5i frame->rip
  print/x frame->cr2  # Faulting virtual address
  continue
end
```

### ISR Stub Debug (check IDT wiring)
```gdb
# Verify IDT entry 14 (page fault) is wired correctly
(gdb) x/2xg _idt256 + (14 * 16)
# High word bits[47:44] = 0xE (interrupt gate 64-bit)
# Low bits[15:0] = offset[15:0] of ISR stub 14
```

### Serial Output Debugging (pre-GDB)
```c
/* In kernel C (before IDT/PAL init): use serial_early_puts() */
serial_early_puts("kmain: step N reached\n");
/* serial_early_puts() in main.c uses COM1 port 0x3F8 directly */
```

## QEMU Monitor (Ctrl-A C)

```
(qemu) info registers    # Dump all CPU registers
(qemu) info mem          # Page table walk
(qemu) xp /10gx [phys]  # Physical memory hex dump
(qemu) log int           # Log all interrupts to stderr
```

## Debug Checklist

- [ ] Triple fault -> check GDT/TSS alignment first
- [ ] Page fault -> read CR2 + error code bits
- [ ] General protection fault (vec 13) -> misaligned stack or bad segment
- [ ] Serial shows nothing -> check COM1 init in serial_early_puts (port 0x3F8)
- [ ] Kernel hangs -> check if kmain() hit infinite idle loop or spinlock deadlock
- [ ] APIC issues -> confirm APIC base at 0xFEE00000 (xAPIC mode)
