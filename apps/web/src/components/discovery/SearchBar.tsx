/**
 * `SearchBar` — Barra de búsqueda del catálogo Discovery (R12.1–R12.7).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Responsabilidades
 * ─────────────────────────────────────────────────────────────────────────
 *   • Input de texto 0–100 chars (R12.1).
 *   • Mínimo 2 chars (trimmed) para disparar la búsqueda (R12.1).
 *   • Debounce de 300ms antes de actualizar URL/store (R12.2).
 *   • Escribe `q` normalizado (trim) en la URL (R12.3).
 *   • Hidrata el valor desde el parámetro `q` de la URL al montar (R12.4).
 *   • Sin resultados → conserva el texto en el input (R12.5).
 *   • Error → conserva último catálogo mostrado (R12.6 — responsabilidad del
 *     CatalogController, no de este componente).
 *   • Botón limpiar (X) elimina el texto y remueve `q` de la URL (R12.7).
 *
 * Montado como parte del island `client:load` de filtros en `discovery.astro`.
 *
 * TypeScript strict, sin `any`.
 */

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ChangeEvent,
  type JSX,
} from "react";
import { X, Search } from "lucide-react";

import { useTranslation } from "../../lib/i18n/provider";
import { LanguageProvider } from "../../lib/i18n/provider";

// ─────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────

/** Longitud máxima del campo de búsqueda (R12.1). */
const MAX_LENGTH = 100;

/** Mínimo de caracteres (trimmed) para disparar la búsqueda (R12.1). */
const MIN_CHARS = 2;

/** Tiempo de debounce en milisegundos (R12.2). */
const DEBOUNCE_MS = 300;

// ─────────────────────────────────────────────────────────────────────────
// Helpers — lectura/escritura de `q` en la URL
// ─────────────────────────────────────────────────────────────────────────

/**
 * Lee el parámetro `q` de la URL actual. Retorna cadena vacía si no existe.
 */
function readQFromUrl(): string {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("q") ?? "";
}

/**
 * Escribe el parámetro `q` en la URL sin recargar la página.
 * Si `value` está vacío o tiene menos de `MIN_CHARS`, elimina `q` de la URL.
 */
function writeQToUrl(value: string): void {
  if (typeof window === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const trimmed = value.trim();

  if (trimmed.length >= MIN_CHARS) {
    params.set("q", trimmed);
  } else {
    params.delete("q");
  }

  const newSearch = params.toString();
  const newUrl = newSearch.length > 0
    ? `${window.location.pathname}?${newSearch}`
    : window.location.pathname;

  window.history.replaceState(null, "", newUrl);
}

// ─────────────────────────────────────────────────────────────────────────
// Componente interno
// ─────────────────────────────────────────────────────────────────────────

function SearchBarInner(): JSX.Element {
  const { t } = useTranslation("discovery");

  // Hidratación: leer `q` desde la URL al montar (R12.4)
  const [value, setValue] = useState<string>(() => readQFromUrl());

  // Ref para el timer de debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ref para el input (para devolver foco tras limpiar)
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Efecto de debounce: cuando el valor cambia, espera 300ms y actualiza la URL.
   * Si el texto trimmed tiene < 2 chars, elimina `q` de la URL (R12.1, R12.2, R12.3).
   */
  useEffect(() => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      writeQToUrl(value);
      // Disparar evento para que CatalogController reaccione al cambio de URL
      window.dispatchEvent(new CustomEvent("catalogstate:change"));
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  /** Maneja cambios en el input (R12.1: 0–100 chars). */
  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    setValue(event.target.value);
  }, []);

  /** Limpia el campo y elimina `q` de la URL (R12.7). */
  const handleClear = useCallback((): void => {
    setValue("");
    // Escribir inmediatamente (sin esperar debounce) para UX responsiva
    writeQToUrl("");
    window.dispatchEvent(new CustomEvent("catalogstate:change"));

    // Devolver foco al input tras limpiar
    inputRef.current?.focus();
  }, []);

  const showClearButton = value.length > 0;

  return (
    <div className="relative w-full">
      {/* Icono de búsqueda decorativo */}
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-negro-volcanico/50"
        size={20}
        aria-hidden="true"
      />

      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={handleChange}
        maxLength={MAX_LENGTH}
        placeholder={t("discovery:search.placeholder")}
        aria-label={t("discovery:search.placeholder")}
        className="w-full rounded-lg border border-negro-volcanico/10 bg-blanco-niebla py-3 pl-10 pr-10 font-body text-base text-negro-volcanico placeholder:text-negro-volcanico/50 focus:border-turquesa focus:outline-none focus:ring-2 focus:ring-turquesa/30"
      />

      {/* Botón limpiar (R12.7) */}
      {showClearButton && (
        <button
          type="button"
          onClick={handleClear}
          aria-label={t("discovery:search.clear")}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-negro-volcanico/50 hover:bg-negro-volcanico/10 hover:text-negro-volcanico focus:outline-none focus:ring-2 focus:ring-turquesa/30"
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Exportación
// ─────────────────────────────────────────────────────────────────────────

/**
 * SearchBar para el catálogo Discovery. Envuelto en LanguageProvider con
 * namespace "discovery" para resolución i18n.
 */
export function SearchBar(): JSX.Element {
  return (
    <LanguageProvider namespace="discovery">
      <SearchBarInner />
    </LanguageProvider>
  );
}

export default SearchBar;
