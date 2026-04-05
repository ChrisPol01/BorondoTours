---
tags: [spec, portal-cliente, wallet, coins, loyalty, gamificacion]
created: 2025-07-14
updated: 2025-07-14
status: listo-para-implementar
kiro-spec: .kiro/specs/flujo-d-client-portal.md
---

# 📋 Spec D — Área Privada, Wallet y Fidelización

---

## 1. Objetivos de negocio

- Retener liquidez mediante Borondo Coins en lugar de reembolsos bancarios
- Fidelizar usuarios con programa de lealtad que beneficia al cliente sin destruir margen
- Los beneficios del programa son financiados por ingresos publicitarios (anuncios en checkout/confirmación)
- Reducir carga operativa de atención al cliente con autogestión total

---

## 2. Sistema de niveles — Borondo Loyalty

### Regla general
- El nivel se sube cuando el usuario cumple **cualquiera** de los dos criterios (tours O monto)
- El % de Coins se aplica sobre el valor **total pagado** en cada compra futura
- Los Coins son permanentes (sin vencimiento), intransferibles entre usuarios
- 1 Coin = $1 COP (paridad 1:1)

### Tabla de niveles

| Nivel | Nombre | Criterio tours | Criterio monto | % Coins/compra | Beneficio adicional |
|---|---|---|---|---|---|
| 0 | Sin nivel | 0 tours | $0 | 0% | Solo acceso básico |
| 1 | Explorador | 1 tour | — | 0.5% | Badge + acceso a ofertas anticipadas 12h |
| 2 | Viajero | 10 tours | $2.000.000 COP | 1% | Acceso anticipado 24h a nuevos tours |
| 3 | Aventurero | 25 tours | $8.000.000 COP | 1.5% | 3% descuento en add-ons del checkout |
| 4 | Conquistador | 50 tours | $20.000.000 COP | 2% | Prioridad en lista de espera + 5% desc. add-ons |
| 5 | Embajador | 2 tours internacionales + 10 nacionales ó 1 crucero + 10 nacionales | — | 3% | Tours exclusivos + badge especial |

### Notas de diseño del programa
- Los % son bajos deliberadamente para que el costo del programa sea cubierto por los ingresos de publicidad
- El nivel Embajador tiene criterio mixto (internacionales/cruceros + nacionales) para incentivar diversidad de compra
- La plataforma muestra al usuario cuánto le falta para el siguiente nivel (barra de progreso)
- El % de Coins se calcula sobre el subtotal antes de IVA

### Requerimientos funcionales de niveles

#### RF-D-LVL01 — Cálculo automático de nivel
**Criterios de aceptación:**
- [ ] Al confirmar cada reserva (`CONFIRMED`), el backend recalcula el nivel del usuario
- [ ] Se suman tours nacionales, internacionales y cruceros por separado en la tabla `UserStats`
- [ ] Se suma el monto total histórico en la tabla `UserStats`
- [ ] Si sube de nivel, se registra en `LoyaltyEvents` y se envía email de felicitación
- [ ] El nivel nunca baja (es acumulativo)

#### RF-D-LVL02 — Acreditación de Coins por compra
**Criterios de aceptación:**
- [ ] Al confirmar pago, se calcula: `subtotal × (% del nivel actual)`
- [ ] Se crea registro en `WalletTransactions` (CREDIT, reason: `LOYALTY_PURCHASE`)
- [ ] El saldo del wallet se actualiza en tiempo real (Zustand en frontend)
- [ ] El cliente ve en la confirmación: "Ganaste X Borondo Coins en esta compra"

---

## 3. Wallet — Borondo Coins

### RF-D01 — Visualización del wallet
**Criterios de aceptación:**
- [ ] Saldo actual en Coins visible en el dashboard y en el header
- [ ] Historial de transacciones: tipo (CREDIT/DEBIT), monto, motivo, fecha
- [ ] Si hay Coins restringidos a un operador, se muestran separados con etiqueta "Restringido: [NombreOperador]"
- [ ] Coins libres y Coins restringidos tienen saldos separados visualmente

### RF-D02 — Uso de Coins en checkout
**Criterios de aceptación:**
- [ ] En el checkout, sección "¿Quieres usar tus Borondo Coins?"
- [ ] Solo se pueden usar Coins libres, O Coins restringidos si el tour es del mismo operador
- [ ] El sistema valida que `coins_a_usar ≤ saldo_disponible`
- [ ] El descuento se aplica antes de calcular el IVA
- [ ] Si se usan Coins, se genera registro `DEBIT` en `WalletTransactions`

### RF-D03 — Reglas de acreditación de Coins

| Motivo | Monto | Restricción | Origen |
|---|---|---|---|
| Cancelación ≥5 días (cliente) | 100% del pago | Libre (cualquier tour) | Automático al cancelar |
| Fuerza mayor (cancela el operador) | 100% del pago | Restringido al operador que canceló | Admin/Coord acredita manualmente |
| Loyalty por compra | % según nivel | Libre | Automático al confirmar pago |
| Compensación manual (admin) | Variable | Configurable | SUPER_ADMIN |

**Criterios de aceptación:**
- [ ] Cancelación del cliente: `DB.transaction` atómico (CANCELED + CREDIT wallet)
- [ ] Fuerza mayor: solo `COORD` o `SUPER_ADMIN` puede acreditar, con campo `restricted_operator_id` obligatorio
- [ ] Los Coins restringidos solo se pueden usar en tours donde `tour.operator_id = coins.restricted_operator_id`

---

## 4. Gamificación — Perfil de viajero

### RF-D04 — Mapa de conquistas
**Criterios de aceptación:**
- [ ] Mapa de Colombia con Mapbox GL JS
- [ ] Departamentos donde el usuario tiene ≥1 tour `COMPLETED` se colorean
- [ ] Color por cantidad: 1 tour = tono claro, 5+ tours = tono oscuro (misma escala cromática)
- [ ] Tooltip al hover: "X tours en [Departamento]"
- [ ] Polígonos GeoJSON de departamentos de Colombia precargados en S3

### RF-D05 — Estadísticas del perfil
**Criterios de aceptación:**
- [ ] Tours realizados (total, nacionales, internacionales, cruceros)
- [ ] Departamentos visitados (count)
- [ ] Total gastado en la plataforma
- [ ] Nivel actual con barra de progreso al siguiente nivel
- [ ] "Te faltan X tours o $Y para ser [Siguiente Nivel]"

---

## 5. Gestión de reservas

### RF-D06 — Voucher PDF descargable
**Criterios de aceptación:**
- [ ] Botón "Descargar Voucher" en cada reserva `CONFIRMED` o `COMPLETED`
- [ ] PDF incluye: logo BorondoTours, nombre tour, fecha, pax, número de confirmación, datos del pasajero principal, QR con el booking_id
- [ ] Generado server-side (NestJS + pdf-lib o puppeteer)

### RF-D07 — Cancelación autónoma
*(Ver también Spec F para la vista Kanban)*
**Criterios de aceptación:**
- [ ] Cancelación disponible si `tour_date - now() ≥ 5 días calendario`
- [ ] Modal: "¿Estás seguro? Recibirás $X en Borondo Coins (no reembolso bancario)"
- [ ] `DB.transaction`: booking → `CANCELED` + `WalletTransactions` CREDIT
- [ ] Si < 5 días: botón deshabilitado con tooltip "Sin reembolso por cancelación tardía"

---

## 6. Chat tripartito (Fase 2)

### RF-D08 — Chat 24h pre-tour
**Criterios de aceptación:**
- [ ] Botón "Abrir Chat" visible en reservas `CONFIRMED` con fecha futura
- [ ] Botón deshabilitado hasta 24h antes del tour con countdown
- [ ] Al activarse: sala de chat con el cliente, el guía asignado y el coordinador
- [ ] Permite texto y adjuntar fotos (presigned URL S3)
- [ ] Historial en DynamoDB (PK: booking_id, SK: timestamp#messageId)
- [ ] TTL: mensajes se eliminan 90 días después del tour

---

## 7. Feedback post-tour (Fase 2)

### RF-D09 — Recolección de reseñas separadas (Tour vs Guía)
**Criterios de aceptación:**
- [ ] Al cambiar booking a `COMPLETED` o `⚫ Terminado` (en App), BullMQ encola tarea de envío de feedback (con el nombre del guía adjunto).
- [ ] Email/SMS/Push Notificaton con enlace mágico o redirección a la vista de Wallet (token único, expira en 7 días, un solo uso).
- [ ] Modal de calificación segmentado en dos bloques visuales obligatorios:
  - **Experiencia / Tour:** Estrellas 1–5 + Comentario libre sobre la logística y la locación.
  - **Atención del Guía:** Estrellas 1–5 + Comentario libre sobre quien los lideró (`{Nombre del Guía}`).
- [ ] La reseña del tour aparece en la página pública del tour en el B2C (Spec B).
- [ ] La reseña del Guía aparece EXCLUSIVAMENTE en el Dashboard Privado de Performance del guía (vía BorondoTours App) y en los reportes del Operador.
- [ ] Un booking solo puede generar un registro atómico de doble-reseña.

---

## 8. API endpoints

```
GET  /api/v1/wallet/me               → saldo y transacciones del usuario
POST /api/v1/wallet/use              → aplicar Coins en checkout
GET  /api/v1/loyalty/me              → nivel, stats, progreso
GET  /api/v1/bookings/me             → upcoming, completed (Kanban)
POST /api/v1/bookings/:id/cancel     → cancelación autónoma
GET  /api/v1/bookings/:id/voucher    → PDF del voucher
POST /api/v1/reviews                 → crear reseña (requiere magic token)
```

---

## 9. Modelo de datos

```
UserStats
  - user_id: uuid FK (PK)
  - tours_national: integer
  - tours_international: integer
  - tours_cruise: integer
  - total_spent: decimal
  - loyalty_level: integer (0–5)
  - updated_at: timestamp

LoyaltyEvents
  - id: uuid
  - user_id: uuid FK
  - event_type: enum (LEVEL_UP, COINS_EARNED, COINS_USED)
  - old_level: integer
  - new_level: integer
  - created_at: timestamp

Wallets
  - id: uuid
  - user_id: uuid FK
  - balance_free: decimal          ← Coins sin restricción
  - balance_restricted: decimal    ← Coins restringidos (suma de todos los operadores)

WalletTransactions
  - id: uuid
  - wallet_id: uuid FK
  - booking_id: uuid FK | null
  - type: enum (CREDIT, DEBIT)
  - amount: decimal
  - reason: enum (CANCELLATION, FORCE_MAJEURE, LOYALTY_PURCHASE, COMPENSATION, CHECKOUT_USE)
  - restricted_operator_id: uuid | null
  - created_by: uuid FK (user que ejecutó la acción)
  - created_at: timestamp
```

---

## 10. Dependencias y riesgos

| Dependencia | Tipo | Impacto |
|---|---|---|
| BullMQ + Redis | Infra | Medio — colas de feedback |
| DynamoDB | AWS | Alto — chat (Fase 2) |
| Mapbox polígonos Colombia | Datos | Medio — GeoJSON de departamentos |
| Siigo API | Externa | Medio — facturación automática (Fase 2) |

---

## Links relacionados
- [[Spec-C-Checkout]]
- [[Spec-F-Dashboard]]
- [[../02-ADRs/ADR-003-DynamoDB-Chat]]
- [[../03-Knowledge/Modelo-Comisiones]]
