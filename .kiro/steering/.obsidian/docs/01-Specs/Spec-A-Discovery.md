---
tags: [spec, discovery, landing, catalogo, busqueda, scrollytelling]
created: 2025-07-14
updated: 2026-03-26
status: listo-para-implementar
kiro-spec: .kiro/specs/flujo-a-discovery.md
---

# 📋 Spec A — Discovery: Landing, Catálogo y Búsqueda

---

## 1. Objetivos de negocio

- Convertir visitantes orgánicos (SEO) en usuarios registrados mediante un landing de alto impacto visual
- Permitir a los viajeros descubrir tours mediante búsqueda y filtros sin requerir login
- Generar intención de compra antes de llegar al checkout
- El Auth Gate captura al usuario justo antes de la conversión (sin fricción innecesaria)

---

## 2. Landing Page con Scrollytelling

### RF-A01 — Hero Section + Auth Gate
**Contexto:** Primera pantalla que ve el usuario. Decide si sigue o rebota.

**Criterios de aceptación:**
- [ ] Video de fondo (hero reel de Colombia) que se reproduce automáticamente, sin sonido, en loop
- [ ] Tagline principal: "Descubre Colombia, un tour a la vez"
- [ ] CTA principal: "Explorar tours" → scroll suave hasta la sección de catálogo
- [ ] CTA secundario: "Iniciar sesión / Registrarse" → Modal Auth (Spec F)
- [ ] El video hero **no bloquea** el acceso al catálogo; el Auth Gate solo aparece al intentar reservar
- [ ] Responsive: en mobile, video se reemplaza por imagen estática WebP

### RF-A02 — Scrollytelling con GSAP ScrollTrigger
**Contexto:** Sección narrativa que explica el valor de BorondoTours mientras el usuario hace scroll.

**Criterios de aceptación:**
- [ ] Mínimo 3 "escenas" de scrollytelling atadas a la posición del scroll
- [ ] Escena 1: "Descubre" — mapa animado de Colombia con puntos de tours apareciendo
- [ ] Escena 2: "Reserva" — mockup de checkout animado (formulario que se completa solo)
- [ ] Escena 3: "Vive" — galería de fotos de viajeros en tours (carrusel)
- [ ] Cada escena tiene animación de entrada/salida con GSAP ScrollTrigger
- [ ] No afecta performance: lazy-load de assets pesados, IntersectionObserver para activar GSAP
- [ ] El scrollytelling es decorativo — no bloquea el scroll del usuario

### RF-A03 — Sección de propuesta de valor
**Criterios de aceptación:**
- [ ] 3 cards con íconos: "Pago seguro con OnePay.la", "Exención IVA extranjeros", "Borondo Coins en cada compra"
- [ ] Sección "Operadores verificados" con logos de partners (si existen) o texto de validación
- [ ] Sección "¿Cómo funciona?" con 3 pasos ilustrados: Busca → Reserva → Vive

---

## 3. Catálogo de Tours

### RF-A04 — Grid de tours con paginación
**Criterios de aceptación:**
- [ ] Grid responsive: 3 cols desktop, 2 cols tablet, 1 col mobile
- [ ] Cada card muestra: foto principal, nombre del tour, duración, precio base, rating (si existe), badge de operador
- [ ] Paginación: 12 tours por página (infinite scroll en mobile, paginación clásica en desktop)
- [ ] Skeleton loading mientras carga la primera página
- [ ] Estado vacío con mensaje amigable si no hay resultados

### RF-A05 — Búsqueda básica con PostgreSQL ILIKE
**Contexto:** Fase 1. Sin Meilisearch. Búsqueda funcional que soporta el demo al inversionista.

**Criterios de aceptación:**
- [ ] Barra de búsqueda en la parte superior del catálogo
- [ ] Búsqueda por: nombre del tour, destino, operador, tags
- [ ] Query: `WHERE nombre ILIKE '%:q%' OR destino ILIKE '%:q%' OR tags @> ARRAY[:q]`
- [ ] Debounce de 300ms en el input (no disparar query en cada keystroke)
- [ ] URL actualiza con query param `?q=texto` para compartir y SEO
- [ ] Sin typo-tolerance en Fase 1 (Meilisearch llega en Fase 2 — ver ADR-002)

### RF-A06 — Filtros del catálogo
**Criterios de aceptación:**
- [ ] Filtro por **Destino** (select con regiones de Colombia): Eje Cafetero, Llanos, Amazonia, Costa Caribe, Costa Pacífico, Andes, Bogotá DC
- [ ] Filtro por **Duración**: Medio día, 1 día, 2–3 días, Más de 3 días
- [ ] Filtro por **Precio**: rango con slider (min–max en COP)
- [ ] Filtro por **Dificultad**: Familiar, Moderado, Aventurero, Extremo
- [ ] Filtro por **Incluye pasaporte** (checkbox): filtra tours con exención IVA disponible
- [ ] Los filtros se acumulan (AND lógico)
- [ ] Botón "Limpiar filtros" visible cuando hay al menos 1 filtro activo
- [ ] Filtros persisten en URL como query params para compartir
- [ ] En mobile: filtros en drawer lateral (no colapsan el catálogo)

### RF-A07 — Ordenamiento
**Criterios de aceptación:**
- [ ] Select de ordenamiento: "Más popular", "Precio: menor a mayor", "Precio: mayor a menor", "Más reciente"
- [ ] Ordenamiento "Más popular" → orden por `bookings_count DESC` (campo denormalizado en `Tours`)
- [ ] Persiste en URL como `?sort=price_asc`

---

## 4. Cross-selling Geográfico (PostGIS)

### RF-A08 — "Tours cerca de este destino"
**Contexto:** Al filtrar por destino, mostrar tours en un radio de 50km usando PostGIS.

**Criterios de aceptación:**
- [ ] Query PostGIS: `ST_DWithin(location, ST_MakePoint(:lng, :lat)::geography, 50000)`
- [ ] Se muestra como carrusel horizontal debajo del grid principal con label "También te puede interesar"
- [ ] Solo se activa cuando hay un filtro de destino activo con coordenadas
- [ ] Excluye los tours ya visibles en el grid principal

---

## 5. Mapa de Tours (Mapbox GL JS)

### RF-A09 — Vista mapa alternativa
**Criterios de aceptación:**
- [ ] Toggle "Lista / Mapa" en la parte superior del catálogo
- [ ] Vista mapa: Mapbox GL JS con marcadores para cada tour visible
- [ ] Al hacer clic en un marcador: popup con card del tour (foto, nombre, precio, botón "Ver detalle")
- [ ] El mapa se centra en Colombia por defecto: `[-74.2973, 4.5709]`, zoom 5
- [ ] Los filtros activos también aplican en la vista mapa
- [ ] En mobile: mapa ocupa 60% de la pantalla, lista de cards debajo en scroll horizontal

---

## 6. Auth Gate (pre-checkout)

### RF-A10 — Interceptar al usuario antes de reservar
**Contexto:** El usuario hace clic en "Reservar" en la card o en el detalle. Si no tiene sesión, se presenta el Auth Gate.

**Criterios de aceptación:**
- [ ] Si el usuario NO está autenticado y hace clic en "Reservar": mostrar modal de Auth (Spec F)
- [ ] La intención de reserva (tour_id, fecha tentativa) se guarda en Zustand antes de abrir el modal
- [ ] Post-auth exitoso: redirigir directamente al checkout con los datos preservados
- [ ] Si el usuario YA está autenticado: ir directamente al checkout sin interrupción
- [ ] El catálogo completo es visible sin login (solo reservar requiere auth)

---

## 7. SEO y Performance

### RF-A11 — SEO básico
**Criterios de aceptación:**
- [ ] Cada tour tiene URL canónica: `/tours/:slug`
- [ ] Meta tags Open Graph para cada tour (imagen, título, descripción)
- [ ] Sitemap.xml generado automáticamente con todas las URLs de tours
- [ ] robots.txt configurado para permitir indexación del catálogo

### RF-A12 — Performance Fase 1
**Criterios de aceptación:**
- [ ] LCP (Largest Contentful Paint) < 2.5s en conexión 3G
- [ ] Imágenes en formato WebP con `srcset` para diferentes resoluciones
- [ ] Lazy load de imágenes fuera del viewport (Intersection Observer)
- [ ] TanStack Query con `staleTime: 5 * 60 * 1000` para catálogo (evitar refetch innecesario)

---

## 8. API Endpoints

```
GET /api/v1/tours
  Query: q?, destino?, duracion?, precio_min?, precio_max?, dificultad?, sort?, page?, limit?
  Response: { data: Tour[], total: number, page: number }

GET /api/v1/tours/nearby
  Query: lat, lng, radio_km? (default 50), exclude_ids?
  Response: { data: Tour[] }

GET /api/v1/tours/:slug
  Response: Tour (completo, con disponibilidad)
```

---

## 9. Modelo de datos (fragmento relevante)

```
Tours
  - id: uuid
  - slug: string (único, SEO-friendly)
  - nombre: string
  - descripcion: text
  - destino: string
  - region: enum (EJE_CAFETERO, LLANOS, AMAZONIA, COSTA_CARIBE, COSTA_PACIFICO, ANDES, BOGOTA)
  - duracion_horas: integer
  - precio_base: decimal
  - dificultad: enum (FAMILIAR, MODERADO, AVENTURERO, EXTREMO)
  - location: geometry(Point, 4326)   ← PostGIS
  - fotos: string[]                    ← S3 URLs
  - tags: string[]
  - bookings_count: integer            ← denormalizado para ordenar por popularidad
  - is_active: boolean
  - operator_id: uuid FK
  - pax_rule: enum (POR_EDAD, POR_ESTATURA)
  - iva_exempt_available: boolean      ← admite extranjeros con pasaporte
  - created_at: timestamp
  - updated_at: timestamp
```

---

## 10. Dependencias y riesgos

| Dependencia | Riesgo | Decisión |
|---|---|---|
| PostgreSQL ILIKE | Sin typo-tolerance | Aceptado para Fase 1. Meilisearch en Fase 2 (ADR-002) |
| PostGIS 50km cross-sell | Requiere coordenadas de cada tour | Obligatorio al crear tour en ERP |
| Mapbox GL JS | Token expuesto en frontend | Usar token con restricción de dominio en Mapbox Dashboard |
| GSAP ScrollTrigger | Impacto en LCP si se carga síncronamente | Importar GSAP dinámicamente (`import()`) después del render |

---

## 11. Decisiones Diferidas

### H-52 — SEO / GEO / AEO + Analytics
**Decisión:** Diferido a Fase 2. No bloquea el MVP.

**Plan:**
- **SEO técnico (Fase 2):** React con SSR via Vite SSR o migración parcial a Next.js para páginas de catálogo (`/tours/:slug`). Meta tags dinámicos con `react-helmet-async` para Fase 1.
- **GEO (Generative Engine Optimization):** Contenido estructurado en JSON-LD (`TouristAttraction`, `Event`) para que motores generativos (ChatGPT Search, Google AI Overview, Perplexity) indexen los tours de BorondoTours.
- **AEO (Answer Engine Optimization):** FAQs en JSON-LD por tour. Textos optimizados para respuestas directas ("¿Qué tours hay en el Eje Cafetero?").
- **Analytics (Fase 1):** Google Analytics 4 (GA4) con eventos personalizados: `view_tour`, `begin_checkout`, `purchase`, `cancel_booking`. Respetar preferencia de cookies (banner GDPR básico).
- **Analytics (Fase 2):** Migrar a Plausible Analytics (privacy-first, self-hosted) o mantener GA4 con consent mode v2.

### H-47 — Chatbot IA de Soporte
**Decisión:** Diferido a Fase 3. Requiere base de conocimiento estructurada y volumen mínimo de tickets para entrenamiento.

**Plan tentativo:**
- Fase 3: Widget de chat con Intercom o Crisp (solución off-the-shelf) + handoff a agente humano.
- Fase 4 (post-inversión): Fine-tuning de un modelo de lenguaje con el histórico de tickets de soporte de BorondoTours.

### H-32 — Reclamación de Leads sin Dueño
**Decisión:** Sin implementación por ahora. Los leads expirados (90 días sin interacción) pasan a la vista "Leads sin dueño" accesible para todos los agentes (Spec-H RF-H04). No se requiere un flujo de "reclamación" formal — cualquier agente puede abrir el lead y crear una nueva cotización.

---

## Links relacionados
- [[Spec-B-Tour-Detail]]
- [[Spec-F-Auth]]
- [[../02-ADRs/ADR-002-Meilisearch]]
- [[../00-Inicio/Stack-Tecnologico]]
- [[../00-Inicio/Vision-y-Objetivos]]
