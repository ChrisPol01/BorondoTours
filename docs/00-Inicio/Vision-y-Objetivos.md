---
tags: [inicio, vision, negocio]
created: 2025-07-14
updated: 2025-07-14
status: definitivo
---

# 🎯 Visión y Objetivos — BorondoTours

## El problema que resuelve

Las agencias de turismo en Colombia operan con WhatsApp + transferencias manuales + Excel. No hay plataforma que unifique el descubrimiento, la reserva, el pago, la coordinación logística en campo y la fidelización del cliente en un solo lugar.

## La solución

BorondoTours es un marketplace gestionado B2C para tours en Colombia que permite a viajeros descubrir, reservar y pagar tours de operadores locales, con portal de autogestión, wallet virtual y coordinación operativa interna para guías y conductores.

---

## Modelo de negocio

| Fuente de ingreso | Mecanismo | Fase |
|---|---|---|
| Comisión marketplace | BorondoTours retiene % configurable por operador sobre cada venta | Fase 1 |
| Publicidad en checkout | Anuncios mostrados durante el flujo de pago (antes de confirmar) | Fase 1 |
| Publicidad en confirmación | Anuncios en página "Gracias por tu compra" | Fase 1 |
| Publicidad en portal cliente | Banners en dashboard del cliente autenticado | Fase 2 |
| Tours propios BorondoTours | Tours operados directamente (100% del revenue) | Fase 2 |

> ⚠️ Los anuncios son la fuente que sostiene el costo de los beneficios del programa de lealtad (Borondo Coins + niveles). El % de Coins otorgado por nivel debe ser menor al ingreso esperado por publicidad por ese tipo de usuario.

---

## Objetivos por fase

### Fase 1 — Demo para inversionista (8 semanas, 1 CTO)
- [ ] Landing + scrollytelling + Auth Gate funcional
- [ ] Catálogo de tours con búsqueda básica (PostgreSQL ILIKE)
- [ ] Detalle de tour + calendario semáforo
- [ ] Checkout completo con Onepayla (IVA, pasaporte S3)
- [ ] Confirmación por email + voucher PDF básico
- [ ] Portal cliente básico (ver reservas, cancelar)
- [ ] Anuncios en checkout y confirmación (primera fuente de ingreso)

### Fase 2 — Plataforma operativa (meses 3–4)
- [ ] Wallet Borondo Coins completo con niveles de lealtad
- [ ] Split Fare con links individuales Onepayla
- [ ] Portal operador ERP (gestión de tours, guías, buses)
- [ ] Liquidación de comisiones a operadores (OperatorPayouts)
- [ ] Facturación electrónica vía Siigo API
- [ ] Meilisearch para búsqueda con typos
- [ ] Chat tripartito 24h pre-tour

### Fase 3 — Campo y escala (meses 5–6)
- [ ] App móvil guía/conductor (React Native + Expo)
- [ ] Modo offline obligatorio (SQLite local — zonas sin señal)
- [ ] Radar de operaciones + Live GPS tracking
- [ ] Alertas de urgencia + log de incidentes internos
- [ ] ECS Fargate + Aurora PostgreSQL (migración desde infra simple)

---

## Usuarios objetivo

| Rol | Necesidad principal |
|---|---|
| Viajero colombiano | Reservar tours online, autogestión, loyalty |
| Turista extranjero | Pagar sin IVA con pasaporte, descubrir Colombia |
| Coordinador BorondoTours | Vender tours en la plataforma, recibir liquidaciones |
| Operador turístico externo | Gestionar operaciones, asignar guías/buses, resolver incidentes |
| Guía / Conductor | Recibir asignaciones, hacer check-in digital en campo |

---

## Criterios de éxito para el inversionista (Fase 1)

- [ ] Demo funcional end-to-end: buscar → reservar → pagar → ver en portal
- [ ] Al menos 1 tour real cargado con fotos, precio y calendario
- [ ] Pago real procesado con Onepayla en sandbox
- [ ] Primera fuente de ingreso (anuncios) visible en el flujo

---

## Links relacionados
- [[Stack-Tecnologico]]
- [[../01-Specs/Spec-A-Discovery]]
- [[../02-ADRs/ADR-Index]]
- [[../03-Knowledge/Modelo-Comisiones]]
