/**
 * `Navbar` — Barra de navegación principal del Portal B2C (R6.1–R6.9).
 *
 * Island React montada con `client:idle` en `Base.astro`. Se hidrata al
 * terminar la carga de la página para reaccionar al scroll (IntersectionObserver)
 * y manejar el menú móvil.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Comportamiento
 * ─────────────────────────────────────────────────────────────────────────
 *   • Sobre el hero (estado glass): aplica la clase `.glass-surface` con
 *     contraste ≥4.5:1 entre texto claro y fondo (R6.4).
 *   • Fuera del hero (sólido): fondo sólido Blanco Niebla con texto Negro
 *     Volcánico, contraste ≥4.5:1 (R6.5). La transición se detecta con
 *     `IntersectionObserver` observando un elemento `[data-hero-sentinel]`.
 *   • ≥768px: enlaces en línea (R6.6).
 *   • <768px: menú hamburguesa con `aria-label`, `aria-expanded`, navegable
 *     con Tab, activable con Enter/Espacio, cierre con Escape devolviendo foco
 *     al botón (R6.7). Usa `useFocusTrap`.
 *   • Logo horizontal "Ave azul" ancho ≥160px con `alt` descriptivo (R6.8).
 *   • Todos los textos vía i18n (R6.9).
 *
 * TypeScript strict, sin `any`.
 */
import { useState, useEffect, useRef, useCallback, type JSX } from "react";
import { Calendar } from "lucide-react";

import { useTranslation } from "../../lib/i18n/provider";
import { AccessibleDialog } from "../ui/AccessibleDialog";

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

/** Enlace de navegación con su clave i18n. */
interface NavLink {
  readonly labelKey: string;
  readonly href: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

/** Enlaces de la Navbar (R6.2). */
const NAV_LINKS: readonly NavLink[] = [
  { labelKey: "nav:destinations", href: "/destinos" },
  { labelKey: "nav:experiences", href: "/experiencias" },
  { labelKey: "nav:about", href: "/nosotros" },
  { labelKey: "nav:blog", href: "/blog" },
  { labelKey: "nav:contact", href: "/contacto" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Navbar del Portal B2C.
 *
 * Detecta si el hero está visible mediante IntersectionObserver sobre un
 * elemento con `data-hero-sentinel` presente en el DOM. Si no existe dicho
 * elemento (páginas sin hero), se muestra siempre con fondo sólido.
 */
export function HeaderIsland(): JSX.Element {
  const { t } = useTranslation("nav");

  // Estado: la navbar está "sobre el hero" (glass) o no (sólido).
  const [isOverHero, setIsOverHero] = useState(true);

  // Estado: menú móvil abierto/cerrado.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Ref al disparador para retorno de foco al cerrar el drawer.
  const hamburgerButtonRef = useRef<HTMLButtonElement>(null);

  // ── IntersectionObserver: detectar scroll fuera del hero (R6.4/R6.5) ──

  useEffect(() => {
    const sentinel = document.querySelector("[data-hero-sentinel]");
    if (!sentinel) {
      // Sin hero → siempre sólido.
      setIsOverHero(false);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        // Si el sentinel (hero) está visible → glass; si no → sólido.
        const entry = entries[0];
        if (entry) {
          setIsOverHero(entry.isIntersecting);
        }
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, []);

  // ── Drawer mobile canónico (foco, Escape y retorno al disparador) ──

  const closeMobileMenu = useCallback((): void => {
    setIsMobileMenuOpen(false);
  }, []);

  // ── Toggle menú móvil ──

  const toggleMobileMenu = useCallback((): void => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  // ── Clases condicionales ──

  // Glass siempre igual, solo cambia color del texto para contraste.
  // Sobre hero (imagen oscura): texto blanco.
  // Fuera del hero (contenido claro): texto negro volcánico.
  const navClasses = isOverHero
    ? "glass-header text-blanco-niebla"
    : "glass-header text-negro-volcanico";

  return (
    <header
      className={`fixed top-3 left-4 right-4 z-50 transition-colors duration-brand ${navClasses}`}
      role="banner"
    >
      <nav
        aria-label={t("nav:home")}
        className="mx-auto flex max-w-public items-center justify-between px-page-gutter py-2 lg:py-3"
      >
        {/* Logo (R6.8): ancho ≥160px con alt descriptivo */}
        <a href="/" className="brand-logo-clear-space flex-shrink-0">
          <img
            src="/logo-horizontal.svg"
            alt={t("nav:logoAlt")}
            className="brand-logo-horizontal"
          />
        </a>

        {/* Desktop links (R6.6): ≥768px en línea */}
        <ul className="hidden md:flex md:items-center md:gap-6">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`font-body text-body1 font-semibold transition-colors duration-200 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-azul-profundo ${
                  isOverHero
                    ? "text-blanco-niebla focus-visible:ring-offset-transparent"
                    : "text-negro-volcanico focus-visible:ring-offset-blanco-niebla"
                }`}
              >
                {t(link.labelKey)}
              </a>
            </li>
          ))}
          {/* CTA Dorado "Planifica tu viaje" con icono calendario (R6.3) */}
          <li>
            <a
              href="/planifica"
              className="inline-flex items-center gap-2 rounded-full bg-dorado px-5 py-2.5 font-body text-sm font-semibold text-negro-volcanico transition-colors hover:bg-verde hover:text-blanco-niebla focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-azul-profundo"
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>{t("nav:planTrip")}</span>
            </a>
          </li>
        </ul>

        {/* Hamburger button (R6.7): <768px */}
        <button
          ref={hamburgerButtonRef}
          type="button"
          className={`md:hidden inline-flex min-h-11 min-w-11 items-center justify-center rounded-control p-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-azul-profundo ${
            isOverHero
              ? "text-blanco-niebla hover:bg-blanco-niebla/10 focus-visible:ring-offset-transparent"
              : "text-negro-volcanico hover:bg-arena focus-visible:ring-offset-blanco-niebla"
          }`}
          aria-label={
            isMobileMenuOpen ? t("nav:closeMenu") : t("nav:openMenu")
          }
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-nav-menu"
          onClick={toggleMobileMenu}
        >
          {/* Hamburger / X icon */}
          {isMobileMenuOpen ? (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>

        {/* Mobile drawer canónico (R6.7, R27.6–R27.8) */}
        <AccessibleDialog
          id="mobile-nav-menu"
          open={isMobileMenuOpen}
          onClose={closeMobileMenu}
          triggerRef={hamburgerButtonRef}
          variant="drawer"
          drawerEdge="right"
          ariaLabel={t("nav:mobileNavigation")}
          closeLabel={t("nav:closeDrawer")}
        >
          <ul className="flex flex-col gap-2 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex min-h-11 items-center rounded-control px-3 py-2 font-body text-body1 font-semibold text-negro-volcanico transition-colors hover:bg-arena focus-visible:outline-focus"
                >
                  {t(link.labelKey)}
                </a>
              </li>
            ))}
            <li className="mt-2">
              <a
                href="/planifica"
                className="inline-flex items-center gap-2 rounded-full bg-dorado px-5 py-2.5 font-body text-sm font-semibold text-negro-volcanico transition-colors hover:bg-verde hover:text-blanco-niebla"
              >
                <Calendar className="h-4 w-4" aria-hidden="true" />
                <span>{t("nav:planTrip")}</span>
              </a>
            </li>
          </ul>
        </AccessibleDialog>
      </nav>
    </header>
  );
}
