---
name: deploy
description: "Iron Gate Deployment Protocol — Full Iron Gate deployment to GCP Cloud Run. Use when the user asks to deploy, ship, push to production, or release to elsontrade.com."
source: platform/sdlc/13_skills/active/SKILL_ELSON_DEPLOY_001.yaml
canonical_id: SKILL_ELSON_DEPLOY_001
generated: 2026-05-27
runtime: codex
---

> **Runtime projection of `SKILL_ELSON_DEPLOY_001`.** Edit the canonical, not this file.
> Source of truth: `platform/sdlc/13_skills/active/SKILL_ELSON_DEPLOY_001.playbook.md`

# Iron Gate Deployment Protocol Playbook

## Purpose
Full Iron Gate deployment to GCP Cloud Run. Use when the user asks to deploy, ship, push to production, or release to elsontrade.com.

## Imported Source
- Collection: `elson_claude_skills_2026-05-17`
- Selected raw source: `16_knowledge/external_collateral/elson_claude_skills_2026-05-17/raw/trading_bot_elson_tb2/deploy/SKILL.md`
- Raw SHA-256: `6a4cb78a9f51cc943cce6bbd66a1a9105cb0f19e30c5b6cfa8b1b76e63ec07f5`
- Source model hint: `claude-sonnet-4-6`

## Activation Rule
Use this skill only when the request is in the Elson / trading bot / portfolio automation domain and matches `deploy`, `deploy`, or the source skill title.

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
