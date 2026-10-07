# Escala una imagen con super-resolución (Real-ESRGAN x4plus) y la guarda como JPG del ancho pedido.
# Uso: .\escalar-imagen.ps1 -Origen ..\..\b2c\fotos-test\destino-ciudad-perdida.png -Destino ..\..\b2c\fotos-test\destino-ciudad-perdida-hd.jpg -Ancho 3072
# El binario (~45 MB) se descarga una sola vez a %LOCALAPPDATA%\borondo-tools (fuera del repo, costo $0).
param(
  [Parameter(Mandatory)] [string]$Origen,
  [Parameter(Mandatory)] [string]$Destino,
  [int]$Ancho = 3072,
  [int]$Calidad = 85
)
$ErrorActionPreference = 'Stop'
$dir = Join-Path $env:LOCALAPPDATA 'borondo-tools\realesrgan'
$exe = Get-ChildItem $dir -Recurse -Filter realesrgan-ncnn-vulkan.exe -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $exe) {
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  $zip = Join-Path $dir 're.zip'
  Invoke-WebRequest -UseBasicParsing -OutFile $zip `
    -Uri 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.2.5.0/realesrgan-ncnn-vulkan-20220424-windows.zip'
  Expand-Archive -Path $zip -DestinationPath $dir -Force
  $exe = Get-ChildItem $dir -Recurse -Filter realesrgan-ncnn-vulkan.exe | Select-Object -First 1
}
$tmp = Join-Path $dir 'salida-x4.png'
& $exe.FullName -i (Resolve-Path $Origen) -o $tmp -n realesrgan-x4plus | Out-Null

Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile($tmp)
$alto = [int]($img.Height * $Ancho / $img.Width)
$bmp = New-Object System.Drawing.Bitmap $Ancho, $alto
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = 'HighQualityBicubic'; $g.PixelOffsetMode = 'HighQuality'
$g.DrawImage($img, 0, 0, $Ancho, $alto)
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$p = New-Object System.Drawing.Imaging.EncoderParameters 1
$p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Calidad)
$bmp.Save($Destino, $enc, $p)
$g.Dispose(); $bmp.Dispose(); $img.Dispose(); Remove-Item $tmp
Write-Output "Listo: $Destino ($Ancho x $alto)"
