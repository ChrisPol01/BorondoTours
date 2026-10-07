/**
 * Toast y Banner — avisos no modales (design.md §8f).
 *
 * - Toast: evento en tiempo real (pago confirmado, mensaje nuevo). `role="status"` para
 *   informativos y `role="alert"` para errores. Abajo a la derecha (400 px) en escritorio;
 *   arriba a ancho completo en móvil. Lo posiciona `ToastRegion`.
 * - Banner: urgencia fija en la franja superior (tour cancelado, cambio de punto de encuentro).
 *   Nunca un modal.
 */
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import type { JSX, ReactNode } from "react";

import { cx } from "../lib/cx";

export type NoticeTone = "info" | "success" | "warning" | "danger";

const ICON: Record<NoticeTone, typeof Info> = { info: Info, success: CircleCheck, warning: TriangleAlert, danger: CircleAlert };
const ICON_COLOR: Record<NoticeTone, string> = {
  info: "text-action-primary",
  success: "text-available",
  warning: "text-limited",
  danger: "text-sold-out",
};

export interface NoticeAction {
  readonly label: string;
  readonly onClick?: () => void;
  readonly href?: string;
}

interface NoticeProps {
  readonly tone?: NoticeTone;
  readonly title?: string;
  readonly message: ReactNode;
  readonly action?: NoticeAction;
  /** Si se pasa, se muestra el botón de cerrar con esta etiqueta accesible. */
  readonly onDismiss?: () => void;
  readonly dismissLabel?: string;
  readonly className?: string;
}

function NoticeBody({ tone = "info", title, message, action, onDismiss, dismissLabel = "Cerrar" }: NoticeProps): JSX.Element {
  const Icon = ICON[tone];
  return (
    <>
      <Icon aria-hidden="true" className={cx("mt-0.5 size-5 shrink-0", ICON_COLOR[tone])} strokeWidth={2} />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {title && <p className="font-body text-body2 font-semibold text-text-primary">{title}</p>}
        <div className="font-body text-body2 text-text-muted">{message}</div>
        {action &&
          (action.href ? (
            <a href={action.href} className="mt-1 self-start font-body text-body2 font-semibold text-text-primary underline underline-offset-4">
              {action.label}
            </a>
          ) : (
            <button type="button" onClick={action.onClick} className="mt-1 self-start font-body text-body2 font-semibold text-text-primary underline underline-offset-4">
              {action.label}
            </button>
          ))}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className="-m-2 inline-flex size-11 shrink-0 items-center justify-center rounded-pill text-text-muted hover:text-text-primary focus-visible:outline-2 focus-visible:outline-focus"
        >
          <X aria-hidden="true" className="size-4" />
        </button>
      )}
    </>
  );
}

export type ToastProps = NoticeProps;

export function Toast(props: ToastProps): JSX.Element {
  const urgent = props.tone === "danger";
  return (
    <div
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
      className={cx("glass-strong flex w-full items-start gap-3 rounded-card p-4 shadow-floating sm:w-[25rem]", props.className)}
    >
      <NoticeBody {...props} />
    </div>
  );
}

/** Contenedor fijo de toasts: arriba a ancho completo en móvil, abajo a la derecha en escritorio. */
export function ToastRegion({ children, label = "Notificaciones" }: { readonly children: ReactNode; readonly label?: string }): JSX.Element {
  return (
    <section
      aria-label={label}
      className="pointer-events-none fixed inset-x-4 top-4 z-50 flex flex-col gap-3 sm:inset-x-auto sm:top-auto sm:right-6 sm:bottom-24 [&>*]:pointer-events-auto"
    >
      {children}
    </section>
  );
}

export type BannerProps = NoticeProps;

export function Banner(props: BannerProps): JSX.Element {
  const urgent = props.tone === "danger" || props.tone === "warning";
  return (
    <div role={urgent ? "alert" : "status"} className={cx("glass-strong flex w-full items-start gap-3 rounded-control px-4 py-3", props.className)}>
      <NoticeBody {...props} />
    </div>
  );
}
