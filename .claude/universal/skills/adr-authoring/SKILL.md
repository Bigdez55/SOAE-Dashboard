---
name: adr-authoring
description: ADR Authoring — SKILL_ADR_AUTHORING_001
source: platform/sdlc/13_skills/active/SKILL_ADR_AUTHORING_001.yaml
canonical_id: SKILL_ADR_AUTHORING_001
generated: 2026-05-27
runtime: codex
---

> **Runtime projection of `SKILL_ADR_AUTHORING_001`.** Edit the canonical, not this file.
> Source of truth: `platform/sdlc/13_skills/active/SKILL_ADR_AUTHORING_001.playbook.md`

# Playbook: ADR Authoring

## Skill ID
SKILL_ADR_AUTHORING_001

## Purpose
Author ADRs from doctrinal decisions; update decision_ledger.

## Inputs
- decision context
- options
- tradeoffs

## Steps
1. Load inputs.
2. Validate against [26_schemas/skill/skill.schema.json](../../26_schemas/skill/skill.schema.json).
3. Execute the operation described in `purpose`.
4. Emit outputs.
5. Record `improvement_history` entry on any change.

## Outputs
- ADR-NNNN-*.md
- decision_ledger row

## Failure modes
- decision lacks rollback path
- no options considered

## Validation
See [08_verification/skill_tests/TEST_SKILL_ADR_AUTHORING_001_001.yaml](../../08_verification/skill_tests/TEST_SKILL_ADR_AUTHORING_001_001.yaml).
