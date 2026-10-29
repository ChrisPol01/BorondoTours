# 📘 BorondoTours — Documentación Maestra del Sistema
**Versión:** 2.0 (Consolidada y estructurada por APP)
**Tipo de Plataforma:** Marketplace Gestionado Turístico (B2C) + ERP Agencia + Panel Operadores (B2B) + App Logística.

> 📂 **Cómo navegar esta documentación:**
> Este documento es el **índice ejecutivo** del proyecto. Cada sección de APP enlaza al documento detallado de flujos. Las especificaciones técnicas completas (modelos de datos, endpoints, criterios de aceptación) están en la carpeta `01-Specs/`.

---

## ⚙️ 1. Arquitectura e Infraestructura Global (Tech Stack)
Diseño escalable y optimizado para desarrollo por un "Solo-Dev" usando Vertical Slicing.

* **Cómputo Backend:** AWS ECS con Fargate (Contenedores Docker).
* **Almacenamiento:** AWS S3 — Bucket público (media) + Bucket privado con Presigned URLs (pasaportes, documentos legales).
* **Runtime & Framework (Backend):** Bun + NestJS (TypeScript).
* **Frontend Web (B2C, ERP, B2B):** React 19 + Vite 6 + TanStack (Router, Query, Form) + Zustand + Tailwind CSS 4.
* **App Móvil (Guías y Conductores):** React Native con Expo — reutiliza lógica TypeScript del frontend web.
* **Base de Datos Principal:** Amazon Aurora PostgreSQL 16 + PostGIS 3 (Geolocalización).
* **ORM:** Drizzle ORM.
* **Base de Datos Secundaria (NoSQL):** Amazon DynamoDB (Chat tripartito con TTL 90 días).
* **Colas y Jobs:** Redis + BullMQ (cron jobs, OTP, webhooks).
* **Búsqueda:** ILIKE (Fase 1) → Meilisearch con tolerancia a typos (Fase 2 — ADR-002).
* **Integraciones:** Onepayla API (Pagos Colombia), Mapbox GL JS (Mapas), Socket.io (Tiempo Real), Google OAuth 2.0.

---

## 👥 2. Matriz de Roles (RBAC) — 10 Roles Totales

**Roles internos BorondoTours:**

| Rol | Código | App principal |
|---|---|---|
| Super Administrador | `SUPER_ADMIN` | App 2 ERP `/erp/admin` |
| Gerente de Agencia | `GERENTE` | App 2 ERP `/erp/dashboard` |
| Agente de Ventas | `AGENT` | App 2 ERP `/erp/crm` |
| Coordinador de Operaciones | `COORD` | App 2 ERP `/erp/radar` |
| Cliente / Viajero | `CLIENT` | App 1 B2C `/mis-reservas` |

**Roles de operador turístico externo:**

| Rol | Código | App principal |
|---|---|---|
| Admin del Operador | `OPERATOR_ADMIN` | App 3 B2B `/operador/dashboard` |
| Coordinador del Operador | `OPERATOR_COORD` | App 3 B2B `/operador/radar` |
| Soporte del Operador | `OPERATOR_AGENT` | App 3 B2B `/operador/manifiestos` |
| Guía Turístico | `OPERATOR_GUIDE` | App 4 Mobile `/field` |
| Conductor | `OPERATOR_DRIVER` | App 4 Mobile `/field` |

> Ver tabla completa con permisos: [[Stack-Tecnologico]] · Spec técnica: [[../01-Specs/Spec-F-Auth]]

---

## 📱 3. APP 1: Portal B2C — Web Pública y Privada del Cliente

**Roles:** `CLIENT` (área privada) · Público general (catálogo sin login).
**Flujos:** A — Búsqueda y Descubrimiento · B — Detalle de Tour · C — Checkout · D — Autenticación y Landing · E — Panel Privado y Fidelización.

→ **Documento completo de flujos:** [[APP1-Portal-B2C]]
→ **Specs técnicas:** [[../01-Specs/Spec-A-Discovery]] · [[../01-Specs/Spec-B-Tour-Detail]] · [[../01-Specs/Spec-C-Checkout]] · [[../01-Specs/Spec-D-Client-Portal]] · [[../01-Specs/Spec-E-Loyalty]] · [[../01-Specs/Spec-F-Auth]]

---

## 💼 4. APP 2: ERP — Agencia Borondo y Agentes

**Roles:** `SUPER_ADMIN` · `GERENTE` · `AGENT` · `COORD`.
**Flujos:** A — Login y Redirección por Rol · B — CRM Kanban del Agente · C — Cotizaciones y Links Mágicos · D — Comisiones y Gamificación · E — Dashboard del Gerente · F — Panel SUPER_ADMIN.

→ **Documento completo de flujos:** [[APP2-ERP-Agencia]]
→ **Specs técnicas:** [[../01-Specs/Spec-F-Auth]] · [[../01-Specs/Spec-G-ERP-Operativo]] · [[../01-Specs/Spec-H-ERP-Agencia]]

---

## 🏭 5. APP 3: B2B — Portal de Proveedores / Operadores

**Roles:** `OPERATOR_ADMIN` · `OPERATOR_COORD` · `OPERATOR_AGENT`.
**Flujos:** A — Onboarding y Activación · B — Inventario y Cupos · C — Manifiesto de Pasajeros · D — Asignaciones de Equipo · E — Radar de Operaciones · F — Finanzas, Reseñas y Privacidad.
**Diferencial:** El manifiesto se llena automáticamente desde todos los canales de venta. Las agencias externas sin tecnología registran pasajeros con un link público sin login.

→ **Documento completo de flujos:** [[APP3-B2B-Operadores]]
→ **Spec técnica:** [[../01-Specs/Spec-I-B2B-Portal-Operadores]]

---

## 🚐 6. APP 4: App Móvil Logística — React Native / Expo

**Roles:** `OPERATOR_GUIDE` · `OPERATOR_DRIVER`.
**Flujos:** A — Modo Conductor (GPS automático) · B — Check-in Dinámico con QR · C — Máquina de Estados Operativos · D — Modo Supervivencia Offline · E — Aislamiento de Gastos de Campo.

→ **Documento completo de flujos:** [[APP4-App-Movil]]
→ **Spec técnica:** [[../01-Specs/Spec-J-BorondoTours-App-Movil]]

---

## 🗂️ 7. Índice de Documentos del Proyecto

### Flujos por APP — resúmenes ejecutivos (`00-Inicio/`)
- [[APP1-Portal-B2C]] — Portal B2C: Discovery, Tour Detail, Checkout, Auth, Panel Cliente
- [[APP2-ERP-Agencia]] — ERP Agencia: CRM Kanban, Cotizaciones, Comisiones, Gerente, SUPER_ADMIN
- [[APP3-B2B-Operadores]] — B2B Operadores: Onboarding, Inventario, Manifiesto, Radar, Finanzas
- [[APP4-App-Movil]] — App Móvil: Conductor GPS, Check-in QR, Estados, Offline, Gastos

### Especificaciones técnicas detalladas (`01-Specs/`)
- [[../01-Specs/Spec-A-Discovery]] — Búsqueda, Catálogo, Mapa, Cross-Selling
- [[../01-Specs/Spec-B-Tour-Detail]] — Detalle de tour, Galería, Calendario Semáforo, Reseñas
- [[../01-Specs/Spec-C-Checkout]] — Checkout, IVA, Split Fare, Pasarela Onepayla
- [[../01-Specs/Spec-D-Client-Portal]] — Panel del cliente, Kanban reservas, Chat
- [[../01-Specs/Spec-E-Loyalty]] — Borondo Coins, Niveles, Wallet, Gamificación
- [[../01-Specs/Spec-F-Auth]] — Auth JWT, RBAC 10 roles, Google OAuth, OTP
- [[../01-Specs/Spec-G-ERP-Operativo]] — Tours, Asignaciones, Vehículos, Incidentes, Payouts
- [[../01-Specs/Spec-H-ERP-Agencia]] — CRM, Cotizaciones, Comisiones, Gerente, SUPER_ADMIN
- [[../01-Specs/Spec-I-B2B-Portal-Operadores]] — Portal completo del operador externo

### Decisiones de arquitectura (`02-ADRs/`)
- [[../02-ADRs/ADR-Index]] — Índice de todas las ADRs
- [[../02-ADRs/ADR-001-Onepayla-Pagos]] — Pasarela Onepayla, sin split nativo
- [[../02-ADRs/ADR-002-Meilisearch]] — Búsqueda ILIKE → Meilisearch
- [[../02-ADRs/ADR-003-DynamoDB-Chat]] — Chat tripartito en DynamoDB

### Infraestructura y stack (`00-Inicio/`)
- [[Stack-Tecnologico]] — Stack completo, RBAC extendido, modelos de datos base
