---
name: elson market pulse
description: "Market Pulse — Event Impact Analysis — Analyze a market event and its portfolio impact — macro events, earnings, Fed decisions, geopolitical news. Use when the user asks what does X mean for my posit"
source: platform/sdlc/13_skills/active/SKILL_ELSON_MARKET_PULSE_001.yaml
canonical_id: SKILL_ELSON_MARKET_PULSE_001
generated: 2026-05-27
runtime: codex
---

> **Runtime projection of `SKILL_ELSON_MARKET_PULSE_001`.** Edit the canonical, not this file.
> Source of truth: `platform/sdlc/13_skills/active/SKILL_ELSON_MARKET_PULSE_001.playbook.md`

# Market Pulse — Event Impact Analysis Playbook

## Purpose
Analyze a market event and its portfolio impact — macro events, earnings, Fed decisions, geopolitical news. Use when the user asks what does X mean for my positions, market analysis, or how does this event affect us.

## Imported Source
- Collection: `elson_claude_skills_2026-05-17`
- Selected raw source: `16_knowledge/external_collateral/elson_claude_skills_2026-05-17/raw/trading_bot_elson_tb2/market-pulse/SKILL.md`
- Raw SHA-256: `0951e265ef7fc821d80f2581e59f0c34eaf15f2028eaca2d4bdc3bc3728da08c`
- Source model hint: `claude-opus-4-6`

## Activation Rule
Use this skill only when the request is in the Elson / trading bot / portfolio automation domain and matches `market-pulse`, `market pulse`, or the source skill title.

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
