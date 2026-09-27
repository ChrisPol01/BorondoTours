# 🧠 03-Knowledge — Fuentes de Verdad

Conocimiento canónico transversal que los Specs consumen. Ante conflicto, estos documentos ganan.

| Archivo | Qué contiene |
|---|---|
| `Modelo-Datos-Core.md` | **Fuente de verdad del esquema de BD** — 41 tablas canónicas, enums, índices, MER, convenciones (UUID, snake_case, PostgreSQL ENUM) |
| `Modelo-Comisiones.md` | Fuentes de ingreso, comisión marketplace/agente, ecuación de sostenibilidad de Coins, flujo de liquidación, impacto de reembolsos |
| `Trazabilidad-Requerimientos.md` | Matriz BR→FR→NFR (29 requerimientos de negocio) + tabla consolidada por módulo + deuda de trazabilidad |
| `Politica-Datos-Personales.md` | Ley 1581 (Habeas Data), retención por tipo de dato, proceso de anonimización, derechos ARCO |
| `Referencia-Sistema-Impuestos-EVA.md` | Arquitectura de referencia de un sistema contable (orquestación Siigo) — insumo del ADR-010 |
| `MCP-Setup-Guide.md` | Guía de configuración de servidores MCP para el entorno de desarrollo |

> **Regla:** si se agrega una tabla nueva, actualizar `Modelo-Datos-Core.md`. Si se agrega un requerimiento de negocio, enlazarlo en `Trazabilidad-Requerimientos.md` con su FR y NFR.
