# SKILL — Arquitectura de Islas Astro + React (Decisión Estática vs Interactiva)

> **Qué es esto:** reglas deterministas para decidir qué parte de una pantalla es HTML estático (Astro) y qué parte
> necesita ser una isla React (`client:*`), y con qué directiva de hidratación.
> **Cómo usarla:** por cada bloque del mockup, aplica el árbol de decisión y reporta el veredicto. El objetivo es
> hidratar lo MÍNIMO (menos JS = más rápido = más barato).

---

## 1. Regla base: por defecto TODO es Astro estático

BorondoTours es SSG. El HTML se genera en build. Una parte SOLO se convierte en isla React si tiene **interactividad de cliente real**: estado que cambia, validación, entrada de usuario, mapa, calendario, carrusel, fetch dinámico, WebSocket.

Contenido que se renderiza y ya (texto, imágenes, links, grids de tarjetas estáticas, footer, hero sin buscador) → **Astro, sin `client:*`**. Un enlace `<a href>` NO necesita React.

## 2. Árbol de decisión (aplícalo a cada bloque)

1. ¿El bloque solo muestra contenido y navega con links? → **Astro estático.** Fin.
2. ¿Tiene inputs que el usuario llena/valida en el cliente (buscador, formulario, filtros)? → **Isla React.**
3. ¿Es un mapa, calendario, carrusel/galería, o algo que carga una librería pesada? → **Isla React** (y casi siempre `client:visible`).
4. ¿Cambia de estado al interactuar (tabs, acordeón, drawer, toggle favorito, modal)? → **Isla React.**
5. ¿Necesita datos que cambian en runtime tras cargar (feed, contadores en vivo)? → **Isla React.**

Si dudas entre estático e isla, elige **estático** y anota la duda en "Gaps".

## 3. Elección de directiva de hidratación (costo ascendente)

Elige la MÍNIMA que funcione:

| Directiva | Cuándo usarla | Ejemplos |
|---|---|---|
| `client:idle` | Interactivo pero no urgente; puede esperar a que el navegador esté libre | Buscador del hero, toggles, formularios below-the-fold |
| `client:visible` | Costoso y/o fuera de pantalla; hidrata al hacer scroll hasta él | Mapa (Mapbox), galería de imágenes, calendario de reservas, carruseles |
| `client:load` | Necesario de inmediato al cargar (crítico above-the-fold) | Shell de área privada, wizard de checkout, algo que debe responder al instante |

Regla práctica: buscadores/filtros → `client:idle`. Mapas/galerías/calendarios → `client:visible`. Solo lo verdaderamente crítico → `client:load`.

## 4. Aislar la isla (importante para rendimiento)

- Una isla debe ser **lo más pequeña posible**: envuelve solo el widget interactivo, no la sección entera. Ej.: en el Home, el hero es Astro estático **excepto** el buscador, que es `HomeSearchIsland client:idle`.
- Las librerías pesadas (Mapbox, Three.js) van en islas separadas con import dinámico y `client:visible`, nunca en el bundle inicial.
- Nombra cada isla en PascalCase terminando en `Island`: `HomeSearchIsland`, `CatalogMapIsland`, `BookingCalendarIsland`, `GalleryIsland`.

## 5. Qué reportar por cada bloque interactivo

> `Isla: Sí — <NombreIsland> client:<idle|visible|load> — motivo: <por qué necesita JS>`
> o
> `Isla: No (Astro estático)`

Ejemplos:
- Hero con buscador → hero `Astro`; buscador `HomeSearchIsland client:idle` (valida inputs y navega con query params).
- Grid de tours → `Astro` estático usando `TourCard` (los links no necesitan JS).
- Mapa del catálogo → `CatalogMapIsland client:visible` (carga Mapbox, pesado, suele estar bajo el fold).
- Botón favorito en TourCard → parte interactiva mínima; si el resto de la card es estático, marca solo el toggle como interactivo.

## 6. Errores a evitar

- ❌ Marcar una sección entera como isla cuando solo un botón es interactivo.
- ❌ Usar `client:load` "por si acaso" (encarece el bundle).
- ❌ Poner Mapbox/galería en `client:load` o dentro del HTML estático.
- ❌ Convertir en isla algo que solo son links y texto.
