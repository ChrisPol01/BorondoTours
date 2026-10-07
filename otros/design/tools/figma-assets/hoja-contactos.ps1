param([string]$Json, [string]$OutDir, [string[]]$Keys, [string]$Name)
# Genera una hoja de contactos (fila = categoría, columna = candidato) para elegir fotos de prueba.
$ProgressPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.Drawing
$data = Get-Content -Raw $Json | ConvertFrom-Json
$tw = 300; $th = 200; $labelW = 150; $pad = 6
$rows = $Keys.Count; $cols = 6
$sheet = New-Object System.Drawing.Bitmap(($labelW + $cols * ($tw + $pad)), ($rows * ($th + $pad + 20)))
$g = [System.Drawing.Graphics]::FromImage($sheet)
$g.Clear([System.Drawing.Color]::White)
$font = New-Object System.Drawing.Font('Arial', 11, [System.Drawing.FontStyle]::Bold)
$small = New-Object System.Drawing.Font('Arial', 9)
$brush = [System.Drawing.Brushes]::Black
$tmp = Join-Path $env:TEMP 'borondo-thumb.jpg'
for ($r = 0; $r -lt $rows; $r++) {
  $key = $Keys[$r]; $y = $r * ($th + $pad + 20)
  $g.DrawString($key, $font, $brush, 4, $y + 80)
  $items = @($data.$key)
  for ($c = 0; $c -lt [Math]::Min($cols, $items.Count); $c++) {
    $p = $items[$c]; $x = $labelW + $c * ($tw + $pad)
    try {
      Invoke-WebRequest -UseBasicParsing -Uri "$($p.base)?w=$tw&h=$th&fit=crop&q=60&fm=jpg" -OutFile $tmp
      $img = [System.Drawing.Image]::FromFile($tmp)
      $g.DrawImage($img, $x, $y, $tw, $th); $img.Dispose()
    } catch { $g.DrawString('error', $small, $brush, $x, $y) }
    $g.DrawString("$key-$c  $($p.w)x$($p.h)", $small, $brush, $x, $y + $th + 2)
  }
}
$out = Join-Path $OutDir "$Name.jpg"
$sheet.Save($out, [System.Drawing.Imaging.ImageFormat]::Jpeg)
$g.Dispose(); $sheet.Dispose()
Write-Output "saved $out"
