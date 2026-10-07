import type { JSX, ReactNode } from "react";

export type StatusMessageTone = "error" | "empty" | "success" | "info";

export interface StatusMessageProps {
  readonly tone: StatusMessageTone;
  readonly title?: string;
  readonly children: ReactNode;
  readonly action?: ReactNode;
  readonly className?: string;
}

const TONE_CLASSES: Readonly<Record<StatusMessageTone, string>> = {
  error: "border-sold-out text-sold-out",
  empty: "border-border-subtle text-text-primary",
  success: "border-available text-text-primary",
  info: "border-turquesa text-text-primary",
};

export function StatusMessage({
  tone,
  title,
  children,
  action,
  className,
}: StatusMessageProps): JSX.Element {
  const isError = tone === "error";
  return (
    <section
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      aria-atomic="true"
      data-status={tone}
      className={["rounded-card border-l-4 bg-surface-page p-4 shadow-card", TONE_CLASSES[tone], className]
        .filter(Boolean)
        .join(" ")}
    >
      {title && <h2 className="font-heading text-h4 font-semibold">{title}</h2>}
      <div className={title ? "mt-2 text-body1" : "text-body1"}>{children}</div>
      {action && <div className="mt-4">{action}</div>}
    </section>
  );
}
