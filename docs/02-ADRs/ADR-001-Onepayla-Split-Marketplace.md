---
tags: [adr, pagos, Onepayla, split, marketplace]
id: ADR-001
titulo: Arquitectura de pagos — Onepayla + Split Marketplace interno
estado: Aceptado
fecha: 2025-07-14
autores: [BorondoTours CTO]
---

# ADR-001 — Arquitectura de pagos: Onepayla + Split Marketplace interno

## Estado
`Aceptado`

## Contexto

BorondoTours opera como marketplace: cobra al cliente el 100% del tour, retiene una comisión variable (negociada por operador), y liquida el resto al operador externo. Se necesitaba decidir si Onepayla podía hacer el split automático a dos cuentas merchant, o si había que construirlo internamente.

**Hallazgo crítico de investigación:** La API de Onepayla Colombia (developers.Onepayla.co) **no tiene soporte nativo de split payments a dos merchants** en el mismo cobro. No existe parámetro `marketplace_fee`, `submerchant` ni nada equivalente. Onepayla solo maneja una cuenta merchant por API key. El split con `marketplace_fee` que existe en MercadoPago no existe en Onepayla.

---

## Decisión

> **Onepayla recibe el 100% del pago. BorondoTours gestiona el split internamente.**

### Flujo de pagos definido:

```
1. Cliente paga $100.000 → llega COMPLETO a cuenta Onepayla de BorondoTours
2. Webhook Onepayla → backend confirma booking
3. Backend calcula automáticamente:
     operator_amount = $100.000 × (1 - commission_rate)
     borondo_amount  = $100.000 × commission_rate
4. Se crea registro OperatorPayouts (status: PENDING)
5. BorondoTours liquida al operador manualmente o por lote (semanal/quincenal)
6. Coordinador marca el payout como PAID en el ERP
7. Siigo genera:
     - Factura electrónica al cliente: $100.000 (BorondoTours como emisor)
     - Nota de liquidación al operador: $operator_amount
```

### Por qué Onepayla y no cambiar a MercadoPago:

Onepayla es el estándar colombiano para startups de turismo, tiene PSE, Nequi, Bancolombia a la mano, y el flujo de links de pago independientes es ideal para el Split Fare individual. La gestión del split internamente es trabajo de backend pero es controlable y auditable.

---

## Consecuencias

### Positivas
- Control total sobre las liquidaciones (BorondoTours decide cuándo y cómo paga)
- Trazabilidad contable completa en `OperatorPayouts`
- Facturación electrónica limpia: una factura por cliente, una liquidación por operador
- Los links individuales de Onepayla para Split Fare funcionan perfectamente

### Negativas / Trade-offs
- BorondoTours asume responsabilidad de hacer los pagos a los operadores (riesgo de retraso)
- Necesita capital de trabajo: el dinero llega a BorondoTours antes de llegar al operador
- Requiere proceso operativo claro de liquidación (periodicidad, SLA de pago al operador)

### Acciones derivadas
- [ ] Definir SLA de liquidación a operadores (propuesta: cada 15 días)
- [ ] Crear tabla `OperatorContracts` con historial inmutable de tasas de comisión
- [ ] Implementar `OperatorPayouts` con estados PENDING → PAID
- [ ] Validar con Onepayla si el webhook incluye suficientes datos para la conciliación
- [ ] Definir política de reembolsos: si el cliente cancela, ¿BorondoTours ya pagó al operador?

---

## Links relacionados
- [[ADR-Index]]
- [[../01-Specs/Spec-C-Checkout]]
- [[../01-Specs/Spec-G-ERP-Operativo]]
- [[../03-Knowledge/Modelo-Comisiones]]
