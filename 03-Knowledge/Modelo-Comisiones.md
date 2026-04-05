---
tags: [knowledge, negocio, comisiones, publicidad]
created: 2025-07-14
---

# 💰 Modelo de Comisiones y Fuentes de Ingreso

## Fuentes de ingreso de BorondoTours

### 1. Comisión marketplace (principal)
- BorondoTours retiene un % de cada venta procesada
- El % es **variable y negociado individualmente por operador**
- Se registra en `OperatorContracts` con historial inmutable
- Ejemplo: Operador A paga 10%, Operador B paga 15%, Tours propios = 100%

### 2. Publicidad en el flujo de pago
- **Momento 1:** Banner justo antes del botón "Pagar ahora" en checkout
- **Momento 2:** 2 banners en la página de confirmación post-pago
- **Audiencia:** Usuarios en el momento de máxima receptividad (acaban de decidir gastar)
- **Exclusión:** Usuarios nivel 4 (Conquistador) y 5 (Embajador) no ven anuncios en checkout — como beneficio premium
- **Tipos de anunciantes:** Operadores del marketplace, seguros de viaje, aerolíneas, hoteles

### 3. Tours propios BorondoTours (Fase 2+)
- Tours operados directamente por BorondoTours sin operador externo
- Revenue completo va a BorondoTours

---

## Ecuación de sostenibilidad del programa de lealtad

El programa de Borondo Coins debe ser financiado por los ingresos de publicidad:

```
Ingreso publicidad por usuario/compra
  > Costo Coins otorgados por compra (% del tier × valor compra)
```

### Por qué los porcentajes son bajos (0.5% a 3%)

| Nivel | % Coins | Tour de $200k | Costo en Coins | Ingreso pub. estimado |
|---|---|---|---|---|
| Explorador (1) | 0.5% | $200.000 | $1.000 | ~$2.000–5.000 |
| Viajero (2) | 1% | $200.000 | $2.000 | ~$2.000–5.000 |
| Aventurero (3) | 1.5% | $200.000 | $3.000 | ~$2.000–5.000 |
| Conquistador (4) | 2% | $200.000 | $4.000 | $0 (no ve anuncios) |
| Embajador (5) | 3% | $200.000 | $6.000 | $0 (no ve anuncios) |

> Nota: Los niveles 4 y 5 no ven anuncios en checkout. Su costo de Coins se cubre con la comisión marketplace (son los usuarios de mayor valor — su retención justifica el costo).

---

## Flujo de liquidación al operador

```
Día 1: Cliente paga $200.000 → llega a cuenta Bold de BorondoTours
Día 1: Sistema crea OperatorPayout PENDING por $180.000 (si comisión = 10%)
Día 1: BorondoTours retiene $20.000 en su cuenta
Día 15: Coordinador genera reporte de payouts del período
Día 15: BorondoTours transfiere $180.000 al operador (Nequi/transferencia)
Día 15: Coordinador marca payout como PAID en el ERP
Día 15: Siigo genera nota de liquidación al operador
```

---

## Reglas de reembolso y su impacto en comisiones

| Escenario | ¿Qué pasa con el payout? |
|---|---|
| Cliente cancela ≥5 días (recibe Coins) | Payout se cancela. BorondoTours absorbe el costo de los Coins y le devuelve el dinero al operador si ya fue liquidado |
| Operador cancela (fuerza mayor) | Payout se cancela. Operador no recibe su parte. Cliente recibe Coins restringidos al operador |
| Bold hace chargeback | BorondoTours asume el chargeback. Si el operador ya fue pagado, se descuenta del siguiente payout |

---

## Links relacionados
- [[../01-Specs/Spec-C-Checkout]]
- [[../01-Specs/Spec-G-ERP-Operativo]]
- [[../02-ADRs/ADR-001-Bold-Split-Marketplace]]
