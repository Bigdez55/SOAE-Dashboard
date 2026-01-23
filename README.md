# SOAE-Dashboard
Report Compliance Tracker

## Report loading
- Use the "Load Reports" button in the header to upload CSV, XLSX, and EML files.
- File names determine the dataset:
  - `soae` → SOAE records
  - `dispatch` → Dispatch records
  - `incident` → Safety incidents
  - `accident` → Safety accidents
  - `safety` → Safety incidents
  - `down` → Downed vehicles
- SharePoint exports that start with a `ListSchema=...` row are supported (the schema row is ignored).
- If a filename doesn’t include a dataset keyword, the loader will try to auto-detect the dataset from the CSV headers.
- Your `Paratransit Summary of ACCESS Events (4).csv` is auto-detected as SOAE based on `EventDate`, `EventType`, and `Created`.
- Safety Tracker XLSX is routed to Accidents by default and split into Incidents when the `ACCIDENT` column is `Incident/INCIDENT`.
- The `ACCIDENT` flag and `P / NP - Risk Perspective` values are surfaced in the Sources tab category column.

## Double-click app (portable desktop)
This uses Tauri to create a native app you can run from a flash drive.

Prereqs (per machine):
- Node.js LTS
- Rust toolchain (Tauri requirement)

Build:
1) `npm install`
2) `npm run tauri:build`

Outputs (typical):
- macOS: `src-tauri/target/release/bundle/macos/SOAE Dashboard.app` (portable)
- Windows: `src-tauri/target/release/soae-dashboard.exe` (portable app binary)

Notes:
- Windows requires WebView2 runtime; most managed PCs already have it.
- Some corporate policies block running EXEs from USB devices.

## Copy to USB (Windows)
After building, you can copy the Windows EXE to `E:\SOAE`:

```bat
scripts\copy-to-usb.cmd
```

PowerShell alternative:

```powershell
.\scripts\copy-to-usb.ps1
```

## Upload limits
- Max 50MB per report file
- Max 200MB total per upload
