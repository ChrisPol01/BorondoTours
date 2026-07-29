/**
 * `TourDescription` — sección de descripción larga y listas informativas del tour.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Responsabilidades (R16.1–R16.4)
 * ─────────────────────────────────────────────────────────────────────────
 *   • Descripción larga (≤20.000 chars) renderizada vía `SafeHtml` (R16.1).
 *   • Si la descripción es vacía/ausente → se omite el bloque entero (R16.2).
 *   • Si `SafeHtml` no puede sanitizar → muestra "contenido no disponible"
 *     sin exponer HTML crudo (R16.3, fallbackKey).
 *   • Secciones "¿Qué incluye?", "¿Qué NO incluye?" y "¿Qué llevar?" solo
 *     se renderizan si su array tiene datos (R16.4).
 *
 * TypeScript strict, sin `any`. Textos vía i18n.
 */

import type { JSX } from "react";

import { SafeHtml } from "../ui/SafeHtml";
import { useTranslation } from "../../lib/i18n/provider";

// ─────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────

export interface TourDescriptionProps {
  /** HTML sin sanitizar de la descripción larga (≤20.000 chars). */
  readonly longDescriptionHtml: string | null | undefined;
  /** Lista de lo que incluye el tour. */
  readonly includes: string[] | null | undefined;
  /** Lista de lo que NO incluye el tour. */
  readonly notIncludes: string[] | null | undefined;
  /** Lista de lo que debe llevar el viajero. */
  readonly whatToBring: string[] | null | undefined;
}

// ─────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────

/**
 * Sección de descripción del tour con listas informativas condicionales.
 * No renderiza nada si no hay descripción ni listas con datos.
 */
export function TourDescription({
  longDescriptionHtml,
  includes,
  notIncludes,
  whatToBring,
}: TourDescriptionProps): JSX.Element | null {
  const { t } = useTranslation("detail");

  const hasDescription = longDescriptionHtml !== null
    && longDescriptionHtml !== undefined
    && longDescriptionHtml.trim().length > 0;

  const hasIncludes = Array.isArray(includes) && includes.length > 0;
  const hasNotIncludes = Array.isArray(notIncludes) && notIncludes.length > 0;
  const hasWhatToBring = Array.isArray(whatToBring) && whatToBring.length > 0;

  // Si no hay nada que mostrar, omitir la sección por completo.
  if (!hasDescription && !hasIncludes && !hasNotIncludes && !hasWhatToBring) {
    return null;
  }

  return (
    <section className="flex flex-col gap-8">
      {/* Descripción larga vía SafeHtml (R16.1, R16.2, R16.3) */}
      {hasDescription && (
        <SafeHtml
          html={longDescriptionHtml}
          fallbackKey="common:content.unavailable"
          className="prose prose-body1 max-w-none font-body text-negro-volcanico"
        />
      )}

      {/* Secciones informativas condicionales (R16.4) */}
      {hasIncludes && (
        <InfoList title={t("section.includes")} items={includes} variant="includes" />
      )}

      {hasNotIncludes && (
        <InfoList title={t("section.excludes")} items={notIncludes} variant="excludes" />
      )}

      {hasWhatToBring && (
        <InfoList title={t("section.bring")} items={whatToBring} variant="bring" />
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Sub-componente: lista informativa con ícono contextual
// ─────────────────────────────────────────────────────────────────────────

type InfoListVariant = "includes" | "excludes" | "bring";

interface InfoListProps {
  readonly title: string;
  readonly items: string[];
  readonly variant: InfoListVariant;
}

function InfoList({ title, items, variant }: InfoListProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-heading text-h4 font-semibold text-negro-volcanico">
        {title}
      </h3>
      <ul className="flex flex-col gap-2 pl-1" role="list">
        {items.map((item, index) => (
          <li key={`${variant}-${index}`} className="flex items-start gap-2 font-body text-body1 text-negro-volcanico">
            <ListIcon variant={variant} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Íconos por variante (Lucide-style, inline SVG)
// ─────────────────────────────────────────────────────────────────────────

interface ListIconProps {
  readonly variant: InfoListVariant;
}

function ListIcon({ variant }: ListIconProps): JSX.Element {
  const commonProps = {
    xmlns: "http://www.w3.org/2000/svg",
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    className: "mt-0.5 flex-shrink-0",
  };

  switch (variant) {
    case "includes":
      // Check circle icon — verde
      return (
        <svg {...commonProps} className={`${commonProps.className} text-verde`}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case "excludes":
      // X circle icon — rojo
      return (
        <svg {...commonProps} className={`${commonProps.className} text-avail-red`}>
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      );
    case "bring":
      // Backpack/mochila icon — azul cóndor
      return (
        <svg {...commonProps} className={`${commonProps.className} text-azul-condor`}>
          <path d="M4 20V10a8 8 0 0 1 16 0v10" />
          <rect x="2" y="20" width="20" height="2" rx="1" />
          <path d="M9 6V4a3 3 0 0 1 6 0v2" />
        </svg>
      );
  }
}
