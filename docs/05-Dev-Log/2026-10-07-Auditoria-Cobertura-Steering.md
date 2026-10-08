---
tipo: dev-log
fecha: 2026-10-07
---
# Auditoría de cobertura de steering (2026-10-07)

## Método
Lectura de listados, `package.json` (raíz, apps, services, packages, infra), configs y docs; sin tocar código de aplicación, `otros/` ni `.claude/`. Respaldo previo: `.agents/tasks/auditoria-steering-2026-10-07/backup.md`.

## Inventario resumido
Ver `docs/04-Tech-Design/Mapa-Repositorio.md`. Hallazgos nuevos: existe `.kiro/specs/operational-planning-module` (4 specs, no 3); `otros/design/tools` solo contiene `figma-assets` (fig2astro y plugin no existen).

## Tema -> cobertura
| Tema | Estado | Acción |
|---|---|---|
| Identidad/fases | Cubierto | 01 con estado real |
| Stack | Parcial -> cubierto | 02 reescrito con lo real |
| Comandos | Hueco -> cubierto | steering 16 + Mapa |
| Estructura real | Hueco -> cubierto | Mapa-Repositorio |
| Estado por fase | Hueco -> cubierto | steering 17 |
| specs/hooks/.claude | Hueco -> cubierto | 00 + Mapa §7 |
| CI/CD, scripts db, SAM vs CDK | Hueco -> pendiente | DECISIONES #13-#15 |
| Entorno | Hueco -> cubierto | 16 (solo nombres) |
| Integraciones | Parcial -> cubierto | Mapa §5 |
| DR | Cubierto en ADR-011 Parte D | Mapa §6 |
| Mapeo servicio->tablas | Hueco | Pendiente de definir (no está en Modelo-Datos-Core) |

## Cambios
Nuevos: Mapa-Repositorio, steering 16 y 17, este reporte. Editados: steering 00, 01, 02, 03, 04, 11, 13; DECISIONES-PENDIENTES (#13-#15); docs/README, 04-Tech-Design/README, Dev-Log-Index. Incidente corregido: una edición fallida sobrescribió seis steering; se restauraron desde el respaldo y se reaplicaron los cambios.

## Steering -> inclusion -> bytes
| Steering | Inclusion | Bytes |
|---|---|---|
| 00 | always | 1604 |
| 01 | always | 1017 |
| 02 | always | 1487 |
| 03 | always | 1026 |
| 04 | always | 1258 |
| 05 | always | 1294 |
| 06 | always | 615 |
| 17 | always | 1235 |
| 07, 11, 15, 16 | fileMatch | 949, ~791, 784, 1435 |
| 10, 12 | auto | 884, 1023 |
| 13, 14 | manual | ~960, 2736 |
**TOTAL always = 9536 B (<= 15 KB).**

## Verificación
- (a) always = 9536 B. (b) Los 16 steering tienen front matter válido (comprobado por script) y sin caracteres corruptos. (c) Comandos copiados de los `package.json` de raíz, apps, services, packages. (d) Rutas con backticks de steering y Mapa comprobadas con Test-Path: 0 rotas salvo `packages/api` (citada como inexistente a propósito) y rangos `1-core..9-ads`. (e) Mapa = 5387 B. (f) `docs/.obsidian/plugins/obsidian-local-rest-api/data.json` no existe y no se cita contenido; 0 coincidencias de apiKey/PRIVATE/AKIA en steering y Mapa. (g) Huecos pendientes: #1, #2 (decisión del usuario), #11 (rotar key), #13-#15, mapeo servicio->tablas, higiene de raíz (tmp-*.json, hooks copy).

## Reversión
```powershell
Remove-Item -Recurse -Force 'c:\Users\Administrador\BorondoTours\.kiro\steering'
Copy-Item -Recurse -Force 'C:\Users\Administrador\BorondoTours-backup-steering-2026-10-07\steering' 'c:\Users\Administrador\BorondoTours\.kiro\steering'
Remove-Item -Recurse -Force 'c:\Users\Administrador\BorondoTours\docs'
Copy-Item -Recurse -Force 'C:\Users\Administrador\BorondoTours-backup-steering-2026-10-07\docs' 'c:\Users\Administrador\BorondoTours\docs'
```