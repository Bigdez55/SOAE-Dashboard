# Development_Skills Agent Instructions

## Cross-Runtime Skill Invocation

When the user says `invoke all skills`, `use all skills`, `run all skills`, `activate all skills`, `all skills now`, or `all skills and agents`, apply the repository-native Development_Skills all-skills policy.

Required behavior:

- Route the phrase through `development_skills/infrastructure/scripts/route_intent.py`.
- Use `development_skills/13_skills/skill_refinery/universal_skill_invocation_policy.md` and `development_skills/13_skills/skill_refinery/cross_runtime_invoke_all_skills_contract.md` as authority.
- Distinguish runtime tool-callable skills from repository-native skill playbooks.
- Treat `development_skills/13_skills/active/SKILL_*.yaml` and matching `.playbook.md` files as applicable disciplines even if they are not registered in the runtime Skill tool list.
- Report `tool_called_skills` separately from `playbook_applied_disciplines`.
- Suppress project-specific skills unless an explicit target/domain binds them.
- Do not run destructive/setup/background/config-writing tools unless the user explicitly requested that exact action.

Forbidden behavior:

- Do not say only the runtime-registered Skill tool list counts.
- Do not ask the user to manually name every `SKILL_*` playbook.
- Do not activate imported `.claude`, `.codex`, or `.gemini` assets as universal law unless they are promoted or target-bound.

Validation gate:

```bash
python3 development_skills/infrastructure/scripts/validate_trigger_determinism.py
```
