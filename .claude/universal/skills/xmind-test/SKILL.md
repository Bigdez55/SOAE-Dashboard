---
name: xmind-test
description: "GEN.OS XMIND Test — Inference Correctness Verification — Verify XMIND inference correctness: tensor math, Q4_0 dequantization, transformer forward pass, sampler output, and tokenizer round-trips. - After modifying `ai"
source: platform/sdlc/13_skills/active/SKILL_GENOS_XMIND_TEST_001.yaml
canonical_id: SKILL_GENOS_XMIND_TEST_001
generated: 2026-05-27
runtime: codex
---

> **Runtime projection of `SKILL_GENOS_XMIND_TEST_001`.** Edit the canonical, not this file.
> Source of truth: `platform/sdlc/13_skills/active/SKILL_GENOS_XMIND_TEST_001.playbook.md`

# GEN.OS XMIND Test — Inference Correctness Verification Playbook

## Purpose
Verify XMIND inference correctness: tensor math, Q4_0 dequantization, transformer forward pass, sampler output, and tokenizer round-trips. - After modifying `ai/xmind/src/` (transformer.c, quantize.c, sampler.c, tokenizer.c)

## Imported Source
- Raw source: `16_knowledge/external_collateral/genos_codex_skills_2026-05-17/raw/xmind-test.md`
- Source repo: `/Users/desmondearly/Library/CloudStorage/OneDrive-Personal/GENESYS/GENESYS`
- Raw SHA-256: `e96716d5ff9e9855de791a9b7c7fe057f53360ccefd732906733a6c3311c9b82`

## Activation Rule
Use this skill when the request is in the GEN.OS / GENESYS domain and matches `xmind-test`, `xmind test`, or the source skill title.

## Operating Contract
- Read the raw source file above for exact commands, gate definitions, templates, or checklists before executing domain-specific work.
- Preserve GEN.OS constraints around freestanding/system code, validation gates, sprint proof, and repository-specific command paths.
- Do not generalize these patterns into unrelated projects unless the user explicitly asks for cross-project adaptation.

## Required Output Shape
- Objective or gate being addressed.
- Source-backed procedure or checklist.
- Commands/files affected when applicable.
- Validation evidence required for closure.
- Blockers or assumptions.
