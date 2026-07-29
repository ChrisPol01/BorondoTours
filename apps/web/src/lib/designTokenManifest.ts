export type TokenProvenanceStatus = "canonical" | "documented_derivative" | "provisional_measurement";

export interface DerivedTokenProvenance {
  readonly name: `--${string}`;
  readonly value: string;
  readonly sourceSheet: "Ave Azul" | "1";
  readonly sourceViewport: "all" | "375x812" | "1440x900" | "375x812 + 1440x900";
  readonly anchors: readonly string[];
  readonly allowedUse: string;
  readonly wcagEvidence: string;
  readonly status: TokenProvenanceStatus;
}

/** Traceability required before a derived value can be reused as a global token. */
function measured(
  name: `--${string}`,
  value: string,
  anchors: readonly string[],
  allowedUse: string,
): DerivedTokenProvenance {
  return {
    name,
    value,
    sourceSheet: "1",
    sourceViewport: "375x812 + 1440x900",
    anchors,
    allowedUse,
    wcagEvidence: "Geometry-only token; contrast remains controlled by semantic color tokens",
    status: "provisional_measurement",
  };
}

const MEASURED_TOKEN_PROVENANCE: readonly DerivedTokenProvenance[] = [
  measured("--layout-container-reading", "48rem", ["reading-column"], "Long-form reading container"),
  measured("--layout-container-account", "90rem", ["account-shell"], "Private account shell container"),
  measured("--layout-section-gap", "clamp(3rem, 7vw, 7rem)", ["section-boundaries"], "Responsive vertical section rhythm"),
  measured("--layout-header-mobile", "4.5rem", ["mobile-header"], "Mobile header reservation"),
  measured("--layout-header-desktop", "5.5rem", ["desktop-header"], "Desktop header reservation"),
  measured("--layout-map-height", "31.25rem", ["catalog-map"], "Map and fallback reserved height"),
  measured("--layout-tour-rail-card", "17.5rem", ["nearby-tour-rail"], "Horizontal tour rail card width"),
  measured("--layout-booking-sidebar", "20rem", ["booking-sidebar"], "Tour detail booking column"),
  measured("--layout-hero-mobile", "60vh", ["hero-bottom-mobile"], "Mobile hero minimum height"),
  measured("--layout-hero-tablet", "70vh", ["hero-bottom-tablet"], "Tablet hero minimum height"),
  measured("--layout-hero-desktop", "80vh", ["hero-bottom-desktop"], "Desktop hero minimum height"),
  measured("--layout-drawer-mobile", "85vw", ["filter-drawer"], "Mobile filter drawer width"),
  measured("--layout-drawer-max", "24rem", ["filter-drawer"], "Mobile filter drawer maximum width"),
  measured("--layout-gallery-overflow", "4rem", ["gallery-overflow"], "Gallery overflow counter width"),
  measured("--layout-tour-media-aspect", "16 / 9", ["tour-card-media"], "Tour media reserved aspect ratio"),
  measured("--shape-panel", "2rem", ["large-panel"], "Large visual panels"),
  measured("--shape-pill", "9999px", ["badge"], "Pills and status badges"),
  measured("--border-hairline", "1px", ["glass-border"], "Subtle surface separation"),
  measured("--elevation-floating", "1rem 3rem / 24% Azul Profundo", ["floating-panel"], "Floating panels and drawers"),
  measured("--elevation-sticky", "-0.125rem 0.5rem / 8% Negro Volcánico", ["sticky-price"], "Sticky mobile action separation"),
  measured("--glass-border", "30% Blanco Niebla", ["header-glass", "home-search"], "Liquid glass border"),
  measured("--glass-highlight", "24% Blanco Niebla inset", ["header-glass", "home-search"], "Liquid glass highlight"),
  measured("--glass-depth", "floating elevation", ["header-glass", "home-search"], "Liquid glass depth"),
  measured("--glass-blur", "1rem", ["header-glass", "home-search"], "Liquid glass backdrop blur"),
  measured("--glass-fallback", "Azul Profundo", ["header-glass", "home-search"], "Opaque WCAG fallback"),
  measured("--logo-clear-space", "0.5rem", ["header-logo"], "Minimum clear space around horizontal logo"),
  measured("--motion-duration-standard", "200ms", ["state-transition"], "Native/CSS state transitions"),
  measured("--motion-ease-standard", "cubic-bezier(0.2, 0, 0, 1)", ["state-transition"], "Native/CSS state easing"),
];

export const DERIVED_TOKEN_PROVENANCE: readonly DerivedTokenProvenance[] = [
  ...MEASURED_TOKEN_PROVENANCE,
  { name: "--semantic-border-subtle", value: "18% Azul Profundo", sourceSheet: "1", sourceViewport: "all", anchors: ["control-border", "panel-border"], allowedUse: "Non-text interface boundaries only", wcagEvidence: "Interactive boundaries use the stronger focus token when focused", status: "documented_derivative" },
  { name: "--icon-stroke", value: "2px", sourceSheet: "Ave Azul", sourceViewport: "all", anchors: ["line-icons"], allowedUse: "Rounded minimal line iconography", wcagEvidence: "Brand-mandated stroke; interface state cannot rely on icon color alone", status: "canonical" },
  { name: "--derived-danger", value: "#b42318", sourceSheet: "1", sourceViewport: "all", anchors: ["availability", "error-state"], allowedUse: "Sold-out and destructive/error emphasis paired with text", wcagEvidence: "Contrast is greater than 6:1 against Blanco Niebla", status: "documented_derivative" },
  { name: "--derived-neutral", value: "#667085", sourceSheet: "1", sourceViewport: "all", anchors: ["unavailable-state"], allowedUse: "Unavailable metadata paired with a textual state", wcagEvidence: "Contrast is greater than 4.5:1 against Blanco Niebla", status: "documented_derivative" },
  { name: "--derived-adventure", value: "#9a3d08", sourceSheet: "1", sourceViewport: "all", anchors: ["difficulty-badge"], allowedUse: "Adventurous difficulty badge only", wcagEvidence: "Contrast is greater than 6:1 against Blanco Niebla", status: "documented_derivative" },
  { name: "--layout-page-gutter", value: "1rem / 1.5rem / 2rem", sourceSheet: "1", sourceViewport: "375x812 + 1440x900", anchors: ["page-left", "page-right"], allowedUse: "Responsive public page gutters", wcagEvidence: "Supports 130% labels without horizontal clipping", status: "provisional_measurement" },
  { name: "--layout-container-public", value: "80rem", sourceSheet: "1", sourceViewport: "1440x900", anchors: ["content-left", "content-right"], allowedUse: "Primary public content container", wcagEvidence: "Preserves readable line lengths and reflow", status: "provisional_measurement" },
  { name: "--shape-control", value: "0.75rem", sourceSheet: "1", sourceViewport: "375x812 + 1440x900", anchors: ["search-controls", "primary-cta"], allowedUse: "Interactive controls", wcagEvidence: "Does not reduce the 44px minimum target", status: "provisional_measurement" },
  { name: "--shape-card", value: "1.25rem", sourceSheet: "1", sourceViewport: "1440x900", anchors: ["tour-card", "trust-card"], allowedUse: "Reusable cards", wcagEvidence: "Decorative only; no contrast impact", status: "provisional_measurement" },
  { name: "--elevation-card", value: "0 0.5rem 1.5rem / 12% Azul Profundo", sourceSheet: "1", sourceViewport: "1440x900", anchors: ["tour-card"], allowedUse: "Static card separation", wcagEvidence: "Borders and content remain independently perceivable", status: "provisional_measurement" },
  { name: "--glass-background", value: "82% Azul Profundo", sourceSheet: "1", sourceViewport: "375x812 + 1440x900", anchors: ["header-glass", "home-search"], allowedUse: "Liquid glass over approved photography", wcagEvidence: "Blanco Niebla text exceeds 4.5:1; opaque fallback exceeds 10:1", status: "provisional_measurement" },
  { name: "--logo-horizontal-min-width", value: "10rem", sourceSheet: "Ave Azul", sourceViewport: "all", anchors: ["header-logo"], allowedUse: "Horizontal logo only with intrinsic aspect ratio", wcagEvidence: "Brand guideline digital minimum; clear-space token required", status: "canonical" },
  { name: "--motion-duration-reduced", value: "100ms", sourceSheet: "1", sourceViewport: "all", anchors: ["state-transition"], allowedUse: "Reduced-motion color and opacity fades only", wcagEvidence: "Requirement 25.6 maximum; no delayed task completion", status: "documented_derivative" },
] as const;
