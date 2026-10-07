---
tags: [spec, blog, contenidos, resenas, moderacion, seo]
created: 2026-09-27
status: borrador
---

# 📋 Spec L — Blog y Contenidos (App 1 B2C)

> El Blog publica **reseñas de viajeros y artículos** que BorondoTours **aprueba** antes de mostrarlos al cliente final. Apoya SEO/GEO (Spec-A H-52) y la confianza de marca.

## Reglas de negocio
- Nada se publica sin aprobación de BorondoTours (SUPER_ADMIN o rol con permiso `blog:approve`).
- Marca blanca: ningún contenido nombra al operador de un tour.
- Reseñas: solo de reservas `COMPLETED` (misma regla que Spec-B RF-B08); el viajero puede autorizar que su reseña se use como historia en el Blog (consentimiento explícito, no pre-marcado — Ley 1581).
- Artículos: guías de destino, tips de viaje, historias. Autores: equipo interno (Fase 1); viajeros invitados (Fase 2).
- Las promesas en contenidos siguen la voz de marca (sin "garantizado", sin hipérboles).

## Requerimientos funcionales

### L-RF01 — Listado del Blog (público)
- [ ] Hero + filtros por categoría (usa [[../03-Knowledge/Taxonomia-Experiencias]] y "Consejos de viaje", "Historias de viajeros").
- [ ] Grid de tarjetas (imagen 16:9, categoría, título, extracto, fecha, tiempo de lectura) con paginación cursor-based.
- [ ] Sidebar: categorías, artículos populares, suscripción a novedades (checkbox de consentimiento no pre-marcado).

### L-RF02 — Detalle de artículo (público)
- [ ] Título, portada, autor (nombre y cargo; sin datos de contacto personales), fecha, tiempo de lectura, cuerpo Markdown renderizado con `SafeHtml`.
- [ ] Tours relacionados (misma categoría/destino) → enlace al detalle del tour.
- [ ] Meta Open Graph + JSON-LD `Article`; slug SEO en español.

### L-RF03 — Flujo editorial (ERP)
- [ ] Estados: `BORRADOR` → `EN_REVISION` → `PUBLICADO` | `RECHAZADO` (con motivo obligatorio). `PUBLICADO` → `ARCHIVADO`.
- [ ] Historial inmutable de cambios de estado (quién, cuándo, motivo).
- [ ] Vista previa exacta antes de aprobar.

### L-RF04 — Reseña convertida en historia
- [ ] Desde una reseña aprobada con consentimiento del viajero, el equipo crea una "Historia de viajero" (nombre mostrado solo con nombre + inicial del apellido).

## Modelo de datos (propuesto — incorporar a Modelo-Datos-Core al implementar)
```
BlogPosts
  - id: uuid (PK)
  - kind: enum (ARTICULO, HISTORIA_VIAJERO)
  - slug: string (UNIQUE)
  - title: string
  - excerpt: string
  - body_md: text
  - cover_url: string
  - category: string            ← categoría de Taxonomia-Experiencias o CONSEJOS / HISTORIAS
  - author_id: uuid FK
  - source_review_id: uuid FK | null
  - status: enum (BORRADOR, EN_REVISION, PUBLICADO, RECHAZADO, ARCHIVADO)
  - rejection_reason: text | null
  - approved_by: uuid FK | null
  - published_at: timestamp | null
  - reading_minutes: integer
  - created_at / updated_at: timestamp

BlogPostStatusHistory
  - id, post_id FK, from_status, to_status, actor_id FK, reason, created_at
```

## Fase
- Fase 1: listado + detalle + artículos internos aprobados (contenido semilla para SEO).
- Fase 2: historias desde reseñas, autores invitados.
