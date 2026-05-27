# GEN.OS ISO Build Pipeline

Build phases 0-9. Run on Ubuntu build host (Linux required for debootstrap).
Reference: `GENOS_BUILD_EXECUTION_PLAN.md`, `build/` directory.

## Prerequisites

```bash
sudo apt-get install \
  debootstrap docker.io qemu-utils squashfs-tools \
  xorriso grub-efi-amd64-bin
```

## Gate: All CI Must Pass First

```bash
python platform/check_language_policy.py
make -f Makefile.rfc002 run-tests
pytest -q
```

## Phase 1 — Debian 12 Rootfs

```bash
sudo debootstrap --arch=amd64 bookworm build/rootfs \
  http://deb.debian.org/debian/

# Validate
sudo chroot build/rootfs /bin/bash -c \
  "uname -a && dpkg --version && echo 'rootfs OK'"
```

## Phase 2 — Kernel + Bootloader

```bash
# Copy AetherBoot EFI (or GRUB during transitional phase)
sudo mkdir -p build/rootfs/EFI/BOOT build/rootfs/boot

# AetherBoot (post Sprint 3 full link)
# sudo cp build/aetherboot/aetherboot.efi \
#         build/rootfs/EFI/BOOT/BOOTX64.EFI

# Transitional: use GRUB
sudo chroot build/rootfs apt-get install -y \
  --no-install-recommends grub-efi-amd64
```

## Phase 3 — GENSD + Services

```bash
sudo mkdir -p build/rootfs/sbin build/rootfs/etc/gensd/services \
              build/rootfs/opt/genos/services

# Copy GENSD binary (after Linux link build)
# sudo cp build/gensd/gensd build/rootfs/sbin/gensd

# Copy .gsd service descriptors
sudo cp init/gensd/services/*.gsd build/rootfs/etc/gensd/services/
```

## Phase 4 — XFRAME + Compositor (Transitional Electron)

```bash
# During Sprint 2 phase: Electron-based shell
sudo cp -r compositor/genos-shell/dist/ \
  build/rootfs/opt/genos/shell/ 2>/dev/null || \
  echo "WARN: shell not built — run: cd compositor/genos-shell && npm run build"
```

## Phase 5 — ISO Assembly

```bash
# Compress rootfs
sudo mksquashfs build/rootfs build/genos.squashfs \
  -comp xz -e build/rootfs/proc build/rootfs/sys build/rootfs/dev

# ISO directory
mkdir -p build/iso/{EFI/BOOT,boot/grub,live}
cp build/genos.squashfs build/iso/live/

# Grub config (transitional)
cat > build/iso/boot/grub/grub.cfg << 'EOF'
set timeout=3
menuentry "GEN.OS" {
  linux /boot/vmlinuz boot=live
  initrd /boot/initrd.img
}
EOF

# Build ISO
xorriso -as mkisofs -r -V "GEN.OS Sprint [N]" \
  -o build/genos-sprint-[N].iso \
  build/iso/
```

## Phase 6 — Verify

```bash
# Checksum
sha256sum build/genos-sprint-[N].iso > build/genos-sprint-[N].iso.sha256
cat build/genos-sprint-[N].iso.sha256

# QEMU smoke boot
qemu-system-x86_64 \
  -m 2048 -cdrom build/genos-sprint-[N].iso \
  -serial stdio -nographic -boot d \
  -enable-kvm 2>/dev/null || \
qemu-system-x86_64 \
  -m 2048 -cdrom build/genos-sprint-[N].iso \
  -serial stdio -nographic -boot d
# Expected: GENSD boot messages on serial
```

## ISO Build Checklist

- [ ] All CI gates pass
- [ ] `build/rootfs/` created via debootstrap
- [ ] `build/rootfs/etc/gensd/services/*.gsd` present
- [ ] `build/rootfs/EFI/BOOT/BOOTX64.EFI` present (or GRUB)
- [ ] `build/genos-sprint-[N].iso` created
- [ ] SHA-256 checksum saved
- [ ] QEMU boot test: GENSD messages on serial output
- [ ] ISO filename includes sprint: `genos-sprint-[N].iso`
