---
tags: [adr, facturacion, siigo, dian]
id: ADR-004
titulo: Facturación electrónica — Siigo API vs Bold POS
estado: Aceptado
fecha: 2025-07-14
autores: [BorondoTours CTO]
---

# ADR-004 — Facturación electrónica: Siigo API vs Bold POS

## Estado
`Aceptado`

## Contexto

BorondoTours debe emitir facturas electrónicas validadas por la DIAN por cada venta. El flujo es complejo porque:
1. La factura al cliente debe ser por el 100% del tour (BorondoTours como emisor)
2. Debe generarse automáticamente al confirmar el pago (webhook Bold)
3. Se necesita también una nota de liquidación al operador por su parte
4. El sistema debe sostenerse sin intervención manual

Se evaluaron dos opciones: integrar Siigo API desde NestJS, o usar Bold POS nativo.

---

## Opciones evaluadas

### Opción A — Siigo API (integración programática desde NestJS)
**Pros:**
- Siigo tiene API REST documentada con `Username + Access Key`
- Integración probada en producción por otros sistemas (WispHub, Shopify/Moship)
- Permite automatización completa: webhook Bold → generar factura en Siigo → enviar al cliente
- Siigo es el proveedor #1 autorizado por la DIAN en Colombia
- Soporta notas crédito automáticas para cancelaciones

**Contras:**
- Requiere desarrollo: `SiigoService` en NestJS con manejo de errores y reintentos
- Costo mensual de Siigo Nube (~$10k-$50k COP/mes según plan)
- Hay que mapear los productos/servicios de BorondoTours en Siigo

### Opción B — Bold POS con facturación nativa
**Pros:**
- Bold POS incluye facturación electrónica nativa sin desarrollo adicional
- Todo en una sola plataforma

**Contras:**
- Bold POS está diseñado para POS físicos (datáfonos), no para marketplaces de tours
- No permite automatización desde una API externa (es un sistema cerrado)
- No soporta la emisión de notas de liquidación a operadores
- No escala para el modelo multi-operador de BorondoTours

---

## Decisión

> **Elegimos: Opción A — Siigo API integrado desde NestJS**

Siigo es la única opción que permite la automatización completa del flujo: pago confirmado → factura generada → enviada al cliente → registrada en la DIAN, sin intervención manual. Además soporta el modelo multi-emisor que necesita BorondoTours.

**Esta integración va en Fase 2**, no bloquea el MVP. En Fase 1 se puede usar Bold POS manualmente para los primeros pagos de la demo.

---

## Flujo de integración definido

```
Webhook Bold (pago confirmado)
  → NestJS SiigoService.createInvoice()
  → POST Siigo API /v1/invoices
  → Respuesta: número de factura + CUFE (DIAN)
  → Email al cliente con PDF de la factura adjunto
  → Si es tour de operador externo:
      → Siigo API crear nota de liquidación (tipo: crédito a proveedor)
```

### Credenciales Siigo API
```
Base URL: https://api.siigo.com
Auth: POST /auth → retorna access_token (Bearer)
Factura: POST /v1/invoices
Nota crédito: POST /v1/credit-notes
```

---

## Consecuencias

### Positivas
- Cumplimiento DIAN automatizado desde el día 1 de Fase 2
- Cero intervención manual para facturación
- Notas crédito automáticas en cancelaciones (importante para la wallet de Coins)

### Negativas / Trade-offs
- Costo adicional de Siigo (~$10k-50k COP/mes)
- Requiere mapear catálogo de servicios en Siigo antes de activar

### Acciones derivadas
- [ ] Crear cuenta Siigo Nube y obtener credenciales API
- [ ] Implementar `SiigoService` en NestJS con reintentos (BullMQ)
- [ ] Mapear en Siigo: "Tour Nacional", "Tour Internacional", "Add-on", "Publicidad"
- [ ] Configurar resolución de facturación de BorondoTours en la DIAN
- [ ] Definir qué pasa con la factura si el webhook Bold llega pero Siigo falla (cola de reintentos)

---

## Links relacionados
- [[ADR-Index]]
- [[ADR-001-Bold-Split-Marketplace]]
- [[../01-Specs/Spec-C-Checkout]]
- [[../01-Specs/Spec-G-ERP-Operativo]]
