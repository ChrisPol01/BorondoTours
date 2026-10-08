---
inclusion: manual
---
# Puente de Figma: reglas de seguridad

Runbook completo: `docs/06-Operaciones/Figma-Bridge-Runbook.md`.

- Una imagen >2000 px puede cerrar la sesión. Por defecto `capture: false`; capturar solo nodos pequeños, `scale` ≤1 (0.5 si >1000 px de alto), máximo 1 imagen por respuesta. Prohibido `figma_screenshot` sin `node_ids`.
- Fuentes: Inter "Semi Bold" (con espacio); Sora "SemiBold"/"Bold"/"ExtraBold". No llamar `listAvailableFontsAsync`.
- Construir por secciones; helpers con `bridge.define`; `bridge.state` se pierde al recargar (usar `bridge.store`).
- Trabajos pesados con `async: true`, lotes pequeños; no `findAll` sobre toda la página; no declarar `log` ni `n`.
- Color solo con variables del tema; auditoría `btvis.audit` = 0 antes de cerrar una pantalla.
- Plugin trabado: reiniciar con Ctrl+Alt+P.
- Activos Figma: ``otros/design/tools/figma-assets``. (``fig2astro`` y el plugin no están en el árbol; verificado 2026-10-07.)
