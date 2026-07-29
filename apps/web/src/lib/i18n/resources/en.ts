/**
 * Catálogo de recursos en inglés (`en`) — estructura preparada, sin contenido.
 *
 * En Fase 1 el Portal sirve todo el contenido en `es`; `en` se deja listo en la
 * estructura i18n para incorporar traducciones sin tocar los componentes
 * (design.md §"Fuera de alcance"). Al estar vacío, toda clave resuelta en `en`
 * cae de forma determinista al respaldo `es` mediante `resolve()` (R19.4).
 *
 * TypeScript strict, sin `any`.
 */

import type { LanguageCatalog } from "../resolve";

/**
 * Catálogo `en` intencionalmente vacío en Fase 1. Añadir aquí los namespaces y
 * claves traducidas cuando se habilite el inglés; la resolución con fallback ya
 * está garantizada por `resolve()`.
 */
export const enCatalog: LanguageCatalog = {};
