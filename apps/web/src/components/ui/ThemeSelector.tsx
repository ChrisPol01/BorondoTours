/**
 * Selector de tema (Figma: componente "Selector de tema", sección 00).
 * Grupo de radios accesible: flechas izquierda/derecha cambian la opción, Tab entra y sale del grupo.
 */
import type { JSX, KeyboardEvent } from "react";
import { useStore } from "@nanostores/react";
import { Monitor, Moon, Palette, Sun } from "lucide-react";

import { useTranslation } from "../../lib/i18n/provider";
import { THEMES, setTheme, themeStore, type Theme } from "../../lib/theme";

const ICONS: Record<Theme, typeof Sun> = { colorido: Palette, claro: Sun, oscuro: Moon, sistema: Monitor };

export function ThemeSelector(): JSX.Element {
  const { t } = useTranslation("common");
  const current = useStore(themeStore);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = THEMES[(THEMES.indexOf(current) + step + THEMES.length) % THEMES.length];
    setTheme(next);
    const target = event.currentTarget.querySelector<HTMLButtonElement>(`[data-value="${next}"]`);
    target?.focus();
  };

  return (
    // Roving tabindex (WAI-ARIA radiogroup): el foco vive en el radio activo, no en el grupo.
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <div
      role="radiogroup"
      aria-label={t("theme.label")}
      onKeyDown={onKeyDown}
      className="inline-flex flex-wrap gap-1 rounded-pill border border-border-subtle bg-surface-warm p-1"
    >
      {THEMES.map((theme) => {
        const Icon = ICONS[theme];
        const checked = theme === current;
        return (
          <button
            key={theme}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            data-value={theme}
            onClick={() => setTheme(theme)}
            className={[
              "inline-flex min-h-11 items-center gap-2 rounded-pill px-4 text-sm",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
              checked ? "bg-surface-page font-semibold text-text-primary shadow-card" : "text-text-muted",
            ].join(" ")}
          >
            <Icon aria-hidden="true" size={16} strokeWidth={2} />
            {t(`theme.${theme}`)}
          </button>
        );
      })}
    </div>
  );
}
