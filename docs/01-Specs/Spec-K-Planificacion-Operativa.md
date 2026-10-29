---
tags: [spec, planificacion, operativa, b2b, calendario, proveedores, contingencia, guia]
created: 2026-07-05
updated: 2026-07-05
status: requisitos-listos
kiro-spec: .kiro/specs/operational-planning-module/requirements.md
---

# 📋 Spec K — Planificación Operativa

> Reubicación canónica del `operational-planning-module`. Provee planificación, programación,
> contingencia, alistamiento y cierre para OPERATOR_COORD, COORD (interno) y OPERATOR_ADMIN,
> más el panel personal del OPERATOR_GUIDE. Vive en **App 3 (B2B Operadores)** + App 4 (guía).
>
> Complementa Spec-I (radar tiempo real) y Spec-J (ejecución en campo) cubriendo el gap de
> **planificación upstream** y **cierre downstream**.
>
> La fuente verbatim de trabajo está en `.kiro/specs/operational-planning-module/requirements.md`.
> Este documento es la referencia canónica dentro de `docs/01-Specs` con códigos RF.

---

## Glosario

- **Calendario_Planificación**: grilla que muestra asignaciones de recursos (guías, conductores, vehículos) por día/semana/mes con indicadores de disponibilidad.
- **Calendario_Personal**: vista del propio OPERATOR_GUIDE con solo sus tours asignados.
- **Recurso**: humano (guía, conductor) o activo (vehículo) requerido para ejecutar una instancia de tour.
- **Proveedor**: prestador externo (restaurante, hospedaje, transporte) autorizado por el operador en una región.
- **Acuerdo_Proveedor**: vínculo proveedor–operador con términos, precios, capacidad y vigencia.
- **Flujo_Contingencia**: proceso estructurado ante interrupciones (guía enfermo, vehículo averiado, clima).
- **Checklist_Alistamiento**: validaciones obligatorias antes de que una instancia se considere lista.
- **Estado_Alistamiento_Tour**: enum (NO_LISTO, PARCIALMENTE_LISTO, LISTO).
- **Cierre_Operativo**: finalización de una instancia completada con reconciliación financiera e incidentes.
- **Región**: agrupación geográfica de ciudades donde el operador ofrece tours.

---

## Requerimientos Funcionales

### K-RF01 — Calendario de Planificación de Guías
**Historia:** Como OPERATOR_COORD, quiero ver todos mis guías en un calendario con sus asignaciones y días libres, para programar sin conflictos y balancear cargas.

- [ ] Grilla semanal/mensual con guías activos como filas y tours como bloques coloreados por día
- [ ] Cada bloque muestra nombre del tour, hora de salida y estado de la instancia
- [ ] Celda sin asignación = indicador "disponible" (fondo verde)
- [ ] Clic en fila del guía → panel de detalle (cronograma, total de tours del mes, días de descanso, promedio/semana)
- [ ] Clic en día disponible → asignación rápida listando instancias sin asignar de esa fecha
- [ ] Vista mensual: badges por guía (días asignados, días libres, indicador de carga)
- [ ] Alerta de fatiga si el guía tiene >6 días consecutivos asignados

### K-RF02 — Calendario de Planificación de Conductores
**Historia:** Como OPERATOR_COORD, quiero ver mis conductores en calendario con asignaciones y días libres, para planificar rutas y asegurar disponibilidad.

- [ ] Grilla con conductores activos como filas y asignaciones como bloques coloreados
- [ ] Cada bloque muestra nombre del tour, placa del vehículo, hora de salida y retorno estimado
- [ ] Clic en fila → resumen mensual (viajes, km estimados, historial de vehículos, días de descanso)
- [ ] Celda libre = asignación rápida disponible
- [ ] Alerta de seguridad si el conductor supera 10h de conducción estimada en un día

### K-RF03 — Calendario Unificado de Operaciones
**Historia:** Como OPERATOR_COORD o COORD, quiero una vista única de todos los tours con filtros, para ver el panorama operativo y detectar gaps o conflictos.

- [ ] Todas las instancias del operador (o de todos, para COORD/GERENTE) en vista día/semana/mes
- [ ] Filtros simultáneos: conductor, guía, vehículo, región, ciudad, tour y estado de alistamiento
- [ ] Al filtrar: actualización inmediata preservando el rango de tiempo
- [ ] Múltiples filtros = lógica AND
- [ ] Hover sobre bloque = tooltip (tour, pax, guía, conductor, vehículo, estado de alistamiento)
- [ ] COORD interno: filtro adicional por operador
- [ ] Vista de día: línea de tiempo por hora de salida agrupada por región

### K-RF04 — Gestión de Disponibilidad de Recursos
**Historia:** Como OPERATOR_COORD, quiero marcar días libres/vacaciones/incapacidades de guías y conductores, para que el calendario refleje la disponibilidad real.

- [ ] Panel por recurso para marcar fechas no disponibles con razón (VACACIONES, INCAPACIDAD, PERSONAL, CAPACITACION)
- [ ] Fecha no disponible → el recurso no aparece en la lista de asignables ese día
- [ ] Intento de asignar en fecha bloqueada → bloqueo + muestra la razón
- [ ] Marcado masivo por rango de fechas
- [ ] Si se marca no disponible con tour ya asignado → alerta de conflicto y solicita reasignar
- [ ] Si la indisponibilidad genera instancias sin asignar en 7 días → notificación urgente al COORD

### K-RF05 — Gestión de Proveedores y Vendors por Región
**Historia:** Como OPERATOR_ADMIN, quiero un directorio de proveedores autorizados por región, para que coordinadores y guías sepan qué vendors usar.

- [ ] Crear proveedor: nombre comercial, contacto, teléfono, email, dirección, región, ciudad, categoría (RESTAURANTE, HOSPEDAJE, TRANSPORTE, ACTIVIDAD, OTRO), capacidad
- [ ] Asociar proveedor a una o más regiones
- [ ] Registrar Acuerdo_Proveedor: precio (por persona/grupal/paquete), vigencia, capacidad máxima, términos de pago (PREPAGADO, POST_TOUR, LIQUIDACION_MENSUAL), instrucciones especiales
- [ ] En la instancia de tour: panel "Proveedores Regionales" filtrado por categorías relevantes
- [ ] Acuerdo que expira en <30 días → recordatorio de renovación al OPERATOR_ADMIN
- [ ] Directorio buscable: filtros por región, ciudad, categoría, estado del acuerdo
- [ ] Info de proveedor + términos disponibles a la App 4 para "Notificar Llegada" (Spec-J RF-J05)

### K-RF06 — Contingencia: Reemplazo de Guía
**Historia:** Como OPERATOR_COORD, quiero un proceso estructurado para reemplazar un guía que no puede asistir, para que el tour opere y todos sean notificados.

- [ ] Lista de guías disponibles para la fecha (excluye conflictos e indisponibles)
- [ ] Al confirmar reemplazo: actualiza asignación, notifica al guía original y al de reemplazo, registra en log de incidentes (Spec-G RF-G08)
- [ ] Requiere razón (ENFERMEDAD, EMERGENCIA, RENDIMIENTO, SOLICITADO_POR_GUIA, OTRO)
- [ ] Sin guía disponible → escala al OPERATOR_ADMIN con opciones (cancelar, fusionar, freelance externo)
- [ ] Reemplazo a <24h de la salida → marcado URGENTE + push al OPERATOR_ADMIN y COORD
- [ ] Rastro de auditoría completo (quién, razón, original, reemplazo, timestamp, entrega de notificaciones)

### K-RF07 — Contingencia: Reemplazo de Vehículo por Avería
**Historia:** Como OPERATOR_COORD, quiero reemplazar un vehículo averiado, para que los tours no se cancelen por transporte.

- [ ] Lista de vehículos disponibles con capacidad ≥ pax confirmados
- [ ] Al seleccionar: valida capacidad, actualiza asignación, notifica al conductor, registra incidente
- [ ] Requiere razón (FALLA_MECANICA, ACCIDENTE, DOCUMENTOS_VENCIDOS, NO_DISPONIBLE, OTRO) + evidencia opcional (S3)
- [ ] Sin vehículo propio disponible → lista proveedores de transporte de la región (K-RF05) con capacidad y contacto
- [ ] Vehículo marcado en avería → revisa instancias futuras con ese vehículo en 7 días y las señala para reasignación

### K-RF08 — Contingencia: Clima y Eventos Externos
**Historia:** Como OPERATOR_COORD, quiero gestionar aplazamientos por clima/eventos sin cancelar de inmediato, para reprogramar pasajeros.

- [ ] Opciones: APLAZAR (nueva fecha), CANCELAR_CON_COINS (fuerza mayor Spec-I RF-I17) o FUSIONAR
- [ ] APLAZAR: requiere nueva fecha objetivo y verifica disponibilidad del mismo guía, conductor y vehículo
- [ ] Al confirmar APLAZAR: notifica a todos los pasajeros (B2C email/push; agencia vía operador) con nueva fecha; permiten aceptar o pedir reembolso
- [ ] Si un pasajero rechaza en 48h → inicia cancelación según políticas del operador (Coins para B2C)
- [ ] FUSIONAR: muestra otras instancias del mismo tour en rango configurable (default 7 días) con capacidad
- [ ] Registra el aplazamiento (tipo CLIMA/BLOQUEO_VIAL/ORDEN_PUBLICO/DESASTRE_NATURAL, descripción, evidencia, pax afectados, resolución)

### K-RF09 — Checklist de Alistamiento Pre-Tour
**Historia:** Como OPERATOR_COORD, quiero un checklist por instancia mostrando qué está completo y qué falta, para asegurar los requisitos operativos antes de la salida.

- [ ] Calcula Estado_Alistamiento_Tour con ítems obligatorios: guía asignado, conductor asignado, vehículo asignado, docs del vehículo vigentes (SOAT), seguro médico registrado, manifiesto con ≥1 pax confirmado
- [ ] Todos completos → LISTO
- [ ] Algunos completos → PARCIALMENTE_LISTO + lista de faltantes
- [ ] Ninguno → NO_LISTO
- [ ] A 48h sin LISTO → alerta al OPERATOR_COORD con faltantes
- [ ] A 24h sin LISTO → escala al OPERATOR_ADMIN + badge crítico en Calendario Unificado
- [ ] Visible en detalle de instancia como indicador completados/total
- [ ] Ítems opcionales configurables (pre-notificación proveedor, mensaje de bienvenida, equipo especial): no bloquean el estado pero registran cumplimiento

### K-RF10 — Cierre Operativo Post-Tour
**Historia:** Como OPERATOR_COORD, quiero un cierre post-tour que reconcilie campo vs plan, para identificar problemas, cerrar finanzas y capturar aprendizajes.

- [ ] Al pasar la instancia a TERMINADO (App 4): crea registro de cierre agregando pax real (check-ins), no-shows, gastos de campo, incidentes y desviación de tiempo
- [ ] Calcula resumen financiero: ingreso esperado, ingreso real, penalidades no-show, gastos de campo, resultado operativo neto
- [ ] Dashboard de cierre con comparación planeado vs real lado a lado
- [ ] Si el guía reportó efectivo sobrante del anticipo → señala discrepancia para OPERATOR_ADMIN
- [ ] Si gastos de campo exceden el anticipo en >20% → señala para revisión financiera
- [ ] Permite nota de cierre con observaciones y sugerencias
- [ ] Marcar CERRADA bloquea ediciones futuras

### K-RF11 — Dashboard de Reportes Operativos
**Historia:** Como OPERATOR_ADMIN o GERENTE, quiero reportes agregados de rendimiento, para decidir sobre asignación de recursos con datos.

- [ ] Dashboard con rango de fechas: utilización de guías, utilización de vehículos, no-show promedio, frecuencia de incidentes por tipo, tiempo promedio de alistamiento
- [ ] Tarjeta de rendimiento por guía (tours completados, calificación promedio, no-shows asignados, completación a tiempo, gastos gestionados)
- [ ] Detalle por vehículo (viajes, km estimados, incidentes de mantenimiento, vencimientos próximos, pax promedio)
- [ ] Desglose regional (ingresos, pax, incidentes, uso de proveedores)
- [ ] GERENTE interno: agrega datos de todos los operadores con filtros por operador/región/fecha
- [ ] Exportar CSV o PDF con filtros aplicados

### K-RF12 — Regiones Configurables por Operador
**Historia:** Como OPERATOR_ADMIN, quiero definir las regiones donde opero, para organizar proveedores, recursos y tours geográficamente.

- [ ] Crear región: nombre, descripción, ciudades incluidas, límite geográfico opcional (polígono)
- [ ] Tour creado/editado requiere asociación a una región del operador
- [ ] Proveedor creado requiere asociación a ≥1 región del operador
- [ ] Todos los recursos, proveedores y tours vinculados a ≥1 región para filtrado en el Calendario Unificado
- [ ] COORD interno: filtro por taxonomía regional unificada gestionada por SUPER_ADMIN

### K-RF13 — Notas e Instrucciones Operativas por Instancia
**Historia:** Como OPERATOR_COORD, quiero adjuntar notas específicas a una instancia, para que el guía reciba todo el contexto antes del tour.

- [ ] Nota operativa se incluye en el briefing pre-tour del guía en App 4
- [ ] Categorías: CAMBIO_RECOGIDA, NECESIDADES_ESPECIALES, AVISO_CLIMA, CLIENTE_VIP, INSTRUCCIONES_PROVEEDOR, GENERAL
- [ ] Nota CAMBIO_RECOGIDA o NECESIDADES_ESPECIALES a <24h → push inmediato a guía y conductor
- [ ] Panel de briefing consolidado en el detalle de la instancia
- [ ] Notas incluidas en los datos sincronizados offline de la App 4

### K-RF14 — Operaciones en Lote y Programación Masiva
**Historia:** Como OPERATOR_COORD, quiero operaciones masivas de programación, para planificar patrones recurrentes eficientemente.

- [ ] Selección múltiple de instancias → acciones masivas (asignar guía/conductor/vehículo, agregar nota)
- [ ] Asignación masiva valida cada instancia y reporta éxitos y fallos con razones
- [ ] Función "copiar semana" que replica asignaciones a la semana siguiente
- [ ] Conflicto en una instancia (doble reserva/indisponibilidad) → la salta y la reporta sin bloquear las válidas

### K-RF15 — Panel del Guía: Calendario Personal, Detalle de Tour y Chat
**Historia:** Como OPERATOR_GUIDE, quiero mi calendario con tours (pasados, en progreso, próximos), el detalle del tour activo con el equipo asignado y acceso al chat, para prepararme y coordinar.

- [ ] Calendario_Personal (semanal/mensual) solo con tours del guía, bloques por estado: PROGRAMADO (azul), EN_PROGRESO (verde), COMPLETADO (gris), CANCELADO (rojo)
- [ ] Cada bloque: nombre del tour, hora de salida, región/ciudad, pax confirmados
- [ ] Pestaña "Historial": lista paginada de tours completados (tour, fecha, pax, calificación, estado de cierre)
- [ ] Tour EN_PROGRESO destacado arriba con badge "Tour Activo" + acceso directo
- [ ] Detalle del tour: fecha/hora, punto de encuentro, itinerario/estaciones, lista de pasajeros, notas operativas (K-RF13), estado de alistamiento
- [ ] Panel "Equipo Operativo": conductor (nombre, teléfono), vehículo (placa, tipo), OPERATOR_COORD responsable, proveedores regionales
- [ ] Botón de acceso al chat tripartito de la instancia (Spec-J)
- [ ] Tour a <24h → badge "Próximo" con countdown y resumen rápido
- [ ] Sin tours en 7 días → estado vacío amigable
- [ ] Sincronización offline (detalle, pasajeros, notas, equipo, contactos de proveedores)
- [ ] Cambio de estado del tour → push inmediato + actualización en tiempo real
- [ ] Filtros por estado y rango de fechas

---

## Modelo de datos

✅ **Definido en [[../03-Knowledge/Modelo-Datos-Core]] §40–48.** Tablas canónicas:

| Tabla | Propósito | Nota de diseño |
|---|---|---|
| `Regions` (§40) | Taxonomía global (SUPER_ADMIN) + regiones de operación | `Tours.region_id` indica dónde se opera el tour |
| `OperatorRegions` (§41) | M2M: regiones donde vende cada operador | Un operador opera en varias regiones |
| `Providers` (§42) | Proveedores **compartidos** entre operadores | No pertenecen a un solo operador |
| `ProviderRegions` (§43) | M2M: regiones que cubre un proveedor | — |
| `ProviderAgreements` (§44) | Acuerdo proveedor ↔ operador | Cada operador tiene su propio acuerdo con el proveedor compartido |
| `ResourceUnavailability` (§45) | Días no disponibles de guías/conductores | Vehículos NO: su disponibilidad va atada al conductor o proveedor de transporte |
| `ReadinessChecklistItems` (§46) | Ítems de alistamiento por instancia | Obligatorios fijos del sistema + opcionales configurables |
| `OperationalClosure` (§47) | Cierre operativo post-tour | Una fila por instancia |
| `TourInstanceNotes` (§48) | Notas operativas por instancia | Alimentan el briefing del guía (K-RF13) |

> El calendario de planificación (K-RF01–04) reutiliza `TourInstances` (con `assigned_guide_id`,
> `assigned_driver_id`, `assigned_vehicle_id`) cruzado con `ResourceUnavailability`. El panel del
> guía (K-RF15) reutiliza `TourInstances`, `ManifestCheckins`, `TourInstanceNotes` y el chat de Spec-J.

---

## Trazabilidad
- Requerimiento de negocio: BR-29 (ver [[../03-Knowledge/Trazabilidad-Requerimientos]])
- Relacionado: Spec-G (ERP operativo), Spec-I (radar B2B), Spec-J (app móvil de campo)

## Links relacionados
- [[Spec-G-ERP-Operativo]]
- [[Spec-I-B2B-Portal-Operadores]]
- [[Spec-J-BorondoTours-App-Movil]]
- [[../03-Knowledge/Modelo-Datos-Core]]
- [[../03-Knowledge/Trazabilidad-Requerimientos]]
