# 🌎 BorondoTours

> **Marketplace gestionado de turismo B2C para Colombia**
> Plataforma integral que conecta viajeros con operadores turísticos a través de 4 aplicaciones especializadas.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?logo=nestjs)](https://nestjs.com/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+PostGIS-4169E1?logo=postgresql)](https://www.postgresql.org/)

---

## 📐 Arquitectura del sistema

BorondoTours es un monorepo que contiene **4 aplicaciones** y **1 API backend** compartida.

```
borondotours/
├── apps/
│   ├── web-b2c/          # APP 1 — Portal público y privado del cliente (React 19 + Vite)
│   ├── web-erp/          # APP 2 — ERP interno Agencia Borondo (React 19 + Vite)
│   ├── web-b2b/          # APP 3 — Portal de operadores turísticos (React 19 + Vite)
│   └── mobile/           # APP 4 — App guías y conductores (React Native + Expo)
├── packages/
│   ├── api/              # Backend NestJS 11 + Bun
│   ├── shared/           # Types, utils y constantes compartidas
│   └── ui/               # Design system compartido (Tailwind CSS 4)
├── docs/                 # Documentación técnica del vault
└── infra/                # Docker, CI/CD, configs de infra
```

---

## 🚀 Las 4 Aplicaciones

| App | Tipo | Usuarios | Descripción |
|-----|------|----------|-------------|
| **APP 1** — Portal B2C | Web | `CLIENT`, Público | Búsqueda, reservas, panel privado, fidelización |
| **APP 2** — ERP Agencia | Web | `SUPER_ADMIN`, `GERENTE`, `AGENT`, `COORD` | CRM, cotizaciones, comisiones, operaciones |
| **APP 3** — B2B Operadores | Web | `OPERATOR_*` (5 roles) | Inventario, manifiesto, radar, finanzas |
| **APP 4** — App Móvil | React Native | `OPERATOR_GUIDE`, `OPERATOR_DRIVER` | GPS, check-in QR, modo offline, cierre de tour |

---

## ⚙️ Stack Tecnológico

### Backend
- **Runtime:** Bun (latest) + NestJS 11
- **Base de datos:** PostgreSQL 16 + PostGIS 3 (geoespacial)
- **ORM:** Drizzle ORM (type-safe, migrations)
- **NoSQL:** Amazon DynamoDB (chat tripartito, TTL 90 días)
- **Colas:** Redis + BullMQ (jobs, cron, webhooks)
- **Auth:** JWT RS256 + refresh tokens · Google OAuth2 · OTP email
- **Real-time:** Socket.io (Radar, Kanban, GPS, Ka-ching alerts)

### Frontend
- **Framework:** React 19 + Vite 6
- **Routing:** TanStack Router (type-safe, AuthGuard nativo)
- **Server state:** TanStack Query
- **Forms:** TanStack Form + Zod
- **UI state:** Zustand 5
- **Estilos:** Tailwind CSS 4
- **Mapas:** Mapbox GL JS
- **Animaciones:** GSAP ScrollTrigger + Framer Motion

### App Móvil
- React Native + Expo
- SQLite / AsyncStorage (modo offline)
- Expo Location (GPS tracking)

### Servicios externos
- **Pagos:** Bold API (Colombia) — Split Fare, Link Mágico
- **Almacenamiento:** AWS S3 (media pública + documentos privados)
- **Email:** AWS SES (transaccional + OTP)
- **Búsqueda:** ILIKE → Meilisearch (Fase 2)
- **Facturación:** Siigo API (Fase 2, DIAN Colombia)

---

## 👥 RBAC — 10 Roles del Sistema

### Roles internos BorondoTours
| Rol | Código | App |
|-----|--------|-----|
| Super Administrador | `SUPER_ADMIN` | ERP `/erp/admin` |
| Gerente de Agencia | `GERENTE` | ERP `/erp/dashboard` |
| Agente de Ventas | `AGENT` | ERP `/erp/crm` |
| Coordinador de Operaciones | `COORD` | ERP `/erp/radar` |
| Cliente / Viajero | `CLIENT` | B2C `/mis-reservas` |

### Roles de operador turístico externo
| Rol | Código | App |
|-----|--------|-----|
| Admin del Operador | `OPERATOR_ADMIN` | B2B `/operador/dashboard` |
| Coordinador del Operador | `OPERATOR_COORD` | B2B `/operador/radar` |
| Soporte del Operador | `OPERATOR_AGENT` | B2B `/operador/manifiestos` |
| Guía Turístico | `OPERATOR_GUIDE` | Mobile `/field` |
| Conductor | `OPERATOR_DRIVER` | Mobile `/field` |

> JWT payload: `{ sub: user_id, role: RoleEnum, email, level: 1-5, operator_id: uuid | null }`

---

## 🗂️ Estrategia de ramas (Git Flow)

```
main          ← Producción (protegida, requiere PR + review)
├── staging   ← Pre-producción (integración continua)
└── develop   ← Rama de integración del equipo
    ├── feature/[ticket-id]-descripcion
    ├── fix/[ticket-id]-descripcion
    ├── chore/descripcion
    └── docs/descripcion
```

### Convención de commits (Conventional Commits)

```
feat(b2c): agregar calendario semáforo de disponibilidad
fix(auth): corregir expiración de refresh token
chore(infra): actualizar Docker base image
docs(adr): agregar ADR-005 para Meilisearch
```

---

## 🏗️ Inicio rápido

### Prerrequisitos
- Bun >= 1.x
- Docker + Docker Compose
- PostgreSQL 16 con extensión PostGIS
- Redis 7

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/[tu-usuario]/BorondoTours.git
cd BorondoTours

# Instalar dependencias (monorepo)
bun install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales locales

# Levantar servicios con Docker
docker-compose up -d postgres redis

# Correr migraciones
cd packages/api
bun run db:migrate

# Iniciar en modo desarrollo
bun run dev
```

### Scripts disponibles

```bash
bun run dev          # Iniciar todos los apps en paralelo
bun run build        # Build de producción
bun run test         # Correr tests
bun run lint         # Linting
bun run db:migrate   # Aplicar migraciones
bun run db:studio    # Abrir Drizzle Studio
```

---

## 📁 Documentación del proyecto

La carpeta `docs/` contiene el vault completo de especificaciones:

| Carpeta | Contenido |
|---------|-----------|
| `docs/00-Inicio/` | Visión, objetivos, stack, resumen por APP |
| `docs/01-Specs/` | Specs funcionales por módulo (A–I) |
| `docs/02-ADRs/` | Architecture Decision Records |
| `docs/03-Knowledge/` | Investigación y referencias |
| `docs/05-Dev-Log/` | Diario de desarrollo |

**Specs principales:**
- [Stack y Resumen](./docs/00-Inicio/Stack-de%20requerimientos%20resumido.md)
- [APP 1 — Portal B2C](./docs/00-Inicio/APP1-Portal-B2C.md)
- [APP 2 — ERP Agencia](./docs/00-Inicio/APP2-ERP-Agencia.md)
- [APP 3 — B2B Operadores](./docs/00-Inicio/APP3-B2B-Operadores.md)
- [APP 4 — App Móvil](./docs/00-Inicio/APP4-App-Movil.md)
- [Spec-F: Auth & RBAC](./docs/01-Specs/Spec-F-Auth.md)
- [ADR Index](./docs/02-ADRs/ADR-Index.md)

---

## 🔒 Seguridad

- **Nunca** commitear `.env` ni credenciales
- Secrets gestionados via AWS Secrets Manager (producción) / `.env.local` (desarrollo)
- Validación de input en todos los endpoints con `class-validator`
- Rate limiting en rutas de auth (`/auth/login`, `/auth/otp`)
- Sanitización de rutas para prevenir directory traversal

---

## 📄 Licencia

MIT © BorondoTours — Todos los derechos reservados.
