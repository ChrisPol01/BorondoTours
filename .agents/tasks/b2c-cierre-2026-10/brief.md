# Brief — Cierre del B2C y arranque del B2B (2026-10)

Objetivo del dueño: este fin de semana el B2C queda **funcional** (con datos simulados en el frontend y luego
con backend) y **desplegado** en AWS. En paralelo se diseña el B2B (app de gestión) en Figma.

## Fuentes que mandan
- Informe QA del B2C: `.agents/tasks/qa-b2c-2026-10/informe.md` (216 funciones: 63 FALLA, 14 PARCIAL, 24 NO IMPLEMENTADO).
- Specs B2C: `docs/01-Specs/Spec-A-Discovery.md`, `Spec-B-Tour-Detail.md`, `Spec-C-Checkout.md`, `Spec-D-Client-Portal.md`, `Spec-F-Auth.md`. Spec-E (Coins) en pausa: no mostrar Coins.
- Diseño: `docs/04-Tech-Design/DESIGN.md`, steering 12 (marca), 13 (puente Figma), 15 (frontend), 18 (kit de componentes).
- Skill de diseño: `.kiro/skills/apple-design` (HIG de Apple). La marca y WCAG mandan si chocan.
- Decisiones de la app de gestión: `.agents/tasks/erp-b2b-unificacion-2026-10/00-propuesta-consolidada.md` y `06-decisiones-dueno.md`.

## Reglas para todos los agentes
- El B2C es `apps/web`. Runtime de pantallas Figma: `apps/web/src/lib/fig/runtime/*`, kit `ui-kit.ts`, estilos
  `apps/web/src/styles/fig-runtime.css` (kit) y `fig-home.css` (solo Home). No editar a mano los `.astro` generados
  por fig2astro; sobrescribir con CSS de mayor especificidad o con el runtime.
- Solo tokens semánticos/marca (sin hex sueltos: el build los valida). Sora títulos, Inter cuerpo, vidrio `bt-glass-std`.
- 3 temas (Colorido, Claro, Oscuro), i18n en 5 idiomas sin strings sueltos, WCAG 2.2 AA, 44 px, reduced-motion.
- No duplicar componentes: reutilizar el kit; si falta una pieza, agregarla al kit una sola vez.
- No borrar `apps/erp` ni `apps/b2b`. No hacer commits ni push. No desplegar a producción.
- Archivos de prueba temporales: `apps/web/tmp-*` y borrarlos al terminar.
- Varios agentes trabajan a la vez en el mismo repo: **tocar solo los archivos de tu alcance**; si necesitas
  cambiar un archivo compartido (fig-runtime.css, ui-kit.ts, i18n), haz ediciones pequeñas y localizadas, nunca
  reescribas el archivo entero.
- Verificación antes de terminar: `pnpm --filter @borondo/web typecheck`, `lint`, `test:run`, `build`.
