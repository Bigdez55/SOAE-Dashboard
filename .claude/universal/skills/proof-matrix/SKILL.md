---
name: proof-matrix
description: Proof Matrix Build — SKILL_PROOF_MATRIX_001
source: platform/sdlc/13_skills/active/SKILL_PROOF_MATRIX_001.yaml
canonical_id: SKILL_PROOF_MATRIX_001
generated: 2026-05-27
runtime: codex
---

> **Runtime projection of `SKILL_PROOF_MATRIX_001`.** Edit the canonical, not this file.
> Source of truth: `platform/sdlc/13_skills/active/SKILL_PROOF_MATRIX_001.playbook.md`

# Playbook: Proof Matrix Build

## Skill ID
SKILL_PROOF_MATRIX_001

## Purpose
Walk specs/ADRs/diagrams/tests/evidence/releases and emit traceable proof rows.

## Inputs
- specs
- tests
- evidence
- releases

## Steps
1. Load inputs.
2. Validate against [26_schemas/skill/skill.schema.json](../../26_schemas/skill/skill.schema.json).
3. Execute the operation described in `purpose`.
4. Emit outputs.
5. Record `improvement_history` entry on any change.

## Outputs
- proof_matrix.generated.yaml

## Failure modes
- orphan spec without test
- orphan release without evidence

## Validation
See [08_verification/skill_tests/TEST_SKILL_PROOF_MATRIX_001_001.yaml](../../08_verification/skill_tests/TEST_SKILL_PROOF_MATRIX_001_001.yaml).
