# GEN.OS Documentation Sync Protocol

Run after every sprint or major feature. Prevents tribal knowledge loss.

## Step 1 — Agent Memory Updates

Each involved agent updates `.claude/agent-memory/[agent]/MEMORY.md`:

```
Required per sprint:
- Sprint N: COMPLETE / IN-PROGRESS
- Files created (path + one-line purpose)
- Key architectural decisions
- Stable patterns confirmed
- Technical debt deferred (+ target sprint)
- Blockers + resolutions
```

Keep MEMORY.md under 200 lines. Create topic files for details:
```
.claude/agent-memory/[agent]/sprint[N]-[topic].md
```
Link from MEMORY.md: `See: sprint[N]-[topic].md`

## Step 2 — Source File Headers

Every new `.c` / `.h` must have:

```c
/*
 * [path/filename] — [One-line description]
 *
 * Copyright (c) 2026 GEN.OS Project. All rights reserved.
 * SPDX-License-Identifier: LicenseRef-Proprietary
 *
 * Task: S[N]-[COMPONENT]-[ID]
 *
 * PURPOSE:
 *   [2-5 sentences: what, why, which sprint.]
 *
 * COMPILE:
 *   [Exact compile command]
 *
 * [For kernel/display/XFRAME]:
 * FREESTANDING CONTRACT:
 *   No libc. No Linux headers. PAL API only.
 */
```

Every public function in a header must have:
```c
/*
 * function_name -- [imperative description].
 *
 * @param p1  Description
 * Returns: [description, error conditions]
 * Thread safety: [ring-0 only / UI thread / spinlock / lock-free]
 */
```

## Step 3 — ADR Index

After each sprint, verify `docs/adr/README.md` lists all new ADRs:
```markdown
| [ADR-NNN](ADR-NNN-title.md) | Title | Accepted | Sprint N |
```

## Step 4 — Milestone Checklist

Update `GENOS_PROJECT_MILESTONE_CHECKLIST.md`:
- Mark completed items with `[x]`
- Add newly discovered items

## Step 5 — Sprint Synthesis Doc

```
File: .claude/agent-memory/master-orchestrator/sprint[N]-audit-synthesis.md

Sections:
- Sprint goal
- Files delivered (count + list with purposes)
- Compile check count (N/N)
- Test results summary
- Security findings resolved
- Technical debt carried forward
- Sprint N+1 inputs
```

## Quick Checklist

- [ ] All 27 agent MEMORY.md updated
- [ ] All new .c/.h files have header comments
- [ ] All new public functions have docstrings
- [ ] New ADRs written and indexed in `docs/adr/README.md`
- [ ] New API contracts in `docs/contracts/`
- [ ] `GENOS_PROJECT_MILESTONE_CHECKLIST.md` updated
- [ ] Sprint synthesis doc in master-orchestrator memory
- [ ] Global MEMORY.md sprint status line updated
