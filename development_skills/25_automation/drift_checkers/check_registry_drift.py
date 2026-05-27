#!/usr/bin/env python3
import subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
sys.exit(subprocess.call(["python3", str(ROOT/"25_automation/registry_sync/sync_registries.py"), "--check"]))
