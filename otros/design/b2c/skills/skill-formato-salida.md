# SKILL — Contrato de Salida + Golden Example + Checklist

> **Qué es esto:** el ejemplo dorado (una Design Spec real y bien hecha) y el checklist que debes correr ANTES de entregar.
> **Cómo usarla:** tu salida debe calcar la estructura del golden example. Antes de responder, verifica el checklist final.
> Si algún ítem falla, corrígelo antes de entregar. Entrega SOLO el Markdown de la Design Spec, sin texto extra.

---

## 1. GOLDEN EXAMPLE (imita esta estructura y nivel de detalle)

El siguiente es un ejemplo de Design Spec para una pantalla ficticia sencilla ("Página de Destinos"). Tu salida real
debe tener este mismo formato, secciones y precisión. Nota cómo usa nombres de token/componente reales, marca
`(INFERIDO)`, transcribe copy literal y clasifica datos.

````markdown
# Design Spec — Destinos

- **Fuente:** 3-Seleccion de destinos pagina web.png
- **Ruta:** /destinations
- **Viewport del mockup:** desktop ~1440
- **Resumen:** Pantalla de exploración de destinos por región. Hero corto con título, mosaico de tarjetas de región con conteo de tours, y CTA final hacia el catálogo.

## 1. Estructura general (secciones de arriba a abajo)
1. Navbar (glass sobre hero) — alto ~88px (= header)
2. Hero corto — alto ~40vh — título + subtítulo centrados sobre imagen
3. Mosaico de regiones — grid 3 columnas — alto (INFERIDO) ~600px
4. Banda de métricas — 3 cifras en fila
5. CTA final "Explora todos los tours" — banda arena
6. Footer

## 2. Detalle por sección

### Sección: Hero corto
- **Layout:** flex centrado (columna), contenido centrado horizontal y vertical
- **Fondo:** imagen de paisaje + overlay `bg-negro-volcanico/40`
- **Elementos:**
  - Título — texto: "Descubre Colombia por regiones" — rol H1 (`text-h1`) `font-heading` ExtraBold — color `blanco-niebla`
  - Subtítulo — texto: "Cada región, una experiencia distinta" — rol Body1 (`text-body1`) `font-body` — color `blanco-niebla/85`
- **Componente:** Reutiliza patrón de hero (Astro estático); imagen con `ResponsiveImage`
- **Isla React:** No (Astro estático)
- **Estados:** default
- **Notas de medida:** alto ~40vh (INFERIDO); padding lateral `px-page-gutter`

### Sección: Mosaico de regiones
- **Layout:** grid 3 columnas, gap ~24px (gap-6), ancho `max-w-public`
- **Fondo:** `bg-surface-page`
- **Elementos:**
  - Card de región (x6) — imagen 3/4, nombre región (rol H3), conteo "12 tours" (rol Label), overlay inferior
  - Icono — significado: flecha "ver" — lucide sugerido: ArrowRight
- **Componente:** Nuevo `RegionCard` (compone `ResponsiveImage` + overlay; similar a `TourCard` pero enlaza a `/discovery?region=X`)
- **Isla React:** No (Astro estático) — son enlaces
- **Estados:** default, hover (escala imagen ~1.05, INFERIDO), vacío (región sin tours → `StatusMessage tone="empty"`)
- **Notas de medida:** cards ~1/3 del contenedor, ratio 3/4

## 3. Componentes nuevos requeridos
| Componente | Tipo | Props sugeridas | Reusa |
|---|---|---|---|
| RegionCard | Astro | region: string, tourCount: number, photoUrl, href | ResponsiveImage |

## 4. Tokens usados
- **Colores:** blanco-niebla, negro-volcanico/40, surface-page, arena (CTA final)
- **Tipografía:** H1, H3, Body1, Label
- **Radios/elevación/glass:** rounded-card, shadow-card
- **Degradados:** ninguno (overlay sólido)

## 5. Iconografía
| Significado | lucide-react | Dónde aparece |
|---|---|---|
| flecha ver más | ArrowRight | RegionCard |
| pin ubicación | MapPin | banda métricas (INFERIDO) |

## 6. Estados globales de la pantalla
- default; empty state por región sin tours

## 7. Responsive (INFERIDO)
- **Desktop → Mobile:** mosaico 3 col → 1 col apilada; hero mantiene texto centrado; métricas 3 en fila → apiladas

## 8. Accesibilidad — checklist específico
- [ ] Imagen de hero decorativa `alt=""`; imágenes de RegionCard con alt = nombre región
- [ ] Orden de foco: navbar → cards en orden de lectura → CTA
- [ ] Contraste: verificar texto blanco sobre overlay 40% en zonas claras de la foto
- [ ] Targets de card ≥44px

## 9. Clasificación de datos
- **contract-backed:** conteo de tours por región (lectura)
- **visual-only:** recomendador "Sugerir destino" (sin contrato aprobado)

## 10. Gaps y preguntas para confirmar
1. ¿Cuántas regiones exactas? El mockup muestra 6, ¿son fijas o dinámicas? [confirmar]
2. Alto real del hero no medible con certeza (estimado 40vh).
3. ¿El conteo "12 tours" viene de un endpoint existente? No inventar fuente.
````

---

## 2. REGLAS DE ESTILO DE LA SALIDA

- Responde **solo** con el bloque Markdown de la Design Spec. Nada antes, nada después.
- Usa exactamente las 10 secciones numeradas del golden example, en ese orden.
- Copy siempre literal entre comillas. Medidas siempre con `~` / clase Tailwind / `(INFERIDO)` según la skill de medición.
- Nombres de color/clase/componente siempre los de la skill de design system. Cero hex si el color es de la paleta.
- Español. Conciso pero completo: cada sección del mockup merece su bloque en la sección 2.

---

## 3. CHECKLIST DE AUTO-VALIDACIÓN (córrelo antes de entregar)

- [ ] ¿Declaré el viewport del mockup al inicio?
- [ ] ¿Recorrí TODAS las secciones visibles de arriba a abajo en la sección 2?
- [ ] ¿Todo el copy está transcrito literal (o marcado `[ilegible]`)?
- [ ] ¿Cada color es una clase base/semántica de la skill (sin hex de la paleta)?
- [ ] ¿Cada texto tiene rol tipográfico `text-h1..text-label` (no `text-xl` genérico)?
- [ ] ¿Cada medida tiene `~`, clase Tailwind o `(INFERIDO)`?
- [ ] ¿Reutilicé componentes existentes cuando aplicaba (TourCard, Button, StatusMessage, AccessibleDialog…)?
- [ ] ¿Marqué cada bloque como Astro estático o isla React con directiva y motivo?
- [ ] ¿Clasifiqué datos en contract-backed vs visual-only?
- [ ] ¿Listé gaps reales sin inventar datos, endpoints ni lógica de negocio?
- [ ] ¿La salida es SOLO el Markdown, sin preámbulo ni cierre?
