---
tags: [tech-design, domain, financiero, funciones-puras, pricing, comisiones, penalidades]
created: 2026-07-14
updated: 2026-07-14
status: aprobado
---

# Dominio Financiero — Funciones Puras de Cálculo

> Este documento define las funciones puras que encapsulan TODA la lógica financiera
> de BorondoTours. Son funciones sin side-effects, sin dependencias de framework ni BD,
> testeables en aislamiento. Ningún service de NestJS debe calcular dinero directamente
> — debe delegar a estas funciones.

---

## 1. Principios de Diseño

- **Puras:** mismos inputs → mismos outputs, sin estado externo
- **Sin framework:** no dependen de NestJS, Drizzle, ni servicios AWS
- **Moneda:** todo en COP (pesos colombianos), sin centavos
- **Redondeo:** `Math.floor()` siempre — truncar hacia abajo, sin decimales
- **Testeable:** cada función tiene edge cases documentados + tests obligatorios
- **Ubicación:** `/backend/src/domain/` (fuera de `/modules/`)

---

## 2. Estructura de Carpetas

```
/backend/src/domain/
  /pricing/
    calculate-booking-total.ts
    calculate-booking-total.spec.ts
  /commissions/
    calculate-operator-commission.ts
    calculate-agent-commission.ts
    calculate-freelancer-commission.ts
    commission-scales.ts
    *.spec.ts
  /cancellations/
    calculate-cancellation-penalty.ts
    calculate-cancellation-penalty.spec.ts
  /payouts/
    calculate-operator-payout.ts
    calculate-operator-payout.spec.ts
  /split-fare/
    calculate-split-payment.ts
    calculate-split-payment.spec.ts
  /taxes/
    calculate-iva-margin.ts
    calculate-withholdings.ts
    *.spec.ts
  /shared/
    money.ts          ← utilidades: floor, validateCOP
    types.ts          ← interfaces compartidas
```

---

## 3. Modelo de Precios (contexto)

```
Operador define precio público: $140,000 COP (incluye IVA del operador internamente)
Comisión BorondoTours: 10% contractual = $14,000
BorondoTours puede agregar markup adicional: ej. +$5,000 → precio final $145,000

Lo que recibe el operador: $140,000 - $14,000 = $126,000
Margen BorondoTours (borondo_amount): $14,000 + markup = $19,000
IVA sobre el margen BT (19%): $19,000 × 0.19 = $3,610 → BT lo absorbe
Neto BorondoTours: $19,000 - $3,610 = $15,390

Para extranjeros: mismo precio, pero IVA del margen exento → neto BT = $19,000
```

**Regla visual frontend:** el cliente ve UN precio ("impuestos incluidos"). No se desglosa.
La factura sí detalla: base + IVA (colombiano) o base exenta (extranjero).

---

## 4. Interfaces TypeScript (tipos compartidos)

```typescript
// /backend/src/domain/shared/types.ts

/** Moneda: siempre COP, entero positivo, sin centavos */
type COP = number; // invariante: Math.floor(x) === x && x >= 0

interface PaxItem {
  category: string;       // "Adulto", "Niño (5-12)", etc.
  quantity: number;
  unitPrice: COP;
}

interface AddonItem {
  name: string;
  quantity: number;
  unitPrice: COP;
}

interface BookingTotalInput {
  paxItems: PaxItem[];
  addons: AddonItem[];
  markup: COP;               // markup adicional de BT (puede ser 0)
  commissionPct: number;     // % contractual del operador (ej: 0.10)
  isExemptIva: boolean;      // true si extranjero con pasaporte
}

interface BookingTotalResult {
  operatorPrice: COP;        // precio definido por el operador (sum pax + addons)
  subtotal: COP;             // operatorPrice + markup = lo que paga el cliente
  commissionAmount: COP;     // operatorPrice × commissionPct
  borondoAmount: COP;        // commissionAmount + markup (margen total BT)
  ivaOnMargin: COP;          // borondoAmount × 0.19 (0 si exento)
  netBorondo: COP;           // borondoAmount - ivaOnMargin
  operatorGross: COP;        // operatorPrice - commissionAmount (bruto operador)
  totalClient: COP;          // subtotal (= lo que paga el cliente, IVA absorbido)
}
```

---

## 5. Función: calculateBookingTotal

```typescript
// /backend/src/domain/pricing/calculate-booking-total.ts

export function calculateBookingTotal(input: BookingTotalInput): BookingTotalResult {
  const { paxItems, addons, markup, commissionPct, isExemptIva } = input;

  // 1. Precio del operador (suma de pax × precio + addons)
  const paxTotal = paxItems.reduce((sum, p) => sum + Math.floor(p.unitPrice * p.quantity), 0);
  const addonsTotal = addons.reduce((sum, a) => sum + Math.floor(a.unitPrice * a.quantity), 0);
  const operatorPrice = paxTotal + addonsTotal;

  // 2. Subtotal = lo que paga el cliente (precio operador + markup BT)
  const subtotal = operatorPrice + markup;

  // 3. Comisión contractual del operador
  const commissionAmount = Math.floor(operatorPrice * commissionPct);

  // 4. Margen total de BorondoTours
  const borondoAmount = commissionAmount + markup;

  // 5. IVA sobre el margen (solo colombianos; absorbido por BT)
  const ivaOnMargin = isExemptIva ? 0 : Math.floor(borondoAmount * 0.19);

  // 6. Neto BorondoTours (después de pagar IVA a la DIAN)
  const netBorondo = borondoAmount - ivaOnMargin;

  // 7. Bruto del operador (lo que le corresponde antes de retenciones)
  const operatorGross = operatorPrice - commissionAmount;

  return {
    operatorPrice,
    subtotal,
    commissionAmount,
    borondoAmount,
    ivaOnMargin,
    netBorondo,
    operatorGross,
    totalClient: subtotal, // el cliente paga esto — IVA absorbido, no sumado
  };
}
```

### Ejemplo numérico

```
Input: 2 adultos × $70,000, markup $5,000, comisión 10%, colombiano
  operatorPrice = 2 × 70,000 = $140,000
  subtotal = $140,000 + $5,000 = $145,000 (precio al cliente)
  commissionAmount = $140,000 × 0.10 = $14,000
  borondoAmount = $14,000 + $5,000 = $19,000
  ivaOnMargin = $19,000 × 0.19 = $3,610
  netBorondo = $19,000 - $3,610 = $15,390
  operatorGross = $140,000 - $14,000 = $126,000
  totalClient = $145,000

Extranjero (mismo input, isExemptIva=true):
  ivaOnMargin = $0
  netBorondo = $19,000 (mayor margen)
```

---

## 6. Función: calculateAgentCommission (interno — meta colectiva)

```typescript
// /backend/src/domain/commissions/calculate-agent-commission.ts

interface AgentCommissionInput {
  teamSalesTotal: COP;       // ventas acumuladas del equipo en el periodo
  agentSalesTotal: COP;      // ventas del agente individual (para proporcionalidad)
  borondoAmountTeam: COP;    // borondo_amount total del equipo en el periodo
}

interface AgentCommissionResult {
  tier: string;              // "TIER_1", "TIER_2", etc.
  commissionPct: number;     // % que aplica según la escala
  teamCommission: COP;       // borondoAmountTeam × commissionPct
  agentShare: COP;           // proporcional al agente según sus ventas
  proportion: number;        // agentSalesTotal / teamSalesTotal
}

/** Escalas de comisión para AGENT interno (meta colectiva de equipo) */
const AGENT_INTERNAL_SCALES = [
  { min: 0,          max: 15_000_000, pct: 0.00, tier: 'NO_COMMISSION' },
  { min: 15_000_001, max: 20_000_000, pct: 0.03, tier: 'TIER_1' },
  { min: 20_000_001, max: 30_000_000, pct: 0.05, tier: 'TIER_2' },
  { min: 30_000_001, max: 50_000_000, pct: 0.07, tier: 'TIER_3' },
  { min: 50_000_001, max: Infinity,   pct: 0.10, tier: 'TIER_4' },
] as const;

export function calculateAgentCommission(input: AgentCommissionInput): AgentCommissionResult {
  const { teamSalesTotal, agentSalesTotal, borondoAmountTeam } = input;

  const scale = AGENT_INTERNAL_SCALES.find(s => teamSalesTotal >= s.min && teamSalesTotal <= s.max)!;
  const teamCommission = Math.floor(borondoAmountTeam * scale.pct);
  const proportion = teamSalesTotal > 0 ? agentSalesTotal / teamSalesTotal : 0;
  const agentShare = Math.floor(teamCommission * proportion);

  return { tier: scale.tier, commissionPct: scale.pct, teamCommission, agentShare, proportion };
}
```

> **Nota:** Los % (3%, 5%, 7%, 10%) son placeholder. Ajustar según negociación real.
> El periodo de evaluación es **mensual** (corte el último día del mes).

---

## 7. Función: calculateFreelancerCommission (individual — escalonada)

```typescript
// /backend/src/domain/commissions/calculate-freelancer-commission.ts

interface FreelancerCommissionInput {
  freelancerSalesTotal: COP;     // ventas acumuladas del freelancer en el periodo
  borondoAmountFreelancer: COP;  // borondo_amount generado por sus ventas
}

interface FreelancerCommissionResult {
  tier: string;
  commissionPct: number;
  commissionAmount: COP;
}

/** Escalas de comisión para FREELANCER (individual) */
const FREELANCER_SCALES = [
  { min: 0,          max: 5_000_000,  pct: 0.00, tier: 'NO_COMMISSION' },
  { min: 5_000_001,  max: 10_000_000, pct: 0.03, tier: 'TIER_1' },
  { min: 10_000_001, max: 20_000_000, pct: 0.05, tier: 'TIER_2' },
  { min: 20_000_001, max: 30_000_000, pct: 0.07, tier: 'TIER_3' },
  { min: 30_000_001, max: 50_000_000, pct: 0.10, tier: 'TIER_4' },
] as const;

export function calculateFreelancerCommission(input: FreelancerCommissionInput): FreelancerCommissionResult {
  const { freelancerSalesTotal, borondoAmountFreelancer } = input;

  const scale = FREELANCER_SCALES.find(s => freelancerSalesTotal >= s.min && freelancerSalesTotal <= s.max)!;
  const commissionAmount = Math.floor(borondoAmountFreelancer * scale.pct);

  return { tier: scale.tier, commissionPct: scale.pct, commissionAmount };
}
```

> **Filtro anti-autocompra:** El piso de $5M asegura que alguien que solo compra para
> su familia ($500K-$2M) no gana comisión. Solo a partir de ventas reales masivas.
> Periodo: **mensual** (misma lógica que agentes internos).

---

## 8. Función: calculateCancellationPenalty

```typescript
// /backend/src/domain/cancellations/calculate-cancellation-penalty.ts

type CancellationTier = 'TIER_1_GTE_10' | 'TIER_2_5_TO_9' | 'TIER_3_LT_5' | 'NO_SHOW';

interface CancellationInput {
  amountPaid: COP;                    // lo que el cliente efectivamente pagó
  daysBeforeTour: number;             // días entre cancelación y fecha del tour
  isForceMajeure: boolean;            // true si presenta doc EPS/médico válido
  policy?: {                          // override del operador (null = política global)
    tier1PenaltyPct: number;
    tier1ForceMajeurePct: number;
    tier2PenaltyPct: number;
    tier2ForceMajeurePct: number;
    tier3PenaltyPct: number;
  };
}

interface CancellationResult {
  tier: CancellationTier;
  penaltyPct: number;                 // % aplicado
  penaltyAmount: COP;                 // retenido por BorondoTours (ingreso por penalidad)
  refundInCoins: COP;                 // devuelto al cliente en Coins (fase futura)
  refundBankReal: COP;                // reembolso bancario real (solo derecho de retracto)
  isReschedulable: boolean;           // si puede reprogramar sin costo
}

// Política global por defecto (ADR-007)
const DEFAULT_POLICY = {
  tier1PenaltyPct: 0.40, tier1ForceMajeurePct: 0.10,
  tier2PenaltyPct: 0.60, tier2ForceMajeurePct: 0.30,
  tier3PenaltyPct: 1.00,
};

export function calculateCancellationPenalty(input: CancellationInput): CancellationResult {
  const { amountPaid, daysBeforeTour, isForceMajeure } = input;
  const policy = input.policy ?? DEFAULT_POLICY;

  let tier: CancellationTier;
  let penaltyPct: number;
  let isReschedulable = false;

  if (daysBeforeTour >= 10) {
    tier = 'TIER_1_GTE_10';
    penaltyPct = isForceMajeure ? policy.tier1ForceMajeurePct : policy.tier1PenaltyPct;
    isReschedulable = !isForceMajeure; // puede reprogramar en vez de cancelar
  } else if (daysBeforeTour >= 5) {
    tier = 'TIER_2_5_TO_9';
    penaltyPct = isForceMajeure ? policy.tier2ForceMajeurePct : policy.tier2PenaltyPct;
  } else if (daysBeforeTour >= 1) {
    tier = 'TIER_3_LT_5';
    penaltyPct = policy.tier3PenaltyPct; // 100% siempre (fuerza mayor: caso por caso)
  } else {
    tier = 'NO_SHOW';
    penaltyPct = 1.00;
  }

  const penaltyAmount = Math.floor(amountPaid * penaltyPct);
  const refundInCoins = amountPaid - penaltyAmount; // fase futura: se acredita en Coins
  const refundBankReal = 0; // solo aplica por derecho de retracto (RF-C09), NO aquí

  return { tier, penaltyPct, penaltyAmount, refundInCoins, refundBankReal, isReschedulable };
}
```

### Tabla resumen de casos

| Días antes | Normal | Fuerza Mayor | Reschedulable |
|---|---|---|---|
| ≥10 | 40% penalidad, 60% Coins | 10% penalidad, 90% Coins | ✅ (normal) |
| 5–9 | 60% penalidad, 40% Coins | 30% penalidad, 70% Coins | ❌ |
| <5 | 100% penalidad, 0 devuelto | Caso por caso (COORD/SUPER_ADMIN) | ❌ |
| No Show | 100% penalidad | N/A | ❌ |

> **Contabilidad (CIIU 7911, PUC pendiente investigar):**
> - La penalidad retenida = ingreso por cláusula penal (NO genera IVA — servicio no prestado)
> - Si ya se emitió factura: Nota Crédito parcial + reclasificación como ingreso indemnizatorio
> - El refund en Coins es una "devolución en especie" (Nota Crédito + acreditación wallet)

---

## 9. Función: calculateOperatorPayout

```typescript
// /backend/src/domain/payouts/calculate-operator-payout.ts

interface PayoutInput {
  operatorGross: COP;              // bruto del operador (precio - comisión BT)
  chargebackDeductions: COP;       // descuentos por chargebacks acumulados
  isDeclarant: boolean;            // true → ReteFuente 4%, false → 6%
  retefuenteOverride?: number;     // override manual (si existe en el contrato)
  appliesReteica: boolean;         // si el municipio del servicio obliga ReteICA
  reteicaPct: number;              // tarifa ICA territorial (ej: 0.00966 = 9.66‰)
  appliesReteiva: boolean;         // si aplica retención de IVA (15% del IVA)
  operatorIvaPct: number;          // IVA que el operador cobra (normalmente 0.19)
}

interface PayoutResult {
  grossRevenue: COP;               // operatorGross
  retefuenteAmount: COP;           // ReteFuente sobre el bruto
  reteicaAmount: COP;              // ReteICA sobre el bruto (si aplica)
  reteIvaAmount: COP;              // ReteIVA = 15% del IVA del operador (si aplica)
  totalWithholdings: COP;          // suma de retenciones
  chargebacks: COP;                // descuentos por chargebacks
  netPayout: COP;                  // lo que recibe el operador
}

export function calculateOperatorPayout(input: PayoutInput): PayoutResult {
  const {
    operatorGross, chargebackDeductions, isDeclarant,
    retefuenteOverride, appliesReteica, reteicaPct,
    appliesReteiva, operatorIvaPct
  } = input;

  // ReteFuente sobre el bruto del operador
  const retefuentePct = retefuenteOverride ?? (isDeclarant ? 0.04 : 0.06);
  const retefuenteAmount = Math.floor(operatorGross * retefuentePct);

  // ReteICA sobre el bruto (si el municipio lo requiere)
  const reteicaAmount = appliesReteica ? Math.floor(operatorGross * reteicaPct) : 0;

  // ReteIVA = 15% del IVA que el operador factura
  // Base: IVA del operador sobre su bruto (operatorGross incluye IVA internamente)
  // Aproximación: IVA del operador = operatorGross × (ivaPct / (1 + ivaPct))
  const operatorIvaAmount = Math.floor(operatorGross * (operatorIvaPct / (1 + operatorIvaPct)));
  const reteIvaAmount = appliesReteiva ? Math.floor(operatorIvaAmount * 0.15) : 0;

  const totalWithholdings = retefuenteAmount + reteicaAmount + reteIvaAmount;
  const netPayout = operatorGross - totalWithholdings - chargebackDeductions;

  return {
    grossRevenue: operatorGross,
    retefuenteAmount,
    reteicaAmount,
    reteIvaAmount,
    totalWithholdings,
    chargebacks: chargebackDeductions,
    netPayout: Math.max(0, netPayout), // nunca negativo
  };
}
```

> **Base de retenciones:** siempre sobre el `operatorGross` (bruto del operador,
> después de comisión BT, antes de retenciones). ADR-009 confirmado.
> Los operadores CIIU 7912 (operadores turísticos) aplican las mismas reglas de
> retención que cualquier proveedor de servicios — la tarifa depende de si son
> declarantes de renta (4%) o no (6%).

---

## 10. Función: calculateSplitPayment (pagos parciales con OnePay)

```typescript
// /backend/src/domain/split-fare/calculate-split-payment.ts

interface SplitPaymentInput {
  totalClient: COP;              // lo que paga el cliente en total
  commissionAmount: COP;         // comisión total BT (incluye markup)
  reservationPct: number;        // % de reserva (ej: 0.40 = 40%)
  onepayFeeFlat: COP;           // fee plana de OnePay (ej: $2,200)
  onepayFeePct: number;         // fee % tarjeta (ej: 0.025 para TC, 0 para PSE)
  paymentMethod: 'PSE' | 'TC';  // método de pago elegido
}

interface SplitPaymentResult {
  payment1Amount: COP;           // lo que paga el cliente en el pago 1 (reserva)
  payment1ToBorondo: COP;        // comisión total BT + fee pasarela (se cobra en pago 1)
  payment1ToOperator: COP;       // resto del pago 1 → escrow operador
  payment2Amount: COP;           // lo que paga el cliente en el pago 2 (saldo)
  payment2ToOperator: COP;       // 100% del pago 2 → operador
  onepayFeeTotal: COP;           // fee total de la pasarela (cobrada en pago 1)
}

export function calculateSplitPayment(input: SplitPaymentInput): SplitPaymentResult {
  const { totalClient, commissionAmount, reservationPct, onepayFeeFlat, onepayFeePct, paymentMethod } = input;

  // Fee de pasarela sobre el TOTAL (cobrada toda en el pago 1)
  const onepayFeeVariable = paymentMethod === 'TC' ? Math.floor(totalClient * onepayFeePct) : 0;
  const onepayFeeTotal = onepayFeeFlat + onepayFeeVariable;
  // Nota: IVA sobre fee OnePay se asume incluido en los valores de arriba

  // Pago 1: reserva (% del total)
  const payment1Amount = Math.floor(totalClient * reservationPct);

  // En el pago 1 se cobra: toda la comisión BT + toda la fee de pasarela
  const payment1ToBorondo = commissionAmount + onepayFeeTotal;

  // El resto del pago 1 va al operador (en escrow según contrato)
  const payment1ToOperator = Math.max(0, payment1Amount - payment1ToBorondo);

  // Pago 2: saldo (100% - reserva)
  const payment2Amount = totalClient - payment1Amount;
  const payment2ToOperator = payment2Amount; // 100% al operador

  return {
    payment1Amount,
    payment1ToBorondo,
    payment1ToOperator,
    payment2Amount,
    payment2ToOperator,
    onepayFeeTotal,
  };
}
```

### Ejemplo numérico (PSE, reserva 40%)

```
Tour $145,000, comisión BT $19,000, PSE (fee $2,200 + 0%)
  payment1Amount = $145,000 × 0.40 = $58,000
  onepayFeeTotal = $2,200
  payment1ToBorondo = $19,000 + $2,200 = $21,200
  payment1ToOperator = $58,000 - $21,200 = $36,800 (escrow)
  payment2Amount = $145,000 - $58,000 = $87,000
  payment2ToOperator = $87,000

Validación: operador recibe $36,800 + $87,000 = $123,800
             + comisión BT $19,000 + fee $2,200 = $145,000 ✓
```

### Regla: si faltan ≤5 días → pago 100% directo

```typescript
// Si daysBeforeTour <= 5: no se permite reserva parcial
// El cliente paga el 100% en 1 solo pago
// payment1Amount = totalClient, payment2Amount = 0
```

---

## 11. Función: calculateIvaOnMargin

```typescript
// /backend/src/domain/taxes/calculate-iva-margin.ts

interface IvaMarginInput {
  borondoAmount: COP;       // margen total de BorondoTours (comisión + markup)
  isExemptIva: boolean;     // true = extranjero con pasaporte
}

interface IvaMarginResult {
  ivaAmount: COP;           // IVA a pagar a DIAN ($0 si exento)
  netAfterIva: COP;         // borondoAmount - ivaAmount
}

export function calculateIvaOnMargin(input: IvaMarginInput): IvaMarginResult {
  const { borondoAmount, isExemptIva } = input;
  const ivaAmount = isExemptIva ? 0 : Math.floor(borondoAmount * 0.19);
  return { ivaAmount, netAfterIva: borondoAmount - ivaAmount };
}
```

> **Régimen AIU:** BorondoTours solo paga IVA 19% sobre su margen/comisión (no sobre
> el total del tour). El operador ya incluyó su propio IVA en el precio que le da a BT.
> Extranjeros: exentos del IVA de la comisión (Decreto 297/2016) → mayor margen neto.

---

## 12. Tests Obligatorios (no se mergea sin ellos)

```typescript
// Cada función debe tener tests que cubran:

describe('calculateBookingTotal', () => {
  it('calcula correctamente para colombiano con addons y markup');
  it('calcula correctamente para extranjero (IVA exento)');
  it('funciona sin addons ni markup (caso mínimo)');
  it('aplica Math.floor en todos los cálculos (sin centavos)');
  it('maneja comisión 0% (tour propio de BorondoTours)');
  it('markup 0 cuando BT no agrega precio adicional');
});

describe('calculateAgentCommission', () => {
  it('retorna 0 si ventas del equipo < $15M (no aplica comisión)');
  it('aplica TIER_1 (3%) entre $15M-$20M, proporcional al agente');
  it('aplica TIER_4 (10%) > $50M');
  it('distribuye proporcionalmente entre 3 agentes con ventas distintas');
  it('agente con 0 ventas recibe 0 aunque el equipo supere el umbral');
});

describe('calculateFreelancerCommission', () => {
  it('retorna 0 si ventas < $5M (filtro anti-autocompra)');
  it('aplica TIER_1 (3%) entre $5M-$10M sobre borondoAmount');
  it('aplica TIER_4 (10%) > $30M');
  it('no mezcla ventas de otros freelancers');
});

describe('calculateCancellationPenalty', () => {
  it('Tier 1 (≥10 días): 40% penalidad, 60% reembolso, reschedulable');
  it('Tier 1 fuerza mayor: 10% penalidad, 90% reembolso');
  it('Tier 2 (5-9 días): 60% penalidad');
  it('Tier 3 (<5 días): 100% penalidad');
  it('No Show: 100% penalidad');
  it('usa policy override del operador si existe');
  it('usa política global si no hay override');
});

describe('calculateOperatorPayout', () => {
  it('ReteFuente 4% para declarantes sobre operatorGross');
  it('ReteFuente 6% para no declarantes');
  it('ReteICA solo si appliesReteica = true');
  it('ReteIVA = 15% del IVA estimado del operador');
  it('descuenta chargebacks del netPayout');
  it('netPayout nunca es negativo');
  it('usa retefuenteOverride si está definido en el contrato');
});

describe('calculateSplitPayment', () => {
  it('pago 1 incluye toda la comisión BT + fee pasarela');
  it('pago 2 es 100% para el operador');
  it('fee PSE es solo flat ($2,200), sin variable');
  it('fee TC incluye % variable sobre el total');
  it('payment1ToOperator no es negativo');
  it('suma de payment1 + payment2 = totalClient');
});
```

---

## 13. Edge Cases Documentados

| Caso | Comportamiento esperado |
|---|---|
| Tour $0 (gratuito/cortesía) | Todas las comisiones = $0. No se cobra fee OnePay (no hay pago). |
| Comisión 0% (tour propio BT, CIIU 7912) | operatorGross = operatorPrice. borondoAmount = solo markup. |
| Extranjero sin pasaporte subido | Backend rechaza el checkout (no puede proceder sin S3 key). |
| Cancelación día 0 (No Show) | 100% penalidad automática. Marcado por el guía desde App 4. |
| Split Fare: 1 participante no paga | Solo su cupo se libera. Comisión BT no cambia (ya se cobró en pago 1). |
| Chargeback post-payout | Se descuenta del siguiente payout. Si netPayout sería negativo: queda en deuda pendiente. |
| Operador con ReteICA + ReteIVA + ReteFuente | Se aplican las 3 retenciones sumadas sobre el bruto. |
| Pago ≤5 días antes del tour | No hay parciales. Cliente paga 100% directo. Un solo split. |

---

## 14. Reglas de Negocio Codificadas

1. **Math.floor() SIEMPRE** — los centavos se truncan, nunca se redondean hacia arriba.
2. **IVA solo sobre margen BT** — el precio al cliente ya incluye todo; BT absorbe el IVA.
3. **Comisión sobre operatorPrice** — nunca sobre el subtotal con markup.
4. **Fee pasarela se cobra en pago 1** — sobre el 100% del total, no sobre el 40%.
5. **Retenciones sobre operatorGross** — nunca sobre netPayout (sería circular).
6. **Penalidad sobre amountPaid** — lo que el cliente efectivamente pagó (incluye todo).
7. **Coins diferidos** — no se implementa acreditación/uso de Coins en Fase 1.
8. **Freelancer: piso $5M** — ventas menores no generan comisión (anti-autocompra).
9. **Agente interno: meta colectiva** — el equipo debe superar $15M para que cualquiera gane.
10. **Dispersión al operador según contrato** — configurable (24h antes, post-tour, etc.).

---

## Links relacionados
- [[../../02-ADRs/ADR-007-Politica-Cancelacion-Escalonada]]
- [[../../02-ADRs/ADR-009-Retenciones-Fiscales]]
- [[../../02-ADRs/ADR-010-Orquestacion-Impuestos-Siigo]]
- [[../../02-ADRs/ADR-011-Arquitectura-Consolidada]]
- [[../../01-Specs/Spec-C-Checkout]]
- [[../../03-Knowledge/Modelo-Comisiones]]
- [[../../03-Knowledge/Referencia-Sistema-Impuestos-EVA]]
