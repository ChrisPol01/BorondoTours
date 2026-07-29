/**
 * `useFocusTrap` — hook de accesibilidad para atrapar el foco de teclado
 * dentro de un contenedor (R22.6, R22.7, R22.8).
 *
 * Reutilizable por: menú móvil (Navbar), drawer lateral (FilterPanel) y modales.
 *
 * Comportamiento:
 * - Tab/Shift+Tab cicla entre el primer y último elemento enfocable dentro del
 *   contenedor sin escapar de él (R22.6).
 * - Escape cierra el componente invocando el callback `onClose` (R22.7).
 * - Al desactivarse (isActive → false), retorna el foco al elemento disparador
 *   referenciado por `triggerRef` (R22.8).
 *
 * TypeScript strict, sin `any`.
 */
import { useEffect, useCallback, useRef, type RefObject } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Utilidad pública: selector de elementos enfocables
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Selector CSS que captura elementos enfocables interactivamente por teclado.
 * Excluye elementos con `disabled`, `aria-hidden="true"`, `tabindex="-1"` o
 * `display: none`/`visibility: hidden`.
 */
const FOCUSABLE_SELECTOR = [
  'a[href]:not([tabindex="-1"])',
  'button:not([disabled]):not([tabindex="-1"])',
  'input:not([disabled]):not([type="hidden"]):not([tabindex="-1"])',
  'select:not([disabled]):not([tabindex="-1"])',
  'textarea:not([disabled]):not([tabindex="-1"])',
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  '[contenteditable]:not([tabindex="-1"])',
].join(", ");

/**
 * Retorna todos los elementos enfocables dentro de un contenedor,
 * filtrados por visibilidad (no ocultos con `display:none`, `visibility:hidden`
 * ni `aria-hidden="true"`).
 *
 * @param container Elemento DOM contenedor.
 * @returns Array de `HTMLElement` enfocables en orden del DOM.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const candidates = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  );

  return candidates.filter((el) => {
    // Excluir elementos con aria-hidden="true"
    if (el.getAttribute("aria-hidden") === "true") return false;

    // Excluir elementos no visibles (display:none o visibility:hidden)
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;

    return true;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook: useFocusTrap
// ─────────────────────────────────────────────────────────────────────────────

/** Opciones del hook `useFocusTrap`. */
export interface UseFocusTrapOptions {
  /** Ref al contenedor cuyo foco debe atraparse. */
  readonly containerRef: RefObject<HTMLElement | null>;
  /** Ref al elemento que abrió el componente (recibe foco al cerrar). */
  readonly triggerRef: RefObject<HTMLElement | null>;
  /** Si el trap está activo. Al pasar de true→false retorna el foco al trigger. */
  readonly isActive: boolean;
  /** Callback invocado al presionar Escape (R22.7). */
  readonly onClose: () => void;
}

/**
 * Hook que atrapa el foco de teclado dentro de un contenedor.
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null);
 * const triggerRef = useRef<HTMLButtonElement>(null);
 *
 * useFocusTrap({
 *   containerRef,
 *   triggerRef,
 *   isActive: isMenuOpen,
 *   onClose: () => setIsMenuOpen(false),
 * });
 * ```
 */
export function useFocusTrap({
  containerRef,
  triggerRef,
  isActive,
  onClose,
}: UseFocusTrapOptions): void {
  // Mover foco al primer elemento enfocable del contenedor al activarse.
  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Pequeño delay para asegurar que el contenedor está en el DOM y visible.
    const rafId = requestAnimationFrame(() => {
      const focusable = getFocusableElements(container);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        // Si no hay elementos enfocables, enfocar el contenedor mismo
        // (necesita tabindex="-1" en el contenedor para funcionar).
        container.setAttribute("tabindex", "-1");
        container.focus();
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [isActive, containerRef]);

  const wasActiveRef = useRef(false);

  // R22.8: retornar foco solo después de una transición activa → inactiva.
  useEffect(() => {
    const wasActive = wasActiveRef.current;
    wasActiveRef.current = isActive;
    if (!wasActive || isActive) return;

    triggerRef.current?.focus();
  }, [isActive, triggerRef]);

  // Handler de teclado: trap Tab/Shift+Tab y Escape.
  const handleKeyDown = useCallback(
    (event: KeyboardEvent): void => {
      if (!isActive) return;

      const container = containerRef.current;
      if (!container) return;

      // R22.7: Escape → cerrar
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      // R22.6: Tab/Shift+Tab — ciclar foco dentro del contenedor.
      if (event.key === "Tab") {
        const focusable = getFocusableElements(container);
        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const activeElement = document.activeElement as HTMLElement | null;

        if (event.shiftKey) {
          // Shift+Tab: si estamos en el primer elemento, ir al último.
          if (activeElement === first || !container.contains(activeElement)) {
            event.preventDefault();
            last.focus();
          }
        } else {
          // Tab: si estamos en el último elemento, ir al primero.
          if (activeElement === last || !container.contains(activeElement)) {
            event.preventDefault();
            first.focus();
          }
        }
      }
    },
    [isActive, containerRef, onClose]
  );

  // Agregar/quitar el listener de keydown en el documento.
  useEffect(() => {
    if (!isActive) return;

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, handleKeyDown]);
}
