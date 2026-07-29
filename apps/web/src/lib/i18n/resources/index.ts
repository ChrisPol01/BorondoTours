/**
 * Composición de los catálogos de recursos por idioma (forma `resources` de
 * i18next: `{ [lng]: { [namespace]: { [key]: value } } }`), consistente con el
 * tipo `Catalogs` de `lib/i18n/resolve.ts`.
 *
 * Fase 1: `es` con contenido; `en` preparado pero vacío (cae a `es` por fallback).
 *
 * TypeScript strict, sin `any`.
 */

import type { Catalogs } from "../resolve";
import { esCatalog } from "./es";
import { enCatalog } from "./en";

/**
 * Colección de catálogos indexada por idioma, consumida por `resolve()` y por
 * la configuración de i18n (`lib/i18n/index.ts`).
 */
export const catalogs: Catalogs = {
  es: esCatalog,
  en: enCatalog,
};

export { esCatalog, enCatalog };
