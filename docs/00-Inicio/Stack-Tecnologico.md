---
tags: [inicio, stack, tecnologia]
created: 2025-07-14
updated: 2026-04-06
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
| Facturación | Manual / Onepayla POS | Siigo API automatizado |

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
| Onepayla API | Pagos, links individuales Split Fare | 1 |
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
| Backend NestJS | `GET /health` | `{ status: 'ok', db: 'ok', redis: 'ok' }` |
| PostgreSQL | Verificado por Terminus en `/health` | `db.status = 'up'` |
| Redis / BullMQ | Verificado por Terminus en `/health` | `redis.status = 'up'` |
| S3 | Verificado por head-object en `/health` | `s3.status = 'ok'` |
| Meilisearch (Fase 2) | `GET /meilisearch/health` | `{ status: 'available' }` |

**Implementación:**
- [ ] `@nestjs/terminus` con `HealthModule` en NestJS
- [ ] Checks: `TypeOrmHealthIndicator` (PostgreSQL), `MicroserviceHealthIndicator` (Redis), `HttpHealthIndicator` (Meilisearch Fase 2)
- [ ] El endpoint `/health` es **público** (sin auth) para que Railway/Render/AWS ALB pueda hacer healthchecks
- [ ] El endpoint `/health/details` es **privado** (solo `SUPER_ADMIN`) y retorna métricas detalladas
- [ ] **Dashboard web**: en Fase 1, Railway/Render proveen dashboard nativo. En Fase 3 (AWS): CloudWatch Dashboard con métricas de ECS tasks, Aurora, Redis
- [ ] **Alertas**: si un servicio falla el healthcheck 3 veces consecutivas → email + Slack al CTO

---

## CI/CD — GitHub Actions + AWS (H-60)

### Pipeline Fase 1

```yaml
# .github/workflows/deploy.yml — activado en push a main
jobs:
  test:
    - npm run lint
    - npm run test
    - npm run build  ← verifica que compila sin errores

  deploy-backend:
    needs: test
    - Railway deploy vía Railway CLI o webhook

  deploy-frontend:
    needs: test
    - Vercel deploy vía Vercel CLI
```

### Pipeline Fase 3 (AWS ECS Fargate)

```yaml
jobs:
  test:
    - npm run lint + test + build

  build-push-ecr:
    needs: test
    - docker build
    - aws ecr get-login-password | docker login
    - docker tag + docker push → AWS ECR

  deploy-ecs:
    needs: build-push-ecr
    - aws ecs update-service --force-new-deployment
    - aws ecs wait services-stable  ← espera que el deploy termine
```

**Criterios de aceptación:**
- [ ] Pull requests no pueden hacer merge sin que pasen todos los checks del CI
- [ ] Deploy automático a **staging** en cada PR merged a `develop`
- [ ] Deploy a **producción** solo desde `main`, con aprobación manual en GitHub Actions (environment protection)
- [ ] Secrets (JWT keys, AWS credentials, OnePay API keys) en **GitHub Secrets** (nunca en código)
- [ ] El pipeline completo (test + deploy) no supera **8 minutos** en Fase 1

---

## ADRs relacionados
- [[../02-ADRs/ADR-001-Onepayla-Split-Marketplace]]
- [[../02-ADRs/ADR-002-Meilisearch]]
- [[../02-ADRs/ADR-003-DynamoDB-Chat]]
- [[../02-ADRs/ADR-004-Siigo-Facturacion]]
- [[../02-ADRs/ADR-005-Infra-MVP]]
