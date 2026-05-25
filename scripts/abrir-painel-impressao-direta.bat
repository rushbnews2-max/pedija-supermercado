@echo off
set "SLUG=sasc-distribuidora"
set "URL=https://pedija.up.railway.app/admin/%SLUG%"
set "PROFILE=%LOCALAPPDATA%\PediJaImpressao\%SLUG%"
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
set "CHROME_X86=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
set "EDGE_64=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"

if exist "%CHROME%" (
  start "" "%CHROME%" --kiosk-printing --user-data-dir="%PROFILE%" --app="%URL%"
  exit /b 0
)

if exist "%CHROME_X86%" (
  start "" "%CHROME_X86%" --kiosk-printing --user-data-dir="%PROFILE%" --app="%URL%"
  exit /b 0
)

if exist "%EDGE%" (
  start "" "%EDGE%" --kiosk-printing --user-data-dir="%PROFILE%" --app="%URL%"
  exit /b 0
)

if exist "%EDGE_64%" (
  start "" "%EDGE_64%" --kiosk-printing --user-data-dir="%PROFILE%" --app="%URL%"
  exit /b 0
)

echo Nao encontrei Google Chrome nem Microsoft Edge nos caminhos padrao.
echo Instale o Chrome ou abra manualmente com --kiosk-printing.
pause
