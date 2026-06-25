---
name: elson security scan
description: "Security Scan — Elson TB2 — Run a security scan — CVE checks, SAST analysis, secrets detection, and dependency audit. Use when the user asks for a security scan, CVE check, vulnerability s"
source: platform/sdlc/13_skills/active/SKILL_ELSON_SECURITY_SCAN_001.yaml
canonical_id: SKILL_ELSON_SECURITY_SCAN_001
generated: 2026-05-27
runtime: codex
---

> **Runtime projection of `SKILL_ELSON_SECURITY_SCAN_001`.** Edit the canonical, not this file.
> Source of truth: `platform/sdlc/13_skills/active/SKILL_ELSON_SECURITY_SCAN_001.playbook.md`

# Security Scan — Elson TB2 Playbook

## Purpose
Run a security scan — CVE checks, SAST analysis, secrets detection, and dependency audit. Use when the user asks for a security scan, CVE check, vulnerability scan, or security review.

## Imported Source
- Collection: `elson_claude_skills_2026-05-17`
- Selected raw source: `16_knowledge/external_collateral/elson_claude_skills_2026-05-17/raw/trading_bot_elson_tb2/security-scan/SKILL.md`
- Raw SHA-256: `e854248dcdf54d5a47e19cd8087f5984866b1d4e633f61af943dec7eb344b53f`
- Source model hint: `claude-opus-4-6`

## Activation Rule
Use this skill only when the request is in the Elson / trading bot / portfolio automation domain and matches `security-scan`, `security scan`, or the source skill title.

## Operating Contract
- Read the preserved raw `SKILL.md` before issuing Elson-specific commands, deployment steps, production diagnostics, model actions, or trading-bot recommendations.
- Treat raw commands as source guidance, not automatic authorization to run production operations.
- Do not repeat preserved secrets or credentials in responses.
- Require current evidence before claiming bot status, Cloud Run health, vLLM state, migration state, or deployment outcome.

## Required Output Shape
- Objective and active Elson context.
- Applicable source skill rules or command family.
- Action sequence or analysis steps.
- Validation gates and evidence requirements.
- Risk, blocker, or escalation condition.
