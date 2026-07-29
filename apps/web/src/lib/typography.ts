/**
 * Escalado tipográfico responsivo del Portal B2C (Fase 1).
 *
 * Función pura, TypeScript strict, sin `any`. Fuente: design.md §"Escalado
 * tipográfico responsivo (R1.6)" y el manual de marca (§3 "Escalado Responsivo").
 */

/**
 * Devuelve el multiplicador tipográfico correspondiente al ancho de viewport.
 *
 * Reglas de marca por breakpoint (R1.6):
 *   - Mobile  (`w < 768`)           → 0.85x
 *   - Tablet  (`768 <= w <= 1024`)  → 0.95x
 *   - Desktop (`w > 1024`)          → 1x
 *
 * Las fronteras 767/768 y 1024/1025 son significativas: 768 y 1024 son
 * inclusivos del rango tablet. La función es total (definida para todo número)
 * y determinista.
 *
 * @param viewportWidth Ancho del viewport en píxeles CSS.
 * @returns Exactamente uno de `0.85`, `0.95` o `1`.
 */
export function typographyMultiplier(viewportWidth: number): 0.85 | 0.95 | 1 {
  if (viewportWidth < 768) return 0.85;
  if (viewportWidth <= 1024) return 0.95;
  return 1;
}
