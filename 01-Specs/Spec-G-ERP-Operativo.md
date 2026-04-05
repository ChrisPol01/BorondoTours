---
tags: [spec, erp, operativo, coordinacion, guias, incidentes]
created: 2025-07-14
updated: 2025-07-14
status: fase-2
kiro-spec: .kiro/specs/flujo-g-erp-operativo.md
---

# 📋 Spec G — ERP Operativo (Backoffice Interno y Portal Operador)

> Módulo interno para gestión de tours, asignación de recursos y coordinación de operaciones en campo. No visible para el cliente final.

---

## 1. Objetivos de negocio

- Eliminar el WhatsApp grupal como herramienta de coordinación operativa
- Dar a operadores externos visibilidad sobre sus tours y liquidaciones
- Registrar incidentes para que cualquier coordinador tenga contexto histórico
- Gestionar comisiones variables por operador de forma transparente

---

## 2. Gestión de tours (OPERATOR_ADMIN / AGENT)

### RF-G01 — Crear y editar tours
**Criterios de aceptación:**
- [ ] Formulario con: nombre, descripción, fotos (S3), video URL, precio base, categoría, ciudad, coordenadas (lat/lng), capacidad máxima, regla de pax (edad o estatura), add-ons disponibles
- [ ] Campo `operator_id` para asociar el tour a un operador externo o a BorondoTours
- [ ] Campo `commission_rate` (porcentaje que retiene BorondoTours — configurable por tour)
- [ ] Campo `reservation_percentage` (% que paga el cliente al reservar en Split Fare)
- [ ] Publicar / despublicar tour (sin eliminar — soft delete)
- [ ] Duplicar tour para crear variantes similares

### RF-G02 — Gestión de instancias de tour (fechas)
**Criterios de aceptación:**
- [ ] Por cada tour, crear instancias con: fecha, hora de salida, cupos disponibles, precio override (opcional)
- [ ] Vista de calendario mensual con las instancias programadas
- [ ] Bloquear fechas manualmente (ej. festivos, mantenimiento)
- [ ] Bulk create: generar instancias recurrentes (ej. todos los sábados de agosto)

---

## 3. Asignación de recursos (COORD / OPERATOR_COORD)

### RF-G03 — Asignar guía a instancia de tour
**Criterios de aceptación:**
- [ ] Lista de guías disponibles filtrada por fecha (sin conflicto de horario)
- [ ] Asignar 1 o más guías a una instancia
- [ ] El guía asignado recibe notificación push/email con los detalles del tour
- [ ] Historial de asignaciones por guía (para calcular pagos futuros)

### RF-G04 — Asignar transporte
**Criterios de aceptación:**
- [ ] Catálogo de vehículos: placa, capacidad, tipo, proveedor de transporte
- [ ] Asignar vehículo a instancia de tour
- [ ] Adjuntar documentos del vehículo: SOAT (S3 bucket privado), tarjeta de propiedad
- [ ] Alerta automática si el SOAT del vehículo vence en los próximos 30 días

### RF-G05 — Seguros médicos
**Criterios de aceptación:**
- [ ] Registrar seguro médico por instancia de tour (proveedor, número de póliza, cobertura)
- [ ] El voucher del cliente incluye el número de póliza del seguro
- [ ] Adjuntar PDF del seguro al tour en S3

---

## 4. Modelo de comisiones (SUPER_ADMIN)

### RF-G06 — Configuración de comisión por operador
**Criterios de aceptación:**
- [ ] Tabla `OperatorContracts` con `operator_id`, `commission_rate` (%), `effective_from`, `effective_until`
- [ ] El `commission_rate` se toma del contrato vigente al momento de la venta, no del actual
- [ ] Historial inmutable de contratos (no se editan, se crean nuevos con nueva vigencia)
- [ ] El operador puede ver su tasa vigente en su portal pero no puede editarla

### RF-G07 — Registro de liquidaciones (OperatorPayouts)
**Criterios de aceptación:**
- [ ] Por cada booking `CONFIRMED`, se calcula automáticamente:
  - `operator_amount = total × (1 - commission_rate)`
  - `borondo_amount = total × commission_rate`
- [ ] Se crea registro en `OperatorPayouts` en estado `PENDING`
- [ ] El coordinador marca el pago como `PAID` cuando transfiere al operador
- [ ] El operador ve en su portal el historial de liquidaciones (pendientes y pagadas)
- [ ] Reporte exportable: liquidaciones por operador por período (CSV)

---

## 5. Gestión de incidentes (COORD)

### RF-G08 — Log de cambios e incidentes por instancia
**Contexto:** El cliente NO ve esto. Es información interna para que cualquier coordinador tenga contexto. No es una alerta pública, es un registro de auditoría operativa.

**Criterios de aceptación:**
- [ ] En la vista de una instancia de tour, sección "Log de cambios"
- [ ] Cualquier coordinador puede añadir una entrada: tipo de incidente + descripción + resolución
- [ ] Tipos de incidente: `CLIMA`, `GUIA_ENFERMO`, `TRANSPORTE_VARADO`, `BLOQUEO_SOCIAL`, `OTRO`
- [ ] Al crear un incidente, campo opcional "Acción tomada" (ej. "Se reemplazó guía por Juan García")
- [ ] Campo "Resuelto en" (timestamp de resolución)
- [ ] El log es inmutable (solo append, no se edita ni borra)
- [ ] El operador del tour recibe notificación interna cuando se crea un incidente en sus tours

### RF-G09 — Alertas de urgencia internas
**Criterios de aceptación:**
- [ ] El coordinador puede marcar un incidente como `URGENTE`
- [ ] Los incidentes urgentes aparecen en el dashboard del coordinador con badge rojo
- [ ] Notificación push/email a todos los `COORD` y `SUPER_ADMIN` activos
- [ ] El radar de operaciones (Fase 3) consume estos eventos para mostrar alertas en el mapa

---

## 6. Portal del operador externo (OPERATOR_ADMIN / OPERATOR_COORD)

### RF-G10 — Vista limitada del operador
> ℹ️ **Nota:** Esta sección describe la vista mínima del operador disponible en la Fase 1. El portal completo del operador (App 3 B2B) está especificado en Spec-I con 5 roles `OPERATOR_*` y 17 secciones. Spec-G solo cubre las interacciones del operador con el ERP interno de BorondoTours.

**Criterios de aceptación:**
- [ ] El operador (`OPERATOR_ADMIN`) puede ver SOLO sus propios tours y reservas
- [ ] No puede ver tours ni datos de otros operadores (tenant isolation por `operator_id`)
- [ ] Puede ver: instancias programadas, cupos disponibles, reservas confirmadas (sin datos personales de clientes — solo count y nombres)
- [ ] Puede ver: liquidaciones pendientes y pagadas
- [ ] Puede editar: descripción, fotos y precio de sus tours (genera `TourEditRequest` — requiere aprobación de BorondoTours antes de publicar)
- [ ] No puede editar: `commission_rate`, fechas bloqueadas por BorondoTours

---

## 7. API endpoints (internos — requieren JWT + rol)

```
POST /api/v1/erp/tours                        → crear tour (AGENT, OPERATOR_ADMIN)
PATCH /api/v1/erp/tours/:id                   → editar tour
POST /api/v1/erp/tours/:id/instances          → crear instancias
POST /api/v1/erp/instances/:id/assign-guide   → asignar guía (COORD)
POST /api/v1/erp/instances/:id/assign-vehicle → asignar vehículo (COORD)
GET  /api/v1/erp/operator/:id/payouts         → liquidaciones del operador
POST /api/v1/erp/payouts/:id/mark-paid        → marcar liquidación pagada (SUPER_ADMIN)
POST /api/v1/erp/instances/:id/incidents      → crear incidente (COORD)
GET  /api/v1/erp/instances/:id/incidents      → log de incidentes
```

---

## 8. Modelo de datos

```
OperatorContracts
  - id: uuid
  - operator_id: uuid FK
  - commission_rate: decimal
  - reservation_percentage: decimal   ← % de reserva para Split Fare
  - effective_from: date
  - effective_until: date | null
  - created_by: uuid FK

OperatorPayouts
  - id: uuid
  - booking_id: uuid FK
  - operator_id: uuid FK
  - gross_amount: decimal            ← total pagado por el cliente
  - operator_amount: decimal         ← 100% - commission_rate
  - borondo_amount: decimal          ← commission_rate
  - status: enum (PENDING, PAID)
  - paid_at: timestamp | null
  - paid_by: uuid FK | null

TourIncidents
  - id: uuid
  - tour_instance_id: uuid FK
  - reported_by: uuid FK
  - type: enum (CLIMA, GUIA_ENFERMO, TRANSPORTE_VARADO, BLOQUEO_SOCIAL, OTRO)
  - description: text
  - action_taken: text | null
  - is_urgent: boolean
  - resolved_at: timestamp | null
  - created_at: timestamp            ← inmutable, no UPDATE

Vehicles
  - id: uuid
  - plate: string
  - capacity: integer
  - type: enum (BUS, VAN, JEEP, LANCHA, OTRO)
  - provider_name: string
  - soat_expiry: date
  - soat_s3_key: string | null
```

---

## 9. Dependencias y riesgos

| Dependencia | Tipo | Impacto |
|---|---|---|
| RBAC en NestJS Guards | Backend | Crítico — sin esto el operador ve datos de otros |
| Historial inmutable de contratos | Legal | Alto — si se edita la tasa, se pierde trazabilidad |
| Notificaciones a coordinadores | Infra | Medio — BullMQ + email/push |

---

## Links relacionados
- [[Spec-C-Checkout]]
- [[../02-ADRs/ADR-001-Bold-Split-Marketplace]]
- [[../02-ADRs/ADR-004-Siigo-Facturacion]]
- [[../03-Knowledge/Modelo-Comisiones]]
