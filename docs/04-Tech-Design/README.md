# 📘 04-Tech-Design — Diseño Técnico y Arquitectura

Diseño detallado por capas: arquitectura, requerimientos no funcionales, contratos y patrones.

| Archivo / Carpeta | Qué contiene |
|---|---|
| `Arquitectura-Sistema.md` | **NFRs cuantificados** (performance p95/p99, SLA, RTO/RPO), infraestructura AWS serverless por fase, patrones backend/frontend, MER completo (54 tablas), estrategia de testing, convenciones de API, jobs (EventBridge/SQS/Step Functions) |
| `Frontend-Architecture.md` | Arquitectura del frontend (React 19, TanStack, Zustand, patrones de componentes) |
| `Estructura-Proyecto.md` | Estructura de carpetas del monorepo/proyecto |
| `Catalogo-Componentes-UI.md` | Catálogo de componentes UI compartidos |
| `Brand-Identity-Resumen.md` | Resumen de marca (antes steering 12) |
| `DESIGN.md` | Sistema de diseño y marca (ver también steering `12-brand-identity`) |
| `API/` | 🟡 Contratos OpenAPI por módulo — **pendiente de poblar** |
| `Services/` | Domain-Financiero, Máquina de estados del Booking, Concurrencia de cupos, Notificaciones |
| `Shared/` | 🟡 Tipos y utilidades compartidas — pendiente de poblar |
| `Mobile-Specific/` | Sync-Engine-Offline (App 4) |

> **Fuente de verdad de infraestructura:** **ADR-011** (serverless-first sobre AWS Lambda; supera a ADR-005 y ADR-008). Las carpetas vacías (`API/`, `Shared/`) son deuda de
> documentación técnica identificada en la auditoría (ver `../03-Knowledge/Trazabilidad-Requerimientos.md`).

> Estado real del código, comandos y ownership: [Mapa-Repositorio](Mapa-Repositorio.md).
