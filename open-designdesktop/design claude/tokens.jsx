// BorondoTours — Páramo-inspired design tokens
// Inspired by: Colombian páramo ecosystem, Chivito (Bearded Helmetcrest) iridescence,
// morning fog, frailejones, stone, moss, cloud forests.

const BT_COLORS = {
  // Neutrals — cold páramo greys
  niebla:    '#EEEAE2',  // Paper / fog — warm cream neutral bg
  nieblaDark:'#D9D4C7',  // Darker fog for surfaces
  piedra:    '#8B8A82',  // Stone mid-grey
  paramo:    '#3E4540',  // Cold deep páramo grey-green
  tinta:     '#1A1E1C',  // Near-black ink
  hueso:     '#F7F4EC',  // Bone white (lightest)

  // Nature accents
  musgo:     '#4E5C3E',  // Moss / frailejón green
  musgoDeep: '#2D3626',  // Deep moss
  liquenGold:'#B89448',  // Lichen ochre

  // Signature — Chivito iridescence
  chivito:       '#00B88A',  // Iridescent teal-green (Chivito bard)
  chivitoBright: '#2DE5A8',  // Brighter iridescent
  chivitoDeep:   '#006B52',  // Deep iridescent shadow
  chivitoShift:  '#4DBFD9',  // Iridescent blue shift

  // Utility
  success: '#4E5C3E',
  error:   '#A64B2D',
  warning: '#B89448',
};

const BT_TYPE = {
  // Display — Fraunces (warm, conversational friend — serif w/ soul)
  display: 'Fraunces, "Playfair Display", Georgia, serif',
  // Body — Instrument Sans / Manrope fallback
  body: '"Instrument Sans", Manrope, "Helvetica Neue", sans-serif',
  // Mono — for coins, data, tags
  mono: '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace',
};

const BT_SPACE = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 40, xxl: 64, xxxl: 96,
};

const BT_RADIUS = {
  sm: 4, md: 8, lg: 16, xl: 24, pill: 999,
};

const BT_SHADOW = {
  soft: '0 1px 2px rgba(26,30,28,0.06), 0 2px 8px rgba(26,30,28,0.04)',
  med:  '0 4px 12px rgba(26,30,28,0.08), 0 16px 32px rgba(26,30,28,0.06)',
  glass: '0 8px 32px rgba(26,30,28,0.12), inset 0 1px 0 rgba(255,255,255,0.4)',
};

// Iridescent gradient — signature of the system (use sparingly)
const BT_IRIDESCENT = `linear-gradient(135deg,
  ${BT_COLORS.chivitoShift} 0%,
  ${BT_COLORS.chivitoBright} 35%,
  ${BT_COLORS.chivito} 55%,
  ${BT_COLORS.chivitoDeep} 90%)`;

const BT_IRIDESCENT_SOFT = `linear-gradient(120deg,
  rgba(77,191,217,0.9) 0%,
  rgba(45,229,168,0.9) 40%,
  rgba(0,184,138,0.9) 70%,
  rgba(0,107,82,0.9) 100%)`;

Object.assign(window, {
  BT_COLORS, BT_TYPE, BT_SPACE, BT_RADIUS, BT_SHADOW,
  BT_IRIDESCENT, BT_IRIDESCENT_SOFT,
});
