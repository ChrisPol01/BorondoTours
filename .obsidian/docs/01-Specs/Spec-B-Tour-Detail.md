---
tags: [spec, tour-detail, calendario, disponibilidad, reserva]
created: 2025-07-14
updated: 2026-03-26
status: listo-para-implementar
kiro-spec: .kiro/specs/flujo-b-tour-detail.md
---

# 📋 Spec B — Detalle de Tour y Calendario de Disponibilidad

---

## 1. Objetivos de negocio

- Presentar el tour de forma que maximice la conversión a checkout
- Mostrar disponibilidad en tiempo real con el "semáforo" (verde/amarillo/rojo)
- Permitir al usuario seleccionar fecha y número de pasajeros antes de ir al checkout
- Habilitar cross-selling geográfico en el momento de mayor intención de compra

---

## 2. Cabecera del Tour

### RF-B01 — Hero del tour
**Criterios de aceptación:**
- [ ] Galería de fotos principal: slider con thumbnails, mínimo 3 fotos requeridas al publicar
- [ ] Foto principal ocupa 60vh en desktop, 40vh en mobile
- [ ] Badge de operador (logo + nombre) sobre la foto principal
- [ ] Badge de dificultad (Familiar / Moderado / Aventurero / Extremo) con color correspondiente
- [ ] Botón "Compartir" con Web Share API (fallback: copiar URL al clipboard)
- [ ] Si el usuario está autenticado: botón "Guardar en mis favoritos" (corazón toggle)

### RF-B02 — Información esencial (above the fold)
**Criterios de aceptación:**
- [ ] Nombre del tour (H1)
- [ ] Destino y región
- [ ] Duración en formato legible: "1 día", "3 días / 2 noches"
- [ ] Precio base con detalle: "Desde $150.000 COP por persona"
- [ ] Rating promedio con número de reseñas (si existen)
- [ ] Indicador "IVA exento disponible" si `iva_exempt_available = true`
- [ ] CTA pegajoso (sticky) en desktop: card lateral con precio + botón "Reservar ahora"
- [ ] CTA en mobile: barra inferior fija con precio + botón "Reservar"

---

## 3. Contenido del Tour

### RF-B03 — Descripción completa
**Criterios de aceptación:**
- [ ] Descripción larga en Markdown, renderizada en HTML (soporte de negritas, listas, links)
- [ ] Sección "¿Qué incluye?" — lista de ítems incluidos
- [ ] Sección "¿Qué NO incluye?" — lista de ítems no incluidos
- [ ] Sección "¿Qué llevar?" — recomendaciones de equipamiento
- [ ] Sección "Punto de encuentro" — texto + mapa Mapbox con pin de la ubicación de salida
- [ ] Sección "Itinerario" — lista de actividades por hora/día (si aplica)

### RF-B04 — Add-ons del tour
**Criterios de aceptación:**
- [ ] Listado de add-ons disponibles con nombre, descripción corta y precio adicional
- [ ] Los add-ons se pueden pre-seleccionar desde el detalle (persisten al ir a checkout via Zustand)
- [ ] Si no hay add-ons configurados, la sección no se muestra

---

## 4. Calendario Semáforo de Disponibilidad

### RF-B05 — Selector de fecha con react-day-picker
**Contexto:** El viajero necesita ver de un vistazo qué fechas tienen cupos disponibles.

**Criterios de aceptación:**
- [ ] Calendario mensual usando react-day-picker con colores personalizados (Tailwind)
- [ ] **Verde**: cupos disponibles ≥ 50% de la capacidad
- [ ] **Amarillo**: cupos disponibles entre 1 y 49% de la capacidad (¡quedan pocos!)
- [ ] **Rojo**: sin cupos (fecha llena o ya pasó)
- [ ] **Gris**: fecha no disponible (día fuera de los horarios del tour)
- [ ] Al hacer clic en una fecha verde o amarilla: se activa como "fecha seleccionada"
- [ ] Tooltip al hover sobre una fecha: "X cupos disponibles" o "Fecha completa"
- [ ] El calendario muestra 2 meses simultáneos en desktop, 1 en mobile
- [ ] Navegación de meses con flechas prev/next
- [ ] No se puede seleccionar fechas pasadas ni fechas en rojo

### RF-B05b — Lista de Espera / Notificarme
**Contexto:** Cuando una fecha está llena (rojo), el viajero puede inscribirse en lista de espera.
**Criterios de aceptación:**
- [ ] Botón "Avisarme si se abren cupos" aparece cuando se selecciona una fecha llena.
- [ ] Flujo: se abre modal pidiendo cantidad de cupos deseados y un email (si no está autenticado).
- [ ] Si se liberan cupos (ej. alguien cancela), BullMQ envía email a todos en lista de espera para esa fecha.
- [ ] Usuarios nivel Conquistador (4) o superior tienen prioridad en la notificación (se les envía 1 hora antes que al resto).

### RF-B06 — Instancias de tour (TourInstances)
**Contexto:** Cada fecha disponible en el calendario corresponde a una `TourInstance`.

**Criterios de aceptación:**
- [ ] Al seleccionar una fecha, se carga la instancia correspondiente:
  - Hora de salida y llegada estimada
  - Capacidad total y cupos disponibles
  - Guías asignados (nombres, si están publicados)
  - Precio vigente (puede diferir del precio base por temporada)
- [ ] El precio mostrado en el CTA se actualiza al seleccionar una instancia específica
- [ ] Si la instancia tiene precio diferenciado, mostrar badge "Temporada alta" o "Oferta"

### RF-B07 — Selector de pax previo al checkout
**Criterios de aceptación:**
- [ ] Contadores `[+]` / `[-]` por categoría de pasajero (según `pax_rule` del tour)
- [ ] El selector de pax en detalle es un preview — no bloquea cupos todavía
- [ ] Si el pax seleccionado excede los cupos disponibles: mostrar advertencia "Solo quedan X cupos"
- [ ] El pax se persiste en Zustand al hacer clic en "Reservar"

---

## 5. Reseñas y Ratings

### RF-B08 — Sección de reseñas
**Criterios de aceptación:**
- [ ] Rating promedio (1–5 estrellas) con distribución porcentual (barra por cada estrella)
- [ ] Listado de reseñas: avatar, nombre, fecha, rating, texto
- [ ] Paginación de reseñas: 5 por defecto, botón "Ver más"
- [ ] Solo usuarios con booking `COMPLETED` pueden dejar reseña (validación en backend)
- [ ] Si no hay reseñas: mostrar "Sé el primero en opinar sobre este tour"
- [ ] Las reseñas se disparan automáticamente 24h después del tour vía BullMQ (ver Spec G)

---

## 6. Cross-selling Geográfico

### RF-B09 — "Tours similares cerca de aquí"
**Contexto:** En el detalle del tour, mostrar otros tours en un radio de 50km del destino actual.

**Criterios de aceptación:**
- [ ] Carrusel horizontal con máximo 6 tours sugeridos
- [ ] Query PostGIS: `ST_DWithin(t.location, :tour_location, 50000) AND t.id != :current_id`
- [ ] Si hay menos de 3 tours cercanos: completar con tours del mismo operador
- [ ] Título de la sección: "También en [nombre del destino]"

---

## 7. API Endpoints

```
GET /api/v1/tours/:slug
  Response: Tour completo con operador, add-ons, instrucciones

GET /api/v1/tours/:id/instances
  Query: year?, month?
  Response: { instances: TourInstance[], availability_map: { [date: string]: 'green' | 'yellow' | 'red' | 'gray' } }

GET /api/v1/tours/:id/instances/:instance_id
  Response: TourInstance (con guías, precio vigente, cupos exactos)

GET /api/v1/tours/:id/reviews
  Query: page?, limit?
  Response: { data: Review[], average_rating: number, distribution: Record<1|2|3|4|5, number> }

POST /api/v1/tours/:id/reviews
  Auth: requerido, booking COMPLETED
  Body: { rating: 1-5, text: string }

GET /api/v1/tours/:id/nearby
  Response: Tour[]
```

---

## 8. Modelo de datos

```
TourInstances
  - id: uuid
  - tour_id: uuid FK
  - date: date
  - time_start: time
  - time_end_estimated: time
  - capacity: integer
  - booked_pax: integer          ← denormalizado (se actualiza en cada booking)
  - available_pax: integer       ← computed: capacity - booked_pax
  - price_override: decimal | null   ← null = usar precio base del tour
  - status: enum (AVAILABLE, FULL, CANCELLED, COMPLETED)
  - guide_ids: uuid[]            ← asignados desde ERP
  - driver_ids: uuid[]

Reviews
  - id: uuid
  - tour_id: uuid FK
  - user_id: uuid FK
  - booking_id: uuid FK (unique — 1 reseña por booking)
  - rating: integer (1–5)
  - text: text
  - created_at: timestamp
  - is_visible: boolean
```

---

## 9. Dependencias y riesgos

| Dependencia | Riesgo | Decisión |
|---|---|---|
| react-day-picker + Tailwind v4 | Estilos CSS modules pueden colisionar con Tailwind | Usar `classNames` prop de react-day-picker para inyectar clases Tailwind |
| `available_pax` denormalizado | Race condition en reservas simultáneas | Usar `SELECT FOR UPDATE` en la instancia al crear booking |
| Reseñas automáticas (BullMQ) | Job puede dispararse si el tour fue cancelado | Verificar estado del booking antes de enviar el email |

---

## Links relacionados
- [[Spec-A-Discovery]]
- [[Spec-C-Checkout]]
- [[Spec-E-Loyalty]]
- [[Spec-G-ERP-Operativo]]
- [[../02-ADRs/ADR-001-Onepayla-Split-Marketplace]]
