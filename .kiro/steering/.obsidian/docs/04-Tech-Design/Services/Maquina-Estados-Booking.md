---
tags: [tech-design, booking, maquina-estados, state-machine, pagos, chargeback, reprogramacion]
created: 2026-07-14
updated: 2026-07-14
status: aprobado
---

# Máquina de Estados del Booking (Multi-dimensional)

> El Booking NO tiene un solo estado. Tiene **4 dimensiones de estado independientes**
> que evolucionan en paralelo, más flags y una tabla separada de reembolsos.
> Esto evita el anti-patrón del "enum plano" que no puede representar estados simultáneos
> (ej: pagado + asistido + reembolso en revisión al mismo tiempo).

---

## 1. Dimensiones de Estado

| Dimensión | Campo | Responsable de moverla |
|-----------|-------|------------------------|
| Pago | `payment_status` | Webhooks OnePay / confirmación manual (canal directo) |
| Operativa | `operational_status` | Guía (App 4) / OPERATOR_COORD |
| Ciclo de vida | `lifecycle_status` | Cliente / AGENT / COORD (ERP) |
| Dispersión | `payout_status` | Sistema (cron) / COORD (manual) |
| Reembolso | tabla `RefundRequests` | AGENT / COORD / SUPER_ADMIN (ERP) |

Flags adicionales en el booking:
- `penalized: boolean` — true si se aplicó penalidad (ej: No Show)
- `fraud_flag: boolean` — true si hay chargeback sospechoso / patrón de abuso
- `reschedule_count: integer` — número de reprogramaciones (máx 2)
- `payment_channel: enum(GATEWAY, DIRECT)` — pasarela OnePay o transferencia directa (QR/llave)

---

## 2. Dimensión PAGO (payment_status)

```
                    ┌─────────────┐
      checkout ────▶│   IN_PAID   │ (link generado, esperando pago)
                    └──────┬──────┘
          ┌────────────────┼──────────────────┬─────────────────┐
          │                │                  │                 │
   webhook│CONFIRMED  webhook│40% pagado   link venció     banco rechazó
   (100% directo)     (reserva)            (sin pago)      (activo)
          │                │                  │                 │
          ▼                ▼                  ▼                 ▼
   ┌───────────┐    ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
   │ CONFIRMED │    │ PARTIAL_PAID │   │ EXPIRED_PAID │  │PAYMENT_FAILED│
   └─────┬─────┘    └──────┬───────┘   └──────────────┘  └──────────────┘
         │                 │ pagó saldo 60%
         │                 ▼
         │          ┌───────────┐
         │          │ CONFIRMED │
         │          └─────┬─────┘
         │                │
         │  dispersión confirmada (BT + operador)
         ▼                ▼
   ┌──────────────────────────┐
   │        SETTLED           │
   └──────────────────────────┘

   Desde CONFIRMED/SETTLED (pago exitoso) puede llegar:
        └─▶ CHARGEBACK (banco revierte un pago ya cobrado)
```

### Estados de pago (definición)

| Estado | Significado | Disparador |
|--------|-------------|------------|
| `IN_PAID` | Link de pago generado, esperando pago del cliente. Cupo reservado temporalmente. | checkout() |
| `PARTIAL_PAID` | Pagó la reserva (40%), falta el saldo (60%). Aplica a pago individual o grupal. | webhook PAYMENT_CONFIRMED (reserva) |
| `CONFIRMED` | El cliente pagó el 100% y el dinero llegó a la pasarela. Cupo firme. | webhook PAYMENT_CONFIRMED (total) |
| `SETTLED` | La pasarela dispersó: comisión en cuenta BT + monto en cuenta operador. Transacción financiera cerrada. | webhook DISBURSEMENT_COMPLETED / confirmación split |
| `EXPIRED_PAID` | El link venció sin pago. Cupos liberados. Revivible (nuevo link). | cron / webhook LINK_EXPIRED |
| `PAYMENT_FAILED` | El banco rechazó activamente el pago (fondos, tarjeta bloqueada). Puede reintentar. | webhook PAYMENT_DECLINED |
| `CHARGEBACK` | Un pago ya cobrado fue revertido por el banco (disputa del cliente). | webhook CHARGEBACK |

**Reglas clave:**
- Solo puede existir **1 link de pago activo** por booking a la vez (G1). Si expira, se genera uno nuevo.
- Pago directo 100% (≤5 días antes del tour): `IN_PAID → CONFIRMED → SETTLED` (salta PARTIAL_PAID).
- **Distinción clave (link vs fecha de pago):** el **link** de pago puede vencer y regenerarse cuantas veces sea necesario (el cliente siempre puede generar un nuevo enlace para pagar). Lo que es INAMOVIBLE es la **fecha límite de pago del saldo** (`balance_due_date`, definida por `full_payment_days_before` del tour).
- **Antes de la `balance_due_date`:** si el cliente pide reembolso dentro de las fechas permitidas (según ADR-007), el 40% **sí es reembolsable** según la franja de cancelación.
- **Pasada la `balance_due_date` sin pagar el 60%:** aplica penalidad de **no reembolso** — el cliente pierde el 40% ya pagado (Spec-C RF-C06b). El booking pasa a `lifecycle=CANCELED` + `penalized=true`. El 40% retenido se registra como ingreso por penalidad. No hay cargo adicional.
- Reserva (40%) y saldo (60%) tienen fechas/links independientes: la reserva tiene su `expires_at` (para confirmar el cupo); el saldo tiene su `balance_due_date` (fecha límite fiscal del pago total).

---

## 3. Dimensión OPERATIVA (operational_status)

```
   ┌──────────┐  guía valida asistencia   ┌──────────┐
   │ PENDING  │──────────┬────────────────▶│ ASSISTED │
   └──────────┘          │                 └────┬─────┘
   (antes del tour)      │ no se presentó       │ guía inicia tour
                         ▼                      ▼
                  ┌──────────────┐        ┌──────────┐
                  │ NO_ASSISTED  │        │ IN_TOUR  │
                  │ (No Show)    │        └────┬─────┘
                  └──────────────┘             │ guía cierra tour
                                               ▼
                                       ┌────────────────┐
                                       │ TOUR_COMPLETED │
                                       └────────────────┘

   Desde PENDING/ASSISTED (día del tour):
        └─▶ TOUR_CANCELLED_ONSITE (operador cancela en sitio, requiere evidencia)

   Si se cancela el lifecycle:
        operational_status ─▶ CANCELLED (se congela)
```

| Estado | Significado | Quién lo mueve |
|--------|-------------|----------------|
| `PENDING` | Aún no es el día del tour / no ha iniciado | (default) |
| `ASSISTED` | El guía confirmó la asistencia del cliente (check-in QR) | OPERATOR_GUIDE (App 4) o quien tenga permisos en portal operador |
| `NO_ASSISTED` | El cliente no se presentó (No Show). Dispara `penalized=true`, sin reembolso. | OPERATOR_GUIDE |
| `IN_TOUR` | El guía marcó inicio del tour | OPERATOR_GUIDE / OPERATOR_COORD |
| `TOUR_COMPLETED` | El guía cerró el tour. Terminal operativo. | OPERATOR_GUIDE / OPERATOR_COORD |
| `TOUR_CANCELLED_ONSITE` | El operador canceló el tour el mismo día. **Requiere evidencia obligatoria:** motivo escrito + foto + firma del gerente/admin del operador. Penaliza al operador. Activa reprogramación (reembolso vía soporte). | OPERATOR_COORD / OPERATOR_ADMIN |
| `CANCELLED` | El ciclo de vida se canceló → la operativa se detiene. | (automático al cancelar lifecycle) |

---

## 4. Dimensión CICLO DE VIDA (lifecycle_status)

```
   ┌──────────┐
   │  ACTIVE  │
   └────┬─────┘
        ├──────────────▶ CANCELED          (cliente cancela voluntariamente)
        ├──────────────▶ OPERATOR_CANCELLED (operador cancela el tour/instancia)
        └──────────────▶ RESCHEDULED        (reemplazado por nuevo booking en otra fecha)
```

| Estado | Significado | Quién lo mueve |
|--------|-------------|----------------|
| `ACTIVE` | Booking vigente | (default) |
| `CANCELED` | El cliente canceló. Penalidad según ADR-007. RefundRequest solo si aplica. | Cliente / AGENT / COORD (ERP) |
| `OPERATOR_CANCELLED` | El operador canceló. Cliente tiene derecho a reembolso 100% o reprogramación (prioridad: reprogramar). | AGENT / COORD (ERP) tras solicitud del operador |
| `RESCHEDULED` | Este booking fue reemplazado por uno nuevo en otra fecha. Terminal. | Cliente / AGENT |

> **Regla:** El reembolso y la reprogramación **de cara al cliente los gestiona la agencia (ERP)**, nunca el operador directamente. El operador solo dispara la solicitud (ej: "cancelo este tour").

---

## 5. Dimensión DISPERSIÓN (payout_status)

```
   ┌────────┐  cron: X días antes del tour   ┌────────────┐   ┌───────────┐
   │  HELD  │───────────(según contrato)────▶│ SCHEDULED  │──▶│ DISBURSED │
   └────────┘                                 └────────────┘   └───────────┘
        │
        └─▶ PARTIALLY_DISBURSED (si se dispersó solo el 40% y el saldo se canceló)
```

| Estado | Significado |
|--------|-------------|
| `HELD` | Dinero retenido en escrow (protección anti-chargeback) |
| `SCHEDULED` | Dispersión programada (cron la ejecutará X días antes del tour, según contrato del operador) |
| `DISBURSED` | Dinero transferido al operador |
| `PARTIALLY_DISBURSED` | Solo se dispersó el 40% (la pasarela lo dispersó por tiempo máximo) y el saldo se canceló (G8) |

> **Regla confirmada:** Ningún operador acepta dispersión post-tour. Siempre es **X días antes del tour**, configurable por contrato (`payout_days_before`). Esto aumenta el riesgo de chargeback → ver sección 8 (anti-fraude).
> **Canal DIRECT (QR/llave):** la dispersión es **manual** (COORD transfiere desde el banco), no automática por OnePay.

---

## 6. Dimensión REEMBOLSO (tabla RefundRequests — separada)

```
   PENDING_REVIEW ──▶ APPROVED ──▶ IN_PROCESS ──▶ COMPLETED
         │
         └──▶ REJECTED (terminal — booking queda CANCELED sin devolución, G7)
```

| Estado | Significado | Quién lo mueve |
|--------|-------------|----------------|
| `PENDING_REVIEW` | Solicitud creada, espera revisión | Sistema |
| `APPROVED` | Validado (retracto ≤5 días hábiles / fuerza mayor con doc / orden judicial) | COORD / SUPER_ADMIN |
| `REJECTED` | No cumple requisitos. Booking permanece CANCELED sin devolución. | COORD / SUPER_ADMIN |
| `IN_PROCESS` | Reembolso enviado (OnePay API o transferencia manual) | Sistema / COORD |
| `COMPLETED` | Dinero devuelto al cliente + Nota Crédito Siigo | Webhook / COORD |

**Casos que originan un RefundRequest:**
- Derecho de retracto (Ley 1480, ≤5 días hábiles): 100%
- Fuerza mayor del operador (OPERATOR_CANCELLED): 100% (prioridad: reprogramar primero)
- Orden judicial: según sentencia (SUPER_ADMIN manual)
- Chargeback ganado por el cliente: monto del chargeback

> El reembolso vive **fuera** del booking. El booking se CANCELA; si aplica devolución, se crea el RefundRequest vinculado por `booking_id`. La mayoría de cancelaciones NO generan reembolso (penalidad retenida).

---

## 7. Reprogramación (política + lógica)

**Política de negocio (NO hay ley colombiana que obligue reprogramaciones infinitas — es criterio de la agencia):**

- Máximo **2 reprogramaciones** por booking (`reschedule_count` ≤ 2).
- Cada reprogramación requiere **≥5 días de anticipación** a la fecha vigente.
- Al reprogramar: se mantiene el valor pagado. Si la nueva fecha cuesta **más**, se cobra la diferencia (booking nuevo nace en `PARTIAL_PAID` hasta pagar diferencia). Si cuesta **menos**, NO se reembolsa la diferencia.
- El booking nuevo **hereda el `payment_status`** del original (SETTLED / CONFIRMED / PARTIAL_PAID).
- Se puede reprogramar desde: `PARTIAL_PAID`, `CONFIRMED`, `SETTLED` (la reserva sigue activa).
- Al reprogramar se puede **añadir pax** (crea reserva adicional para esa fecha); NO se pueden **eliminar** pax; NO se añaden pax al mismo booking (van como bookings individuales).
- Al llegar al límite (2): se inhabilita el botón "Reprogramar". Una 3ª requiere **soporte técnico con evidencia** que valide el caso.

**Lógica de programación (guard):**
```typescript
function canReschedule(booking, newDate): { allowed: boolean; reason?: string } {
  if (booking.reschedule_count >= 2)
    return { allowed: false, reason: 'MAX_RESCHEDULES_REACHED' }; // requiere soporte
  if (daysBetween(now, booking.tourDate) < 5)
    return { allowed: false, reason: 'TOO_CLOSE_TO_TOUR' };
  if (!['PARTIAL_PAID', 'CONFIRMED', 'SETTLED'].includes(booking.payment_status))
    return { allowed: false, reason: 'INVALID_PAYMENT_STATE' };
  if (!hasAvailability(booking.tourId, newDate))
    return { allowed: false, reason: 'NO_SLOTS_AVAILABLE' };
  return { allowed: true };
}
```

---

## 8. Proceso Anti-Fraude por Chargeback

**Riesgo:** "friendly fraud" — el cliente compra, consume el tour, y luego pide contracargo al banco para recuperar el dinero conservando el servicio. Como la dispersión al operador es pre-tour, BorondoTours queda expuesto.

**Capa preventiva:**
1. **Escrow con dispersión configurable** — retener hasta X días antes según contrato (reduce ventana).
2. **Evidencia de servicio prestado** — check-in QR (`ASSISTED`) + foto/firma en `TOUR_COMPLETED`. Es la prueba ante el banco en una disputa.
3. **KYC ligero** — validar documento del comprador vs pasajero en primera compra.
4. **`fraud_flag`** — usuario con chargeback previo no reconocido queda marcado; solo puede pagar con métodos NO reversibles (PSE, no tarjeta de crédito).

**Capa reactiva (llega el chargeback):**
1. Si `payout_status = HELD` (aún no dispersado): se puede aceptar/absorber sin pérdida directa.
2. Si `payout_status = DISBURSED` (ya se pagó al operador): **NO se acepta como pérdida** — BorondoTours **disputa** el chargeback ante OnePay/banco con la evidencia (check-in, firma, fotos). Si el tour se ejecutó con evidencia, alta probabilidad de ganar.
3. Se descuenta del siguiente payout del operador si la disputa se pierde y el operador ya cobró (tabla `OperatorChargebacks`).

> **Regla (G4/G6):** un chargeback durante `IN_TOUR` no detiene el tour — se ejecuta y se disputa en paralelo. Un chargeback post-`TOUR_COMPLETED` con dispersión hecha → se disputa, no se acepta como pérdida.

---

## 9. Modelo de Fees por Método de Pago (canal + costo)

**Principio:** el costo de la pasarela (fijo o %, según método) NO se mete en el precio del tour;
se muestra en el **total al momento de pagar**, con los métodos SIN costo primero y los de mayor costo después.

| Canal | Método | Costo pasarela | Dispersión |
|-------|--------|----------------|------------|
| GATEWAY | PSE / Nequi / Daviplata | $2,200 + IVA (plana) | Automática (OnePay split) |
| GATEWAY | Tarjeta de crédito | 2.5% + $800 + IVA | Automática (OnePay split) |
| DIRECT | QR / llave por correo | Sin fee de pasarela | **Manual** (COORD desde banco) |

**`fee_display_mode` (configurable — pendiente confirmar con OnePay qué permite el contrato):**
- `SURCHARGE`: el precio del tour es el base; en checkout se suma el costo del método elegido (enfoque preferido del negocio). Métodos sin costo se listan primero.
- `DISCOUNT`: el precio incluye el costo del peor método (TC); se muestra descuento por métodos baratos ("Ahorra pagando con PSE").

> **⚠️ PENDIENTE (reunión OnePay):** confirmar si el contrato de adquirencia permite mostrar el recargo por TC explícitamente (`SURCHARGE`) o exige el modelo `DISCOUNT`. La regla de transparencia de precios (Estatuto del Consumidor) SÍ es obligatoria: el total final debe verse antes de confirmar. El diseño soporta ambos modos vía configuración.

**Canal DIRECT — confirmación manual:** el cliente paga por transferencia y envía el comprobante por WhatsApp/correo. Un `AGENT`/`COORD` valida humanamente y marca el booking como pagado (`payment_status` avanza manualmente). Dispersión al operador manual.

---

## 10. Matriz de Combinaciones Válidas (dimensiones en paralelo)

Ejemplos de combinaciones simultáneas legítimas (demuestran por qué NO puede ser enum plano):

| payment_status | operational_status | lifecycle_status | payout_status | Situación real |
|---|---|---|---|---|
| SETTLED | PENDING | ACTIVE | HELD | Pagó completo, tour futuro, dinero en escrow |
| SETTLED | ASSISTED | ACTIVE | DISBURSED | Cliente en el punto de encuentro, operador ya cobró |
| SETTLED | IN_TOUR | ACTIVE | DISBURSED | Tour en curso |
| SETTLED | ASSISTED | ACTIVE | DISBURSED | + RefundRequest PENDING_REVIEW (pidió reembolso el día del tour) |
| PARTIAL_PAID | PENDING | ACTIVE | HELD | Pagó 40%, esperando saldo, tour futuro |
| CHARGEBACK | TOUR_COMPLETED | ACTIVE | DISBURSED | Tour ya se hizo, llegó chargeback → se disputa |
| CONFIRMED | PENDING | RESCHEDULED | HELD | Reprogramado, este booking reemplazado |
| SETTLED | NO_ASSISTED | ACTIVE | DISBURSED | No Show, penalized=true, operador cobró igual |

**Regla de coherencia (invariantes):**
- `operational_status` solo avanza si `payment_status ∈ {CONFIRMED, SETTLED}` (nadie asiste sin pagar).
- `payout_status = DISBURSED` requiere `payment_status ∈ {CONFIRMED, SETTLED}`.
- `lifecycle=CANCELED/RESCHEDULED` congela `operational_status` (no avanza más).
- `fraud_flag=true` bloquea métodos de pago reversibles (solo PSE).

---

## 11. Resumen de Enums (para Modelo-Datos-Core)

```
payment_status:     IN_PAID | PARTIAL_PAID | CONFIRMED | SETTLED
                    | EXPIRED_PAID | PAYMENT_FAILED | CHARGEBACK
operational_status: PENDING | ASSISTED | NO_ASSISTED | IN_TOUR
                    | TOUR_COMPLETED | TOUR_CANCELLED_ONSITE | CANCELLED
lifecycle_status:   ACTIVE | CANCELED | OPERATOR_CANCELLED | RESCHEDULED
payout_status:      HELD | SCHEDULED | DISBURSED | PARTIALLY_DISBURSED
payment_channel:    GATEWAY | DIRECT
fee_display_mode:   SURCHARGE | DISCOUNT   (config global, pendiente confirmar OnePay)

flags: penalized (bool), fraud_flag (bool), reschedule_count (int 0-2)
fechas: reservation_expires_at (link 40%), balance_due_date (fecha límite pago 60%)

RefundRequests.status: PENDING_REVIEW | APPROVED | REJECTED | IN_PROCESS | COMPLETED
```

> **Acción pendiente:** actualizar `Bookings` en Modelo-Datos-Core (de 1 campo `status` a estos
> 4 campos + flags + fechas), y ampliar `OperatorChargebacks` con estado de disputa.

---

## Links relacionados
- [[Domain-Financiero]] — funciones puras de cálculo (penalidades, split, fees)
- [[../../02-ADRs/ADR-007-Politica-Cancelacion-Escalonada]]
- [[../../02-ADRs/ADR-001-Onepayla-Split-Marketplace]]
- [[../../02-ADRs/ADR-011-Arquitectura-Consolidada]]
- [[../../01-Specs/Spec-C-Checkout]] — RF-C06/C06b (Split Fare, saldo), RF-C09 (reembolso)
- [[../../01-Specs/Spec-I-B2B-Portal-Operadores]] — RF-I17 (cancelación operador)
- [[../../03-Knowledge/Modelo-Datos-Core]] — enum Bookings (a actualizar)
