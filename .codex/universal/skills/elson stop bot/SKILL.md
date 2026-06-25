---
name: elson stop bot
description: "Stop Autonomous Trading Bot — Stop the autonomous trading bot gracefully. Use when the user says stop the bot, pause trading, disable auto-trading, or halt the trading loop."
source: platform/sdlc/13_skills/active/SKILL_ELSON_STOP_BOT_001.yaml
canonical_id: SKILL_ELSON_STOP_BOT_001
generated: 2026-05-27
runtime: codex
---

> **Runtime projection of `SKILL_ELSON_STOP_BOT_001`.** Edit the canonical, not this file.
> Source of truth: `platform/sdlc/13_skills/active/SKILL_ELSON_STOP_BOT_001.playbook.md`

# Stop Autonomous Trading Bot Playbook

## Purpose
Stop the autonomous trading bot gracefully. Use when the user says stop the bot, pause trading, disable auto-trading, or halt the trading loop.

## Imported Source
- Collection: `elson_claude_skills_2026-05-17`
- Selected raw source: `16_knowledge/external_collateral/elson_claude_skills_2026-05-17/raw/trading_bot_elson_tb2/stop-bot/SKILL.md`
- Raw SHA-256: `2ef59201fdf18b6691458883aa67632505c2ab5235a7d5cb0323556803ba747d`
- Source model hint: `claude-sonnet-4-6`

## Activation Rule
Use this skill only when the request is in the Elson / trading bot / portfolio automation domain and matches `stop-bot`, `stop bot`, or the source skill title.

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
