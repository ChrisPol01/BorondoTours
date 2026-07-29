---
tags: [spec, portal-cliente, wallet, coins, loyalty, gamificacion]
created: 2025-07-14
updated: 2026-04-06
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
- Los niveles se alcanzan acumulando **Puntos de Experiencia (XP)** por múltiples acciones (no solo compras)
- Los XP determinan el nivel; los Borondo Coins son la moneda de descuento (ratio configurable)
- Los Coins son permanentes (sin vencimiento), intransferibles entre usuarios
- Ratio por defecto: 100 Coins = $500 COP (configurable por SUPER_ADMIN)

> ℹ️ **Fuente de verdad del modelo completo:** Spec-E §2-3. Esta sección es un resumen ejecutivo.

### Tabla de niveles por XP

| Nivel | Nombre | XP requeridos | % Coins por compra | Beneficio adicional |
|---|---|---|---|---|
| 0 | Sin nivel | 0 | 0% | Solo acceso básico |
| 1 | Explorador | 100 XP | 0.5% | Badge + acceso a ofertas anticipadas 12h |
| 2 | Viajero | 1.500 XP | 1% | Acceso anticipado 24h a nuevos tours |
| 3 | Aventurero | 5.000 XP | 1.5% | 3% descuento en add-ons del checkout |
| 4 | Conquistador | 12.000 XP | 2% | Prioridad en lista de espera + 5% desc. add-ons + sin ads checkout |
| 5 | Embajador | 25.000 XP | 3% | Tours exclusivos + sin ads en todo el flujo + badge especial |

### Cómo se ganan XP (resumen — detalle en Spec-E §3)
- Tours completados: 100-300 XP según tipo (nacional/internacional/crucero)
- Reseñas: 20-30 XP por reseña
- Referidos convertidos: 75 XP
- Ver anuncios rewarded (20 o más al mes): 25 XP/mes
- Monto acumulado: 50 XP por cada $1M COP gastado
- Completar perfil: 50 XP (una vez)

### Notas de diseño del programa
- Un usuario activo (reseñas + ads + referidos) sube de nivel MÁS RÁPIDO que uno que solo compra
- Los % de Coins por compra son bajos deliberadamente (financiados por publicidad)
- El nivel Embajador requiere diversidad (internacionales o cruceros)
- La plataforma muestra al usuario: XP actual + barra de progreso al siguiente nivel

### Requerimientos funcionales de niveles

#### RF-D-LVL01 — Cálculo automático de nivel por XP
**Criterios de aceptación:**
- [ ] Al completar cualquier acción que otorga XP, el backend recalcula el nivel del usuario
- [ ] Se suman XP de todas las fuentes en `UserStats.xp_total`
- [ ] Si el XP supera el umbral del siguiente nivel: sube automáticamente
- [ ] Si sube de nivel, se registra en `LoyaltyEvents` y se envía email + push de felicitación
- [ ] El nivel nunca baja (es acumulativo y permanente)

#### RF-D-LVL02 — Acreditación de Coins por compra
**Criterios de aceptación:**
- [ ] Al confirmar pago, se calcula: `coins = floor(subtotal_antes_iva * % del nivel * multiplicador_nacionalidad)`
- [ ] Multiplicador: 2x si tour internacional (usuario local), 1.5x si tour nacional (usuario extranjero), 1x default
- [ ] Se crea registro en `WalletTransactions` (CREDIT, reason: `LOYALTY_PURCHASE`)
- [ ] El saldo del wallet se actualiza en tiempo real (Zustand en frontend)
- [ ] El cliente ve en la confirmación: "Ganaste X Borondo Coins + Y XP en esta compra"

---

## 3. Wallet — Borondo Coins

### RF-D01 — Visualización del wallet
**Criterios de aceptación:**
- [ ] Saldo actual en Coins visible en el dashboard y en el header
- [ ] Historial de transacciones: tipo (CREDIT/DEBIT), monto, motivo, fecha
- [ ] Todos los Coins son libres — usables en cualquier tour de cualquier operador (ADR-007)
- [ ] No hay distinción entre Coins "restringidos" y "libres"

### RF-D02 — Uso de Coins en checkout
**Criterios de aceptación:**
- [ ] En el checkout, sección "¿Quieres usar tus Borondo Coins?"
- [ ] Todos los Coins son usables en cualquier tour (sin restricción por operador)
- [ ] El sistema valida que `coins_a_usar ≤ saldo_disponible`
- [ ] El descuento se aplica antes de calcular el IVA
- [ ] Si se usan Coins, se genera registro `DEBIT` en `WalletTransactions`

### RF-D03 — Reglas de acreditación de Coins

| Motivo | Monto | Restricción | Origen |
|---|---|---|---|
| Cancelación ≥10 días (cliente) | 60% del pago (penalidad 40%) | Libre | Automático al cancelar |
| Cancelación 5–9 días (cliente) | 40% del pago (penalidad 60%) | Libre | Automático al cancelar |
| Cancelación <5 días (cliente) | 0% (penalidad 100%) | — | No aplica reembolso |
| Fuerza mayor (cancela el operador) | 100% del pago | Libre | COORD/SUPER_ADMIN acredita |
| Loyalty por compra | Puntos según nivel (ratio configurable) | Libre | Automático al confirmar pago |
| Compensación manual (admin) | Variable | Libre | SUPER_ADMIN |
| Ver anuncios rewarded (máx 3/día) | Puntos fijos por visualización | Libre | Automático al completar ad |
| Dejar reseña | Puntos fijos por reseña | Libre | Automático al enviar |

**Criterios de aceptación:**
- [ ] Cancelación del cliente: `DB.transaction` atómico (CANCELED + CREDIT wallet). Monto según franja de cancelación (ver Spec-C RF-C11)
- [ ] Fuerza mayor: solo `COORD` o `SUPER_ADMIN` puede acreditar. Todos los Coins son LIBRES (usables en cualquier operador)
- [ ] No existen Coins restringidos por operador (ADR-007)

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

### RF-D07 — Cancelación autónoma (escalonada — ADR-007)
*(Ver Spec-C RF-C11 para la tabla completa de franjas y penalidades)*
**Criterios de aceptación:**
- [ ] **≥10 días**: Opción de reprogramar (RF-D08b) o cancelar con penalidad 40% → recibe 60% en Coins
- [ ] **5–9 días**: Cancelar con penalidad 60% → recibe 40% en Coins
- [ ] **<5 días**: Botón deshabilitado con tooltip "Sin reembolso por cancelación tardía — penalidad 100%"
- [ ] Modal muestra la franja actual y el monto exacto que recibirá: "Recibirás $X en Borondo Coins (penalidad del Y%)"
- [ ] `DB.transaction`: booking → `CANCELED` + `WalletTransactions` CREDIT (monto según franja) + `PenaltyIncome` registro
- [ ] Fuerza mayor: requiere adjuntar documento EPS → penalidades reducidas (ver Spec-C RF-C11)

---

## 6. Chat tripartito (Fase 2)

### RF-D08 — Chat 24h pre-tour
**Criterios de aceptación:**
- [ ] Botón "Abrir Chat" visible en reservas `CONFIRMED` con fecha futura
- [ ] Botón deshabilitado hasta 24h antes del tour con countdown
- [ ] Al activarse: sala de chat con el cliente, el guía asignado y el **agente de ventas** (no el coordinador)
- [ ] Permite texto y adjuntar fotos (presigned URL S3)
- [ ] Historial en DynamoDB (PK: `CHAT#CLIENT#{booking_id}`, SK: timestamp#messageId)
- [ ] TTL: mensajes se eliminan cuando el tour finaliza (estado `COMPLETED` o `TERMINADO`)

### RF-D08b — Reprogramar reserva
**Criterios de aceptación:**
- [ ] El cliente puede solicitar reprogramación si `tour_date - now() >= 5 días calendario`.
- [ ] UI muestra calendario con instancias disponibles del mismo tour.
- [ ] Si la nueva instancia tiene sobrecargo, el cliente debe pagar la diferencia vía link de pago.
- [ ] Si el cliente no paga en 48h, se cancela la solicitud de reprogramación.

### RF-D10 — Recordatorio pre-tour (Push + Email)
**Criterios de aceptación:**
- [ ] BullMQ job que corre 24h antes de cada instancia.
- [ ] Envía Push Notification y Email a pasajeros con booking `CONFIRMED`.
- [ ] Contenido: "¡Prepárate! Tu tour [Nombre] empieza mañana a las [Hora]. No olvides [Recomendaciones]."
- [ ] Si el tour no tiene guía asignado alerta al COORD en el mensaje intero.

---

## 6b. Onboarding del Viajero (H-63)

### RF-D11 — Onboarding completo del viajero con tooltips
**Contexto:** Un viajero recién registrado llega a `/mis-reservas` y no sabe qué puede hacer en la plataforma. Un onboarding guiado con tooltips reduce la fricción y aumenta la retención.

**Criterios de aceptación:**
- [ ] Al primer login del usuario (campo `onboarding_completed = false` en `Users`), se activa automáticamente una secuencia de onboarding.
- [ ] La secuencia usa **Shepherd.js** (o equivalente React) para mostrar tooltips contextuales sobre los elementos de la UI.
- [ ] Pasos del onboarding (en orden):
  1. **Bienvenida**: modal con avatar del nivel actual (Explorador) y mensaje "¡Bienvenido a BorondoTours! Te mostramos cómo funciona en 30 segundos".
  2. **Búsqueda de tours** *(tooltip sobre el buscador)*: "Encuentra tu próxima aventura: filtra por destino, fecha y tipo de tour".
  3. **Wallet** *(tooltip sobre el saldo de Coins)*: "Ganas Borondo Coins con cada compra. Son como cashback para tu próximo tour".
  4. **Nivel de viajero** *(tooltip sobre el badge de nivel)*: "Entre más tours hagas, más beneficios: descuentos, acceso anticipado y tours exclusivos".
  5. **Mis reservas** *(tooltip sobre la lista vacía)*: "Aquí aparecerán todos tus tours próximos y pasados. ¡Haz tu primera reserva!".
  6. **CTA final**: botón "¡Explorar tours ahora!" que lleva a `/` (Discovery).
- [ ] El usuario puede saltar el onboarding con botón "Saltar" en cualquier paso — se marca como completado igualmente.
- [ ] Al completar el onboarding: actualizar `Users.onboarding_completed = true` vía `PATCH /api/v1/users/me/onboarding`.
- [ ] El onboarding NO se vuelve a mostrar aunque el usuario limpie cookies (persiste en backend).
- [ ] En mobile (viewport < 768px): los tooltips se adaptan a posición inferior con flecha apuntando al elemento.
- [ ] Los tooltips son accesibles: focus trap dentro del tooltip, Escape para saltar, ARIA roles correctos.

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
PATCH /api/v1/users/me/onboarding   → marcar onboarding como completado
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
  - user_id: uuid FK (UNIQUE)
  - balance: decimal (default: 0)    ← saldo total en Coins (todos libres, ADR-007)

WalletTransactions
  - id: uuid
  - wallet_id: uuid FK
  - booking_id: uuid FK | null
  - type: enum (CREDIT, DEBIT)
  - amount: decimal
  - reason: enum (CANCELLATION_REFUND, FORCE_MAJEURE, LOYALTY_PURCHASE, COMPENSATION, CHECKOUT_USE, AD_REWARD, REVIEW_REWARD, REFERRAL_REWARD, VOIDED)
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
