# install-plugin.ps1 — copia el code.js parcheado del Antigravity Bridge a las tres rutas
# donde Figma Desktop busca el plugin. Idempotente: se puede volver a correr tras una
# actualización del bridge que haya sobrescrito el archivo.
#
# Uso:  pwsh otros/infra/figma-bridge-plugin/compartir/install-plugin.ps1

$ErrorActionPreference = 'Stop'

# El code.js parcheado vive un nivel arriba de esta carpeta (en el plugin versionado).
$source = Join-Path $PSScriptRoot '..\code.js' | Resolve-Path | Select-Object -ExpandProperty Path

$targets = @(
  "$HOME\.gemini\antigravity\mcp\figma-plugin",
  "$HOME\.gemini\antigravity-ide\mcp\figma-plugin",
  "$HOME\.figma-mcp-bridge\mcp\figma-plugin"
)

Write-Host "Origen: $source`n"
$copied = 0
foreach ($dir in $targets) {
  if (Test-Path $dir) {
    Copy-Item $source (Join-Path $dir 'code.js') -Force
    Write-Host "  [OK]   copiado a $dir"
    $copied++
  } else {
    Write-Host "  [skip] no existe (instala primero el Antigravity Bridge): $dir" -ForegroundColor Yellow
  }
}

Write-Host ""
if ($copied -eq 0) {
  Write-Host "No se copio a ninguna ruta. Instala el Antigravity Bridge y vuelve a correr este script." -ForegroundColor Red
  exit 1
}
Write-Host "Listo ($copied de $($targets.Count)). Reinicia el plugin 'Antigravity Bridge' en Figma Desktop." -ForegroundColor Green
