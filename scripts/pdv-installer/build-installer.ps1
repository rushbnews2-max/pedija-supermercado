$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$source = Join-Path $PSScriptRoot 'PediJahPdv.cs'
$assetDir = Join-Path $projectRoot 'server\assets'
$output = Join-Path $assetDir 'PediJah-PDV-Setup.exe'
$icon = Join-Path $PSScriptRoot 'pedijah-pdv.ico'
$csc = 'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'

New-Item -ItemType Directory -Force -Path $assetDir | Out-Null

Add-Type -AssemblyName System.Drawing
$bitmap = New-Object System.Drawing.Bitmap 256, 256
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.Clear([System.Drawing.Color]::FromArgb(255, 255, 255))
$navyBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(10, 26, 48))
$orangeBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(244, 81, 6))
$graphics.FillEllipse($navyBrush, 10, 10, 236, 236)
$graphics.FillEllipse($orangeBrush, 24, 24, 208, 208)
$graphics.FillEllipse($navyBrush, 42, 42, 172, 172)
$font = New-Object System.Drawing.Font 'Segoe UI', 104, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center
$graphics.DrawString('P', $font, $whiteBrush, (New-Object System.Drawing.RectangleF 0, 40, 175, 180), $format)
$graphics.DrawString('J', $font, $orangeBrush, (New-Object System.Drawing.RectangleF 82, 52, 150, 180), $format)
$handle = $bitmap.GetHicon()
$iconObject = [System.Drawing.Icon]::FromHandle($handle)
$stream = [System.IO.File]::Create($icon)
$iconObject.Save($stream)
$stream.Close()
$graphics.Dispose()
$bitmap.Dispose()

& $csc /nologo /target:winexe /optimize+ /out:$output /win32icon:$icon /reference:System.dll /reference:System.Drawing.dll /reference:System.Windows.Forms.dll /reference:Microsoft.CSharp.dll $source
if ($LASTEXITCODE -ne 0) { throw 'Falha ao compilar o instalador PediJah PDV.' }

Write-Host "Instalador criado em $output"
