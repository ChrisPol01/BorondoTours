---
tags: [tech-design, frontend, arquitectura, decisiones]
created: 2026-04-16
updated: 2026-04-16
status: aprobado
---

# Frontend Architecture — BorondoTours

> Documento de requerimientos técnicos, funcionales y de negocio para la implementación del frontend. Complementa el `Stack-Tecnologico.md` con las decisiones de arquitectura interna del frontend que no estaban definidas en los specs funcionales.

---

## 1. Stack de Librerías (decisiones aprobadas)

| Categoría | Librería | Decisión |
|---|---|---|
| Framework | React 19.x | Stack base |
| Build tool | Vite 6.x | Stack base |
| Routing | TanStack Router | Stack base |
| Server state | TanStack Query | Stack base |
| Forms | TanStack Form + Zod | Stack base |
| Estado global | Zustand 5.x | Stack base |
| Estilos | Tailwind CSS 4.x | Stack base |
| Mapas | Mapbox GL JS | Stack base |
| Animaciones scroll | GSAP ScrollTrigger | Stack base |
| Calendario | react-day-picker | Stack base |
| Transiciones | Framer Motion | Stack base |
| i18n | i18next + react-i18next | Stack base |
| **Componentes UI** | **Shadcn/UI** | Aprobado 2026-04-16 |
| **Toasts** | **Sonner** | Aprobado 2026-04-16 |
| **Markdown** | **react-markdown** | Aprobado 2026-04-16 |
| **Cliente HTTP** | **axios** | Aprobado 2026-04-16 |
| **Iconos** | **Lucide React** | Aprobado 2026-04-16 |
| **Imágenes CDN** | **@unpic/react** | Aprobado 2026-04-16 |
| **Sanitización HTML** | **DOMPurify** | Requerido Spec-F RF-F10 |
| **WebSockets** | **socket.io-client** | Requerido Spec-D |
| **Testing unit** | **Vitest + Testing Library** | Aprobado 2026-04-16 |
| **Testing E2E** | **Playwright** | Aprobado 2026-04-16 |

---

## 2. Estructura de Carpetas

Organización por **feature/dominio** con capa de apps encima. Cada feature es autónomo (patrón análogo a microservicios en el backend).

```
/frontend
  /public
    /locales
      /es
        common.json
        tours.json
        checkout.json
        auth.json
        erp.json
        b2b.json
  /src
    /features
      /auth             <- Login, registro, OTP, OAuth, RBAC guards
      /tours            <- Catálogo, detalle, disponibilidad, reseñas
      /checkout         <- Wizard checkout, IVA, Split Fare, Coins
      /loyalty          <- Borondo Coins, niveles, mapa conquistas
      /chat             <- Chat tripartito Socket.io
      /erp              <- CRM, cotizaciones, comisiones, radar (App 2)
      /b2b              <- Portal operadores, manifiesto, radar (App 3)
      /ads              <- Banners publicitarios, tracking impresiones
    /shared
      /components
        SafeHtml.tsx    <- Wrapper DOMPurify (ver sección 8)
        TourImage.tsx   <- Wrapper @unpic/react
        ErrorBoundary.tsx
      /hooks
        useSocket.ts    <- Hook compartido Socket.io
        useDebounce.ts
        useMapbox.ts
      /stores
        auth.store.ts   <- JWT, user, role, level
        cart.store.ts   <- Intención de reserva (tour_id, fecha, pax)
        coins.store.ts  <- Saldo Borondo Coins
        modal.store.ts  <- Estado de modales globales
      /lib
        axios.ts        <- Instancia axios con interceptores auth
        queryClient.ts  <- Configuración TanStack Query
        i18n.ts         <- Configuración i18next
    /apps
      /b2c              <- Punto de entrada App 1
      /erp              <- Punto de entrada App 2
      /b2b              <- Punto de entrada App 3
    /styles
      tokens.css        <- Design tokens CSS (paleta, tipografía, radios)
    main.tsx
    router.tsx
```

---

## 3. Design Tokens — Paleta Glassmorphism

Definidos como variables CSS nativas en `/src/styles/tokens.css`.

| Token | Nombre | Valor | Uso |
|---|---|---|---|
| `--color-base` | Azul Noche | `#020617` (slate-950) | Fondo principal |
| `--color-glow` | Azul Oceánico | `#0369A1` (sky-700) | Gradiente radial de fondo |
| `--color-surface` | Cristal Esmerilado | `bg-white/5 + backdrop-blur` | Tarjetas glass |
| `--color-text-primary` | Hielo Puro | `#F8FAFC` (slate-50) | Texto principal |
| `--color-text-secondary` | Azul Ártico | `#BAE6FD` (sky-200) | Texto descriptivo |
| `--color-action` | Cian Eléctrico | `#0EA5E9` (sky-500) | CTAs, botones de compra |

**Semáforo de disponibilidad (Spec-B RF-B05):**

| Estado | Color | Criterio |
|---|---|---|
| Verde | `#22C55E` (green-500) | Cupos >= 50% |
| Amarillo | `#EAB308` (yellow-500) | Cupos 1–49% |
| Rojo | `#EF4444` (red-500) | Sin cupos |
| Gris | `#64748B` (slate-500) | Fecha no disponible / pasada |

**WCAG 2.1 AA:** El par Cian Eléctrico / Azul Noche alcanza ratio 5.8:1. Verificar todos los pares texto/fondo con Axe DevTools antes de release.

---

## 4. Variables de Entorno

Archivo `.env.example` en la raíz del frontend:

```
# API Backend
VITE_API_URL=http://localhost:3000/api/v1

# Mapbox (token restringido por dominio en Mapbox Dashboard)
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiYm9yb25kb3RvdXJzIiwiYSI6...

# Google OAuth
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

> El token de Mapbox debe estar restringido a dominios de producción y staging. Nunca incluir tokens sin restricción en el repositorio.

---

## 5. Cliente HTTP — Configuración axios

El interceptor de respuesta implementa el flujo de refresh token de Spec-F RF-F05:

1. **Request:** inyecta `Authorization: Bearer {accessToken}` desde `auth.store`
2. **Response 401:** llama `POST /auth/refresh` (cookie HttpOnly automática)
3. **Refresh exitoso:** actualiza el store y reintenta la request original
4. **Refresh fallido:** ejecuta `logout()` y redirige a `/login`

**Criterios de aceptación:**
- [ ] El access token NUNCA se guarda en localStorage (Spec-F RF-F05)
- [ ] El access token vive en Zustand en memoria
- [ ] El interceptor previene bucles infinitos con bandera `isRefreshing`
- [ ] Las requests que llegan durante el refresh se encolan y resuelven juntas

---

## 6. Stores de Zustand

### auth.store.ts
```
Estado: { user, accessToken, isAuthenticated, pendingReservation }
pendingReservation: { tourId, instanceId, pax } — persiste en sessionStorage durante OAuth redirect
Acciones: login, logout, refreshToken, setPendingReservation, clearPendingReservation
```

### cart.store.ts
```
Estado: { tourId, instanceId, date, pax, addons, coinsToUse, splitFare }
Acciones: setTour, setDate, setPax, toggleAddon, setCoins, enableSplitFare
Persiste en sessionStorage (sobrevive refresh, no nueva pestaña — intencional para OAuth)
```

### coins.store.ts
```
Estado: { freeCoins, restrictedCoins: [{ operatorId, amount }] }
Acciones: setBalance, applyCoins, releaseCoins
```

### modal.store.ts
```
Estado: { activeModal: 'auth' | 'otp' | 'feedback' | 'waitlist' | null, modalProps }
Acciones: openModal, closeModal
```

---

## 7. Shared Hook — useSocket

Ubicación: `/src/shared/hooks/useSocket.ts`

Comportamiento:
- Conecta al servidor Socket.io autenticado con el access token del `auth.store`
- Maneja reconexión automática con backoff exponencial
- Ejecuta `socket.disconnect()` automático al desmontar
- Reutilizable para: chat tripartito y futuras notificaciones en tiempo real del ERP

**Criterios de aceptación:**
- [ ] Solo conecta cuando el usuario está autenticado
- [ ] No crea múltiples conexiones si el componente re-renderiza
- [ ] Expone: `socket`, `isConnected`, `sendMessage`, `on`, `off`

---

## 8. Componente SafeHtml

Ubicación: `/src/shared/components/SafeHtml.tsx`

Props: `{ content: string, className?: string }`

Comportamiento:
- Sanitiza el contenido con DOMPurify antes de renderizarlo como HTML
- Whitelist de tags permitidos: `p, strong, em, ul, ol, li, a, br, h2, h3`
- Bloquea: `script, iframe, form, input, style` y todos los atributos `on*`

**Uso obligatorio en:** descripciones de tours, comentarios de reseñas, notas de operadores, políticas de cancelación.

> NOTA DE SEGURIDAD: Este componente es la única forma autorizada de renderizar HTML proveniente del backend. No usar innerHTML directamente en ningún otro componente.

---

## 9. Gestión de Imágenes — @unpic/react

Configuración:
- CDN base: URL de CloudFront (variable de entorno)
- `srcset` automático: 400w, 800w, 1200w
- Formato WebP con fallback JPEG
- `loading="lazy"` por defecto — `loading="eager"` solo para fotos hero above the fold
- Placeholder blur-hash mientras carga (Spec-A RF-A12)

---

## 10. Loading States — Skeletons por Componente

Usando `Skeleton` de Shadcn/UI como primitivo base:

| Componente | Skeleton |
|---|---|
| Grid de tours | `TourCardSkeleton` (3 cols desktop, 2 tablet, 1 mobile) |
| Detalle de tour | `TourDetailSkeleton` (hero + info + calendario) |
| Wizard checkout | `CheckoutSkeleton` (paso actual) |
| Panel reservas | `BookingKanbanSkeleton` (3 columnas) |
| Dashboard ERP | `DashboardSkeleton` (métricas + gráficas) |

Regla TanStack Query: `staleTime: 5 * 60 * 1000` para el catálogo (evita skeleton innecesario en navegación de regreso).

---

## 11. Error Boundaries por Sección Crítica

Cada sección crítica tiene su propio `ErrorBoundary` con fallback local:

| Sección | Fallback |
|---|---|
| Mapa Mapbox | "El mapa no está disponible. Ver lista de tours." |
| Chat tripartito | "El chat no está disponible en este momento." |
| Wizard checkout | "Error al cargar el checkout. Por favor recarga la página." |
| Reseñas | "No se pudieron cargar las reseñas." |
| Cross-selling geográfico | Sección oculta silenciosamente |

Un `ErrorBoundary` global en el root captura errores no manejados con pantalla genérica + botón "Volver al inicio".

---

## 12. Deploy — AWS S3 + CloudFront

**Flujo CI/CD (GitHub Actions):**

```yaml
# .github/workflows/deploy-frontend.yml — activado en push a main

jobs:
  build:
    - npm run lint
    - npm run test          <- Vitest
    - npm run build         <- Vite genera /dist

  deploy:
    needs: build
    - aws s3 sync ./dist s3://borondotours-frontend --delete
    - aws cloudfront create-invalidation --paths "/*"
```

**Configuración SPA en CloudFront:**
- Error 403 → `/index.html` (status 200) — maneja rutas de TanStack Router
- Error 404 → `/index.html` (status 200) — idem
- Cache: `index.html` sin cache (`Cache-Control: no-cache`), assets con hash con cache largo (`max-age=31536000, immutable`)

---

## 13. Testing

### Unit / Integration — Vitest + Testing Library
- Cobertura mínima requerida: **80%**
- Tests obligatorios: stores de Zustand, hooks compartidos, lógica IVA del checkout, guards de rutas RBAC
- Mock de axios con `msw` (Mock Service Worker)

### E2E — Playwright
Flujos críticos cubiertos desde el inicio:
- [ ] Discovery -> Auth Gate -> Checkout -> Confirmación
- [ ] Login con Google OAuth (mock)
- [ ] Split Fare: organizar grupo N personas
- [ ] Panel cliente: ver reservas, cancelar, calificar tour
- [ ] Redirección correcta por rol (CLIENT, AGENT, OPERATOR_ADMIN)

---

## 14. Internacionalización (i18n)

- Idioma Fase 1: `es` — Fases 2+: `en`, `fr`
- Detección: browser language header -> fallback `es`
- Almacenamiento: `localStorage` (`i18nextLng`) + campo `Users.language` en backend

Estructura `/public/locales/es/`:
- `common.json` — navegación, footer, botones globales, errores genéricos
- `tours.json` — catálogo, detalle, filtros, semáforo de disponibilidad
- `checkout.json` — wizard, IVA, Split Fare, Coins, confirmación
- `auth.json` — login, registro, OTP, errores de autenticación
- `erp.json` — CRM, cotizaciones, comisiones, dashboard interno
- `b2b.json` — portal operadores, manifiesto, radar

**Regla:** Cero strings hardcodeados en JSX. Todo pasa por `t('namespace:key')`.

---

## 15. Accesibilidad — Checklist de Implementación

Requerido por Stack-Tecnologico H-30 (WCAG 2.1 AA):

- [ ] Componentes Shadcn/UI cumplen ARIA por defecto — no sobreescribir atributos de accesibilidad
- [ ] Toasts Sonner: `role="alert"` para errores, `aria-live="polite"` para informativos
- [ ] Modal Auth Gate: focus trap, Escape para cerrar, `role="dialog"` + `aria-modal="true"`
- [ ] Calendario semáforo: `aria-label="[fecha]: X cupos disponibles"` en cada día
- [ ] Link "Saltar al contenido principal" como primer elemento de cada página
- [ ] Validación con Axe DevTools en: Discovery, Tour Detail, Checkout, Panel Cliente

---

## 16. Seguridad Frontend

Requerido por Spec-F RF-F10:

- [ ] Access token en Zustand (memoria), nunca en localStorage
- [ ] `SafeHtml` obligatorio para HTML del backend — ver sección 8
- [ ] Headers de seguridad en CloudFront: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] Mapbox token restringido por dominio en el Mapbox Dashboard
- [ ] Variables `VITE_*` sin secretos reales en el repositorio — usar GitHub Secrets para CI/CD

---

## 17. Relaciones con otros documentos

**ADRs relacionados:**
- `docs/02-ADRs/ADR-001-Onepayla-Split-Marketplace.md`
- `docs/02-ADRs/ADR-002-Meilisearch.md`
- `docs/02-ADRs/ADR-003-DynamoDB-Chat.md`
- `docs/02-ADRs/ADR-005-Infra-MVP.md`

**Specs que este documento complementa:**
- `docs/01-Specs/Spec-A-Discovery.md` — catálogo, búsqueda, scrollytelling, mapa
- `docs/01-Specs/Spec-B-Tour-Detail.md` — galería, calendario semáforo, add-ons
- `docs/01-Specs/Spec-C-Checkout.md` — wizard, IVA, Split Fare, pasarela
- `docs/01-Specs/Spec-D-Client-Portal.md` — kanban reservas, chat, feedback
- `docs/01-Specs/Spec-E-Loyalty.md` — Borondo Coins, niveles, mapa conquistas
- `docs/01-Specs/Spec-F-Auth.md` — JWT, RBAC, OAuth, OTP, guards de rutas
- `docs/00-Inicio/Stack-Tecnologico.md` — stack base, roles, i18n, accesibilidad
