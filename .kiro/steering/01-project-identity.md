---
inclusion: always
---

# BorondoTours — Identidad del Proyecto

## Qué es
BorondoTours es un marketplace gestionado B2C de tours en Colombia. Permite a viajeros descubrir, reservar y pagar tours de operadores locales, con portal de autogestión, wallet virtual (Borondo Coins), programa de lealtad y coordinación operativa para guías y conductores.

## 4 Aplicaciones del Sistema
1. **App 1 — Portal B2C**: Web pública de descubrimiento + área privada del viajero
2. **App 2 — ERP Agencia**: CRM kanban, cotizaciones, comisiones, dashboard gerente, panel SUPER_ADMIN
3. **App 3 — B2B Operadores**: Portal de proveedores turísticos (inventario, manifiesto, radar, finanzas)
4. **App 4 — Mobile Logística**: React Native/Expo para guías y conductores (GPS, check-in QR, offline)

## Modelo de Negocio
- Comisión marketplace (% variable por operador sobre cada venta)
- Publicidad en checkout y confirmación (sostiene el programa de lealtad)
- Tours propios BorondoTours (Fase 2+)

## 10 Roles RBAC
**Internos BorondoTours:** SUPER_ADMIN, GERENTE, AGENT, COORD, CLIENT
**Operador externo:** OPERATOR_ADMIN, OPERATOR_COORD, OPERATOR_AGENT, OPERATOR_GUIDE, OPERATOR_DRIVER

## Fases de Desarrollo
- **Fase 1**: Demo para inversionista (8 semanas) — Catálogo, checkout, pagos Onepayla, portal básico
- **Fase 2**: Plataforma operativa — Wallet Coins, Split Fare, ERP operador, facturación Siigo
- **Fase 3**: Campo y escala — App móvil, offline, GPS tracking, AWS ECS + Aurora

## Documentación de Referencia
La documentación completa del proyecto vive en `docs/` con esta estructura:
- `docs/00-Inicio/` — Visión, stack, inventario, flujos por APP
- `docs/01-Specs/` — Especificaciones técnicas detalladas (Spec-A a Spec-J)
- `docs/02-ADRs/` — Decisiones de arquitectura
- `docs/03-Knowledge/` — Modelo de datos, comisiones, política de datos
- `docs/04-Tech-Design/` — Arquitectura frontend, diseño técnico

SIEMPRE consulta la documentación relevante antes de implementar. Si hay conflicto entre el código y los docs, pregunta cuál prevalece.
