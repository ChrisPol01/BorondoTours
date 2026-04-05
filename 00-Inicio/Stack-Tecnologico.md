---
tags: [inicio, stack, tecnologia]
created: 2025-07-14
updated: 2025-07-14
status: definitivo
---

# ⚙️ Stack Tecnológico — BorondoTours

## Stack por fase

> El stack evoluciona con las fases. No se sobre-ingenia desde el día 1.

| Componente | Fase 1 (MVP) | Fase 2–3 (Escala) |
|---|---|---|
| Hosting backend | Railway o Render (Docker) | AWS ECS Fargate |
| Base de datos | Neon PostgreSQL (serverless) | Amazon Aurora PostgreSQL |
| Búsqueda | PostgreSQL ILIKE | Meilisearch (container) |
| Auth OTP | Solo email (AWS SES) | Email + SMS (AWS SNS) |
| Facturación | Manual / Bold POS | Siigo API automatizado |

---

## Frontend

| Tecnología | Versión | Justificación |
|---|---|---|
| React | 19.x | SPA con ecosistema maduro |
| Vite | 6.x | Build tool rápido, HMR óptimo |
| TanStack Router | latest | Type-safe routing, AuthGuard nativo |
| TanStack Query | latest | Cache de servidor, invalidación reactiva |
| TanStack Form | latest | Validación reactiva con Zod |
| Zustand | 5.x | Estado global: auth, cart, coins, modal |
| Tailwind CSS | 4.x | Utilidades CSS, diseño responsivo |
| Mapbox GL JS | latest | Mapa tours, mapa conquistas, radar GPS |
| GSAP ScrollTrigger | latest | Scrollytelling — video atado al scroll |
| react-day-picker | latest | Calendario semáforo de disponibilidad |
| Framer Motion | latest | Transiciones de secciones en landing |

## Backend

| Tecnología | Versión | Justificación |
|---|---|---|
| NestJS | 11.x | Modular, RBAC con Guards, WebSockets |
| Bun | latest | Runtime más rápido que Node |
| Drizzle ORM | latest | Type-safe, migrations, PostGIS compatible |
| PostgreSQL | 16.x | BD principal |
| PostGIS | 3.x | Consultas geoespaciales (cross-selling 50km) |
| Socket.io | latest | Chat tripartito en tiempo real |
| BullMQ + Redis | latest | Colas: feedback post-tour, notificaciones |
| Passport.js | latest | JWT + Google OAuth2 |

## Servicios externos

| Servicio | Uso | Fase |
|---|---|---|
| Bold API | Pagos, links individuales Split Fare | 1 |
| AWS S3 | Pasaportes (presigned URL), fotos perfil | 1 |
| AWS SES | Emails transaccionales, OTP email | 1 |
| Amazon DynamoDB | Historial de chat (PK: booking_id) | 2 |
| Meilisearch | Búsqueda tolerante a typos | 2 |
| Siigo API | Facturación electrónica automática DIAN | 2 |
| AWS SNS | OTP por SMS (MFA completo) | 2 |
| AWS ECS Fargate | Orquestación de contenedores | 3 |
| Amazon Aurora PG | BD de alta disponibilidad | 3 |

## App móvil (Fase 3)

| Tecnología | Uso |
|---|---|
| React Native + Expo | App guía y conductor |
| SQLite / AsyncStorage | Modo offline obligatorio (zonas sin señal) |
| Expo Location | GPS tracking en tiempo real |
| React Native Linking | SMS de emergencia offline |

## RBAC — Roles del sistema

### Roles internos BorondoTours (App 1 B2C + App 2 ERP)

| Rol | Descripción | App principal |
|---|---|---|
| `SUPER_ADMIN` | BorondoTours — acceso total | App 2 ERP `/erp/admin` |
| `GERENTE` | Gerente de Agencia interno BorondoTours (manager del equipo de ventas) | App 2 ERP `/erp/dashboard` |
| `AGENT` | Agente de ventas interno BorondoTours (CRM, cotizaciones, links de pago) | App 2 ERP `/erp/crm` |
| `COORD` | Coordinador de operaciones (asignaciones, radar, incidentes) | App 2 ERP `/erp/radar` |
| `CLIENT` | Viajero / comprador (portal B2C, reservas, wallet) | App 1 B2C `/mis-reservas` |

### Roles de operador externo (App 3 B2B + App 4 Mobile)

| Rol | Descripción | App principal |
|---|---|---|
| `OPERATOR_ADMIN` | Admin principal del operador turístico (tours, equipo, finanzas, cupos) | App 3 `/operador/dashboard` |
| `OPERATOR_COORD` | Coordinador operativo del operador (radar, manifiesto, asignaciones) | App 3 `/operador/radar` |
| `OPERATOR_AGENT` | Agente de ventas del operador (manifiesto manual, AgencyLinks) | App 3 `/operador/manifiestos` |
| `OPERATOR_GUIDE` | Guía turístico del operador (check-in QR, estados operativos) | App 4 Mobile `/field` |
| `OPERATOR_DRIVER` | Conductor / transportista del operador (GPS pasivo, ruta asignada) | App 4 Mobile `/field` |

> ⚠️ **Distinción crítica:**
> - `GERENTE` (interno, empleado BorondoTours) ≠ `OPERATOR_ADMIN` (externo, operador turístico).
> - Los antiguos roles `AGENCY_ADMIN`, `GUIDE` y `DRIVER` se reemplazan por la jerarquía `OPERATOR_*` de 5 niveles.
> - Requiere migración del enum `RoleEnum` en la BD al implementar. Ver Spec-I §2, Spec-H y Spec-F.
> - Total de roles en el sistema: **10** (5 internos + 5 operador).

---

## ADRs relacionados
- [[../02-ADRs/ADR-001-Bold-Split-Marketplace]]
- [[../02-ADRs/ADR-002-Meilisearch]]
- [[../02-ADRs/ADR-003-DynamoDB-Chat]]
- [[../02-ADRs/ADR-004-Siigo-Facturacion]]
- [[../02-ADRs/ADR-005-Infra-MVP]]
