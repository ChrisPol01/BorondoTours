---
tags: [inicio, stack, tecnologia]
created: 2025-07-14
updated: 2026-07-10
status: definitivo
---

# ⚙️ Stack Tecnológico — BorondoTours

> **Fuente de verdad de arquitectura:** [[../02-ADRs/ADR-011-Arquitectura-Consolidada]] (serverless-first sobre AWS Lambda). Este documento refleja esa decisión.

## Stack por fase (AWS serverless-first, región us-east-1)

> El stack evoluciona con las fases. Solo cambia el tier/tamaño, no la plataforma.

| Componente | Fase 1 (MVP) | Fase 2 (Operativo) | Fase 3 (Escala) |
|---|---|---|---|
| Compute API | AWS Lambda "Lambda-lith" (NestJS) + API Gateway HTTP API | igual, más funciones | + Provisioned Concurrency donde aplique |
| Base de datos | RDS PostgreSQL **t4g.micro** (Single-AZ, PostGIS) + **RDS Proxy** | RDS t4g.small Multi-AZ | Aurora PostgreSQL Serverless v2 (+ Global DB para DR) |
| Tiempo real / Chat | API Gateway **WebSocket API** + Lambda + DynamoDB | igual | + radar en vivo |
| Jobs / Asíncrono | **EventBridge Scheduler + SQS + Step Functions** | igual | igual |
| Caché / Rate-limit | API Gateway throttling + **DynamoDB TTL** (contadores) + CloudFront | igual | + ElastiCache Serverless si se justifica |
| Búsqueda | PostgreSQL **`pg_trgm`** (typo-tolerance) | `pg_trgm` | OpenSearch Serverless (si el volumen lo exige) |
| Frontend hosting | S3 privado + CloudFront + OAC | igual | + WAF |
| Auth | JWT propio (Passport) + Lambda Authorizer | igual | + MFA roles internos |
| Auth OTP | Solo email (AWS SES) | Email + SMS (AWS SNS) | igual |
| Facturación | Manual / Onepayla POS | Siigo API automatizado | igual |
| IaC | AWS SAM + CloudFormation | igual | igual |

> **NO en Fase 1 (por costo, riesgo aceptado):** AWS WAF, AWS X-Ray, ElastiCache Redis, ECS Fargate. Ver ADR-011 Parte B.

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
| NestJS | 11.x | Modular, RBAC con Guards. Corre como **Lambda-lith** (adaptador `serverless-express`) |
| Node.js (runtime Lambda) | 22.x | Runtime de las funciones Lambda |
| Drizzle ORM | latest | Type-safe, migrations, PostGIS compatible. Conexión vía RDS Proxy |
| PostgreSQL | 16.x | BD principal (RDS t4g.micro → Aurora) |
| PostGIS | 3.x | Consultas geoespaciales (cross-selling 50km) |
| pg_trgm | (extensión PG) | Búsqueda tolerante a typos (reemplaza Meilisearch/OpenSearch en F1-2) |
| API Gateway WebSocket | AWS | Chat tripartito en tiempo real (reemplaza Socket.io) |
| EventBridge + SQS + Step Functions | AWS | Jobs y flujos asíncronos (reemplaza BullMQ + Redis) |
| Passport.js | latest | JWT propio + Google OAuth2 (validado por Lambda Authorizer) |
| Zod (contratos) | latest | Paquete `/packages/contracts` compartido FE/BE/mobile |

> **Nota Bun:** el runtime local de desarrollo puede seguir usando Bun, pero el runtime de producción en Lambda es Node.js 22.x (mejor soporte de runtime gestionado en Lambda).

## Servicios externos

| Servicio | Uso | Fase |
|---|---|---|
| Onepayla API | Pagos, links individuales Split Fare | 1 |
| AWS Lambda + API Gateway | Compute API + WebSocket | 1 |
| AWS S3 + CloudFront | Frontend SPA, pasaportes (presigned URL), fotos, media | 1 |
| Amazon RDS PostgreSQL + RDS Proxy | BD principal (t4g.micro) | 1 |
| Amazon DynamoDB | Chat (historial + conexiones), contadores diarios (TTL), idempotencia | 1 |
| EventBridge + SQS + Step Functions | Jobs, colas, flujos multi-paso | 1 |
| AWS SES | Emails transaccionales, OTP email | 1 |
| AWS Secrets Manager | Secretos | 1 |
| Google OAuth2 | Autenticación social | 1 |
| Siigo API | Facturación electrónica automática DIAN | 2 |
| AWS SNS | OTP por SMS (MFA completo) | 2 |
| Amazon Aurora Serverless v2 | BD alta disponibilidad + Global DB (DR) | 3 |
| OpenSearch Serverless | Búsqueda avanzada (si el volumen lo exige) | 3 |
| AWS WAF + X-Ray | Seguridad L7 + tracing distribuido | 3 |

## App móvil (Fase 3)

| Tecnología | Uso |
|---|---|
| React Native + Expo | App guía y conductor |
| **WatermelonDB** (sobre SQLite) | Modo offline obligatorio + sync engine (outbox + Last-Write-Wins) |
| Expo Location | GPS tracking en tiempo real |
| Expo Push Notifications | Notificaciones push por rol |
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

## Internacionalización (i18n) — H-29

| Aspecto | Decisión |
|---|---|
| Librería | `i18next` + `react-i18next` |
| Idiomas Fase 1 | Español (`es`) — idioma base |
| Idiomas Fase 2 | Inglés (`en`), Francés (`fr`) |
| Formato de archivos | JSON por idioma en `/public/locales/{lang}/` |
| Detección | Browser language header → fallback a `es` |
| Namespaces | `common`, `tours`, `checkout`, `auth`, `erp` |
| Variables dinámicas | Precios siempre en COP con `Intl.NumberFormat('es-CO')` |
| Fechas | `date-fns` con locale `es` en Fase 1 |
| Router | TanStack Router sin prefijo de idioma en URL (no `/es/tours`) — detecta por header |

**Criterios de aceptación:**
- [ ] Todos los textos del frontend pasan por `t('key')` de react-i18next (no strings hardcodeados)
- [ ] El idioma seleccionado se guarda en `localStorage` + campo `Users.language` en backend
- [ ] Los emails transaccionales (SES) tienen templates en español e inglés

---

## Accesibilidad — WCAG 2.1 AA (H-30)

### Checklist mínimo requerido

| Criterio | Implementación |
|---|---|
| Contraste de color | Tailwind colors con ratio mínimo 4.5:1 para texto normal, 3:1 para texto grande |
| Texto alternativo | `alt` obligatorio en todas las `<img>`. Imágenes decorativas: `alt=""` |
| Navegación por teclado | Todos los interactivos alcanzables con Tab. Focus ring visible (Tailwind `focus:ring-2`) |
| Labels en formularios | `<label htmlFor>` o `aria-label` en todos los inputs |
| Mensajes de error | `aria-describedby` apuntando al mensaje de error del campo |
| Modales | Focus trap al abrir. Escape para cerrar. `role="dialog"` + `aria-modal="true"` |
| Botones vs links | `<button>` para acciones, `<a>` para navegación (nunca `<div onClick>`) |
| Skip to content | Primer elemento de cada página: link "Saltar al contenido principal" (visible al focus) |
| Tablas | `<th scope="col/row">` en todas las tablas de datos |
| Notificaciones | Toasts con `role="alert"` y `aria-live="assertive"` para urgentes, `"polite"` para informativos |

**Criterios de aceptación:**
- [ ] Axe DevTools sin errores críticos en las rutas principales: Discovery, Tour Detail, Checkout, Portal Cliente
- [ ] Navegación completa del checkout con solo teclado (Tab + Enter + Escape)
- [ ] Screen reader (VoiceOver / NVDA) puede completar el flujo de reserva

---

## Health Panel por Microservicio (H-59)

### Endpoints de salud

| Servicio | Endpoint | Respuesta esperada |
|---|---|---|
| Backend (Lambda) | `GET /health` | `{ status: 'ok', db: 'ok' }` |
| PostgreSQL (vía RDS Proxy) | Verificado por Terminus en `/health` | `db.status = 'up'` |
| DynamoDB | Verificado en `/health` | `dynamo.status = 'ok'` |
| S3 | Verificado por head-object en `/health` | `s3.status = 'ok'` |

**Implementación:**
- [ ] `@nestjs/terminus` con `HealthModule` en NestJS
- [ ] Checks: PostgreSQL (vía RDS Proxy), DynamoDB, S3
- [ ] El endpoint `/health` es **público** (sin auth) para el health check de API Gateway / Route 53
- [ ] El endpoint `/health/details` es **privado** (solo `SUPER_ADMIN`) y retorna métricas detalladas
- [ ] **Dashboard web**: **CloudWatch Dashboard** (Lambda invocations/errors/duration, RDS, DynamoDB, colas SQS) desde Fase 1
- [ ] **Alertas**: CloudWatch Alarm → SNS → email al CTO (error rate, latencia, profundidad de cola SQS/DLQ)

---

## CI/CD — GitHub Actions + AWS SAM (H-60)

### Pipeline backend (Lambda vía SAM) — todas las fases

```yaml
# .github/workflows/deploy-backend.yml — activado en push a main
jobs:
  test:
    - pnpm run lint
    - pnpm run test
    - pnpm run build          ← verifica que compila sin errores

  deploy:
    needs: test
    - sam build --template-file infra/template.yaml
    - sam deploy --config-env prod  ← empaqueta Lambdas y actualiza API Gateway,
                                       RDS Proxy, DynamoDB, SQS, EventBridge, Step Functions
```

### Pipeline frontend (S3 + CloudFront)

```yaml
# .github/workflows/deploy-frontend.yml — activado en push a main
jobs:
  build:
    - pnpm run lint + test + build   ← Astro genera /dist
  deploy:
    needs: build
    - aws s3 sync ./dist s3://borondotours-frontend --delete
    - aws cloudfront create-invalidation --paths "/*"
```

**Criterios de aceptación:**
- [ ] Pull requests no pueden hacer merge sin que pasen todos los checks del CI
- [ ] Deploy automático a **staging** en cada PR merged a `develop` (sam deploy --config-env staging)
- [ ] Deploy a **producción** solo desde `main`, con aprobación manual en GitHub Actions (environment protection)
- [ ] Secrets (JWT keys, AWS credentials, OnePay API keys) en **GitHub Secrets** → **AWS Secrets Manager** (nunca en código)
- [ ] El pipeline completo (test + deploy) no supera **8 minutos** en Fase 1

---

## ADRs relacionados
- [[../02-ADRs/ADR-011-Arquitectura-Consolidada]] ← **fuente de verdad del stack (serverless-first)**
- [[../02-ADRs/ADR-001-Onepayla-Split-Marketplace]]
- [[../02-ADRs/ADR-002-Meilisearch]] (búsqueda: pg_trgm F1-2)
- [[../02-ADRs/ADR-003-DynamoDB-Chat]] (tiempo real: API Gateway WebSocket)
- [[../02-ADRs/ADR-004-Siigo-Facturacion]]
- [[../02-ADRs/ADR-005-Infra-MVP]] (superado)
- [[../02-ADRs/ADR-008-Infra-AWS-First]] (superado)
