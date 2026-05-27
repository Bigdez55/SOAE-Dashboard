#!/usr/bin/env python3
"""Copy a curated subset of Development_Skills into a child repo's `development_skills/` directory.

Design notes (issues surfaced 2026-05-04 by LMOS agent):
- `rsync -a` without --delete leaves stale paths after upstream renames (e.g. genesis → starter).
- `19_truth_state/current.truth.yaml` is upstream-identity, not template material; child repos
  must keep their own. We ship only the doctrinal truth-state files (source ranking + stale rules)
  and exclude `current.truth.yaml` so child-authored identity survives re-sync.
- Allowlist now ships only directories that are template/doctrine; identity files are excluded.
"""
import argparse, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

ALLOWLIST = [
    "13_skills",
    "14_templates",
    "19_truth_state",
    "24_prompt_library",
    "25_automation",
    "26_schemas",
    "37_command_protocol",
    "APEX_PROTOCOL.md",
    "README.md",
]

# Per-path excludes (rsync --exclude) — relative to the synced item's root.
PER_ITEM_EXCLUDES = {
    "19_truth_state": ["current.truth.yaml", "truth_state.registry.yaml"],
}

# Paths inside the child's `development_skills/` that the script should also delete on every
# sync, regardless of allowlist membership, so old top-level dirs from past upstream renames
# do not linger. Add new entries here whenever a top-level dir is renamed/removed upstream;
# remove entries once all known children have synced past the introduction of the entry.
LEGACY_PURGE: list[str] = []

def rsync(src: Path, dst: Path, excludes: list[str] | None = None) -> None:
    cmd = ["rsync", "-a", "--delete"]
    for e in excludes or []:
        cmd += ["--exclude", e]
    if src.is_dir():
        cmd += [str(src) + "/", str(dst) + "/"]
    else:
        cmd += [str(src), str(dst)]
    subprocess.check_call(cmd)

def purge_legacy(dev_skills_dir: Path) -> list[str]:
    removed = []
    for rel in LEGACY_PURGE:
        p = dev_skills_dir / rel
        if p.exists() or p.is_symlink():
            if p.is_dir():
                subprocess.check_call(["rm", "-rf", str(p)])
            else:
                p.unlink()
            removed.append(rel)
    return removed

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--target", required=True, help="absolute path to child repo")
    ap.add_argument("--no-purge", action="store_true", help="skip LEGACY_PURGE step")
    ap.add_argument(
        "--no-sync-claude-universal",
        action="store_true",
        help="skip syncing ROOT/.claude/universal -> child repo/.claude/universal",
    )
    ap.add_argument(
        "--no-sync-codex-universal",
        action="store_true",
        help="skip syncing ROOT/.codex/universal -> child repo/.codex/universal",
    )
    args = ap.parse_args()

    dst_root = Path(args.target) / "development_skills"
    dst_root.mkdir(parents=True, exist_ok=True)

    if not args.no_purge:
        removed = purge_legacy(dst_root)
        if removed:
            print(f"Purged {len(removed)} legacy paths: {removed}")

    for item in ALLOWLIST:
        src = ROOT / item
        if not src.exists():
            continue
        target = dst_root / item
        if src.is_dir():
            target.mkdir(parents=True, exist_ok=True)
        rsync(src, target, excludes=PER_ITEM_EXCLUDES.get(item))

    if not args.no_sync_claude_universal:
        claude_src = ROOT / ".claude" / "universal"
        if claude_src.exists():
            claude_dst = Path(args.target) / ".claude" / "universal"
            claude_dst.parent.mkdir(parents=True, exist_ok=True)
            rsync(claude_src, claude_dst)
            print(f"Synced .claude universal bundle into {claude_dst}")
        else:
            print("Skipped .claude universal sync (source missing)")

    if not args.no_sync_codex_universal:
        codex_src = ROOT / ".codex" / "universal"
        if codex_src.exists():
            codex_dst = Path(args.target) / ".codex" / "universal"
            codex_dst.parent.mkdir(parents=True, exist_ok=True)
            rsync(codex_src, codex_dst)
            print(f"Synced .codex universal bundle into {codex_dst}")
        else:
            print("Skipped .codex universal sync (source missing)")

    print(f"Synced {len(ALLOWLIST)} allowlist entries (with --delete) into {dst_root}")
    if "19_truth_state" in PER_ITEM_EXCLUDES:
        print(f"  Excluded from 19_truth_state/: {PER_ITEM_EXCLUDES['19_truth_state']}")

if __name__ == "__main__":
    main()
