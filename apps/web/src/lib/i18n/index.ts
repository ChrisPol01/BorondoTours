/**
 * Configuración de i18n del Portal B2C (Fase 1) + store compartido entre islands.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Enfoque
 * ─────────────────────────────────────────────────────────────────────────
 * El diseño (design.md §"i18n (R19)") describe una configuración estilo
 * i18next: `lng: 'es'`, `fallbackLng: 'es'` (R19.2, R19.4) y namespaces por
 * dominio (`common`, `nav`, `footer`, `home`, `discovery`, `detail`) (R19.3).
 *
 * La resolución de claves con fallback determinista y log de desarrollo ya vive
 * como función PURA en `lib/i18n/resolve.ts` (tarea 6.1, probada con Property 9).
 * Este módulo reutiliza esa lógica en lugar de duplicarla: expone la config con
 * la forma de i18next (`i18nConfig`) y un STORE de idioma activo basado en
 * nanostores. nanostores es el mecanismo aprobado para compartir estado entre
 * islands React independientes (cada island es un árbol React separado, por lo
 * que un React Context no basta para compartir entre ellas). Al cambiar el
 * idioma activo, todas las islands suscritas re-resuelven sus textos SIN que
 * haya que modificar los componentes (R19.6).
 *
 * TypeScript strict, sin `any`.
 */

import { atom, type ReadableAtom } from "nanostores";

import {
  resolve,
  FALLBACK_LANGUAGE,
  type Catalogs,
  type Language,
  type Namespace,
} from "./resolve";
import { catalogs } from "./resources";

// ─────────────────────────────────────────────────────────────────────────
// Configuración (forma i18next)
// ─────────────────────────────────────────────────────────────────────────

/** Idioma por defecto en Fase 1 (R19.2). Equivale a `lng` en i18next. */
export const DEFAULT_LANGUAGE: Language = "es";

/**
 * Idiomas soportados por la estructura i18n. `en` se prepara pero su catálogo
 * está vacío en Fase 1 (cae a `es` por fallback).
 */
export const SUPPORTED_LANGUAGES: readonly Language[] = ["es", "en"];

/**
 * Namespaces por dominio (R19.3). Equivale a `ns` en i18next; `common` es el
 * namespace por defecto.
 */
export const NAMESPACES: readonly Namespace[] = [
  "common",
  "nav",
  "footer",
  "home",
  "discovery",
  "detail",
];

/** Namespace por defecto cuando una clave no incluye prefijo `namespace:`. */
export const DEFAULT_NAMESPACE: Namespace = "common";

/**
 * Opciones de configuración con la forma de `InitOptions` de i18next. Se expone
 * como objeto declarativo (fuente única de verdad de la config i18n) que
 * consumen el store y, en el futuro, cualquier inicialización de i18next.
 */
export interface I18nConfig {
  readonly lng: Language;
  readonly fallbackLng: Language;
  readonly ns: readonly Namespace[];
  readonly defaultNS: Namespace;
  readonly supportedLngs: readonly Language[];
  readonly resources: Catalogs;
}

/** Configuración i18n efectiva del Portal (R19.2, R19.3, R19.4). */
export const i18nConfig: I18nConfig = {
  lng: DEFAULT_LANGUAGE,
  fallbackLng: FALLBACK_LANGUAGE,
  ns: NAMESPACES,
  defaultNS: DEFAULT_NAMESPACE,
  supportedLngs: SUPPORTED_LANGUAGES,
  resources: catalogs,
};

// ─────────────────────────────────────────────────────────────────────────
// Store de idioma activo (compartido entre islands vía nanostores)
// ─────────────────────────────────────────────────────────────────────────

const languageAtom = atom<Language>(DEFAULT_LANGUAGE);

/**
 * Store de solo lectura con el idioma activo, para suscripción reactiva desde
 * las islands (`@nanostores/react`). La escritura se realiza únicamente a través
 * de `setLanguage`, de forma análoga al `sessionStore`.
 */
export const languageStore: ReadableAtom<Language> = languageAtom;

/**
 * Cambia el idioma activo (R19.6). Todas las islands suscritas al store
 * re-resuelven sus textos automáticamente, sin modificar los componentes.
 *
 * @param lng Idioma soportado al que cambiar.
 */
export function setLanguage(lng: Language): void {
  languageAtom.set(lng);
}

/**
 * Devuelve el idioma activo actual.
 *
 * @returns El idioma activo del store.
 */
export function getLanguage(): Language {
  return languageAtom.get();
}

// ─────────────────────────────────────────────────────────────────────────
// Resolución de texto
// ─────────────────────────────────────────────────────────────────────────

/**
 * Normaliza una clave al patrón `namespace:key`. Si `key` ya incluye un
 * separador de namespace se usa tal cual; en caso contrario se antepone el
 * namespace por defecto (`common`).
 */
function withNamespace(key: string): string {
  return key.includes(":") ? key : `${DEFAULT_NAMESPACE}:${key}`;
}

/**
 * Resuelve una clave i18n contra los catálogos del Portal usando la lógica de
 * fallback pura de `resolve()` (idioma activo → `es` → clave literal; nunca
 * cadena vacía). Es la puerta de entrada no reactiva (uso fuera de React o con
 * idioma explícito); dentro de las islands se usa `useTranslation`.
 *
 * @param key Clave `namespace:key` (o `key`, que se resuelve en `common`).
 * @param lng Idioma en el que resolver; por defecto, el idioma activo del store.
 * @returns El texto resuelto según precedencia; nunca cadena vacía.
 */
export function translate(key: string, lng: Language = getLanguage()): string {
  return resolve(withNamespace(key), lng, catalogs);
}

export { catalogs };
export type { Catalogs, Language, Namespace };
export { resolve, FALLBACK_LANGUAGE } from "./resolve";
