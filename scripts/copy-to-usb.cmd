@echo off
setlocal

set "USB_ROOT=E:\SOAE"
set "WIN_TARGET=%USB_ROOT%\builds\windows"
set "EXE_PATH=%~dp0..\src-tauri\target\release\soae-dashboard.exe"

if not exist "%USB_ROOT%" (
  echo USB path not found: %USB_ROOT%
  exit /b 1
)

if not exist "%EXE_PATH%" (
  echo Build not found. Run "npm run tauri:build" first.
  exit /b 1
)

mkdir "%WIN_TARGET%" >nul 2>&1
copy /Y "%EXE_PATH%" "%WIN_TARGET%" >nul

echo Copied to %WIN_TARGET%
endlocal
