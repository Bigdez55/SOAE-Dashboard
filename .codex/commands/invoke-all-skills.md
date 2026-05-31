# Invoke All Skills Compatibility Command

Use this command when the user says:

- `invoke all skills`
- `use all skills`
- `run all skills`
- `activate all skills`
- `all skills now`
- `all skills and agents`

## Required Interpretation

Do not interpret this as "call every skill in Claude's registered Skill tool list."

Interpret it as:

```text
Apply the ATLAS universal skill coverage matrix and selected repository-native playbooks.
```

Also use:

- `13_skills/universal_surface/UNIVERSAL_SKILL_SURFACE.md`
- `13_skills/universal_surface/index.yaml`
- `13_skills/skill_refinery/cross_runtime_invoke_all_skills_contract.md`
- `AGENTS.md`

## Skill Surfaces

There are three surfaces:

| Surface | Correct handling |
| --- | --- |
| Claude registered Skill tool | Call only if relevant, safe, and non-destructive. |
| `13_skills/active/SKILL_*.yaml` + `.playbook.md` | Repository-native playbooks. Read and apply as repository-native disciplines. These are not necessarily callable through Claude's Skill tool. |
| `.claude`, `.codex`, `.gemini` imported assets | Treat as raw/normalized source evidence unless promoted or target-bound. |

## Required Workflow

1. Route the request with `25_automation/route_intent.py`.
2. Use `13_skills/universal_surface/UNIVERSAL_SKILL_SURFACE.md` as the shared Claude/Codex/Gemini surface.
3. Use `13_skills/skill_refinery/universal_skill_invocation_policy.md` as authority.
4. Apply the universal coverage matrix:
   - intake and trigger routing
   - context packet
   - truth-state check
   - planning and specs
   - architecture
   - build and implementation
   - data and retrieval
   - graph and knowledge
   - security and compliance
   - testing and proof
   - documentation and handoff
   - skill refinement
5. Read selected `SKILL_*.yaml` and `.playbook.md` files from `13_skills/active/`.
6. Suppress project-specific skills unless the target/domain explicitly binds them.
7. Do not run destructive/setup/background tools such as `init`, `schedule`, `loop`, or config writers unless explicitly requested.

## Required Response

Report:

- `tool_called_skills`
- `playbook_applied_disciplines`
- `activated_project_specific_skills`
- `suppressed_project_specific_skills`
- `validation_or_proof_gates`
- `misses_logged_or_none`

## Forbidden Response Pattern

Do not say "only the registered Skill tool list counts" or ask the user to manually name every `SKILL_*` playbook. That is a runtime limitation, not the ATLAS canon.
