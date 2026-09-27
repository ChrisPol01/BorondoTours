<#
.SYNOPSIS
    Corta los mockups PNG de b2c en tramos SOLAPADOS (adaptando el eje segun la
    orientacion) y los organiza por carpeta (una carpeta por pantalla), listos
    para subir a una IA multimodal externa que genere la Design Spec (.design.md).

.DESCRIPTION
    Kiro NUNCA analiza estas imagenes (caro en tokens). El analisis visual se hace
    una sola vez en una IA externa. Este script solo PREPARA el material:

      - Crea una carpeta por pantalla en otros/design/b2c/tramos/<slug>/
      - Copia la imagen completa como 00-full.png (vista general / contexto)
      - Corta la imagen en -Slices tramos SOLAPADOS para maxima fidelidad de detalle,
        eligiendo el eje del corte segun la forma de la imagen:
          * Apaisada (ancho > alto * AspectThreshold): corta en COLUMNAS
            (izquierda/derecha). El detalle fino esta distribuido a lo ancho.
            Archivos: 01-izquierda.png, 02-derecha.png (o 01/02/03-col si Slices=3).
          * Vertical / cuadrada: corta en FILAS (arriba/abajo).
            Archivos: 01-arriba.png, 02-abajo.png (o ...-fila si Slices=3).
      - El solape (-OverlapPct) evita que un componente quede partido sin contexto.
      - Escribe un README.txt por pantalla con dimensiones, eje de corte y el mapeo
        NOMBRE_PANTALLA / RUTA (para rellenar los marcadores del prompt).

    Sin dependencias externas: usa System.Drawing (nativo en Windows).
    Idempotente: regenera la carpeta tramos/ desde cero en cada corrida.

.PARAMETER Slices
    Numero de tramos por imagen para las pantallas VERTICALES (ademas del 00-full).
    Default 4 (mayor detalle: cada franja gana resolucion en el eje largo).
    Las pantallas APAISADAS se cortan en LandscapeSlices columnas (ver abajo),
    porque partirlas en 4 fragmentaria el contexto horizontal.

.PARAMETER LandscapeSlices
    (Obsoleto con -LandscapeGrid quadrants) Numero de columnas para apaisadas
    cuando -LandscapeGrid = 'columns'. Default 2.

.PARAMETER LandscapeGrid
    Como cortar las pantallas apaisadas:
      * 'quadrants' (default): 4 cuadrantes 2x2 solapados (sup-izq, sup-der,
        inf-izq, inf-der). Maxima resolucion por region — recomendado.
      * 'columns': LandscapeSlices columnas verticales (comportamiento previo).

.PARAMETER OverlapPct
    Porcentaje de solapamiento entre tramos consecutivos (0.0-0.5). Default 0.12
    (12%). El solape evita que un componente quede partido sin contexto.

.PARAMETER AspectThreshold
    Si ancho/alto supera este valor, la imagen se considera apaisada y se corta en
    columnas. Default 1.1 (ligeramente apaisada ya se corta en columnas).

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\split-mockups.ps1
    powershell -ExecutionPolicy Bypass -File .\split-mockups.ps1 -Slices 4 -OverlapPct 0.15
#>
[CmdletBinding()]
param(
    [int]$Slices = 4,
    [int]$LandscapeSlices = 2,
    [ValidateSet("quadrants", "columns")]
    [string]$LandscapeGrid = "quadrants",
    [double]$OverlapPct = 0.12,
    [double]$AspectThreshold = 1.1
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

if ($Slices -lt 1) { throw "Slices debe ser >= 1." }
if ($LandscapeSlices -lt 1) { throw "LandscapeSlices debe ser >= 1." }
if ($OverlapPct -lt 0 -or $OverlapPct -ge 0.5) { throw "OverlapPct debe estar en [0, 0.5)." }

# ── Rutas base (el script vive en otros/design/b2c/tools) ──
$toolsDir = $PSScriptRoot
$b2cDir = Split-Path -Parent $toolsDir
$outRoot = Join-Path $b2cDir "tramos"

# ── Mapeo PNG -> (slug de carpeta, NOMBRE_PANTALLA, RUTA) ──
# Slugs con prefijo numerico = orden de procesamiento sugerido por valor de negocio.
# Ver otros/design/b2c/README-analisis.md
$screens = @(
    @{ Png = "1-Inicio de pagina web.png";                              Slug = "01-home";              Nombre = "Home";                  Ruta = "/" }
    @{ Png = "2-Catalogo pagina web.png";                               Slug = "02-catalogo";          Nombre = "Catalogo";              Ruta = "/discovery" }
    @{ Png = "2-1-Reserva de tour seleccionado pagina web.png";         Slug = "03-detalle-tour";      Nombre = "Detalle de tour";       Ruta = "/tours/[slug]" }
    @{ Png = "21-2-Proceso de reservas usuario pagina web.png";         Slug = "04-checkout";          Nombre = "Checkout";              Ruta = "/checkout" }
    @{ Png = "20-Panel usuario pagina web.png";                         Slug = "05-panel-usuario";     Nombre = "Panel de usuario";      Ruta = "/mi-cuenta" }
    @{ Png = "21-Mis tours usuario pagina web.png";                     Slug = "06-mis-tours";         Nombre = "Mis Tours";             Ruta = "/mis-reservas" }
    @{ Png = "21-1-Detalle de reserva de tour usuario pagina web.png";  Slug = "07-detalle-reserva";   Nombre = "Detalle de reserva";    Ruta = "/mis-reservas/[reference]" }
    @{ Png = "22-Perfil usuario pagina web.png";                        Slug = "08-perfil";            Nombre = "Perfil";                Ruta = "/perfil" }
    @{ Png = "23-Borondo Coins usuario pagina web.png";                 Slug = "09-borondo-coins";     Nombre = "Borondo Coins";         Ruta = "/coins" }
    @{ Png = "24-Tours favoritos usuario pagina web.png";               Slug = "10-favoritos";         Nombre = "Favoritos";             Ruta = "/favoritos" }
    @{ Png = "25-Mensajes usuarios pagina web.png";                     Slug = "11-mensajes";          Nombre = "Mensajes";              Ruta = "/mensajes" }
    @{ Png = "3-Seleccion de destinos pagina web.png";                  Slug = "12-destinos";          Nombre = "Destinos";              Ruta = "/destinations" }
    @{ Png = "4-Experiencias pagina web.png";                           Slug = "13-experiencias";      Nombre = "Experiencias";          Ruta = "/experiences" }
    @{ Png = "5-Blog pagina web.png";                                   Slug = "14-blog";              Nombre = "Blog";                  Ruta = "/blog" }
    @{ Png = "6-Nosotros y contacto pagina web.png";                    Slug = "15-nosotros-contacto"; Nombre = "Nosotros y Contacto";   Ruta = "/about, /contact" }
)

function Save-Png {
    param([System.Drawing.Bitmap]$Bitmap, [string]$Path)
    $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
}

# Recorta una region rectangular de la imagen fuente y la guarda como PNG.
function Save-Crop {
    param(
        [System.Drawing.Image]$Src,
        [int]$X, [int]$Y, [int]$W, [int]$H,
        [string]$Path
    )
    $rect = New-Object System.Drawing.Rectangle($X, $Y, $W, $H)
    $bmp = New-Object System.Drawing.Bitmap($W, $H)
    try {
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        try {
            $dest = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
            $g.DrawImage($Src, $dest, $rect, [System.Drawing.GraphicsUnit]::Pixel)
        } finally { $g.Dispose() }
        Save-Png -Bitmap $bmp -Path $Path
    } finally { $bmp.Dispose() }
}

# Calcula los offsets de inicio y el tamano de cada tramo a lo largo de un eje
# de longitud 'total', repartido en 'n' tramos con 'overlapPct' de solape.
function Get-SlicePlan {
    param([int]$Total, [int]$N, [double]$OverlapPct)
    # tamano de cada tramo: total / (n - (n-1)*overlap)
    $denom = $N - ($N - 1) * $OverlapPct
    $sliceLen = [int][Math]::Ceiling($Total / $denom)
    $step = [int][Math]::Floor($sliceLen * (1 - $OverlapPct))
    if ($step -lt 1) { $step = 1 }
    $plan = @()
    for ($i = 0; $i -lt $N; $i++) {
        $start = $i * $step
        if ($i -eq ($N - 1)) { $start = [Math]::Max(0, $Total - $sliceLen) } # ultimo pegado al final
        $len = [Math]::Min($sliceLen, $Total - $start)
        $plan += [pscustomobject]@{ Start = $start; Len = $len }
    }
    return $plan
}

# ── Regenerar la salida desde cero (idempotente) ──
if (Test-Path $outRoot) { Remove-Item -Recurse -Force $outRoot }
New-Item -ItemType Directory -Path $outRoot | Out-Null

$report = @()
$totalTramos = 0

foreach ($screen in $screens) {
    $srcPath = Join-Path $b2cDir $screen.Png
    if (-not (Test-Path $srcPath)) {
        Write-Warning "No encontrado, se omite: $($screen.Png)"
        continue
    }

    $screenDir = Join-Path $outRoot $screen.Slug
    New-Item -ItemType Directory -Path $screenDir | Out-Null

    $img = [System.Drawing.Image]::FromFile($srcPath)
    try {
        $w = $img.Width
        $h = $img.Height

        # 00-full.png: vista general / contexto.
        Save-Crop -Src $img -X 0 -Y 0 -W $w -H $h -Path (Join-Path $screenDir "00-full.png")

        # Modo de corte segun orientacion:
        #   Apaisada + quadrants -> 4 cuadrantes 2x2 solapados (max resolucion por region).
        #   Apaisada + columns   -> LandscapeSlices columnas verticales.
        #   Vertical             -> Slices filas horizontales (mas resolucion en el eje largo).
        $isLandscape = ($w / [double]$h) -ge $AspectThreshold
        $tramoFiles = @()

        if ($isLandscape -and $LandscapeGrid -eq "quadrants") {
            # Cuadrantes 2x2: partir ambos ejes en 2 con solape.
            $colPlan = Get-SlicePlan -Total $w -N 2 -OverlapPct $OverlapPct
            $rowPlan = Get-SlicePlan -Total $h -N 2 -OverlapPct $OverlapPct
            $quadNames = @(
                @{ Name = "01-sup-izquierda"; Col = 0; Row = 0 },
                @{ Name = "02-sup-derecha";   Col = 1; Row = 0 },
                @{ Name = "03-inf-izquierda"; Col = 0; Row = 1 },
                @{ Name = "04-inf-derecha";   Col = 1; Row = 1 }
            )
            foreach ($q in $quadNames) {
                $cp = $colPlan[$q.Col]
                $rp = $rowPlan[$q.Row]
                Save-Crop -Src $img -X $cp.Start -Y $rp.Start -W $cp.Len -H $rp.Len -Path (Join-Path $screenDir "$($q.Name).png")
                $tramoFiles += $q.Name
            }
            $nSlices = 4
            $axis = "cuadrantes 2x2 (sup-izq, sup-der, inf-izq, inf-der)"
        }
        elseif ($isLandscape) {
            $nSlices = $LandscapeSlices
            $axis = "columnas (izquierda a derecha)"
            $namesCols2 = @("01-izquierda", "02-derecha")
            $plan = Get-SlicePlan -Total $w -N $nSlices -OverlapPct $OverlapPct
            for ($i = 0; $i -lt $plan.Count; $i++) {
                $p = $plan[$i]
                $name = if ($nSlices -eq 2) { $namesCols2[$i] } else { "{0:D2}-col" -f ($i + 1) }
                Save-Crop -Src $img -X $p.Start -Y 0 -W $p.Len -H $h -Path (Join-Path $screenDir "$name.png")
                $tramoFiles += $name
            }
        }
        else {
            $nSlices = $Slices
            $axis = "filas (arriba a abajo)"
            $namesRows2 = @("01-arriba", "02-abajo")
            $plan = Get-SlicePlan -Total $h -N $nSlices -OverlapPct $OverlapPct
            for ($i = 0; $i -lt $plan.Count; $i++) {
                $p = $plan[$i]
                $name = if ($nSlices -eq 2) { $namesRows2[$i] } else { "{0:D2}-fila" -f ($i + 1) }
                Save-Crop -Src $img -X 0 -Y $p.Start -W $w -H $p.Len -Path (Join-Path $screenDir "$name.png")
                $tramoFiles += $name
            }
        }

        $totalTramos += $nSlices

        # README.txt por pantalla. ($tramoFiles ya fue llenado en el bloque de corte.)
        $orden = "00-full.png (contexto) + " + (($tramoFiles | ForEach-Object { "$_.png" }) -join " + ")
        $notaCorte = if ($isLandscape -and $LandscapeGrid -eq "quadrants") {
            "Son 4 cuadrantes solapados de la MISMA pantalla (2x2). Reconstruyela mentalmente: 00-full da la estructura, los cuadrantes el detalle fino. NO son pantallas distintas."
        } else {
            "Son cortes de la MISMA pantalla; analizala como un todo, no como pantallas distintas."
        }

        $readme = @()
        $readme += "Pantalla: $($screen.Nombre)"
        $readme += "Ruta:     $($screen.Ruta)"
        $readme += "PNG:      $($screen.Png)"
        $readme += "Dimensiones: ${w}x${h} px  ($(if ($isLandscape) {'apaisada'} else {'vertical/cuadrada'}))"
        $readme += ""
        $readme += "Cortada en $nSlices tramos por $axis, con solape del $([int]($OverlapPct*100))%."
        $readme += "Sube a la IA externa en este orden: $orden"
        $readme += "IMPORTANTE: $notaCorte"
        $readme += ""
        $readme += "Marcadores para el prompt (PROMPT-COMPLETO-autocontenido.md):"
        $readme += "  {{NOMBRE_PANTALLA}} = $($screen.Nombre)"
        $readme += "  {{NOMBRE_ARCHIVO_PNG}} = $($screen.Png)"
        $readme += "  {{RUTA}} = $($screen.Ruta)"
        $readme += ""
        $readme += "Guarda la Design Spec resultante en: otros/design/b2c/specs/$($screen.Slug).design.md"
        Set-Content -Path (Join-Path $screenDir "README.txt") -Value ($readme -join "`r`n") -Encoding UTF8

        $ejeLabel = if ($isLandscape) {
            if ($LandscapeGrid -eq "quadrants") { "cuadrantes 2x2" } else { "columnas" }
        } else { "filas" }
        $report += [pscustomobject]@{
            Slug = $screen.Slug; Pantalla = $screen.Nombre; Dim = "${w}x${h}"
            Forma = $(if ($isLandscape) { "apaisada" } else { "vertical" })
            Eje = $ejeLabel; Tramos = $nSlices
        }
    }
    finally {
        $img.Dispose()
    }
}

# ── Indice global ──
$indexLines = @()
$indexLines += "# Tramos de mockups B2C (generado por split-mockups.ps1)"
$indexLines += ""
$indexLines += "Kiro NO analiza estas imagenes. Suben a la IA multimodal externa (junto con"
$indexLines += "PROMPT-COMPLETO-autocontenido.md) para generar cada Design Spec (.design.md)."
$indexLines += "Ver ../README-analisis.md para el flujo completo."
$indexLines += ""
$apaisadasDesc = if ($LandscapeGrid -eq "quadrants") { "4 cuadrantes 2x2" } else { "$LandscapeSlices columnas" }
$indexLines += "Parametros: Slices(vertical)=$Slices, LandscapeGrid=$LandscapeGrid, OverlapPct=$([int]($OverlapPct*100))%, AspectThreshold=$AspectThreshold"
$indexLines += "Corte adaptativo: apaisadas -> $apaisadasDesc; verticales -> $Slices filas (arriba a abajo)."
$indexLines += ""
$indexLines += "| Orden | Pantalla | Carpeta | Dimensiones | Forma | Eje de corte | Tramos |"
$indexLines += "|---|---|---|---|---|---|---|"
foreach ($r in $report) {
    $indexLines += "| $($r.Slug.Substring(0,2)) | $($r.Pantalla) | ``$($r.Slug)/`` | $($r.Dim) | $($r.Forma) | $($r.Eje) | $($r.Tramos) |"
}
Set-Content -Path (Join-Path $outRoot "INDEX.md") -Value ($indexLines -join "`r`n") -Encoding UTF8

Write-Output ""
Write-Output "Listo. $($report.Count) pantallas procesadas, $totalTramos tramos generados (verticales=$Slices filas, apaisadas=$apaisadasDesc, solape=$([int]($OverlapPct*100))%)."
Write-Output "Salida: $outRoot"
Write-Output "Indice: $(Join-Path $outRoot 'INDEX.md')"
