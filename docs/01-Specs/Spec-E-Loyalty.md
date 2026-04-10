---
tags: [spec, loyalty, coins, wallet, gamificacion, niveles]
created: 2025-07-14
updated: 2026-03-26
status: listo-para-implementar
kiro-spec: .kiro/specs/flujo-e-loyalty.md
---

# 📋 Spec E — Programa de Lealtad: Borondo Coins y Niveles

---

## 1. Objetivos de negocio

- Incrementar la retención de clientes y la frecuencia de compra
- Financiar el programa con los ingresos publicitarios (ver Modelo-Comisiones)
- Crear diferenciación premium para los usuarios de mayor valor (niveles 4 y 5)
- Los % de Coins deben mantenerse por debajo del ingreso publicitario generado por ese usuario

---

## 2. Estructura de Niveles

### RF-E01 — Niveles de lealtad
**Criterios de aceptación:**
- [ ] 5 niveles con **criterio dual (tours completados O monto acumulado en COP)**. El usuario sube de nivel al cumplir **cualquiera** de los dos criterios:

> ℹ️ **Fuente de verdad:** La tabla canónica de niveles está en Spec-D §2. Esta sección refleja la misma información.

| Nivel | Nombre | Criterio tours | Criterio monto COP | % Coins por compra | Beneficios extra |
|---|---|---|---|---|---|
| 1 | Explorador | 1 tour | — | 0.5% | Badge + acceso a ofertas anticipadas 12h |
| 2 | Viajero | 10 tours | $2.000.000+ | 1% | Acceso anticipado 24h a nuevos tours |
| 3 | Aventurero | 25 tours | $8.000.000+ | 1.5% | 3% descuento en add-ons |
| 4 | Conquistador | 50 tours | $20.000.000+ | 2% | Prioridad en lista de espera + 5% dcto add-ons, sin anuncios en checkout |
| 5 | Embajador | 2 int'l + 10 nac. ó 1 crucero + 10 nac. | — | 3% | Tours exclusivos + sin anuncios en todo el flujo, badge especial |

- [ ] El nivel se recalcula automáticamente después de cada booking CONFIRMED
- [ ] El nivel NUNCA baja (una vez alcanzado, es permanente)
- [ ] En el perfil del usuario se muestra: nivel actual, barra de progreso al siguiente nivel, tours/COP faltantes

### RF-E02 — Insignias de nivel
**Criterios de aceptación:**
- [ ] Cada nivel tiene un ícono/badge único visible en perfil y en portal cliente
- [ ] Al subir de nivel: notificación push / email de celebración con el nuevo badge
- [ ] Los badges se muestran en el avatar del usuario (pequeño overlay)

---

## 3. Economía de Borondo Coins

### RF-E03 — Acumulación de Coins al confirmar una reserva
**Contexto:** Los Coins se otorgan al momento en que el pago es CONFIRMED por el webhook de OnePay.la.

**Criterios de aceptación:**
- [ ] Cálculo: `Coins = floor(subtotal_antes_iva × % nivel / 100)` (en pesos COP, 1 Coin = $1 COP)
- [ ] Los Coins se acreditan **netos del IVA** (si aplica) — no se bonifican sobre el IVA
- [ ] Los Coins acreditados son **libres** por defecto (usables en cualquier tour)
- [ ] Excepción: si el operador activó "Coins restringidos", los Coins de ese tour solo se usan con ese operador
- [ ] Transacción registrada en `WalletTransactions` con tipo `CREDIT` y reason `LOYALTY_PURCHASE`
- [ ] El saldo del wallet se actualiza en tiempo real (invalidar TanStack Query del wallet)

### RF-E04 — Tipos de Coins
**Criterios de aceptación:**
- [ ] **Coins Libres**: usables en cualquier tour de cualquier operador
- [ ] **Coins Restringidos**: vinculados a un `operator_id` específico
  - Se otorgan cuando: cliente cancela con ≥5 días de antelación (ver Modelo-Comisiones)
  - Se otorgan cuando: operador ofrece compensación por cancelación propia
- [ ] Al usar Coins en checkout: primero se consumen Coins Libres, luego Restringidos del operador correspondiente
- [ ] El saldo del wallet muestra subtotales: "X Coins libres + Y Coins restringidos (Operador Z)"

### RF-E05 — Expiración de Coins
**Criterios de aceptación:**
- [ ] Coins Libres: **no expiran**
- [ ] Coins Restringidos: expiran a los **180 días** desde su acreditación
- [ ] 30 días antes de expirar: email automático de recordatorio (BullMQ job)
- [ ] 7 días antes de expirar: segundo email de urgencia
- [ ] Al expirar: transacción `DEBIT` con reason `EXPIRED` en `WalletTransactions`, saldo se reduce

---

## 4. Wallet Virtual

### RF-E06 — Vista del wallet en portal cliente
**Criterios de aceptación:**
- [ ] Sección "Mi Wallet" en el portal cliente con:
  - Saldo total de Coins (libres + restringidos)
  - Gráfico de historial de movimientos (últimos 90 días)
  - Tabla de transacciones paginada (tipo, monto, fecha, tour/referencia)
- [ ] Filtros en la tabla: por tipo (CREDIT, DEBIT), por reason (LOYALTY_PURCHASE, CANCELLATION, CHECKOUT_USE, EXPIRED, FORCE_MAJEURE, COMPENSATION), por fecha
- [ ] Exportar historial como CSV (solo si el usuario lo solicita — botón)

### RF-E07 — Transacciones del wallet
> ℹ️ **Tabla unificada:** Se usa `WalletTransactions` (misma tabla que Spec-D) con campos `type` (CREDIT/DEBIT) y `reason` para distinguir el motivo.

**Tipos y razones soportados:**
- [ ] `CREDIT / LOYALTY_PURCHASE` — Coins ganados por compra confirmada
- [ ] `DEBIT / CHECKOUT_USE` — Coins aplicados como descuento en checkout
- [ ] `DEBIT / EXPIRED` — Coins restringidos vencidos
- [ ] `CREDIT / CANCELLATION` — Coins otorgados al cliente cuando cancela con ≥5 días (reemplazan reembolso bancario)
- [ ] `CREDIT / FORCE_MAJEURE` — Coins restringidos otorgados por cancelación del operador
- [ ] `CREDIT / COMPENSATION` — Ajuste manual por SUPER_ADMIN o COORD (con nota obligatoria)
- [ ] `DEBIT / VOIDED` — Reverso de Coins si un booking fue fraudulento o anulado por SUPER_ADMIN

---

## 5. Uso de Coins en Checkout (integración con Spec C)

### RF-E08 — Toggle "Usar Borondo Coins" en checkout
*(Definido en Spec-C RF-C05 — este spec define la lógica de negocio)*

**Reglas de negocio:**
- [ ] El descuento por Coins se aplica **antes del cálculo de IVA** (reduce la base imponible)
- [ ] Mínimo de Coins para usar: 500 Coins (equivalente a $500 COP)
- [ ] No se pueden usar Coins fraccionados (múltiplos de 100)
- [ ] Si el booking es cancelado y ya se usaron Coins: los Coins se **devuelven** al wallet (`REFUNDED`)
- [ ] Si el booking es cancelado antes de pagar: los Coins preseleccionados se liberan inmediatamente

---

## 6. Gamificación

### RF-E09 — Mapa de conquistas (Fase 2)
**Contexto:** Mapa visual de Colombia donde se "iluminan" las regiones ya visitadas.

**Criterios de aceptación:**
- [ ] Mapa SVG/Mapbox con regiones de Colombia coloreadas según tours completados
- [ ] Al completar un tour en una región nueva: animación de "conquista" + badge de región
- [ ] Reto de temporada: "Completa 3 tours en el Eje Cafetero antes del 31 de octubre" → bonus de Coins
- [ ] Accesible desde el portal cliente en pestaña "Mis conquistas"

### RF-E10 — Referidos (Fase 2)
**Criterios de aceptación:**
- [ ] Cada usuario tiene un código de referido único (6 caracteres alfanuméricos)
- [ ] Si un referido completa su primera compra: el referente recibe 1.000 Coins Libres
- [ ] El referido recibe 500 Coins de bienvenida al completar su primera compra
- [ ] Máximo 10 referidos activos por usuario
- [ ] El panel de referidos muestra: links enviados, convertidos, Coins ganados por referidos

---

## 7. API Endpoints

```
GET /api/v1/wallet/balance
  Auth: requerido
  Response: { free_coins: number, restricted_coins: RestrictedBalance[], total: number, level: LoyaltyLevel }

GET /api/v1/wallet/transactions
  Auth: requerido
  Query: type?, from_date?, to_date?, page?, limit?
  Response: { data: CoinTransaction[], total: number }

GET /api/v1/wallet/transactions/export
  Auth: requerido
  Response: CSV stream

GET /api/v1/loyalty/level
  Auth: requerido
  Response: { current_level: LoyaltyLevel, next_level: LoyaltyLevel | null, total_spent: number, coins_to_next: number }

POST /api/v1/wallet/adjust    ← solo SUPER_ADMIN / COORD
  Body: { user_id, amount, type: 'MANUAL', note: string }
```

---

## 8. Modelo de datos

```
LoyaltyLevels (tabla de configuración — editable desde ERP)
  - id: integer (0–5)
  - nombre: string
  - umbral_tours: integer | null      ← criterio por tours completados
  - umbral_cop: decimal | null        ← criterio por monto acumulado
  - umbral_tours_intl: integer | null ← para nivel 5 (tours internacionales)
  - pct_coins: decimal (0, 0.5, 1, 1.5, 2, 3)
  - beneficios: jsonb

UserLoyalty (se fusiona con UserStats de Spec-D)
  → Ver Spec-D §9 — UserStats es la fuente de verdad.
  → `UserStats.loyalty_level` contiene el nivel actual del usuario.

WalletTransactions (tabla unificada — fuente de verdad en Spec-D §9)
  → Ver Spec-D §9 — WalletTransactions con type CREDIT/DEBIT y reason enum.
  → Los campos adicionales de restricción por operador:
  - restricted_operator_id: uuid FK | null  ← solo si Coins restringidos
  - expires_at: timestamp | null            ← solo si Coins restringidos (180 días)
  - note: string | null                     ← obligatorio si reason = COMPENSATION

RestrictedCoinBalances (vista materializada o tabla)
  - user_id: uuid FK
  - operator_id: uuid FK
  - balance: decimal
  - earliest_expiry: timestamp
```

---

## 9. Dependencias y riesgos

| Dependencia | Riesgo | Decisión |
|---|---|---|
| % Coins < ingreso publicitario | Si el balance es negativo, el programa pierde dinero | Monitorear mensualmente en ERP con reporte de margen de lealtad |
| Niveles 4 y 5 sin anuncios | Sus Coins se cubren con comisión marketplace | Son usuarios de alto valor — su retención justifica el costo (ver Modelo-Comisiones) |
| Coins restringidos vencidos | Usuario puede sentir que "perdió" dinero | Email temprano (30 días) + recordatorio urgente (7 días) vía BullMQ |
| Race condition en checkout | Dos bookings simultáneos del mismo usuario que gastan los mismos Coins | `SELECT FOR UPDATE` sobre `UserLoyalty` al descontar Coins |

---

## Links relacionados
- [[Spec-C-Checkout]]
- [[Spec-D-Client-Portal]]
- [[../03-Knowledge/Modelo-Comisiones]]
- [[../02-ADRs/ADR-001-Onepayla-Split-Marketplace]] *(en migración a OnePay.la)*
