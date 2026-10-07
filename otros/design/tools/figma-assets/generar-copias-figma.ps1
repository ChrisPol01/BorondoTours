param([int]$Ancho = 1600, [int]$Calidad = 80)
# Genera copias livianas (JPG, $Ancho px) de fotos-test/ en fotos-test/figma-1600/ para subirlas a Figma sin bloquear el plugin.
Add-Type -AssemblyName System.Drawing
$src = Join-Path $PSScriptRoot '..\..\b2c\fotos-test'
$dst = Join-Path $src 'figma-1600'
New-Item -ItemType Directory -Force -Path $dst | Out-Null
$enc = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Calidad)
Get-ChildItem $src -File -Include *.jpg, *.png -Recurse:$false | Where-Object { $_.DirectoryName -eq (Resolve-Path $src).Path } | ForEach-Object {
  $img = [System.Drawing.Image]::FromFile($_.FullName)
  $w = [Math]::Min($Ancho, $img.Width); $h = [int]($img.Height * $w / $img.Width)
  $bmp = New-Object System.Drawing.Bitmap($w, $h)
  $g = [System.Drawing.Graphics]::FromImage($bmp); $g.InterpolationMode = 'HighQualityBicubic'
  $g.DrawImage($img, 0, 0, $w, $h)
  $out = Join-Path $dst ($_.BaseName + '.jpg'); $bmp.Save($out, $enc, $ep)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  '{0} → {1}px' -f $_.Name, $w
}
