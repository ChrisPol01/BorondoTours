/**
 * Proveedor i18n y hook `useTranslation` para las islands React del Portal B2C.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Por qué provider + store
 * ─────────────────────────────────────────────────────────────────────────
 * El estado del idioma activo se comparte entre islands mediante el
 * `languageStore` de nanostores (ver `lib/i18n/index.ts`): cada island es un
 * árbol React independiente, así que la reactividad entre islands NO puede
 * apoyarse solo en un React Context. El hook `useTranslation` se suscribe al
 * store con `useStore`, de modo que cualquier cambio de idioma re-resuelve los
 * textos de todas las islands SIN modificar los componentes (R19.6).
 *
 * El `LanguageProvider` es una envoltura opcional por island que: (1) fija un
 * idioma inicial si se indica y (2) vincula un namespace por defecto para poder
 * escribir `t('key')` en vez de `t('namespace:key')` dentro de esa island.
 *
 * TypeScript strict, sin `any`.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from "react";
import { useStore } from "@nanostores/react";

import { resolve, type Language, type Namespace } from "./resolve";
import { catalogs } from "./resources";
import { DEFAULT_NAMESPACE, languageStore, setLanguage } from "./index";

/** Función de traducción expuesta por `useTranslation`. */
export type TranslateFn = (key: string) => string;

/** Valor devuelto por `useTranslation`. */
export interface UseTranslationResult {
  /** Resuelve una clave `namespace:key` (o `key` con el namespace vinculado). */
  readonly t: TranslateFn;
  /** Idioma activo actual (reactivo). */
  readonly language: Language;
  /** Cambia el idioma activo compartido entre islands (R19.6). */
  readonly setLanguage: (lng: Language) => void;
}

/** Contexto interno que transporta el namespace por defecto de la island. */
const NamespaceContext = createContext<Namespace>(DEFAULT_NAMESPACE);

/** Props del `LanguageProvider`. */
export interface LanguageProviderProps {
  /** Idioma inicial para esta island; si se omite, se conserva el del store. */
  readonly initialLanguage?: Language;
  /** Namespace por defecto para las claves sin prefijo dentro de la island. */
  readonly namespace?: Namespace;
  readonly children: ReactNode;
}

/**
 * Proveedor i18n por island. Fija (opcionalmente) el idioma inicial en el store
 * compartido y vincula el namespace por defecto para los `t('key')` internos.
 */
export function LanguageProvider({
  initialLanguage,
  namespace = DEFAULT_NAMESPACE,
  children,
}: LanguageProviderProps): ReactNode {
  useEffect(() => {
    if (initialLanguage !== undefined) {
      setLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  return <NamespaceContext.Provider value={namespace}>{children}</NamespaceContext.Provider>;
}

/**
 * Hook de traducción reactivo para las islands.
 *
 * Se suscribe al `languageStore` para re-renderizar cuando cambia el idioma
 * activo. La resolución delega en la función pura `resolve()` (fallback
 * determinista, nunca cadena vacía; R19.4, R19.5).
 *
 * @param namespace Namespace por defecto para claves sin prefijo. Si se omite,
 *                  se usa el vinculado por `LanguageProvider` (o `common`).
 * @returns `{ t, language, setLanguage }`.
 */
export function useTranslation(namespace?: Namespace): UseTranslationResult {
  const language = useStore(languageStore);
  const contextNamespace = useContext(NamespaceContext);
  const boundNamespace = namespace ?? contextNamespace;

  const t = useCallback<TranslateFn>(
    (key: string): string => {
      const fullKey = key.includes(":") ? key : `${boundNamespace}:${key}`;
      return resolve(fullKey, language, catalogs);
    },
    [language, boundNamespace],
  );

  return useMemo<UseTranslationResult>(
    () => ({ t, language, setLanguage }),
    [t, language],
  );
}
