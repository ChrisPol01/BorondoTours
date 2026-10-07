/**
 * Tema de color del Portal B2C (paridad con Figma: Colorido · Claro · Oscuro · Sistema).
 *
 * El tema vive en `data-theme` del elemento <html>; `tokens.css` sobrescribe los tokens
 * semánticos por tema. "Colorido" es el predeterminado. "Sistema" deja que
 * `prefers-color-scheme` elija entre Claro y Oscuro.
 */
import { atom } from "nanostores";

export const THEMES = ["colorido", "claro", "oscuro", "sistema"] as const;
export type Theme = (typeof THEMES)[number];

export const DEFAULT_THEME: Theme = "colorido";
const STORAGE_KEY = "borondo.theme";

/** Valida un valor desconocido (localStorage, backend) y cae al predeterminado. */
export function parseTheme(value: unknown): Theme {
  return typeof value === "string" && (THEMES as readonly string[]).includes(value)
    ? (value as Theme)
    : DEFAULT_THEME;
}

function readStored(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    return parseTheme(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
}

export const themeStore = atom<Theme>(readStored());

/** Aplica el tema al documento y lo guarda. No toca el DOM fuera del navegador. */
export function setTheme(theme: Theme): void {
  themeStore.set(theme);
  if (typeof document === "undefined") return;
  if (theme === DEFAULT_THEME) document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", theme);
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Sin almacenamiento (modo privado): el tema aplica solo en esta sesión.
  }
}
