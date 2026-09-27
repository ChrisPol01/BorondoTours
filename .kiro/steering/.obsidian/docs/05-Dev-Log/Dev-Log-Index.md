---
tags: [dev-log]
---

# 📓 Dev Log — Índice

> Registro diario del desarrollo. Captura decisiones rápidas, blockers, avances y aprendizajes.

---

## Entradas recientes

| Fecha | Resumen | Link |
|---|---|---|
| {{fecha}} | Inicio del proyecto | [[2025-01-01]] |

---

_Crea una nota nueva en [05-Dev-Log] por día usando la plantilla [[../Templates/Dev-Log-Diario]]_


---

## Pendientes de CÓDIGO derivados del diseño en Figma (no perder el hilo)

> Estos efectos se diseñaron/validaron en Figma pero **aún NO están en el código** de `apps/web`.
> Implementarlos cuando se retome la fase de programación del frontend B2C.

### PEND-CODE-01 — Glow de marca en botones (turquesa ↔ verde frailejón)
- **Qué:** el `Button` primario (turquesa `#00b7c7`) debe llevar una sombra difusa de color **verde frailejón** (`#79c142`), y el estado hover (verde) debe llevar un **glow turquesa** (`#00b7c7`). Efecto de "iluminación de marca" que refuerza la firma turquesa↔verde.
- **Dónde:** `apps/web/src/components/ui/Button.*` (o el componente canónico equivalente).
- **Cómo (código real):** `box-shadow` de color con blur alto y spread leve, p. ej. reposo `0 6px 20px color-mix(in srgb, var(--brand-verde-frailejon) 45%, transparent)`; en hover intercambiar a glow turquesa. Respetar `prefers-reduced-motion` en la transición.
- **Estado:** diseñado en Figma (solo Figma por ahora, por decisión del usuario). Falta llevar a CSS/tokens.

### PEND-CODE-02 — Header liquid glass estilo iOS 26 (opción A: sin indicador deslizante)
- **Qué:** el navbar/header debe verse como "vidrio líquido" iOS: fondo casi invisible (blanco ~2% / azul-profundo translúcido), borde con **degradado lineal** (blanco 0% → blanco → 0%), **doble inner shadow** (blanca Y:+2 blur:8 arriba, negra Y:-2 blur:6 abajo), corner radius alto (pill) y **background blur**. Es solo el look de vidrio (NO lleva el indicador deslizante tipo tabs).
- **Dónde:** `apps/web/src/components/layout/Navbar.tsx` + estilos glass en `global.css` (tokens `--glass-header-*` ya existen en `tokens.css`).
- **Cómo (código real):** `backdrop-filter: blur() saturate()`, borde con `border-image` o pseudo-elemento con gradiente, doble `box-shadow inset`. El blur real solo se ve sobre contenido (hero/foto) detrás.
- **Nota:** las `Inner Shadow`, `texture` y `Background Blur` del tutorial de Figma son de Figma; en web se traducen a `backdrop-filter` + `box-shadow inset`.
- **Estado:** diseñado en Figma. Falta llevar a código.

### PEND-CODE-03 (FUTURO, no pedido aún) — Componente Tabs liquid glass con indicador deslizante
- **Qué:** selector de pestañas con indicador que se desliza con física de resorte (tipo iOS 26), para filtros del Discovery. El usuario eligió opción A (solo header) por ahora; esto queda anotado por si luego se quiere (era la opción B/C).
- **Cómo (código real):** `backdrop-filter` para el glass + animación de deslizamiento con **Framer Motion `layoutId` + spring** (o CSS `cubic-bezier` tipo spring). La animación Smart Animate / Custom Spring del tutorial de Figma es solo prototipo; NO se exporta.
- **Estado:** no iniciado. Solo referencia.

> Fuente de las referencias de motion: tutoriales de Studio Shepard (iOS 26 liquid glass) y "Liquid Navigation Menu [Korsat X Parmaga]" en `otros/design/b2c/`.
