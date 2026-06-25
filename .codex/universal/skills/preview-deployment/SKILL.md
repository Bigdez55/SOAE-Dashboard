---
name: preview-deployment
description: Preview Deployment — SKILL_PREVIEW_DEPLOYMENT_001
source: platform/sdlc/13_skills/active/SKILL_PREVIEW_DEPLOYMENT_001.yaml
canonical_id: SKILL_PREVIEW_DEPLOYMENT_001
generated: 2026-05-27
runtime: codex
---

> **Runtime projection of `SKILL_PREVIEW_DEPLOYMENT_001`.** Edit the canonical, not this file.
> Source of truth: `platform/sdlc/13_skills/active/SKILL_PREVIEW_DEPLOYMENT_001.playbook.md`

# Playbook: Preview Deployment

## Skill ID
SKILL_PREVIEW_DEPLOYMENT_001

## Purpose
Author a preview deployment plan and emit evidence on success.

## Inputs
- target
- build steps
- rollback

## Steps
1. Load inputs.
2. Validate against [26_schemas/skill/skill.schema.json](../../26_schemas/skill/skill.schema.json).
3. Execute the operation described in `purpose`.
4. Emit outputs.
5. Record `improvement_history` entry on any change.

## Outputs
- preview plan
- preview evidence packet

## Failure modes
- secret leakage
- build env mismatch

## Validation
See [08_verification/skill_tests/TEST_SKILL_PREVIEW_DEPLOYMENT_001_001.yaml](../../08_verification/skill_tests/TEST_SKILL_PREVIEW_DEPLOYMENT_001_001.yaml).
