---
tags: [spec, checkout, pagos, onepay, fiscal, iva, split-fare, publicidad, reembolso]
created: 2025-07-14
updated: 2026-04-06
status: listo-para-implementar
kiro-spec: .kiro/specs/flujo-c-checkout.md
---

# 📋 Spec C — Checkout, Pagos y Publicidad en Flujo

---

## 1. Objetivos de negocio

- Cumplir ley de turismo colombiana (exención IVA extranjeros con PIP/Sello)
- Primera fuente de ingreso: publicidad en el flujo de pago y confirmación
- Permitir ventas grupales con responsabilidad individual por cupo (Split Fare) vía OnePay.la
- Maximizar conversión con mínimo de pasos

---

## 2. Publicidad en el flujo de pago (nueva fuente de ingreso)

### RF-C-ADS01 — Anuncios en paso de confirmación
**Contexto:** El usuario completó los datos y está a punto de confirmar el pago. Máxima atención.

**Criterios de aceptación:**
- [ ] Banner publicitario (1 unidad) visible justo antes del botón "Pagar ahora"
- [ ] Formato: imagen 728×90 o 300×250 con link externo que abre en nueva pestaña
- [ ] No bloquea ni retrasa el flujo de pago
- [ ] El anuncio no se muestra si el usuario es nivel Conquistador (4) o Embajador (5)
- [ ] Sistema de rotación básico: tabla `Ads` con prioridad y fechas de vigencia
- [ ] Tracking: registro de impresiones y clics en tabla `AdImpressions`

### RF-C-ADS02 — Anuncios en página de confirmación post-pago
**Contexto:** El usuario acaba de pagar. Está feliz. Máxima receptividad.

**Criterios de aceptación:**
- [ ] 2 banners en la página "¡Tu reserva está confirmada!" 
- [ ] Posición 1: debajo del mensaje de confirmación (alta visibilidad)
- [ ] Posición 2: antes del carrusel de cross-selling geográfico
- [ ] Mismo sistema de rotación y tracking que RF-C-ADS01
- [ ] Pueden ser anuncios de operadores de la plataforma o externos

---

## 3. Onboarding integrado en checkout

### RF-C01 — Auth sin perder la selección
**Criterios de aceptación:**
- [ ] Si usuario no tiene sesión, el Wizard pide Email/Pass o Google OAuth
- [ ] Fecha, tour y pax seleccionados persisten en Zustand durante redirect OAuth
- [ ] Post-auth: checkout continúa desde el paso donde estaba

---

## 3b. Datos del Pasajero para Manifiesto

### RF-C08 — Paso de datos del pasajero en checkout
**Contexto:** El manifiesto del operador (Spec-I RF-I08) requiere datos que actualmente no se recolectan en el checkout B2C. Sin estos campos, el manifiesto quedará incompleto para todos los clientes B2C.

**Criterios de aceptación:**
- [ ] Paso adicional en el wizard de checkout (después de auth, antes de pago): "Datos del pasajero principal"
- [ ] Campos obligatorios:
  - Tipo de documento: `CC` (Cédula de Ciudadanía) | `CE` (Cédula de Extranjería) | `PASSPORT`
  - Número de documento
  - Teléfono principal (con código de país)
  - Contacto de emergencia: nombre + teléfono
- [ ] Campos opcionales:
  - Condiciones médicas relevantes (textarea, ej: alergias, diabetes, movilidad reducida)
  - Hotel o punto de recogida
- [ ] Si el usuario ya tiene estos datos en su perfil (`Users`), se pre-llenan automáticamente
- [ ] Los datos se guardan tanto en `Users` (para futuras compras) como en `BookingPassengers`
- [ ] Para Split Fare: cada participante debe llenar sus propios datos al pagar su parte
- [ ] Los datos del pasajero aparecen automáticamente en el manifiesto del operador (Spec-I RF-I08)

---

## 4. Selector dinámico de pasajeros

### RF-C02 — Pax por regla del tour
**Criterios de aceptación:**
- [ ] Contadores `[+]` / `[-]` por categoría según `pax_rule` del tour
- [ ] Regla por **Edad**: 0–2 años (bebé), 3–10 años (niño), 11+ años (adulto)
- [ ] Regla por **Estatura**: rangos definidos por el operador en el tour
- [ ] El subtotal se actualiza en tiempo real
- [ ] Mínimo 1 adulto por reserva

---

## 5. Upselling con add-ons

### RF-C03 — Add-ons opcionales
**Criterios de aceptación:**
- [ ] Checkboxes de add-ons configurados por operador por tour
- [ ] Al marcar: subtotal se actualiza inmediatamente
- [ ] Usuarios nivel Aventurero (3) o superior: 3% descuento en add-ons
- [ ] Usuarios nivel Conquistador (4) o superior: 5% descuento en add-ons

---

## 6. Lógica fiscal de IVA

### RF-C04 — IVA según residencia fiscal
**Criterios de aceptación:**
- [ ] Radio button: "¿Residente fiscal en Colombia?"
- [ ] Si **SÍ**: aplica 19% IVA sobre subtotal
- [ ] Si **NO**: IVA = $0, muestra texto legal, bloquea pago hasta adjuntar pasaporte
- [ ] Upload de pasaporte via Presigned URL a S3 (bucket privado, expira en 15 min)
- [ ] Backend valida existencia del archivo en S3 antes de procesar
- [ ] Validación también en backend (no solo en UI)

---

## 7. Uso de Borondo Coins en checkout

### RF-C05 — Aplicar Coins como descuento
**Criterios de aceptación:**
- [ ] Sección "¿Usar Borondo Coins?" con saldo disponible visible
- [ ] Toggle para activar/desactivar uso de Coins
- [ ] Coins libres: usables en cualquier tour
- [ ] Coins restringidos: usables solo si `tour.operator_id` coincide
- [ ] Descuento aplicado antes del IVA
- [ ] El sistema no permite usar más Coins que el subtotal del tour

---

## 8. Split Fare — Responsabilidad individual por cupo

### RF-C06 — Divide tu cuenta (modelo individual)
**Modelo decidido:** Cada persona paga su parte de forma independiente. La responsabilidad del cupo es individual. Se usan links de pago de **OnePay.la** (antes Bold).

**Criterios de aceptación:**
- [ ] El organizador activa "Dividir cuenta" e ingresa el número de personas (N ≥ 2)
- [ ] El **% de reserva por persona** lo define el operador en la configuración del tour (ej. 30%, 50%)
- [ ] El sistema genera N links de pago OnePay.la individuales, cada uno por `(precio_total / N) × %_reserva`
- [ ] La reserva grupal entra en estado `HOLD_GROUP`
- [ ] Cada link tiene vigencia configurable (ej. 48h para pagar)
- [ ] Si una persona no paga dentro del plazo → **solo su cupo se libera** (el resto conserva el suyo)
- [ ] La persona que no pagó puede: reprogramar (nuevo link) o recibir nada (no pagó = no reservó)
- [ ] La reserva pasa a `CONFIRMED` cuando todos los participantes confirmados han pagado el % de reserva

### RF-C06b — Segundo cobro del saldo restante (Split Fare)
**Contexto:** Después de que el grupo confirmó con el % de reserva, falta cobrar el saldo pendiente antes del tour.

**Criterios de aceptación:**
- [ ] BullMQ job `split-fare-balance-collection` se dispara **5 días calendario antes** de la fecha del tour
- [ ] Para cada participante con `reservation_paid = true && balance_paid = false`:
  - Se genera un nuevo link OnePay.la por `amount_balance` (saldo individual)
  - Se envía email + push + WhatsApp con el link
- [ ] Si un participante **no paga el saldo** dentro de 48h tras el envío del link:
  - Se envía recordatorio urgente (email + push)
  - Si sigue sin pagar 24h antes del tour: se cancela su cupo y se liberan cupos
  - Los Coins de reserva (si usó) se devuelven como `CREDIT / CANCELLATION`
- [ ] Si el organizador quiere pagar el saldo de todos: puede generar un link consolidado por la suma de todos los saldos pendientes
- [ ] Al completar todos los saldos: booking pasa a `SETTLED`
- [ ] Si faltan ≤2 días y hay saldos pendientes: alerta al COORD vía push + email

**Estados del Split Fare:**

```
HOLD_GROUP      → pendiente de que todos paguen el % inicial
PARTIAL_PAID    → algunos pagaron, otros no (dentro del plazo)
CONFIRMED       → todos los que pagaron completaron su reserva
SETTLED         → segundo cobro (saldo) completado
```

---

## 8b. Reembolso Bancario Real

### RF-C09 — Flujo de reembolso bancario por PQRS
**Contexto:** La Ley 1480 de 2011 (Estatuto del Consumidor Colombiano) exige que el consumidor pueda ejercer su derecho de retracto y recibir reembolso real, no solo créditos internos. Este flujo aplica en casos legalmente obligatorios.

**Casos que requieren reembolso bancario (no Coins):**
- [ ] Derecho de retracto: el cliente solicita dentro de 5 días hábiles desde la compra
- [ ] Cancelación por fuerza mayor del operador (Spec-I RF-I17 tipo `OPERATOR_CANCEL`)
- [ ] Orden judicial o resolución de la SIC

**Criterios de aceptación:**
- [ ] El cliente que aplica a reembolso bancario NO recibe Coins; recibe una solicitud de reembolso
- [ ] Se crea un registro `RefundRequests` en estado `PENDING_REVIEW`
- [ ] El COORD o SUPER_ADMIN revisa y aprueba/rechaza con justificación
- [ ] Al aprobar:
  - Si OnePay.la soporta API de reembolso (`POST /refunds`): se ejecuta automáticamente
  - Si no: se marca como `MANUAL_TRANSFER` y el COORD ejecuta la transferencia bancaria manualmente
- [ ] El reembolso queda registrado en `RefundRequests` con: monto, método, fecha de ejecución, aprobado_por
- [ ] Se emite Nota Crédito en Siigo (Fase 2) automáticamente al aprobar el reembolso
- [ ] El cliente recibe confirmación por email con el número de referencia del reembolso

---

## 9. Webhooks y Conciliación de Pagos

### RF-C07 — Webhook de OnePay.la (handler completo)
**Contexto:** OnePay.la envía webhooks para múltiples eventos. Se deben manejar TODOS los tipos, no solo pagos confirmados.

**Criterios de aceptación:**
- [ ] Endpoint: `POST /api/v1/webhooks/onepay`
- [ ] Validar firma HMAC con `ONEPAY_WEBHOOK_SECRET`
- [ ] **Idempotencia:** Guardar `webhook_event_id` en tabla `WebhookEvents` para no procesar duplicados
- [ ] Handlers por tipo de evento:

| Evento | Acción |
|---|---|
| `PAYMENT_CONFIRMED` | Actualizar booking, acreditar Coins, crear OperatorPayout, crear AgentCommission (si aplica), enviar email confirmación |
| `PAYMENT_DECLINED` | Marcar intent como `FAILED`, notificar al cliente por email con opción de reintentar, mantener cupo por 15 min |
| `CHARGEBACK` | Marcar booking `CHARGEBACK`, crear `OperatorChargebacks`, notificar SUPER_ADMIN, revertir Coins, cancelar cupo |
| `LINK_EXPIRED` | Liberar cupos bloqueados, marcar booking `EXPIRED`, notificar al cliente, mover tarjeta del Kanban si es cotización |
| `REFUND_COMPLETED` | Actualizar `RefundRequests.status = COMPLETED`, emitir Nota Crédito Siigo |

### RF-C10 — Conciliación automática de pagos
**Contexto:** Si el webhook de OnePay.la nunca llega (falla la red, servidor caído), los bookings quedan en estado inconsistente.

**Criterios de aceptación:**
- [ ] BullMQ cron job `reconcile-onepay-payments` se ejecuta diariamente a las 2:00 AM
- [ ] Consulta la API de OnePay.la para obtener pagos de las últimas 48h
- [ ] Compara con bookings en el sistema: identifica pagos confirmados cuyo webhook no se procesó
- [ ] Para cada discrepancia: ejecuta la lógica del handler `PAYMENT_CONFIRMED` y notifica al COORD
- [ ] Genera log de conciliación exportable desde el panel SUPER_ADMIN

---

## 10. API endpoints

```
POST /api/v1/bookings/checkout
  Body: {
    tour_instance_id, pax, addons,
    is_colombian_resident, passport_s3_key?,
    coins_to_use: number,
    split_fare: { enabled: boolean, parts: number },
    passenger_data: {
      document_type: 'CC' | 'CE' | 'PASSPORT',
      document_number: string,
      phone: string,
      emergency_contact_name: string,
      emergency_contact_phone: string,
      medical_conditions?: string,
      hotel_pickup?: string
    }
  }
  Response: {
    booking_id, payment_url,
    split_links: [{ participant_index, link, amount, expires_at }]
  }

POST /api/v1/webhooks/onepay
  Trigger: OnePay.la envía evento
  Acciones:
    1. Validar firma HMAC con ONEPAY_WEBHOOK_SECRET
    2. Verificar idempotencia (webhook_event_id)
    3. Ejecutar handler según event_type (ver RF-C07)

POST /api/v1/bookings/:id/refund-request   ← Solicitar reembolso bancario
PATCH /api/v1/admin/refunds/:id            ← Aprobar/rechazar reembolso (COORD, SUPER_ADMIN)

GET  /api/v1/bookings/:id/s3-presigned-url
POST /api/v1/ads/impression    ← tracking de impresiones
POST /api/v1/ads/click         ← tracking de clics
```

---

## 11. Modelo de datos

```
Bookings (extensión — ver schema completo en Modelo-Datos-Core.md)
  - status: enum (HOLD, HOLD_GROUP, PARTIAL_PAID, CONFIRMED, SETTLED, CANCELED, COMPLETED, CHARGEBACK)
  - coins_used: decimal
  - onepay_reference: string           ← antes bold_reference
  - passport_s3_key: string | null
  - source: enum (WEB_B2C, AGENT_QUOTE, AGENCY_LINK, QUICK_SALE)

BookingPassengers
  - id: uuid
  - booking_id: uuid FK
  - user_id: uuid FK | null            ← null si es participante Split Fare sin cuenta
  - document_type: enum (CC, CE, PASSPORT)
  - document_number: string
  - full_name: string
  - phone: string
  - emergency_contact_name: string
  - emergency_contact_phone: string
  - medical_conditions: text | null
  - hotel_pickup: string | null
  - created_at: timestamp

SplitFareParticipants
  - id: uuid
  - booking_id: uuid FK
  - participant_index: integer
  - amount_reservation: decimal        ← % inicial
  - amount_balance: decimal            ← saldo restante
  - onepay_link_reservation: string    ← antes bold_link_reservation
  - onepay_link_balance: string | null ← antes bold_link_balance
  - reservation_paid: boolean
  - reservation_paid_at: timestamp | null
  - balance_paid: boolean
  - balance_paid_at: timestamp | null
  - expires_at: timestamp

RefundRequests
  - id: uuid
  - booking_id: uuid FK
  - requested_by: uuid FK              ← usuario que solicita
  - reason: enum (RIGHT_OF_WITHDRAWAL, OPERATOR_CANCEL, JUDICIAL_ORDER, FORCE_MAJEURE)
  - amount: decimal
  - status: enum (PENDING_REVIEW, APPROVED, REJECTED, COMPLETED, MANUAL_TRANSFER)
  - approved_by: uuid FK | null
  - rejection_reason: text | null
  - onepay_refund_id: string | null    ← si se hizo vía API
  - transfer_reference: string | null  ← si fue manual
  - completed_at: timestamp | null
  - siigo_credit_note_id: string | null
  - created_at: timestamp

WebhookEvents (idempotencia)
  - id: uuid
  - provider: enum (ONEPAY, SIIGO)
  - external_event_id: string (UNIQUE)
  - event_type: string
  - payload: jsonb
  - processed_at: timestamp
  - created_at: timestamp

OperatorChargebacks
  - id: uuid
  - operator_id: uuid FK
  - booking_id: uuid FK
  - amount: decimal
  - reason: text
  - initiated_by: uuid FK
  - status: enum (PENDING, APPLIED)
  - applied_to_payout_id: uuid FK | null
  - created_at: timestamp

Ads
  - id: uuid
  - title: string
  - image_url: string
  - click_url: string
  - position: enum (CHECKOUT_BEFORE_PAY, CONFIRMATION_TOP, CONFIRMATION_BOTTOM)
  - priority: integer
  - active_from: date
  - active_until: date
  - min_level_excluded: integer | null  ← null = se muestra a todos

AdImpressions
  - id: uuid
  - ad_id: uuid FK
  - user_id: uuid FK | null
  - booking_id: uuid FK | null
  - event: enum (IMPRESSION, CLICK)
  - created_at: timestamp
```

---

## 12. Dependencias y riesgos

| Dependencia | Riesgo | Decisión |
|---|---|---|
| OnePay.la split nativo | ❌ No existe como split marketplace | Se usa un link OnePay por persona. BorondoTours recibe todo y liquida al operador internamente |
| OnePay.la Refund API | ❓ Validar disponibilidad | Si no existe, usar transferencia manual con registro en `RefundRequests` |
| Siigo integración | ❓ Pendiente validar | Fase 2. Nota Crédito automática al aprobar reembolso |
| Pasaporte en S3 | Regulatorio | Bucket privado obligatorio, presigned URL 15 min TTL |
| Publicidad DIAN | Legal | Los ingresos publicitarios deben facturarse; incluir en Siigo Fase 2 |
| Ley 1480 — Retracto | Legal | Obligatorio: reembolso bancario real en 5 días hábiles. RF-C09 lo cubre |

---

## Links relacionados
- [[Spec-B-Tour-Detail]]
- [[Spec-D-Client-Portal]]
- [[../02-ADRs/ADR-001-Bold-Split-Marketplace]] *(en migración a OnePay.la)*
- [[../02-ADRs/ADR-004-Siigo-Facturacion]]
- [[../03-Knowledge/Modelo-Comisiones]]
- [[../03-Knowledge/Politica-Datos-Personales]]
