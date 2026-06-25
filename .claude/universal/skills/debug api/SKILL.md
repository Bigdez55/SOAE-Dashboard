---
name: debug api
description: "API Debugging Protocol — Debug a failing API endpoint — trace the request through auth, router, service, and database layers. Use when the user reports a 404, 500, 422, or unexpected AP"
source: platform/sdlc/13_skills/active/SKILL_ELSON_DEBUG_API_001.yaml
canonical_id: SKILL_ELSON_DEBUG_API_001
generated: 2026-05-27
runtime: codex
---

> **Runtime projection of `SKILL_ELSON_DEBUG_API_001`.** Edit the canonical, not this file.
> Source of truth: `platform/sdlc/13_skills/active/SKILL_ELSON_DEBUG_API_001.playbook.md`

# API Debugging Protocol Playbook

## Purpose
Debug a failing API endpoint — trace the request through auth, router, service, and database layers. Use when the user reports a 404, 500, 422, or unexpected API response, or says an endpoint is broken.

## Imported Source
- Collection: `elson_claude_skills_2026-05-17`
- Selected raw source: `16_knowledge/external_collateral/elson_claude_skills_2026-05-17/raw/trading_bot_elson_tb2/debug-api/SKILL.md`
- Raw SHA-256: `8d776a2e28e02614fb85c41355a21b6bf662e74e0ac3e1603a26fe65cfcddcd4`
- Source model hint: `claude-sonnet-4-6`

## Activation Rule
Use this skill only when the request is in the Elson / trading bot / portfolio automation domain and matches `debug-api`, `debug api`, or the source skill title.

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
