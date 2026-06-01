# superc-v1 Canonical Directory Map
## Reference for apex-directory-discipline skill (superc-v1 tree)
## Companion to canonical-directory-map.md (GENOSCOPY map)

---

## Last verified: 2026-04-27 (post-organize commit `35e08d6`)

## Top-level structure

```
desmond-super-c/superc-v1/
├── README.md                          ← project README
├── APEX_PROJECT_REPORT.md             ← master development record
├── COMPLETION_REPORT.md               ← v1.0.0 release notes
├── CHANGELOG.md
├── RELEASE_CHECKLIST_V1.md
├── LANGUAGE_REFERENCE_V1_OUTLINE.md
├── V2_ROADMAP_DRAFT.md
├── AI_ASSISTED_COMPILATION_DESIGN.md
├── COMPILER_LINT_BASELINE.md
├── COMPILER_PERF_TARGETS.md
│
├── compiler/                          ← compiler implementation
│   ├── seedc/                         ← LEGACY C bootstrap (NOTICE.md)
│   └── scc/                           ← self-host compiler
│       ├── src/
│       │   ├── *.sc / *.c             ← source files
│       │   └── *_PLAN.md              ← in-flight slice plans
│       └── tests/
│
├── frontend/                          ← shared lexer + parser
│   └── src/
│       ├── lexer.sc
│       └── parser.sc
│
├── std/                               ← standard library
│   ├── core/                          (29 modules)
│   ├── alloc/                         (22 modules)
│   └── std/                           (24 modules)
│
├── docs/
│   ├── README.md                      ← docs index
│   ├── language_reference.md
│   └── archive/                       ← historical artifacts (NEVER-DELETE)
│       ├── sessions/                  35 SESSION_PROGRESS_*.md
│       ├── stages/                    39 STAGE*_*.md + gate checklists
│       ├── planning/                  15 spec/stdlib/dependency docs
│       └── design/                    18 design drafts
│
├── audits/                            ← release audits
│   ├── README.md                      ← audit index
│   ├── alpha/                         (7 stage-5 follow-behind audits)
│   ├── bootstrap_attempt_*.md
│   ├── parser_cascade.md
│   └── CONFORMANCE_AUDIT.md + CONVENTION_*.md
│
├── release/                           ← release-engineering scripts
├── spec/                              ← (points to canonical spec elsewhere)
├── tests/                             ← cross-module integration tests
├── tools/                             ← developer tools
└── dist/                              ← built artifacts (gitignored)
```

## Where new docs go (decision matrix)

| New doc kind | Goes here |
|---|---|
| User-facing language reference | `docs/` |
| Active architecture proposal | repo root (e.g., AI_ASSISTED_COMPILATION_DESIGN.md) |
| In-flight slice plan | `compiler/scc/src/<topic>_PLAN.md` (alongside source) |
| Audit report | `audits/` (or `audits/alpha/` for follow-behind) |
| Release notes / changelog | repo root |
| Historical record (post-completion) | `docs/archive/<sessions\|stages\|planning\|design>/` |
| Per-stage entry note | `docs/archive/stages/STAGE<N>_*.md` (archive immediately on close) |
| Per-session progress | `docs/archive/sessions/SESSION_PROGRESS_<N>.md` |
| RMEC amendment | `../GENOSCOPY/RMEC_AMENDMENTS_*.md` (sibling tree) |
| XEMU / XISC-Apex spec | `../GENOSCOPY/docs/` or `../GENOSCOPY/xisc/spec/` |

## Do NOT create in superc-v1/

- New top-level subdirs (`organize/`, `archive2/`, `legacy/`, etc.)
- Parallel `*-v2/`, `*-apex/`, `*-new/` directories
- `superc-v2/` (this IS superc-v1; the next version supersedes via tag/branch, not directory)
- Top-level `archive/` (use `docs/archive/`)
- Top-level `sessions/` or `stages/` (those live under `docs/archive/`)

## Migration record

The 2026-04-27 organize pass (commit `35e08d6`) moved 110 markdown
files from the repo root to `docs/archive/<category>/` and `audits/`.
Pre-2026-04-27 references to bare filenames (e.g.,
`STAGE5_SELFHOST_SLICES.md`) now resolve to
`docs/archive/stages/STAGE5_SELFHOST_SLICES.md`. Use:

```bash
find docs/archive/ -name "*KEYWORD*"
```

to locate any archived file by name fragment.
