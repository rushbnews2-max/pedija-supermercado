$workspace = Split-Path -Parent $PSScriptRoot
$target = Join-Path $workspace "scripts\abrir-painel-impressao-direta.bat"
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "PediJa Impressao Direta.lnk"

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $target
$shortcut.WorkingDirectory = Split-Path -Parent $target
$shortcut.WindowStyle = 7
$shortcut.Description = "Abre o painel PediJa com impressao direta ativada no navegador."
$shortcut.Save()

Write-Host "Atalho criado em: $shortcutPath"
