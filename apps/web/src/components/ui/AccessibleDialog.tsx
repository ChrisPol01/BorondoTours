import { useCallback, useEffect, useRef, type JSX, type ReactNode, type RefObject } from "react";
import { useFocusTrap } from "./useFocusTrap";

export type AccessibleDialogVariant = "dialog" | "drawer";
export type DrawerEdge = "left" | "right";

export interface AccessibleDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly triggerRef: RefObject<HTMLElement | null>;
  readonly ariaLabel: string;
  readonly closeLabel: string;
  readonly children: ReactNode;
  readonly variant?: AccessibleDialogVariant;
  readonly drawerEdge?: DrawerEdge;
  readonly describedBy?: string;
  readonly id?: string;
  readonly className?: string;
}

export function AccessibleDialog({
  open,
  onClose,
  triggerRef,
  ariaLabel,
  closeLabel,
  children,
  variant = "dialog",
  drawerEdge = "right",
  describedBy,
  id,
  className,
}: AccessibleDialogProps): JSX.Element | null {
  const containerRef = useRef<HTMLElement>(null);

  useFocusTrap({ containerRef, triggerRef, isActive: open, onClose });

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const closeFromBackdrop = useCallback((): void => {
    onClose();
  }, [onClose]);

  if (!open) return null;
  const placement = variant === "drawer"
    ? drawerEdge === "left"
      ? "mr-auto h-full w-drawer-mobile max-w-drawer-max rounded-r-panel"
      : "ml-auto h-full w-drawer-mobile max-w-drawer-max rounded-l-panel"
    : "m-auto max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-2xl rounded-panel";

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute inset-0 bg-negro-volcanico/60"
        data-overlay-backdrop
        onClick={closeFromBackdrop}
      />
      <section
        ref={containerRef}
        id={id}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        data-dialog-variant={variant}
        className={[
          "relative z-10 overflow-y-auto bg-surface-page p-6 text-text-primary shadow-floating",
          placement,
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="ml-auto flex min-h-11 min-w-11 items-center justify-center rounded-control text-2xl leading-none hover:bg-surface-warm focus-visible:outline-focus"
        >
          <span aria-hidden="true">×</span>
        </button>
        {children}
      </section>
    </div>
  );
}
