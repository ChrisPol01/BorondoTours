---
name: bt-astro-frontend
description: >
  Patrones de frontend con Astro y React 19 (islands) para BorondoTours: Nanostores, TanStack Query,
  kit de componentes bt-* (steering 18), i18next, SafeHtml, mobile-first y accesibilidad WCAG 2.2 AA.
  Para los roles frontend, uiux-a11y y content-seo de la fábrica.
---

# bt-astro-frontend

Patrones para `apps/web` (Astro + `@astrojs/react`, React 19) y `packages/ui`. El objetivo es
reutilizar el kit antes de crear, mantener la accesibilidad y no inventar estilos.

## Cuándo se activa

- Construir páginas Astro o islands React.
- Manejar estado de cliente o datos remotos.
- Colocar piezas del kit `bt-*` o validar accesibilidad.

## Islands y estado

- Astro renderiza estático por defecto; React solo en islands con la directiva mínima: `client:idle`,
  `client:visible` o `client:load` según la interacción (evitar `client:load` si no hace falta).
- Estado compartido entre islands con Nanostores; datos remotos con TanStack Query.
- Access token en memoria, nunca en `localStorage`.

## Kit de componentes bt-* (steering 18)

- Antes de escribir un elemento nuevo, revisar el kit: si dos piezas se ven y se comportan igual, son
  un componente. Constructores en `apps/web/src/lib/fig/runtime/ui-kit.ts`; estilos en el bloque
  "KIT DE COMPONENTES" de `apps/web/src/styles/fig-runtime.css`.
- El CSS de una pantalla solo coloca piezas (posición, ancho, rejilla); no define colores, tipografía
  ni hover propios. Nunca hex en componentes: usar los tokens semánticos.
- Pieza nueva o variante que no exista en Figma → se replica en Figma invocando el subagente
  `figma-sync` al terminar (Figma es la fuente de verdad del diseño).

## i18n y formato

- Todo texto visible vía `t('ns:key')` con i18next (es-CO primero); sin cadenas sueltas.
- Montos con `Intl.NumberFormat('es-CO')`; precios con "Impuestos incluidos" (RF-C15).

## HTML del backend

- HTML que venga del backend solo a través de `SafeHtml` (DOMPurify). Nunca `innerHTML` directo.

## Mocks desde el contrato

- Generar fixtures tipados a partir de los `examples` del `openapi.yaml` en
  `apps/web/src/lib/api/mocks/<feature>.ts` para vitest y desarrollo, sin librería nueva.
- Ante `CONTRACT_UPDATED` en el inbox, regenerar los mocks y ajustar la implementación.

## Accesibilidad WCAG 2.2 AA

- `label` y `alt` presentes; foco visible; trampa de foco en modales y restauración del foco al cerrar.
- Navegación por teclado completa (flechas/Enter/Escape en menús y dropdowns).
- Contraste ≥ 4.5:1; objetivos táctiles ≥ 44 px; respetar `prefers-reduced-motion`.
- Roles y `aria-*` correctos (`role="dialog"`, `aria-modal`, `aria-expanded`).

## Composición de componentes

- Preferir composición a herencia; componentes funcionales. Memoizar solo cuando el perfilado lo pide.
- Un archivo, una responsabilidad; funciones ≤ 50 líneas.

## Verificación (PowerShell)

```powershell
pnpm --filter @borondo/web run lint
pnpm --filter @borondo/web run typecheck
pnpm --filter @borondo/web run test:run
```

No usar `pnpm --filter @borondo/web run test` (abre vitest en modo watch y cuelga). En `packages/ui`,
`run typecheck` y `run test`.

## Lista de verificación

- [ ] Island con la directiva `client:*` mínima necesaria.
- [ ] Pieza reutilizada del kit; sin hex ni estilos propios en la pantalla.
- [ ] Textos vía `t('ns:key')`; montos con `Intl.NumberFormat('es-CO')`.
- [ ] HTML del backend solo con SafeHtml; token en memoria.
- [ ] WCAG 2.2 AA: foco, contraste, teclado, `prefers-reduced-motion`.
- [ ] Figma sincronizado si hay piezas o variantes nuevas.

## Atribución

Adaptado de affaan-m/ECC `.kiro/skills/frontend-patterns`, MIT, Copyright (c) 2026 Affaan Mustafa.
Ver `.kiro/factory/THIRD_PARTY.md`. Reescrito para Astro + React 19, Nanostores, TanStack Query,
el kit `bt-*` e i18next de BorondoTours (sin Next.js, Framer Motion ni Supabase).
