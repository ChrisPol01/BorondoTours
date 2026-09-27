---
tags: [spec, loyalty, coins, wallet, gamificacion, niveles, engagement, multifactorial]
created: 2025-07-14
updated: 2026-06-07
status: listo-para-implementar
kiro-spec: .kiro/specs/flujo-e-loyalty.md
---

# 📋 Spec E — Programa de Lealtad: Borondo Coins, Puntos y Niveles

> **Modelo actualizado (ADR-007):** Sistema de puntos multifactorial con ratio configurable.
> Los Coins NO son 1:1 con COP. El ratio es configurable por el SUPER_ADMIN.
> Los niveles se alcanzan por engagement (múltiples acciones), no solo por compras.

---

## 1. Objetivos de negocio

- Incrementar la retención de clientes y la frecuencia de interacción (no solo compra)
- Financiar el programa con los ingresos publicitarios (Rewarded Ads — ver Spec-C RF-C-ADS03)
- Crear diferenciación premium para usuarios de mayor valor (niveles 4 y 5: sin ads, tours exclusivos)
- El costo de los Coins otorgados SIEMPRE debe ser menor al ingreso publicitario generado
- Incentivar acciones de engagement (reseñas, ads, referidos) que tienen costo $0 para BorondoTours

---

## 2. Economía de Borondo Coins — Ratio Configurable

### RF-E01 — Ratio Coins:COP (NO es 1:1)
**Contexto:** El ratio entre Coins y dinero real es configurable. Permite que BorondoTours controle la inflación del programa y que los números grandes sean psicológicamente atractivos.

**Criterios de aceptación:**
- [ ] Ratio configurable por SUPER_ADMIN en tabla `LoyaltyConfig`
- [ ] Ratio por defecto: **100 Coins = $500 COP** (1 Coin = $5 COP de descuento)
- [ ] El ratio se muestra claramente al usuario: "Tus 2.500 Coins equivalen a $12.500 de descuento"
- [ ] Al cambiar el ratio: los Coins existentes se mantienen (no se recalculan), solo cambia la equivalencia futura
- [ ] El ratio actual se almacena como snapshot en cada transacción (para auditoría)
- [ ] Mínimo de Coins para usar en checkout: 100 Coins (= $500 COP con ratio default)

### RF-E02 — Fuentes de Coins (multifactorial)
**Contexto:** Los Coins se ganan por MÚLTIPLES acciones, no solo por comprar. Esto incentiva engagement activo.

| Acción | Coins otorgados | Frecuencia | Costo real para BorondoTours |
|--------|----------------|------------|------------------------------|
| Compra de tour (% según nivel) | Variable (0.5%-3% del subtotal convertido a Coins) | Por compra | Financiado por comisión marketplace |
| Ver anuncio rewarded completo (5s mín) | 10 Coins (configurable) | Máx 3/día | Financiado por CPM del anunciante |
| Dejar reseña del tour | 50 Coins | Por booking completado | $0 (engagement gratuito) |
| Dejar reseña del guía | 30 Coins | Por booking completado | $0 |
| Referir amigo que compre | 200 Coins (referente) + 100 Coins (referido) | Por referido convertido | Costo de adquisición subsidiado |
| Completar perfil (onboarding) | 100 Coins (una vez) | Una vez | $0 |
| Tour internacional (bonus local) | 2x multiplicador en Coins de compra | Por compra | Proporcional a comisión |
| Tour nacional (bonus extranjero) | 1.5x multiplicador | Por compra | Proporcional a comisión |

**Criterios de aceptación:**
- [ ] Cada fuente de Coins tiene su propia `reason` en `WalletTransactions`
- [ ] Los montos son configurables desde el panel SUPER_ADMIN (tabla `CoinRewardConfig`)
- [ ] El multiplicador por nacionalidad se calcula: si `user.country != tour.country` entonces bonus
- [ ] Los Coins por reseña solo se otorgan si la reseña tiene mínimo 20 caracteres (evitar spam)
- [ ] Los Coins por anuncios se limitan a 3/día (Redis counter con TTL 24h)
- [ ] Todas las transacciones son auditables y trazables

---

## 3. Sistema de Niveles — Puntos de Experiencia (XP)

### RF-E03 — Niveles por puntos de experiencia (no solo compras)
**Contexto:** Los niveles se alcanzan acumulando Puntos de Experiencia (XP). Los XP son DIFERENTES a los Borondo Coins. Los XP determinan el nivel; los Coins son la moneda de descuento.

**Fuentes de XP:**

| Acción | XP otorgados | Nota |
|--------|-------------|------|
| Tour nacional completado | 100 XP | Base |
| Tour internacional completado | 250 XP | Incentiva diversidad |
| Crucero completado | 300 XP | Premium |
| Monto acumulado por cada $1M COP | 50 XP | Recompensa por volumen |
| Reseña escrita (tour) | 30 XP | Engagement |
| Reseña escrita (guía) | 20 XP | Engagement |
| Referido convertido | 75 XP | Growth |
| Anuncios vistos en el mes (20 o más) | 25 XP/mes | Engagement con ads |
| Perfil completado | 50 XP (una vez) | Onboarding |

**Tabla de niveles por XP:**

| Nivel | Nombre | XP requeridos | % Coins por compra | Beneficios |
|-------|--------|--------------|-------------------|------------|
| 0 | Sin nivel | 0 | 0% | Acceso básico |
| 1 | Explorador | 100 XP | 0.5% | Badge + ofertas anticipadas 12h |
| 2 | Viajero | 1.500 XP | 1% | Acceso anticipado 24h a nuevos tours |
| 3 | Aventurero | 5.000 XP | 1.5% | 3% descuento en add-ons |
| 4 | Conquistador | 12.000 XP | 2% | Prioridad lista de espera + 5% desc add-ons + sin ads en checkout |
| 5 | Embajador | 25.000 XP | 3% | Tours exclusivos + sin ads en todo el flujo + badge especial |

**Criterios de aceptación:**
- [ ] Los XP se acumulan de forma permanente (nunca bajan)
- [ ] El nivel NUNCA baja (una vez alcanzado, es permanente)
- [ ] Al alcanzar un nuevo nivel: notificación push + email de celebración + animación en portal
- [ ] Barra de progreso visible: "Te faltan X XP para ser [Siguiente Nivel]"
- [ ] El % de Coins por compra se aplica según el nivel ACTUAL del usuario al momento de la compra
- [ ] Los umbrales de XP son configurables por SUPER_ADMIN (tabla `LoyaltyLevels`)
- [ ] Un usuario que hace 5 tours + 5 reseñas + ve ads + refiere amigos sube MÁS RÁPIDO que uno que solo compra

### RF-E04 — Insignias de nivel
**Criterios de aceptación:**
- [ ] Cada nivel tiene un ícono/badge único visible en perfil y en portal cliente
- [ ] Al subir de nivel: notificación push / email de celebración con el nuevo badge
- [ ] Los badges se muestran en el avatar del usuario (overlay)
- [ ] Badge especial "Embajador" tiene diseño premium diferenciado

---

## 4. Coins Libres — Sin Restricción ni Expiración

### RF-E05 — Todos los Coins son libres (ADR-007)
**Criterios de aceptación:**
- [ ] **Todos los Borondo Coins son LIBRES**: usables en cualquier tour de cualquier operador
- [ ] No existen Coins restringidos por operador
- [ ] Los Coins **NO expiran** (permanentes mientras la cuenta esté activa)
- [ ] No hay BullMQ jobs de expiración
- [ ] El wallet muestra un solo saldo total: "X Borondo Coins (equivalen a $Y de descuento)"

---

## 5. Wallet Virtual

### RF-E06 — Vista del wallet en portal cliente
**Criterios de aceptación:**
- [ ] Sección "Mi Wallet" en el portal cliente con:
  - Saldo total de Coins + equivalencia en COP (según ratio vigente)
  - Gráfico de historial de movimientos (últimos 90 días)
  - Tabla de transacciones paginada (tipo, monto, fecha, tour/referencia, reason)
- [ ] Filtros: por tipo (CREDIT, DEBIT), por reason, por fecha
- [ ] Exportar historial como CSV
- [ ] Sección "Cómo ganar más Coins" con las acciones disponibles y sus recompensas

### RF-E07 — Transacciones del wallet
**Tipos y razones soportados (enum WalletTransactionReason):**
- [ ] `CREDIT / LOYALTY_PURCHASE` — Coins ganados por compra confirmada (% según nivel)
- [ ] `CREDIT / AD_REWARD` — Coins ganados por ver anuncio rewarded
- [ ] `CREDIT / REVIEW_REWARD` — Coins ganados por dejar reseña
- [ ] `CREDIT / REFERRAL_REWARD` — Coins ganados por referido que compró
- [ ] `CREDIT / CANCELLATION_REFUND` — Coins otorgados por cancelación (según franja, Spec-C RF-C11)
- [ ] `CREDIT / FORCE_MAJEURE` — Coins libres por cancelación del operador
- [ ] `CREDIT / COMPENSATION` — Ajuste manual por SUPER_ADMIN/COORD (nota obligatoria)
- [ ] `CREDIT / ONBOARDING` — Coins por completar perfil (una vez)
- [ ] `DEBIT / CHECKOUT_USE` — Coins aplicados como descuento en checkout
- [ ] `DEBIT / VOIDED` — Reverso por booking fraudulento o anulado

---

## 6. Uso de Coins en Checkout

### RF-E08 — Aplicar Coins como descuento
**Reglas de negocio:**
- [ ] El descuento se calcula: `descuento_cop = coins_usados * (ratio_cop / ratio_coins)`
- [ ] El descuento se aplica **antes del cálculo de IVA** (reduce la base imponible)
- [ ] Mínimo: 100 Coins para usar (equivale a $500 COP con ratio default)
- [ ] No se pueden usar fracciones menores a 10 Coins
- [ ] Si el booking es cancelado: los Coins usados se devuelven según la franja de cancelación
- [ ] Si el booking es cancelado antes de pagar: los Coins preseleccionados se liberan inmediatamente
- [ ] `SELECT FOR UPDATE` en wallet al descontar (previene race condition)

---

## 7. Gamificación

### RF-E09 — Mapa de conquistas (Fase 2)
**Criterios de aceptación:**
- [ ] Mapa SVG/Mapbox con departamentos de Colombia coloreados según tours completados
- [ ] Al completar tour en región nueva: animación de "conquista" + badge de región
- [ ] Reto de temporada: "Completa 3 tours en el Eje Cafetero antes del 31 de octubre" → bonus XP + Coins
- [ ] Accesible desde portal cliente en pestaña "Mis conquistas"

### RF-E10 — Referidos (Fase 2)
**Criterios de aceptación:**
- [ ] Código de referido único (6 caracteres alfanuméricos) por usuario
- [ ] Referente recibe: 200 Coins + 75 XP al primer tour completado del referido
- [ ] Referido recibe: 100 Coins de bienvenida al completar su primera compra
- [ ] Máximo 20 referidos activos por usuario
- [ ] Panel de referidos: links enviados, convertidos, Coins + XP ganados

### RF-E11 — Retos semanales/mensuales (Fase 2)
**Criterios de aceptación:**
- [ ] El SUPER_ADMIN puede crear "retos" temporales con fecha de inicio y fin
- [ ] Ejemplo: "Deja 3 reseñas esta semana → 150 Coins bonus"
- [ ] Ejemplo: "Haz un tour en un destino nuevo → 100 XP bonus"
- [ ] Los retos activos se muestran en el portal cliente con barra de progreso
- [ ] Al completar un reto: animación de celebración + acreditación automática

---

## 8. API Endpoints

```
GET /api/v1/wallet/balance
  Auth: requerido
  Response: { coins: number, equivalent_cop: number, ratio: { coins: number, cop: number }, level: LoyaltyLevel }

GET /api/v1/wallet/transactions
  Auth: requerido
  Query: type?, reason?, from_date?, to_date?, page?, limit?
  Response: { data: WalletTransaction[], total: number }

GET /api/v1/wallet/transactions/export
  Auth: requerido
  Response: CSV stream

GET /api/v1/loyalty/me
  Auth: requerido
  Response: { 
    level: number, level_name: string, 
    xp_current: number, xp_next_level: number, 
    xp_progress_pct: number,
    coins_pct_per_purchase: number,
    benefits: string[],
    stats: { tours_national, tours_international, tours_cruise, reviews_written, referrals_converted, ads_viewed_month }
  }

GET /api/v1/loyalty/how-to-earn
  Response: CoinRewardConfig[] (tabla de acciones y recompensas para mostrar al usuario)

POST /api/v1/wallet/adjust
  Auth: SUPER_ADMIN / COORD
  Body: { user_id, coins_amount, xp_amount?, reason: 'COMPENSATION', note: string }
```

---

## 9. Modelo de datos

> **Nota:** Spec-E extiende el modelo canónico de `Wallets` y `WalletTransactions` definido en Modelo-Datos-Core §12.
> Los campos adicionales (`xp_amount`, `ratio_snapshot`) y las razones nuevas (`AD_REWARD`, `REVIEW_REWARD`, `REFERRAL_REWARD`, `ONBOARDING`)
> deben incorporarse al Modelo-Datos-Core cuando se implemente esta versión del programa de lealtad.

```
LoyaltyConfig (singleton — configuración global del programa)
  - id: integer (PK, siempre = 1)
  - coin_ratio_coins: integer (default: 100)     ← "cada X Coins..."
  - coin_ratio_cop: integer (default: 500)       ← "...equivalen a $Y COP"
  - min_coins_to_use: integer (default: 100)
  - max_referrals_per_user: integer (default: 20)
  - max_ads_per_day: integer (default: 3)
  - updated_by: uuid FK
  - created_at: timestamp
  - updated_at: timestamp

LoyaltyLevels (tabla de configuración — editable desde ERP)
  - id: integer (0-5)
  - name: string
  - xp_threshold: integer                ← XP necesarios para alcanzar este nivel
  - coins_pct_per_purchase: decimal      ← % de Coins otorgados por compra
  - benefits: jsonb                      ← array de beneficios del nivel
  - badge_icon_url: string | null
  - created_at: timestamp
  - updated_at: timestamp

CoinRewardConfig (tabla de configuración — recompensas por acción)
  - id: uuid (PK)
  - action: enum (PURCHASE, AD_VIEW, REVIEW_TOUR, REVIEW_GUIDE, REFERRAL, ONBOARDING, CHALLENGE)
  - coins_amount: integer               ← Coins otorgados por esta acción
  - xp_amount: integer                  ← XP otorgados por esta acción
  - max_per_day: integer | null         ← límite diario (null = sin límite)
  - max_per_user: integer | null        ← límite total por usuario (null = ilimitado)
  - is_active: boolean (default: true)
  - description_es: string              ← texto visible al usuario en "Cómo ganar"
  - updated_by: uuid FK
  - created_at: timestamp
  - updated_at: timestamp

UserStats (extensión con XP — fuente de verdad para niveles)
  - user_id: uuid FK (PK)
  - tours_national: integer (default: 0)
  - tours_international: integer (default: 0)
  - tours_cruise: integer (default: 0)
  - total_spent: decimal (default: 0)
  - xp_total: integer (default: 0)
  - loyalty_level: integer (0-5)
  - reviews_written: integer (default: 0)
  - referrals_converted: integer (default: 0)
  - ads_viewed_total: integer (default: 0)
  - ads_viewed_today: integer (default: 0)   ← reset vía Redis TTL (no cron job)
  - level_achieved_at: timestamp | null
  - created_at: timestamp
  - updated_at: timestamp

Wallets (simplificado — ADR-007)
  - id: uuid (PK)
  - user_id: uuid FK (UNIQUE)
  - balance: decimal (default: 0)       ← saldo total en Coins (todos libres)
  - created_at: timestamp
  - updated_at: timestamp

WalletTransactions (extiende Modelo-Datos-Core §12)
  - id: uuid (PK)
  - wallet_id: uuid FK
  - booking_id: uuid FK | null
  - type: enum (CREDIT, DEBIT)
  - amount: decimal                     ← monto en Coins (coherente con Core)
  - xp_amount: integer | null           ← XP otorgados (si aplica)
  - reason: enum (LOYALTY_PURCHASE, AD_REWARD, REVIEW_REWARD, REFERRAL_REWARD, 
                  CANCELLATION_REFUND, FORCE_MAJEURE, COMPENSATION, ONBOARDING,
                  CHECKOUT_USE, VOIDED)
  - ratio_snapshot: jsonb | null        ← {coins: 100, cop: 500} al momento de la transacción
  - note: text | null                   ← obligatorio si reason = COMPENSATION
  - created_by: uuid FK
  - created_at: timestamp

LoyaltyChallenges (retos temporales — Fase 2)
  - id: uuid (PK)
  - title: string
  - description: text
  - action_required: enum
  - target_count: integer
  - coins_reward: integer
  - xp_reward: integer
  - starts_at: timestamp
  - ends_at: timestamp
  - is_active: boolean
  - created_by: uuid FK
  - created_at: timestamp
```

---

## 10. Dependencias y riesgos

| Dependencia | Riesgo | Decisión |
|---|---|---|
| Costo Coins < ingreso publicitario | Si el programa cuesta más de lo que genera | Monitorear: reporte mensual de margen (ingreso ads - costo Coins otorgados por ads) |
| Niveles 4 y 5 sin anuncios | No generan ingreso por ads | Su retención y volumen de compra justifica: son high-value customers |
| Gaming del sistema (ver ads sin atención) | Usuarios que farmean Coins viendo ads sin mirar | Validación: ad debe completarse (5s), fingerprint de sesión, Redis anti-abuse |
| Race condition en checkout | Dos bookings simultáneos gastan los mismos Coins | `SELECT FOR UPDATE` sobre `Wallets` al descontar |
| Ratio cambia y usuarios se confunden | "Antes mis 1000 Coins valían X y ahora valen Y" | El ratio snapshot se guarda por transacción. Cambios de ratio solo afectan futuras transacciones |

---

## Links relacionados
- [[Spec-C-Checkout]] (RF-C-ADS03 Rewarded Ads, RF-C05 uso en checkout)
- [[Spec-D-Client-Portal]] (wallet UI, niveles en perfil)
- [[../02-ADRs/ADR-007-Politica-Cancelacion-Escalonada]] (§Eliminación de Coins Restringidos)
- [[../03-Knowledge/Modelo-Comisiones]]
- [[../03-Knowledge/Modelo-Datos-Core]] (§12 Wallets y WalletTransactions)
