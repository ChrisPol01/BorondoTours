# Migra clases Tailwind de primitivas de marca a tokens semánticos (para que respeten los temas).
# Uso: pwsh otros/infra/scripts/migrate-brand-classes.ps1 [-DryRun]
param([switch]$DryRun)
$root = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..\apps\web\src')).Path
# Texto sobre acción (turquesa, verde, dorado) debe ser text-on-action (Negro Volcánico en todos los temas).
$actionBg = 'bg-(dorado|turquesa|verde|action-primary|action-cta|action-primary-hover)\b'
$map = [ordered]@{
  'ring-offset-blanco-niebla' = 'ring-offset-surface-page'
  'bg-blanco-niebla'          = 'bg-surface-card'
  'bg-arena'                  = 'bg-surface-warm'
  'bg-azul-profundo'          = 'bg-surface-strong'
  'text-blanco-niebla'        = 'text-on-strong'
  'text-azul-profundo'        = 'text-text-heading'
  'text-azul-condor'          = 'text-text-muted'
  'border-azul-profundo'      = 'border-border-subtle'
  'border-blanco-niebla'      = 'border-border-subtle'
}
$files = Get-ChildItem $root -Recurse -File -Include *.tsx,*.astro,*.ts | Where-Object { $_.Name -notmatch '\.test\.' }
$total = 0
foreach ($f in $files) {
  $lines = [IO.File]::ReadAllLines($f.FullName)
  $changed = $false
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $orig = $lines[$i]; $l = $orig
    # negro volcánico: on-action junto a fondos de acción; texto primario en el resto
    if ($l -match $actionBg) { $l = $l -replace '\btext-negro-volcanico\b', 'text-on-action' }
    else { $l = $l -replace '\btext-negro-volcanico\b', 'text-text-primary' }
    # border-azul-profundo/NN -> border-border-subtle (se descarta la opacidad: el token ya es sutil)
    $l = $l -replace '\bborder-(azul-profundo|blanco-niebla)(/\d+)?\b', 'border-border-subtle'
    foreach ($k in $map.Keys) { $l = $l -replace "\b$([regex]::Escape($k))\b", $map[$k] }
    if ($l -ne $orig) { $lines[$i] = $l; $changed = $true; $total++ }
  }
  if ($changed) {
    Write-Output "$($f.FullName.Substring($root.Length))"
    if (-not $DryRun) { [IO.File]::WriteAllText($f.FullName, ($lines -join "`n") + "`n", (New-Object Text.UTF8Encoding $false)) }
  }
}
Write-Output "Líneas cambiadas: $total"
