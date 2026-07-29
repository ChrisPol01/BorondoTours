// BorondoTours Wordmark — "Borondo Tours" with O as bird portrait
function BorondoWordmark({ size = 120, color = '#1A1E1C', beardColor = '#00B88A', birdInO = true, stacked = false }) {
  const fontSize = size;
  const OSize = fontSize * 0.9;
  if (stacked) {
    return (
      <div style={{
        fontFamily: 'Fraunces, serif', fontWeight: 500, fontStyle: 'italic',
        fontSize: fontSize, color: color, lineHeight: 0.85, letterSpacing: -fontSize * 0.04,
        display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start',
        fontVariationSettings: '"opsz" 144, "SOFT" 100',
      }}>
        <span>Borondo</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: fontSize * 0.04 }}>
          T<span style={{ display: 'inline-block', width: OSize, height: OSize, marginTop: fontSize * 0.06 }}>
            <ChivitoCircleO size={OSize} color={color} beardColor={beardColor} />
          </span>urs
        </span>
      </div>
    );
  }
  return (
    <div style={{
      fontFamily: 'Fraunces, serif', fontWeight: 500, fontStyle: 'italic',
      fontSize: fontSize, color: color, lineHeight: 1, letterSpacing: -fontSize * 0.035,
      display: 'inline-flex', alignItems: 'center', gap: fontSize * 0.12,
      fontVariationSettings: '"opsz" 144, "SOFT" 100',
    }}>
      <span>Borondo</span>
      {birdInO ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: fontSize * 0.02 }}>
          <span>T</span>
          <span style={{ display: 'inline-block', width: OSize, height: OSize, transform: `translateY(${fontSize * 0.04}px)` }}>
            <ChivitoCircleO size={OSize} color={color} beardColor={beardColor} />
          </span>
          <span>urs</span>
        </span>
      ) : <span>Tours</span>}
    </div>
  );
}

// Swatch card
function Swatch({ name, hex, role, dark }) {
  const isLight = ['#EEEAE2','#F7F4EC','#D9D4C7'].includes(hex);
  return (
    <div>
      <div style={{
        width: '100%', aspectRatio: '1.2', background: hex, borderRadius: 10,
        border: isLight ? '1px solid rgba(0,0,0,0.08)' : 'none',
        display: 'flex', alignItems: 'flex-end', padding: 12,
        color: isLight ? BT_COLORS.tinta : BT_COLORS.hueso,
        fontFamily: BT_TYPE.mono, fontSize: 10, letterSpacing: 0.5,
      }}>{hex.toUpperCase()}</div>
      <div style={{ marginTop: 10, fontFamily: BT_TYPE.body, fontSize: 13, fontWeight: 600, color: BT_COLORS.tinta }}>{name}</div>
      <div style={{ fontFamily: BT_TYPE.body, fontSize: 11, color: BT_COLORS.piedra, marginTop: 2 }}>{role}</div>
    </div>
  );
}

// Borondo Coin — metallic red finish
// Palette built around oxblood/ruby/crimson: specular highlight top-left,
// deep maroon shadow bottom-right, darkened engraving for depth.
// I/V/X variants shift the rim hue slightly: I=wine, V=ruby, X=cherry.
function BorondoCoin({ size = 140, value = 'I', rim = '#9E1B2E' }) {
  const uid = `${value}-${rim.replace('#', '')}`;
  // Derive a lighter specular + darker shadow from the rim tone
  const specular = '#F5D1D0';   // pink-white highlight
  const midlight = '#E24056';   // saturated ruby midtone
  const shadow = '#4A0A12';     // deep maroon/oxblood shadow
  const engrave = '#2B0509';    // near-black crimson for text
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Metallic gradient coin */}
      <svg width={size} height={size} viewBox="0 0 140 140" style={{ display: 'block', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.25))' }}>
        <defs>
          {/* Rim: offset specular to sell the 3D metal */}
          <radialGradient id={`coin-rim-${uid}`} cx="35%" cy="28%" r="85%">
            <stop offset="0%" stopColor={specular} />
            <stop offset="22%" stopColor={midlight} />
            <stop offset="55%" stopColor={rim} />
            <stop offset="85%" stopColor={shadow} />
            <stop offset="100%" stopColor="#1A0206" />
          </radialGradient>
          {/* Inner face: shallower gradient, same light direction */}
          <radialGradient id={`coin-face-${uid}`} cx="38%" cy="32%" r="90%">
            <stop offset="0%" stopColor="#F0A8AF" />
            <stop offset="35%" stopColor={midlight} />
            <stop offset="75%" stopColor={rim} />
            <stop offset="100%" stopColor={shadow} />
          </radialGradient>
          {/* Glossy specular streak — overlay */}
          <linearGradient id={`coin-gloss-${uid}`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`coin-clip-${uid}`}>
            <circle cx="70" cy="70" r="68" />
          </clipPath>
        </defs>
        {/* Outer rim */}
        <circle cx="70" cy="70" r="68" fill={`url(#coin-rim-${uid})`} />
        {/* Reeded edge — tick marks around circumference */}
        {Array.from({ length: 72 }, (_, i) => (
          <line key={i} x1="70" y1="3" x2="70" y2="10"
                stroke={engrave} strokeWidth="0.8" opacity="0.55"
                transform={`rotate(${i * 5} 70 70)`} />
        ))}
        {/* Inner stepped ring — subtle bevel */}
        <circle cx="70" cy="70" r="58" fill="none" stroke={shadow} strokeWidth="1.5" opacity="0.7" />
        <circle cx="70" cy="70" r="56" fill="none" stroke={specular} strokeWidth="0.6" opacity="0.55" />
        {/* Inner face */}
        <circle cx="70" cy="70" r="54" fill={`url(#coin-face-${uid})`} />
        <circle cx="70" cy="70" r="54" fill="none" stroke={shadow} strokeWidth="0.8" opacity="0.6" />
        <circle cx="70" cy="70" r="50" fill="none" stroke={specular} strokeWidth="0.5" opacity="0.45" />
        {/* Engraved text around top */}
        <defs>
          <path id={`coin-top-${uid}`} d="M 26 70 A 44 44 0 0 1 114 70" />
          <path id={`coin-bot-${uid}`} d="M 26 70 A 44 44 0 0 0 114 70" />
        </defs>
        <text fontFamily="Fraunces, serif" fontSize="7" fontWeight="700" letterSpacing="3" fill={engrave} opacity="0.85">
          <textPath href={`#coin-top-${uid}`} startOffset="50%" textAnchor="middle">
            · BORONDO · COLOMBIA ·
          </textPath>
        </text>
        <text fontFamily="Fraunces, serif" fontSize="6.5" fontWeight="600" letterSpacing="4" fill={engrave} opacity="0.85">
          <textPath href={`#coin-bot-${uid}`} startOffset="50%" textAnchor="middle">
            COIN · {value}
          </textPath>
        </text>
        {/* Glossy specular overlay (clipped to coin disc) */}
        <g clipPath={`url(#coin-clip-${uid})`}>
          <ellipse cx="48" cy="38" rx="42" ry="22" fill={`url(#coin-gloss-${uid})`} />
        </g>
      </svg>
      {/* Bird in center — absolutely positioned */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <div style={{
          transform: 'translateY(-2px)',
          filter: 'drop-shadow(0 1px 0 rgba(255,180,180,0.4)) drop-shadow(0 -1px 0 rgba(40,0,5,0.5))',
          mixBlendMode: 'multiply',
          opacity: 0.92,
        }}>
          <ChivitoFrontal size={size * 0.56} />
        </div>
      </div>
    </div>
  );
}

// Pattern — frailejón silhouettes + topo lines
function BrandPattern({ width = 400, height = 280, color = BT_COLORS.musgo, bg = BT_COLORS.niebla, opacity = 0.15 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 400 280" style={{ display: 'block', background: bg }}>
      <g opacity={opacity} stroke={color} strokeWidth="1" fill="none">
        {/* Topo contour lines */}
        <path d="M 0 80 Q 100 60 200 90 Q 300 110 400 85" />
        <path d="M 0 110 Q 100 95 200 120 Q 300 140 400 115" />
        <path d="M 0 140 Q 100 130 200 150 Q 300 170 400 145" />
        <path d="M 0 170 Q 100 165 200 180 Q 300 200 400 175" />
        <path d="M 0 200 Q 100 200 200 210 Q 300 230 400 205" />
      </g>
      {/* Frailejón silhouettes */}
      <g fill={color} opacity={opacity * 1.8}>
        {[{ x: 50, s: 1 }, { x: 160, s: 0.7 }, { x: 280, s: 1.1 }, { x: 360, s: 0.8 }].map(({ x, s }, i) => (
          <g key={i} transform={`translate(${x}, ${240 - 40 * s}) scale(${s})`}>
            {/* Tall stem */}
            <rect x="-2" y="0" width="4" height="40" />
            {/* Rosette on top — star shape */}
            <g transform="translate(0, 0)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                <ellipse key={a} cx="0" cy="-10" rx="3" ry="8"
                         transform={`rotate(${a})`} />
              ))}
              <circle r="4" />
            </g>
          </g>
        ))}
      </g>
    </svg>
  );
}

Object.assign(window, { BorondoWordmark, Swatch, BorondoCoin, BrandPattern });
