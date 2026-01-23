$ErrorActionPreference = "Stop"

$usbRoot = "E:\SOAE"
$buildRoot = Join-Path $usbRoot "builds"
$winTarget = Join-Path $buildRoot "windows"

if (-not (Test-Path $usbRoot)) {
  Write-Error "USB path not found: $usbRoot"
}

New-Item -ItemType Directory -Force -Path $winTarget | Out-Null

$exePath = Join-Path $PSScriptRoot "..\\src-tauri\\target\\release\\soae-dashboard.exe"

if (-not (Test-Path $exePath)) {
  Write-Error "Build not found. Run 'npm run tauri:build' first."
}

Copy-Item -Force $exePath $winTarget

Write-Host "Copied to $winTarget"
