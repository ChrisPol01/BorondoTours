# Paquete de Análisis de Mockups → Design Spec

Sistema para convertir cada mockup PNG en un documento Markdown ("Design Spec") que Kiro implementa sin volver a analizar la imagen. El análisis visual (caro en tokens) se hace **una vez** en una IA multimodal externa y queda versionado aquí.

## Estructura

```
otros/design/b2c/
  PROMPT-analisis-mockup.md      ← prompt maestro (instrucción principal)
  README-analisis.md             ← este archivo
  skills/
    skill-design-system.md       ← tokens + clases Tailwind + componentes reales del repo
    skill-medicion-visual.md     ← método anti-alucinación para medir tamaños
    skill-astro-islands.md       ← decidir Astro estático vs isla React
    skill-formato-salida.md      ← golden example + checklist de la salida
  specs/                         ← (se irá llenando) los .md resultantes por pantalla
    01-home.design.md
    02-catalogo.design.md
    ...
  *.png                          ← los 16 mockups originales
```

## Flujo de trabajo

### Fase A — Análisis (una vez por pantalla, en la IA externa)
1. Abre la IA multimodal (la que analiza imágenes sin costo para ti).
2. Adjunta: los **4 archivos** de `skills/` + **1 imagen** de mockup.
   - Si tu IA no permite varios archivos: pega el contenido de las 4 skills tras el prompt, cada una bajo su título.
3. Pega el contenido del prompt (entre `=== INICIO DEL PROMPT ===` y `=== FIN DEL PROMPT ===`).
4. Reemplaza los 3 marcadores del prompt: `{{NOMBRE_PANTALLA}}`, `{{NOMBRE_ARCHIVO_PNG}}`, `{{RUTA}}`.
5. La IA devuelve el Markdown de la Design Spec.
6. Guárdalo en `specs/NN-nombre.design.md` y me lo envías (o lo pego yo al implementar).

### Fase B — Implementación (en Kiro, barata)
Kiro lee solo el `.md` + los steering de marca. Cero imágenes. Implementa el componente Astro/React.

## Mapa de pantallas (marcadores sugeridos)

| PNG | NOMBRE_PANTALLA | RUTA |
|---|---|---|
| 1-Inicio de pagina web.png | Home | / |
| 2-Catalogo pagina web.png | Catálogo | /discovery |
| 2-1-Reserva de tour seleccionado pagina web.png | Detalle de tour | /tours/[slug] |
| 3-Seleccion de destinos pagina web.png | Destinos | /destinations |
| 4-Experiencias pagina web.png | Experiencias | /experiences |
| 5-Blog pagina web.png | Blog | /blog |
| 6-Nosotros y contacto pagina web.png | Nosotros y Contacto | /about, /contact |
| 20-Panel usuario pagina web.png | Panel de usuario | /mi-cuenta |
| 21-Mis tours usuario pagina web.png | Mis Tours | /mis-reservas |
| 21-1-Detalle de reserva de tour usuario pagina web.png | Detalle de reserva | /mis-reservas/[reference] |
| 21-2-Proceso de reservas usuario pagina web.png | Checkout | /checkout |
| 22-Perfil usuario pagina web.png | Perfil | /perfil |
| 23-Borondo Coins usuario pagina web.png | Borondo Coins | /coins |
| 24-Tours favoritos usuario pagina web.png | Favoritos | /favoritos |
| 25-Mensajes usuarios pagina web.png | Mensajes | /mensajes |

## Mantenimiento

- Si agregas o cambias un componente en `apps/web/src/components/`, actualiza `skills/skill-design-system.md`. Es la única skill que cambia seguido.
- Las otras 3 skills son estables (método, no inventario).
- Un mockup muy alto puede cortarse en 2-3 tramos; el formato de salida se concatena bien porque va sección por sección.

## Por qué este diseño ahorra tokens

- El análisis visual pesado ocurre en la IA externa, no en Kiro.
- El resultado queda en texto versionado: no se repite el análisis entre sesiones.
- Kiro implementa leyendo texto (barato) en vez de re-analizar PNGs (caro).
