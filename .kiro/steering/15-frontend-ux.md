---
inclusion: fileMatch
fileMatchPattern: ["apps/**/*.tsx","apps/**/*.astro","apps/**/*.css","packages/ui/**"]
---
# Frontend y UX

Referencias: `docs/04-Tech-Design/DESIGN.md`, `Catalogo-Componentes-UI.md`, `Frontend-Architecture.md`.

- WCAG 2.1 AA: labels, `aria-describedby` en errores, focus visible, skip link, modales con focus trap y Escape, `<button>` vs `<a>`.
- i18n: cero strings hardcodeados; precios COP con `Intl.NumberFormat('es-CO')`.
- Componentes compartidos en `packages/ui`; tokens semánticos; targets táctiles ≥44px; respetar `prefers-reduced-motion`.
- Patrones: diálogos bloqueantes con velo + blur; paneles laterales; popovers sin velo; en móvil hoja inferior o pantalla completa.
- Auth Gate al pulsar "Pagar"; Borondo Coins no se muestran (en pausa).