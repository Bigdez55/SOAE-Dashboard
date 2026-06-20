# SOAE-Dashboard — Spec vs Build Discrepancies

_Generated 2026-06-20 · companion to [`ARCHITECTURE MAP.html`](ARCHITECTURE%20MAP.html) · reconnaissance only (read-only; nothing built, executed, or modified)._

**Verdict:** A **real, working client-only React SPA** (VTA Paratransit SOAE Compliance Dashboard) — fully wired upload → parse → filter → chart pipeline — with a handful of honest defects: a double-escaped regex that breaks EML date extraction, a `lint` script that can't run (eslint not installed), dormant SharePoint/API TODO stubs, an orphaned sample-data file, and no tests. Not a scaffold; not theater.

---

## A. Summary + real-source census

The repository tree is overwhelmingly **vendored agent tooling**, not application code. Excluding that bulk, the actual app is small and coherent.

| Bucket | Count / size | Notes |
|---|---|---|
| First-party code files | **37** (23 `.jsx` + 12 `.js` + 2 `.rs`) | 3 of the `.js` are build-config (`vite`/`tailwind`/`postcss`) → **34 app-only** modules |
| App LOC (approx) | **~5,218** | `dataService.js` 797 is the largest; 10 tabs at 180–273 each |
| Tests | **0** | no `*.test.*` / `*.spec.*`; "test" hits are vendored `.md` agent files |
| Data files | 1 JSON used at build (`src/data/sampleData.json` = **orphaned**, 2.3 KB) | not imported anywhere |
| **Vendored / excluded** | `atlas/` **28 MB / 3,308 files**, `.claude/` **5.6 MB**, `.codex/` **5.6 MB**, `.git/` 7.5 MB | ~99% of file count; unrelated to the app; `atlas/` is committed |

**Classification:** `real-application` (single-page React + Vite dashboard, with Tauri desktop + GitHub Pages delivery).

**Real project root:** repo root itself (`/Users/desmondearly/Developer/SOAE-Dashboard`); app source under `src/`, desktop shell under `src-tauri/`.

**Architecture in one line:** `index.html` → `main.jsx` → `App.jsx` → `useDashboardData` / `useFilters` → `services/dataService.js` (CSV/XLSX/EML parse + LD math) → 10 Recharts tab views. No backend, no DB; all computation client-side; uploads never leave the machine.

---

## B. Spec ↔ Build register

Source of spec: `README.md`, `index.html`, `package.json`, `src-tauri/tauri.conf.json`.

| # | Spec claim | Status | Evidence / reality |
|---|---|---|---|
| 1 | "Load Reports" uploads CSV/XLSX/EML | BUILT | `Header.jsx:67` `accept=".csv,.xlsx,.eml" multiple` → `App.handleCsvLoad` → `dataService.loadCsvFiles` |
| 2 | Filename → dataset routing + header auto-detect | BUILT | `getDatasetKeyFromFilename` (`dataService.js:264`), `getDatasetKeyFromHeaders` (273) |
| 3 | SharePoint `ListSchema=` first row ignored | BUILT | `stripSchemaRow` (480) |
| 4 | Safety XLSX → Accidents, split to Incidents on `ACCIDENT` col | BUILT | `getSafetyDatasetKey` (472); accidents branch (246); XLSX via dynamic `import('xlsx')` (676) |
| 5 | EML Downed/Unfueled vehicle parsing | **PARTIAL** | Section + line-item parse works (`parseDownedEmail` 727; `/^\d+/` 751), but **subject & date extraction broken** by double-escaped regex (730, 784) → records load with `date: null`. See F-1. |
| 6 | LD = $5,000 + $100/day; 24h on-time rule | BUILT | `calculateLdForLate` (569), `calculateLdForMissing` (577), `DEFAULT_CONFIG.onTimeHours:24` |
| 7 | Upload limits 50 MB/file, 200 MB total | BUILT | `validateReportSizes` (652) |
| 8 | 10 tabs (Exec…Export) + CSV/JSON export | BUILT | all 10 in `src/components/tabs/`, wired in `App.jsx` switch; `ExportTab` `convertToCSV` + Blob download (250) |
| 9 | Tauri double-click portable app (mac/Win) | **UNVERIFIED** | `tauri.conf.json` + 7-line `main.rs` coherent; **not built/run** (recon is read-only). CSP locked, `allowlist.all:false`. |
| 10 | GitHub Pages at `/SOAE-Dashboard/` | BUILT | base-path chain wired: `vite.config.js` `base=process.env.BASE` ← `deploy.yml` `BASE:/SOAE-Dashboard/` ← README URL |
| 11 | SharePoint / REST API source ("for now / later") | **SCAFFOLD** | PRESENT-BUT-NOT-WIRED: `DATA_CONFIG.mode:'csv'` hardcoded ⇒ `getDashboardData` always returns empty; `transformSharePointData`/`calculateMetrics`/`groupDataBySource`/`calculateTrends` are TODO placeholders. Possibly intentional. See F-2. |
| 12 | `npm run lint` | **NO-TESTS / broken** | eslint referenced in script but **not installed** (absent from `devDependencies`) and no config → command-not-found. No tests in repo. See F-3. |

---

## C. Findings (reported, not fixed)

- **F-1 — EML date/subject regex double-escaped (real bug).** `dataService.js:730` `/Subject:\\s*(.*)/i` and `:784` `/(\\d{1,2})[\\/-](\\d{1,2})[\\/-](\\d{2,4})/` use literal `\\s`/`\\d`/`[\\/-]` inside JS regex literals — these match a literal backslash, not whitespace/digit. Result: Subject never matches → `extractDateFromSubject` gets empty input → every `.eml` downed-vehicle record is created with `date: null` (no `yearMonth`, vanishes from month filters). Line 784 is additionally masked by 730. Fix = single backslashes. _Confirmed via verbatim Read + grep._

- **F-2 — SharePoint/API paths are dormant placeholder stubs (PRESENT-BUT-NOT-WIRED).** `mode` is hardcoded `'csv'`; `getDashboardData()` always returns `getEmptyData()`; `fetchFromApi`/`fetchFromSharePoint` unreachable; transform/metrics/grouping/trends functions are `// Placeholder` / `// TODO` returning `{}`/empty. README hedges "for now / can be added later" → **possibly intentional pre-implementation; confirm intent.** App is strictly upload-driven.

- **F-3 — `lint` script non-functional + zero tests.** `package.json` `"lint": "eslint ..."` but no `eslint` dependency and no `.eslintrc*`/`eslint.config.*` → fails at command-not-found. No unit/integration/e2e tests anywhere (the only "test" filename hits are vendored `.claude`/`.codex` agent `.md` files). Only CI is the Pages build (no quality gate).

- **F-4 — `src/data/sampleData.json` orphaned (dead fixture).** 2.3 KB; zero imports across `src/`. App boots from `getEmptyData()`, never this file.

- **F-5 — App boots empty; deployed site shows no data until upload.** On mount `dataSource` = "No data loaded" and tabs render empty. By design (CSV-first, privacy-preserving) — but confirm the **public GitHub Pages site is meant to be empty-on-load** rather than shipping a seeded demo (the orphaned `sampleData.json` could serve that role).

- **F-6 — Dead formatter exports.** `utils/formatters.js` exports `truncateText` and `formatDateShort`; neither is imported anywhere. Minor dead code.

- **F-7 — Vendored bulk dominates (honesty note, not a defect).** `atlas/` 28 MB / 3,308 files + `.claude/` & `.codex/` 5.6 MB each ≈ 99% of file count vs ~5,218 LOC of real app. Imported agent tooling, unrelated to the dashboard; naive file counts will badly overstate repo size. `atlas/` is committed (not gitignored).

- **F-8 — `build:portable` duplicates `build`.** Both are `vite build`; "portable" actually = the Tauri path (`tauri:build`). Naming implies a distinct portable web build that doesn't exist. Low impact.

---

## D. Provenance

- **Method:** read-only reconnaissance — `ls`/`find`/`wc`/`grep`/`sed -n` and file Reads only. **Nothing was built, executed, installed, served, or modified.** No `npm`/`vite`/`tauri`/`cargo`/`eslint` was run; the Tauri "portable app" and the Pages build are reported from configuration, not from a build.
- **Scope:** characterized after excluding vendored bulk (`atlas/`, `.claude/`, `.codex/`, `.git/`, `node_modules` not present, `src-tauri/target` not present). Real-source census = first-party `.jsx`/`.js`/`.rs` under repo root and `src/`, `src-tauri/`.
- **Evidence:** all line numbers cite `cat -n`-format Reads of the named files; dead-code / dependency / orphan claims verified by `grep` returning no matches (`sampleData`, `truncateText`, `formatDateShort`, `"eslint"`).
- **Files written by this pass (the only two):** `docs/ARCHITECTURE MAP.html`, `docs/SPEC_VS_BUILD_DISCREPANCIES.md`. No source/config/code file was touched.
- **Caveats:** runtime behavior (actual upload parsing, chart rendering, Tauri packaging, Pages deploy) was **not** observed — statuses marked `UNVERIFIED` where wiring could not be proven by static read. A "wrong"/empty/dormant state may be deliberate pre-implementation; such items are flagged "possibly intentional — confirm," not asserted as broken intent.

_Reconnaissance only — observations for the coding agent's checklist + your oversight, not changes._
