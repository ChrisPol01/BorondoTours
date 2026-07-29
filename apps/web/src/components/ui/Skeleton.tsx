/**
 * `Skeleton` — placeholder animado del Portal B2C, usado en TODA carga
 * asíncrona en lugar de un spinner genérico (R21.2).
 *
 * ─────────────────────────────────────────────────────────────────────────
 * Motivación (R21.2, R21.3 / coding-standards "Skeleton loaders")
 * ─────────────────────────────────────────────────────────────────────────
 * Mientras una vista espera datos asíncronos se muestran `Skeleton`s que
 * reservan el espacio final del contenido, evitando el desplazamiento de
 * diseño (layout shift) y comunicando progreso sin spinners.
 *
 * Diseño:
 *   • Color de marca: fondo `arena` (token `--color-arena`) sobre el fondo
 *     `blanco-niebla` de la web — se referencia vía utilidades Tailwind que
 *     apuntan a los design tokens (nada hardcodeado, R1.9).
 *   • Animación de pulso con `animate-pulse`. Se desactiva automáticamente bajo
 *     `prefers-reduced-motion` mediante `motion-reduce:animate-none`.
 *   • Tamaño/forma configurables por props (`width`/`height`/`rounded`) y
 *     clases extra vía `className`.
 *
 * Accesibilidad:
 *   Por defecto es un elemento puramente decorativo: `aria-hidden="true"` para
 *   que los lectores de pantalla lo ignoren (el contenedor de la vista es quien
 *   anuncia el estado de carga con `role="status"`/`aria-busy`). Si se necesita
 *   que el propio placeholder anuncie la carga, se pasa `label`: entonces el
 *   nodo expone `role="status"` + `aria-label` y deja de estar oculto.
 *
 * TypeScript strict, sin `any`.
 */
import { Fragment } from "react";
import type { CSSProperties, ReactElement } from "react";

/** Radios de esquina soportados, mapeados a utilidades Tailwind. */
export type SkeletonRadius = "none" | "sm" | "md" | "lg" | "xl" | "full";

/** Props de `Skeleton`. */
export interface SkeletonProps {
  /**
   * Ancho del placeholder. Un número se interpreta como píxeles (`120` → `120px`);
   * una cadena se usa tal cual (`"100%"`, `"12rem"`). Si se omite, el ancho lo
   * determinan `className`/el layout contenedor.
   */
  readonly width?: number | string;
  /**
   * Alto del placeholder. Un número se interpreta como píxeles; una cadena se
   * usa tal cual. Si se omite, lo determinan `className`/el layout contenedor.
   */
  readonly height?: number | string;
  /** Relación de aspecto reservada para reproducir la geometría final. */
  readonly aspectRatio?: number | string;
  /** Forma de las esquinas. Por defecto `"md"`. */
  readonly rounded?: SkeletonRadius;
  /** Clases Tailwind adicionales (p. ej. para márgenes o tamaños responsive). */
  readonly className?: string;
  /**
   * Etiqueta accesible opcional. Si se provee, el placeholder anuncia la carga
   * (`role="status"` + `aria-label`) en lugar de ocultarse a lectores de
   * pantalla. Si se omite, el nodo es decorativo (`aria-hidden="true"`).
   */
  readonly label?: string;
  /**
   * Número de placeholders a renderizar. Permite componer grillas de carga
   * (p. ej. 12 skeletons de `TourCard` en el catálogo) sin repetir el
   * componente manualmente. Por defecto `1`. Valores `< 1` no renderizan nada.
   */
  readonly count?: number;
}

/** Mapa de radios a utilidades Tailwind (referencian el tema, no literales). */
const RADIUS_CLASS: Record<SkeletonRadius, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

/**
 * Normaliza un valor de tamaño a un valor CSS: los números se expresan en
 * píxeles; las cadenas se devuelven sin cambios.
 */
export function toCssSize(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

/**
 * Placeholder animado para estados de carga asíncrona.
 *
 * @param props `{ width?, height?, rounded?, className?, label? }`.
 * @returns Un `<span>` de bloque con pulso animado (desactivado bajo
 *          `prefers-reduced-motion`).
 */
export function Skeleton({
  width,
  height,
  aspectRatio,
  rounded = "md",
  className,
  label,
  count = 1,
}: SkeletonProps): ReactElement | null {
  // Solo se generan estilos inline para dimensiones dinámicas que Tailwind no
  // puede resolver en build (valores arbitrarios en runtime).
  const style: CSSProperties = {};
  if (width !== undefined) style.width = toCssSize(width);
  if (height !== undefined) style.height = toCssSize(height);
  if (aspectRatio !== undefined) style.aspectRatio = String(aspectRatio);

  // Color de marca (arena) + pulso; el pulso se anula bajo prefers-reduced-motion.
  const classes = [
    "block",
    "bg-arena",
    "animate-pulse",
    "motion-reduce:animate-none",
    RADIUS_CLASS[rounded],
    className,
  ]
    .filter((token): token is string => Boolean(token))
    .join(" ");

  // Con `label`: el placeholder anuncia la carga. Sin `label`: decorativo.
  const a11yProps =
    label === undefined
      ? ({ "aria-hidden": true } as const)
      : ({ role: "status", "aria-label": label } as const);

  // `count < 1` no renderiza nada; `count === 1` renderiza un único nodo.
  if (count < 1) return null;
  if (count === 1) {
    return <span className={classes} style={style} {...a11yProps} />;
  }

  // Para grillas de carga (p. ej. 12 `TourCard`), solo el primer placeholder
  // conserva la etiqueta accesible; los demás son decorativos para no repetir
  // el mismo anuncio a los lectores de pantalla.
  return (
    <Fragment>
      {Array.from({ length: count }, (_unused, index) => {
        const itemA11y =
          index === 0
            ? a11yProps
            : ({ "aria-hidden": true } as const);
        return (
          <span
            key={index}
            className={classes}
            style={style}
            {...itemA11y}
          />
        );
      })}
    </Fragment>
  );
}
