---
tags: [spec, checkout, pagos, bold, fiscal, iva, split-fare, publicidad]
created: 2025-07-14
updated: 2025-07-14
status: listo-para-implementar
kiro-spec: .kiro/specs/flujo-c-checkout.md
---

# 📋 Spec C — Checkout, Pagos y Publicidad en Flujo

---

## 1. Objetivos de negocio

- Cumplir ley de turismo colombiana (exención IVA extranjeros con PIP/Sello)
- Primera fuente de ingreso: publicidad en el flujo de pago y confirmación
- Permitir ventas grupales con responsabilidad individual por cupo (Split Fare)
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
**Modelo decidido:** Cada persona paga su parte de forma independiente. La responsabilidad del cupo es individual.

**Criterios de aceptación:**
- [ ] El organizador activa "Dividir cuenta" e ingresa el número de personas (N ≥ 2)
- [ ] El **% de reserva por persona** lo define el operador en la configuración del tour (ej. 30%, 50%)
- [ ] El sistema genera N links de pago Bold individuales, cada uno por `(precio_total / N) × %_reserva`
- [ ] La reserva grupal entra en estado `HOLD_GROUP`
- [ ] Cada link tiene vigencia configurable (ej. 48h para pagar)
- [ ] Si una persona no paga dentro del plazo → **solo su cupo se libera** (el resto conserva el suyo)
- [ ] La persona que no pagó puede: reprogramar (nuevo link) o recibir nada (no pagó = no reservó)
- [ ] El saldo restante (% pendiente del total) se cobra automáticamente con otro link Bold por persona una vez confirmada la reserva
- [ ] La reserva pasa a `CONFIRMED` cuando todos los participantes confirmados han pagado el % de reserva
- [ ] Confirmación completa: segundo cobro del saldo restante se dispara 5 días antes del tour

**Estados del Split Fare:**

```
HOLD_GROUP      → pendiente de que todos paguen el % inicial
PARTIAL_PAID    → algunos pagaron, otros no (dentro del plazo)
CONFIRMED       → todos los que pagaron completaron su reserva
SETTLED         → segundo cobro (saldo) completado
```

---

## 9. API endpoints

```
POST /api/v1/bookings/checkout
  Body: {
    tour_instance_id, pax, addons,
    is_colombian_resident, passport_s3_key?,
    coins_to_use: number,
    split_fare: { enabled: boolean, parts: number }
  }
  Response: {
    booking_id, payment_url,
    split_links: [{ participant_index, link, amount, expires_at }]
  }

POST /api/v1/webhooks/bold
  Trigger: Bold confirma pago
  Acciones:
    1. Validar firma HMAC
    2. Buscar booking por reference
    3. Actualizar estado (CONFIRMED o HOLD_GROUP parcial)
    4. Si CONFIRMED: acreditar Loyalty Coins + enviar email
    5. Registrar en AdImpressions si hubo anuncio
    6. Idempotencia: ignorar si ya CONFIRMED

GET  /api/v1/bookings/:id/s3-presigned-url
POST /api/v1/ads/impression    ← tracking de impresiones
POST /api/v1/ads/click         ← tracking de clics
```

---

## 10. Modelo de datos

```
Bookings
  - status: enum (HOLD, HOLD_GROUP, PARTIAL_PAID, CONFIRMED, SETTLED, CANCELED, COMPLETED)
  - coins_used: decimal
  - bold_reference: string
  - passport_s3_key: string | null

SplitFareParticipants
  - id: uuid
  - booking_id: uuid FK
  - participant_index: integer
  - amount_reservation: decimal    ← % inicial
  - amount_balance: decimal        ← saldo restante
  - bold_link_reservation: string
  - bold_link_balance: string | null
  - reservation_paid: boolean
  - reservation_paid_at: timestamp | null
  - balance_paid: boolean
  - expires_at: timestamp

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

## 11. Dependencias y riesgos

| Dependencia | Riesgo | Decisión |
|---|---|---|
| Bold split nativo | ❌ No existe en Bold API | Se usa un link Bold por persona. BorondoTours recibe todo y liquida al operador internamente |
| Siigo integración | ❓ Pendiente validar | Fase 2. Bold POS como fallback temporal |
| Pasaporte en S3 | Regulatorio | Bucket privado obligatorio, presigned URL 15 min TTL |
| Publicidad DIAN | Legal | Los ingresos publicitarios deben facturarse; incluir en Siigo Fase 2 |

---

## Links relacionados
- [[Spec-B-Tour-Detail]]
- [[Spec-D-Client-Portal]]
- [[../02-ADRs/ADR-001-Bold-Split-Marketplace]]
- [[../02-ADRs/ADR-004-Siigo-Facturacion]]
- [[../03-Knowledge/Modelo-Comisiones]]
