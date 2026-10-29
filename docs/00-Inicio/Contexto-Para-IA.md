---
tipo: contexto
ultima_revision: 2026-10-07
---
# Contexto para IA — BorondoTours

**Qué es:** marketplace gestionado B2C de tours en Colombia (descubrir, reservar, pagar) con ERP de agencia, portal B2B de operadores y app móvil de campo.

**4 apps:** B2C (`apps/web`), ERP (`apps/erp`), B2B (`apps/b2b`), móvil Expo (Fase 3, no existe aún en el repo).

**10 roles:** SUPER_ADMIN, GERENTE, AGENT, COORD, CLIENT; OPERATOR_ADMIN/COORD/AGENT/GUIDE/DRIVER (detalle: `Stack-Tecnologico.md` §RBAC).

**Fases:** F1 demo inversionista (catálogo, checkout OnePay.la, portal básico, anuncios); F2 operativa (Split Fare, ERP, Siigo, Coins); F3 campo y escala (móvil offline, GPS, Aurora).

**Estado real del repo:** monorepo pnpm/turbo. `apps/{web,erp,b2b}` con Astro + React; `services/1-core..9-ads` con Hono; `packages/{contracts,db,domain,ui}`; `infra/template.yaml` (SAM). Diseño B2C en Figma casi cerrado; se programa el frontend (handoff: `05-Dev-Log/HANDOFF-2026-09-29-Frontend.md`).

**Decisiones pendientes:** ver `../DECISIONES-PENDIENTES.md` (NestJS vs Hono, Astro vs Vite, residuos Redis/BullMQ/Socket.io, Coins en pausa, WAF).

**Dónde mirar:**
- Datos: `03-Knowledge/Modelo-Datos-Core.md` (54 tablas)
- Infra/stack: `02-ADRs/ADR-011-Arquitectura-Consolidada.md`
- Funcional: `01-Specs/` (Spec-A..L)
- Reglas de negocio: `03-Knowledge/Reglas-Negocio-Detalle.md`, `Modelo-Comisiones.md`
- Operaciones AWS/Figma: `06-Operaciones/`
- Marca/UI: `04-Tech-Design/DESIGN.md`

**Reglas:** leer el Spec relevante antes de implementar; Coins/Spec-E en pausa; no inventar decisiones; confirmar contradicciones con el usuario.