---
tags: [spec, checkout, pagos, onepay, fiscal, iva, split-fare, publicidad, reembolso]
created: 2025-07-14
updated: 2026-06-07
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

### RF-C-ADS03 — Anuncios Rewarded fuera del flujo de compra (Coins por visualización)
**Contexto:** El viajero puede ganar Borondo Coins viendo anuncios completos, pero NUNCA dentro del flujo de compra (discovery → detalle → checkout → pago). Los anuncios rewarded aparecen en zonas de contenido secundario que el usuario QUIERE desbloquear.

**Principio:** El anuncio desbloquea contenido de valor. No interrumpe la compra.

**Ubicaciones válidas para Rewarded Ads (FUERA del flujo de compra):**
- [ ] **"Ver más reseñas"**: en el detalle del tour, después de las primeras 5 reseñas visibles, un botón "Ver 10 reseñas más" muestra un ad rewarded de 5 segundos antes de cargar más
- [ ] **"Galería completa"**: en el detalle del tour, la galería muestra 5 fotos gratis. Para ver las restantes: ad rewarded
- [ ] **"Guía de viaje del destino"**: contenido editorial (tips, recomendaciones, qué llevar) desbloqueado con ad rewarded
- [ ] **"Descubrir tours exclusivos"**: sección "Tours que otros viajeros amaron" desbloqueada con ad
- [ ] **Portal cliente — "Explorar ofertas anticipadas"**: sección de ofertas 12/24h antes accesible con ad

**Ubicaciones donde NUNCA se muestra un Rewarded Ad:**
- [ ] Barra de búsqueda
- [ ] Filtros del catálogo
- [ ] Selector de fecha / calendario
- [ ] Selector de pasajeros
- [ ] Formulario de checkout (datos, pago)
- [ ] Botón "Reservar" o "Pagar"
- [ ] Modal de Auth Gate

**Criterios de aceptación:**
- [ ] Formato: video corto o imagen interactiva de mínimo **5 segundos** de visualización completa
- [ ] El usuario debe ver el ad COMPLETO para obtener los Coins (no puede saltarlo antes de 5s)
- [ ] Máximo **3 ads rewarded por día por usuario** (control en backend con Redis counter por user_id)
- [ ] Cada ad visto correctamente acredita una cantidad fija de Coins (configurable en tabla `AdRewardConfig`, default: 10 Coins)
- [ ] El costo por CPM/visualización del anunciante debe ser **mayor** que el valor de los Coins otorgados (esto se valida en el Ads Manager al configurar)
- [ ] Al completar el ad: toast celebratorio "¡+10 Borondo Coins! Te faltan X para tu próximo descuento"
- [ ] El contador diario se resetea a las 00:00 UTC-5 (hora Colombia)
- [ ] Si el usuario ya vio 3 ads hoy: el botón de "desbloquear con ad" se reemplaza por un mensaje "Vuelve mañana por más Coins"
- [ ] Los Coins por ad se registran como `WalletTransaction` con reason `AD_REWARD`
- [ ] El contenido desbloqueado se mantiene accesible por 24h sin necesidad de ver otro ad (cache en localStorage)
- [ ] Usuarios nivel Conquistador (4) o Embajador (5): NO ven ads rewarded. El contenido está desbloqueado por defecto como beneficio premium.
- [ ] En mobile (App): misma lógica pero usando el formato nativo de Expo (interstitial rewarded)

**Modelo económico:**
- Si el anunciante paga $5 CPM (costo por mil impresiones) = $5 por cada 1000 vistas
- Cada vista le da al usuario 10 Coins
- Si 100 Coins = $500 COP de descuento → 10 Coins = $50 COP de "costo"
- $5 CPM ÷ 1000 = $0.005 USD por vista ≈ $22 COP por vista (a TRM $4,400)
- Costo de Coins otorgados: $50 COP por vista
- **ALERTA:** Con CPM estándar ($5 USD), el costo de los Coins es mayor que el ingreso publicitario
- **Solución:** Usar solo anunciantes premium (CPM ≥ $15 USD) o reducir Coins por ad a 5 Coins ($25 COP costo)
- El Ads Manager debe validar que `ad_revenue_per_impression > coins_cost_per_impression` antes de activar un ad como rewarded

**API:**
```
POST /api/v1/ads/rewarded/start    ← usuario solicita ver un ad (valida límite diario)
  Response: { ad_id, content_url, duration_seconds, session_token }

POST /api/v1/ads/rewarded/complete ← usuario completó la visualización
  Body: { ad_id, session_token }   ← el token previene fraude (solo se puede completar si se solicitó)
  Response: { coins_earned, daily_remaining, unlocked_content_key }
```

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
- [ ] Todos los Coins son libres: usables en cualquier tour de cualquier operador (ADR-007)
- [ ] Descuento aplicado antes del IVA
- [ ] El sistema no permite usar más Coins que el subtotal del tour

---

## 8. Split Fare — Responsabilidad individual por cupo

### RF-C06 — Divide tu cuenta (modelo individual)
**Modelo decidido:** Cada persona paga su parte de forma independiente. La responsabilidad del cupo es individual. Se usan links de pago de **OnePay.la** (antes Onepayla).

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
  - **La cuota inicial (% de reserva) NO es reembolsable** — ni en dinero ni en Coins. Se registra como ingreso por penalidad (ver RF-C11).
  - Si el participante usó Borondo Coins como parte del pago de reserva, esos Coins también se pierden (son equivalentes a dinero pagado).
- [ ] Si el organizador quiere pagar el saldo de todos: puede generar un link consolidado por la suma de todos los saldos pendientes
- [ ] Al completar todos los saldos: booking pasa a `SETTLED`
- [ ] Si faltan ≤2 días y hay saldos pendientes: alerta al COORD vía push + email
- [ ] Si el operador logra revender los cupos liberados y no cobra penalidad a BorondoTours: la cuota retenida es ingreso neto de BorondoTours (ver RF-C11)

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

## 9b. Política de Cancelación Escalonada

### RF-C11 — Cancelación con penalidades graduales
**Contexto:** La política de cancelación NO es binaria. Tiene 3 franjas temporales con penalidades crecientes, más un tratamiento especial para fuerza mayor con documento EPS. La mayoría de operadores usan la política por defecto del sistema; los pocos que tienen diferente se configuran en su contrato (`CancellationPolicies`).

**Franjas de cancelación (política por defecto):**

| Ventana | Cancelación normal | Fuerza mayor (doc EPS/soporte médico) |
|---------|-------------------|----------------------------------------|
| **≥10 días antes del tour** | Reprogramar sin costo. Si pide reembolso: penalidad 40% → recibe 60% en Coins | Reembolso 90% en Coins (penalidad 10%) |
| **5–9 días antes del tour** | Penalidad 60% → recibe 40% en Coins | Penalidad 30% (solo transporte) → recibe 70% en Coins |
| **<5 días antes del tour** | Penalidad 100% → no recibe nada | A evaluar caso por caso (COORD/SUPER_ADMIN decide) |
| **No Show (día del tour)** | Penalidad 100% → no recibe nada | N/A |

**Criterios de aceptación:**
- [ ] La política por defecto aplica a TODOS los operadores salvo que tengan una `CancellationPolicy` custom en su contrato
- [ ] Al cancelar, el sistema calcula automáticamente la penalidad según la franja temporal
- [ ] **Franja ≥10 días:**
  - UI ofrece "Reprogramar" (ver RF-D08b) como opción principal, "Solicitar reembolso" como secundaria
  - Si pide reembolso: se acreditan Coins por el 60% del monto pagado. El 40% es ingreso BorondoTours.
- [ ] **Franja 5–9 días:**
  - Solo opción de cancelación con penalidad
  - Se acreditan Coins por el 40% del monto pagado. El 60% es ingreso BorondoTours.
- [ ] **Franja <5 días:**
  - Botón deshabilitado con tooltip "Sin reembolso por cancelación tardía"
  - El 100% del monto pagado es ingreso BorondoTours (penalidad total)
- [ ] **No Show:**
  - Marcado por el guía desde la App 4 (RF-J03)
  - Penalidad 100% automática. No requiere acción del cliente.
- [ ] **Fuerza mayor:**
  - Requiere adjuntar documento de soporte (EPS, certificado médico, defunción familiar 1er grado)
  - El COORD o SUPER_ADMIN valida el documento y aplica la penalidad reducida
  - Si el documento no es válido: se aplica la penalidad normal de la franja

**Tratamiento contable de la penalidad:**
- [ ] La penalidad retenida se reconoce como ingreso ordinario bajo NIIF 15 (cuenta PUC 4135 — Servicios de agencia de viajes)
- [ ] Se registra en tabla `PenaltyIncome` con: booking_id, amount, percentage, tier (TIER_1/TIER_2/TIER_3/NO_SHOW), is_force_majeure, created_at
- [ ] Si el operador no cobra penalidad a BorondoTours (logró revender los cupos): todo el monto es ingreso neto
- [ ] Si el operador cobra penalidad: se registra como deducción en el próximo `OperatorPayout`
- [ ] Se factura electrónicamente en Siigo (Fase 2) como "Penalidad por cancelación — Servicio turístico"

---

## 9c. Tipos de Producto y Planes de Pago

### RF-C12 — Tipo de producto y política de abono
**Contexto:** El tour tiene un **tipo de producto** (`product_type`) independiente de su categoría temática (`category`). Una Pasadía puede ser de categoría NATURALEZA o AVENTURA. La política de abono depende del tipo y **se configura cuando BorondoTours aprueba el tour** (no la define el operador ni el cliente).

**Tipos y política por defecto:**

| product_type | Abono por defecto | Pago total |
|---|---|---|
| PASADIA | $100.000 fijo | 5 días antes |
| PASANOCHE | $200.000 fijo | 7 días antes |
| EXCURSION | 30% del total | 20 días antes |
| PLAN_PERSONALIZADO | Componentes (ver RF-C13) | según cupo/tiquete |
| PLAN_AEREO | 40% del total | 30 días antes |

**Criterios de aceptación:**
- [ ] Al crear el tour se selecciona `product_type` y su `category`
- [ ] El abono se configura con `deposit_kind` (FIXED | PERCENT vía radio button) + `deposit_value`, y `full_payment_days_before`
- [ ] Estos campos se editan en el **paso de aprobación de BorondoTours** (no en el panel del operador ni del cliente)
- [ ] El cliente en checkout ve únicamente el **monto mínimo para reservar** (el abono calculado), no la configuración
- [ ] Si no se paga el total antes de `full_payment_days_before`: se cancela la reserva, no se entrega voucher, y el abono **no es reembolsable** (ni en dinero ni en Coins)

### RF-C13 — Planes compuestos (Personalizado y Aéreo)
**Contexto:** Los planes personalizados y aéreos se arman por componentes con abono propio. Son productos **de agencia**: la agencia se registra en el B2B como operadora para crear/publicar el plan, o se maneja internamente sin publicar.

**Criterios de aceptación:**
- [ ] El plan se desglosa en `PlanComponents`: TIQUETE, HOTEL, ADMIN_FEE (y OTHER a futuro)
- [ ] Abono del personalizado = 100% tiquete + 100% tarifa admin + 20% hotel
- [ ] La **tarifa administrativa** proviene de la Aeronáutica Civil de Colombia (`source = AERONAUTICA_CIVIL`), no es un valor fijo hardcodeado
- [ ] Abono del aéreo con bloqueo = 40% del total
- [ ] El **bloqueo de tiquetes no tiene fecha límite propia**: el cliente puede pagar el saldo hasta 1 día antes si hay cupo
- [ ] El saldo se cobra igual que el segundo cobro de Split Fare (RF-C06b)

### RF-C14 — Acta de compromiso de pago (flexibilidad)
**Contexto:** BorondoTours (no el operador) puede autorizar flexibilidad para que un cliente pague el total 2–3 días antes bajo compromiso.

**Criterios de aceptación:**
- [ ] Solo BorondoTours (AGENT / COORD / GERENTE / SUPER_ADMIN) puede activar la flexibilidad (`is_flexible_payment`)
- [ ] Al activarla se genera un **documento de acta de compromiso de pago** (PDF con fecha límite pactada) cuando el cliente lo requiere
- [ ] La acta define nueva fecha de pago del saldo, pero **no otorga derecho a reembolso** del abono si incumple
- [ ] Si el cliente incumple la fecha del acta: se cancela la reserva y se pierde el abono (RF-C12)

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

> ⚠️ **Definición canónica en [[../03-Knowledge/Modelo-Datos-Core]].** Las tablas de esta sección
> (`Bookings`, `BookingPassengers`, `SplitFareParticipants`, `RefundRequests`, `WebhookEvents`,
> `OperatorChargebacks`, `Ads`, `AdImpressions`) ya están consolidadas en el Core como fuente de
> verdad. Lo que sigue es ilustrativo del dominio de checkout; ante cualquier diferencia de columnas
> o enums, **el Modelo-Datos-Core gana**.

```
Bookings (extensión — ver schema completo en Modelo-Datos-Core.md)
  - status: enum (HOLD, HOLD_GROUP, PARTIAL_PAID, CONFIRMED, SETTLED, CANCELED, COMPLETED, CHARGEBACK)
  - coins_used: decimal
  - onepay_reference: string           ← antes Onepayla_reference
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
  - onepay_link_reservation: string    ← antes Onepayla_link_reservation
  - onepay_link_balance: string | null ← antes Onepayla_link_balance
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
- [[../02-ADRs/ADR-001-Onepayla-Split-Marketplace]] *(en migración a OnePay.la)*
- [[../02-ADRs/ADR-004-Siigo-Facturacion]]
- [[../02-ADRs/ADR-007-Politica-Cancelacion-Escalonada]]
- [[../03-Knowledge/Modelo-Comisiones]]
- [[../03-Knowledge/Politica-Datos-Personales]]
