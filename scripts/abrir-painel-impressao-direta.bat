@echo off
set "URL=https://pedija-supermercado-production.up.railway.app/"
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"

if exist "%CHROME%" (
  start "" "%CHROME%" --kiosk-printing --app="%URL%"
  exit /b 0
)

if exist "%EDGE%" (
  start "" "%EDGE%" --kiosk-printing --app="%URL%"
  exit /b 0
)

echo Nao encontrei Google Chrome nem Microsoft Edge nos caminhos padrao.
echo Instale o Chrome ou abra manualmente com --kiosk-printing.
pause
