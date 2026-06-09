$ErrorActionPreference = 'Stop'

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$source = Join-Path $PSScriptRoot 'PediJahPdv.cs'
$assetDir = Join-Path $projectRoot 'server\assets'
$output = Join-Path $assetDir 'PediJah-PDV-Setup.exe'
$icon = Join-Path $PSScriptRoot 'pedijah-pdv.ico'
$logo = Join-Path $PSScriptRoot 'pedijah-logo.jpeg'
$csc = 'C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe'

New-Item -ItemType Directory -Force -Path $assetDir | Out-Null

Add-Type -AssemblyName System.Drawing
$sourceLogo = [System.Drawing.Image]::FromFile($logo)
$bitmap = New-Object System.Drawing.Bitmap 256, 256
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.Clear([System.Drawing.Color]::FromArgb(255, 255, 255))
$graphics.DrawImage($sourceLogo, (New-Object System.Drawing.Rectangle 0, 0, 256, 256))
$handle = $bitmap.GetHicon()
$iconObject = [System.Drawing.Icon]::FromHandle($handle)
$stream = [System.IO.File]::Create($icon)
$iconObject.Save($stream)
$stream.Close()
$graphics.Dispose()
$bitmap.Dispose()
$sourceLogo.Dispose()

& $csc /nologo /target:winexe /optimize+ /out:$output /win32icon:$icon /reference:System.dll /reference:System.Drawing.dll /reference:System.Windows.Forms.dll /reference:Microsoft.CSharp.dll $source
if ($LASTEXITCODE -ne 0) { throw 'Falha ao compilar o instalador PediJah PDV.' }

Write-Host "Instalador criado em $output"
