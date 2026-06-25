#!/usr/bin/env python3
"""Test-time instruction encoding oracle for emitted machine-code constants.

This script is a bootstrap test helper only. It must never be invoked from the
SUPER C / seedc / scc emit path and must not ship in runtime artifacts.
"""

from __future__ import annotations

import argparse
import re
import shutil
import subprocess


ARM64_TRIPLE = "arm64-apple-macos"


def oracle_encode(asm: str, triple: str = ARM64_TRIPLE) -> int:
    """Return little-endian 32-bit instruction word for one AArch64 instr."""
    if shutil.which("llvm-mc") is None:
        raise RuntimeError(
            "llvm-mc not found. STOP: no oracle is available, so no "
            "machine-code constant may land until llvm-mc/as/otool or a "
            "sovereign encoder/decoder oracle is available."
        )
    out = subprocess.run(
        ["llvm-mc", f"-triple={triple}", "--show-encoding"],
        input=asm + "\n",
        capture_output=True,
        text=True,
        check=True,
    ).stdout
    match = re.search(r"encoding:\s*\[([^\]]+)\]", out)
    if not match:
        raise RuntimeError(f"no encoding for `{asm}`:\n{out}")
    little_endian = bytes(int(part, 16) for part in match.group(1).split(","))
    return int.from_bytes(little_endian, "little")


def assert_constant(name: str, claimed: int, asm: str, triple: str = ARM64_TRIPLE) -> int:
    truth = oracle_encode(asm, triple)
    if claimed != truth:
        raise AssertionError(
            f"{name}: emit constant 0x{claimed:08X} ({claimed}) != "
            f"0x{truth:08X} ({truth}) for `{asm}`"
        )
    return truth


def main() -> None:
    parser = argparse.ArgumentParser(description="Encode one instruction with llvm-mc.")
    parser.add_argument("asm", help="Instruction text, e.g. 'ldr w1, [sp, #0]'")
    parser.add_argument("--triple", default=ARM64_TRIPLE)
    parser.add_argument("--name", default="CLAIMED_CONSTANT")
    parser.add_argument("--claimed", help="Optional claimed constant, decimal or 0x-prefixed.")
    args = parser.parse_args()

    try:
        truth = oracle_encode(args.asm, args.triple)
    except Exception as exc:
        raise SystemExit(str(exc)) from None
    print(f"asm: {args.asm}")
    print(f"word_hex: 0x{truth:08X}")
    print(f"word_decimal: {truth}")
    print(f"bytes_le: {truth.to_bytes(4, 'little').hex(' ')}")
    if args.claimed is not None:
        claimed = int(args.claimed, 0)
        assert_constant(args.name, claimed, args.asm, args.triple)
        print("claimed_matches: true")


if __name__ == "__main__":
    main()
