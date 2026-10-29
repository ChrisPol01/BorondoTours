# Figma B2B · Gestión — informe de figma-sync

Estado: **BLOQUEADO, sin cambios en Figma.** El puente no tiene ningún plugin conectado.

## Diagnóstico
- `figma_list_targets` devolvió `targets: []` dos veces.
- `figma_execute_code` devolvió `BRIDGE_OFFLINE`: "No Figma plugin is connected to the bridge".
- No se creó la página ni ningún componente. Page 1 y la página Design System no se tocaron.

## Para retomar
1. Abrir Figma Desktop (no el navegador) con el archivo de BorondoTours.
2. Lanzar el plugin "Antigravity Bridge" (Ctrl+Alt+P) hasta que muestre CONNECTED.
3. Volver a ejecutar este paso del workflow.

## Plan preparado (se ejecuta al reconectar)
Lecturas hechas: brief, 00-propuesta-consolidada §1, 06-decisiones-dueno (D1-D11), 04-ux-sidebar-ia (§3-§8),
02-dominio §4, steering 13, runbook del puente, skill apple-design.

Puntos a confirmar en vivo antes de construir:
- El runbook (2026-09-29) dice que la sección 00 se movió a la página **Design System** (`52:5262`); el encargo
  dice "sección 00 de Page 1". Los componentes nuevos irán donde esté hoy la sección 00.
- El runbook dice en una nota que `bridge.store` no existía en una versión del plugin; se verificará con
  `bridge.info()` y, si falta, el avance se guardará en `pluginData` de la página nueva.

Lote 1, componentes (con variantes): AppSidebar (expandido / colapsado, grupo abierto / cerrado, ítem activo
con pill Turquesa sólida + `text/on-action`, contador neutral / warning / danger / 99+, módulo bloqueado con
candado), selector de organización/company, DataTable, KanbanColumn + KanbanCard, StatCard, estado vacío
(reutilizar StatusMessage/bt-empty si existe), FilterBar, panel lateral de detalle (drawer wide), CommandPalette.

Lote 2, página "B2B · Gestión" con 3 tableros (Colorido canónico, Claro y Oscuro como copias con btreg/btregen2),
filas = pantalla (Desktop arriba, Móvil abajo), columnas = estados (normal, carga, vacío, error, sin permiso,
módulo bloqueado, éxito). Pantallas: Acceso (login / registro de empresa), Inicio, Agencia (CRM kanban, Clientes,
Cotizaciones y ventas, Catálogo, Comisiones, Bandeja 3 columnas WhatsApp + Instagram), Operador (Inicio,
Inventario con instancias y cupos, Manifiesto, Distribución/AgencyLinks, Planificación mínima, Flota, Finanzas),
Común (Perfil de empresa con companies, Equipo y permisos, Documentos con validación IA, Notificaciones,
Mi vista), Plataforma (Revisión de tours, Organizaciones y módulos).

Cierre: `btvis.audit` = 0 en canónicos y copias.
