# 📚 Documentación — BorondoTours

Índice raíz de la documentación del proyecto. Cada carpeta tiene su propio README con el detalle de sus archivos.

| Carpeta | Propósito |
|---|---|
| [`00-Inicio/`](00-Inicio/README.md) | Punto de entrada: visión, stack, inventario MVP y resúmenes por App |
| [`01-Specs/`](01-Specs/README.md) | Especificaciones funcionales detalladas (Spec-A a Spec-L) con códigos RF |
| [`02-ADRs/`](02-ADRs/README.md) | Architecture Decision Records — decisiones técnicas y su justificación |
| [`03-Knowledge/`](03-Knowledge/README.md) | Fuentes de verdad: modelo de datos, comisiones, trazabilidad, datos personales |
| [`04-Tech-Design/`](04-Tech-Design/README.md) | Arquitectura, NFRs, diseño frontend, estructura de proyecto y marca |
| [`05-Dev-Log/`](05-Dev-Log/README.md) | Bitácora de desarrollo por sesión |
| [`06-Operaciones/`](06-Operaciones/README.md) | AWS multi-cuenta/SSO, inventario AWS, runbook Figma |
| [`DECISIONES-PENDIENTES.md`](DECISIONES-PENDIENTES.md) | Contradicciones y preguntas abiertas |
| [`Templates/`](Templates/README.md) | Plantillas reutilizables (ADR, dev-log, reunión, spec) |

## Reglas de gobernanza documental
- **Fuente de verdad de datos:** `03-Knowledge/Modelo-Datos-Core.md` (ante conflicto con un Spec, gana el Core).
- **Fuente de verdad de infraestructura/stack:** `02-ADRs/ADR-011-Arquitectura-Consolidada.md` (serverless-first; supera ADR-005 y ADR-008). Divergencias código vs docs (Hono, Astro): ver `DECISIONES-PENDIENTES.md`.
- **Fuente de verdad de roles:** `00-Inicio/Stack-Tecnologico.md` §RBAC (10 roles).
- Cada requerimiento de negocio (BR) se enlaza a un funcional (FR) y un no funcional (NFR) en `03-Knowledge/Trazabilidad-Requerimientos.md`.

> Mapa verificado del repositorio (árbol, comandos, ownership): [Mapa-Repositorio](04-Tech-Design/Mapa-Repositorio.md).
