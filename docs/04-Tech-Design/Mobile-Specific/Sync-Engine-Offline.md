---
tags: [tech-design, mobile, offline, sync, watermelondb, conflictos, guia]
created: 2026-07-14
updated: 2026-07-14
status: aprobado
fase: 3
---

# Sync Engine Offline — App Móvil del Guía (Fase 3)

> La app del guía (React Native + Expo + WatermelonDB) debe operar SIN señal
> en páramos/selva. Este documento define qué se pre-descarga, cómo se resuelven
> conflictos, qué operaciones son offline, y cómo se cifran los datos sensibles.

---

## 1. Arquitectura de sincronización

```
[Con señal — antes del tour]
   Servidor (RDS) ──pull──▶ WatermelonDB local (cifrada)
   Pre-descarga: manifiesto del día + pax + datos del tour actual/cercano

[Sin señal — durante el tour]
   Guía opera 100% local: check-in, gastos, estados, incidentes
   Cada cambio se registra en un OUTBOX local con timestamp + device_id

[Recupera señal]
   Outbox local ──push──▶ Servidor (SQS → Lambda)
   Servidor resuelve conflictos (LWW + verificación) ──pull──▶ actualiza local
   Sync automático al detectar señal + botón manual "Sincronizar cambios"
```

---

## 2. Pre-descarga por módulo (M1)

Se carga según el rol/módulo que inició sesión, priorizando el tour actual/cercano:

| Rol | Datos pre-descargados |
|-----|----------------------|
| OPERATOR_GUIDE | Manifiesto del tour del día (pax, documentos, contacto emergencia, condiciones médicas, punto de recogida), datos del tour, checklist operativo |
| OPERATOR_DRIVER | Ruta asignada, vehículo, lista de pax, puntos de recogida |

Regla: **prioridad al tour más cercano en el tiempo**. Si hay varios tours el mismo día, se cargan todos los del día. Tours de días futuros: solo si hay señal (no se pre-cargan masivamente).

---

## 3. Resolución de conflictos (M2) — LWW + verificación

**Base:** Last-Write-Wins por `timestamp` del cambio (gana el más reciente). Pero para campos
**críticos** (estado operativo, financiero) se añade una capa de verificación para no perder datos.

### Modelo de cada operación en el outbox

```typescript
interface SyncOperation {
  entity: string;          // 'ManifestCheckin', 'FieldExpense', etc.
  entity_id: string;
  field: string;           // campo modificado
  new_value: any;
  client_timestamp: string; // hora del dispositivo (UTC)
  device_id: string;
  sync_id: string;          // UUID para idempotencia (deduplicación)
}
```

### Reglas de conflicto

| Tipo de campo | Regla |
|---------------|-------|
| No crítico (notas, foto de recibo) | **LWW puro** — gana el timestamp más reciente |
| **Crítico** (operational_status: ASSISTED vs NO_ASSISTED) | LWW + **flag de verificación**: si dos fuentes cambiaron el mismo campo dentro de una ventana (ej: 10 min), se aplica el más reciente PERO se marca `needs_review=true` para que el COORD lo valide |
| Financiero (gastos de caja menor) | Nunca se sobrescribe: cada gasto es un registro nuevo con `sync_id` (no hay conflicto, son inserts) |

> **Ejemplo (tu caso M2):** guía marca ASSISTED offline 8:00am; COORD marca NO_ASSISTED 8:05am.
> Al sincronizar 10am: gana NO_ASSISTED (más reciente por timestamp) PERO se marca `needs_review=true`
> → el COORD recibe alerta para confirmar cuál es correcto. Así aseguras que "cada estado fue verificado nuevamente".

**Idempotencia:** cada operación tiene un `sync_id` único. Si el sync se reintenta (señal intermitente),
el servidor descarta operaciones con `sync_id` ya procesado (no duplica check-ins ni gastos).

---

## 4. Operaciones offline del guía (M3 — análisis QA)

Como QA, estos son los casos que el guía enfrenta sin señal y las acciones que debe poder hacer:

| # | Caso | Acción offline | Al sincronizar |
|---|------|----------------|----------------|
| 1 | Pasajero llega al punto de encuentro | Check-in QR / manual → `ASSISTED` | Push del estado + timestamp |
| 2 | Pasajero no se presenta | Marcar `NO_ASSISTED` (No Show) | Dispara `penalized=true` en servidor |
| 3 | Pasajero llega tarde | Marcar `LATE` (variante de check-in) | Registro con hora real |
| 4 | Inicia el tour | Marcar `IN_TOUR` | Timestamp de inicio |
| 5 | Gasto de campo (entrada, comida, propina) | Registrar `FieldExpense` + foto del recibo (guardada local) | Insert + upload de foto a S3 |
| 6 | Incidente (accidente, retraso, clima) | Registrar `TourIncident` + fotos + severidad | Insert + alerta al COORD (urgente) |
| 7 | Cierra el tour | Marcar `TOUR_COMPLETED` | Timestamp de cierre + dispara reseñas |
| 8 | Cancelación en sitio (fuerza mayor operador) | `TOUR_CANCELLED_ONSITE` + evidencia (foto, motivo, firma) | Alerta ERP + flujo reembolso/reprogramación |
| 9 | Pasajero adicional no registrado se presenta | Registrar nota (no puede cobrar offline) | COORD valida al sincronizar |
| 10 | Consultar datos médicos/contacto emergencia de un pax | Lectura local (ya pre-descargada) | N/A (solo lectura) |

**Regla QA:** toda acción offline genera un registro en el outbox con `sync_id`, `timestamp`, `device_id`.
Ninguna acción offline mueve dinero (los gastos se registran pero se aprueban al sincronizar).

---

## 5. Sync automático + manual (M4)

- **Automático:** un listener de conectividad (NetInfo de Expo) detecta señal → dispara sync del outbox.
- **Manual:** botón "Sincronizar cambios" visible siempre, muestra cuántas operaciones pendientes hay.
- **Indicador visual:** badge con nº de cambios sin sincronizar + estado ("Todo sincronizado" / "3 pendientes").
- **Reintentos:** si el sync falla a mitad, las operaciones no confirmadas quedan en el outbox y se reintentan.

---

## 6. Cifrado de datos sensibles en el dispositivo (M5)

**Tu pregunta:** ¿cuál es el costo? ¿el dispositivo cifra o el servidor cifra antes?

**Respuesta y recomendación:**

El **dispositivo cifra localmente** la base WatermelonDB usando **SQLCipher** (SQLite con cifrado AES-256 nativo). El servidor no puede "pre-cifrar" la BD local porque el dispositivo necesita leer/escribir esos datos offline (necesita la llave). El flujo correcto:

```
1. Transmisión servidor → dispositivo: cifrada en tránsito (TLS 1.3) — ya lo tienes
2. Almacenamiento en el dispositivo: cifrado en reposo con SQLCipher (AES-256)
   - La llave de cifrado se guarda en el almacenamiento seguro del OS:
     iOS Keychain / Android Keystore (respaldado por hardware)
3. Los datos permanecen cifrados en reposo SIEMPRE, desde antes de iniciar el tour
4. Al terminar el tour + sincronizar: se purgan los datos PII locales del dispositivo
```

**Costo:**
- **SQLCipher es gratis** (open source). Overhead de CPU: ~5-15% en lectura/escritura — imperceptible para el volumen de un manifiesto (decenas de registros).
- Cero costo de infraestructura AWS (el cifrado es 100% en el dispositivo).
- No requiere que el servidor haga trabajo adicional de cifrado.

**Retención (cumplimiento Ley 1581 + steering 07):**
- Datos PII (documentos, teléfonos, condiciones médicas) se **borran del dispositivo** al completar el tour + sincronizar (política: condiciones médicas se eliminan 30 días post-tour en el servidor; en el dispositivo, inmediatamente tras sync).
- La llave rota si el guía cierra sesión o se desvincula el dispositivo.

---

## 7. GPS del conductor offline (M6)

- Sin señal: los pings de ubicación (cada 30s) se **acumulan localmente** en una cola.
- Al recuperar señal: se envían **en lote** (batch) al servidor con sus timestamps originales.
- No se pierden datos de ruta (importante para el radar de operaciones y auditoría).
- Se descartan pings redundantes (si el vehículo estuvo quieto) para reducir el volumen del batch.

---

## 8. Tests obligatorios

```typescript
describe('SyncEngine', () => {
  it('pre-descarga solo el manifiesto del día del guía');
  it('registra operaciones offline en el outbox con sync_id único');
  it('deduplica operaciones con sync_id ya procesado (idempotencia)');
  it('LWW: gana el timestamp más reciente en campos no críticos');
  it('conflicto crítico (ASSISTED vs NO_ASSISTED) → aplica LWW + needs_review=true');
  it('gastos de campo son inserts, nunca sobrescritura (sin conflicto)');
  it('sincroniza automáticamente al detectar señal');
  it('GPS offline: acumula pings y envía en lote al recuperar señal');
  it('BD local cifrada con SQLCipher (AES-256)');
  it('purga PII del dispositivo al completar tour + sync');
});
```

---

## Links relacionados
- [[../Services/Maquina-Estados-Booking]] — operational_status (ASSISTED, IN_TOUR, etc.)
- [[../../01-Specs/Spec-J-BorondoTours-App-Movil]] — RF-J02/J09 (offline, sync)
- [[../../03-Knowledge/Politica-Datos-Personales]] — retención PII, Ley 1581
- [[../../02-ADRs/ADR-011-Arquitectura-Consolidada]] — WatermelonDB, mobile
