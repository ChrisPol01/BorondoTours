// Chivito (Bearded Helmetcrest) — stylized logo marks in several styles
// The bird has: a distinctive head with 2 crests (white spiky plumes going up),
// a white-and-black face stripe pattern, and an iridescent green-blue beard
// that hangs below the chin.

// ── STYLE 01: Line art — modern, elegant ──────────────────────────
function ChivitoLineArt({ size = 120, color = '#1A1E1C', beardColor = null, strokeWidth = 2 }) {
  const b = beardColor || color;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none"
         style={{ display: 'block' }}>
      {/* Head outline — simplified profile facing right */}
      <g stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Back of head & neck */}
        <path d="M 42 62 Q 36 52 40 40 Q 48 28 62 28" />
        {/* Top crest — 3 spikes rising up */}
        <path d="M 48 30 L 45 14" />
        <path d="M 55 26 L 54 10" />
        <path d="M 62 28 L 64 12" />
        {/* Front head down to beak */}
        <path d="M 62 28 Q 74 30 80 38 Q 86 44 88 50" />
        {/* Beak */}
        <path d="M 88 50 L 108 54 L 88 56 Z" fill={color} />
        {/* Chin line */}
        <path d="M 84 56 Q 72 62 62 60" />
        {/* Face stripe suggestion */}
        <path d="M 56 38 Q 64 42 72 40" />
      </g>
      {/* Iridescent beard — hanging filaments */}
      <g stroke={b} strokeWidth={strokeWidth + 0.5} strokeLinecap="round">
        <path d="M 64 60 Q 62 72 60 84" />
        <path d="M 68 62 Q 68 76 68 90" />
        <path d="M 72 62 Q 74 76 76 88" />
        <path d="M 76 60 Q 80 72 82 82" />
      </g>
      {/* Eye */}
      <circle cx="72" cy="40" r="2" fill={color} />
    </svg>
  );
}

// ── STYLE 02: Solid silhouette — geometric, minimal ────────────────
function ChivitoSilhouette({ size = 120, color = '#1A1E1C', beardColor = null }) {
  const b = beardColor || color;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none"
         style={{ display: 'block' }}>
      {/* Spiky crest — abstracted triangles */}
      <path d="M 42 30 L 46 10 L 50 30 Z" fill={color} />
      <path d="M 52 28 L 57 8  L 60 28 Z" fill={color} />
      <path d="M 62 28 L 68 12 L 70 28 Z" fill={color} />
      {/* Solid head shape */}
      <path d="M 40 42 Q 38 34 44 30 L 72 28 Q 84 34 88 46 L 108 50 L 88 54 Q 84 60 76 62 L 54 64 Q 42 60 40 48 Z"
            fill={color} />
      {/* White face stripe (negative space, use near-bg) */}
      <path d="M 54 40 Q 66 42 78 40 L 78 46 Q 66 48 54 46 Z" fill="#F7F4EC" />
      {/* Eye */}
      <circle cx="72" cy="38" r="2" fill="#F7F4EC" />
      {/* Iridescent beard */}
      <path d="M 60 62 L 58 84 L 64 72 L 66 88 L 72 74 L 74 86 L 80 72 L 82 82 L 84 64 Z"
            fill={b} />
    </svg>
  );
}

// ── STYLE 03: Emblem — badge / vintage expedition ─────────────────
function ChivitoEmblem({ size = 120, color = '#1A1E1C', beardColor = null, ringColor = null }) {
  const b = beardColor || color;
  const r = ringColor || color;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none"
         style={{ display: 'block' }}>
      {/* Outer ring */}
      <circle cx="60" cy="60" r="56" stroke={r} strokeWidth="1.5" fill="none" />
      <circle cx="60" cy="60" r="52" stroke={r} strokeWidth="0.5" fill="none" opacity="0.5" />
      {/* Tick marks */}
      {[0, 90, 180, 270].map(a => (
        <line key={a} x1="60" y1="4" x2="60" y2="10"
              stroke={r} strokeWidth="1.5"
              transform={`rotate(${a} 60 60)`} />
      ))}
      {/* Bird — centered, smaller */}
      <g transform="translate(0, -4)">
        {/* Crests */}
        <path d="M 48 36 L 51 22 L 54 36 Z" fill={color} />
        <path d="M 56 34 L 60 20 L 63 34 Z" fill={color} />
        <path d="M 64 36 L 68 24 L 70 36 Z" fill={color} />
        {/* Head */}
        <path d="M 44 46 Q 44 38 52 36 L 70 36 Q 82 40 86 50 L 96 54 L 86 58 Q 82 62 76 64 L 56 66 Q 44 62 44 52 Z"
              fill={color} />
        <circle cx="70" cy="44" r="1.8" fill="#F7F4EC" />
        {/* Beard */}
        <g fill={b}>
          <path d="M 62 64 L 60 80 L 64 70 L 66 82 L 70 72 L 72 80 L 76 70 L 78 78 L 80 64 Z" />
        </g>
      </g>
      {/* Bottom text path */}
      <defs>
        <path id="bt-bottom" d="M 18 72 A 42 42 0 0 0 102 72" />
      </defs>
      <text fontFamily="Fraunces, serif" fontSize="7" fontWeight="600" letterSpacing="3" fill={r}>
        <textPath href="#bt-bottom" startOffset="50%" textAnchor="middle">
          · BORONDO TOURS · COLOMBIA ·
        </textPath>
      </text>
    </svg>
  );
}

// ── STYLE 04: Detailed — illustrated, editorial ───────────────────
function ChivitoDetailed({ size = 120, color = '#1A1E1C', beardColor = null }) {
  const b = beardColor || '#00B88A';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none"
         style={{ display: 'block' }}>
      <g stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Crest — many thin spikes */}
        <path d="M 40 32 L 42 12" />
        <path d="M 44 30 L 45 8" />
        <path d="M 48 28 L 50 6" />
        <path d="M 53 27 L 55 8" />
        <path d="M 58 28 L 60 6" />
        <path d="M 62 29 L 65 9" />
        <path d="M 66 30 L 70 12" />
        {/* Head outline */}
        <path d="M 38 46 Q 36 40 40 34 Q 46 30 54 30 L 70 32 Q 82 36 86 46" />
        {/* Neck */}
        <path d="M 38 48 Q 38 58 46 64" />
        {/* Face detail — eye ring + stripe */}
        <circle cx="68" cy="42" r="2.5" fill={color} stroke="none" />
        <path d="M 54 42 L 62 42" />
        <path d="M 52 48 Q 60 50 66 48" />
        {/* Beak */}
        <path d="M 86 46 L 108 52 L 86 54" fill={color} />
        {/* Chin */}
        <path d="M 82 54 Q 70 58 60 56" />
        {/* Body hint */}
        <path d="M 46 64 Q 40 72 44 82" />
      </g>
      {/* Iridescent beard — dense hatching */}
      <g stroke={b} strokeWidth="1.2" strokeLinecap="round">
        <path d="M 60 58 L 58 86" />
        <path d="M 63 60 L 62 88" />
        <path d="M 66 60 L 68 90" />
        <path d="M 70 60 L 72 88" />
        <path d="M 74 58 L 78 86" />
        <path d="M 78 58 L 82 82" />
      </g>
      {/* Highlight dot on beard */}
      <circle cx="70" cy="70" r="2" fill={b} opacity="0.8" />
    </svg>
  );
}

// ── STYLE 05: Frontal — uses real illustrated PNG asset ─────────
function ChivitoFrontal({ size = 120, color, beardColor, bg = 'transparent' }) {
  return (
    <div style={{ width: size, height: size, position: 'relative', display: 'block' }}>
      {bg !== 'transparent' && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: bg }} />
      )}
      <img src="assets/chivito-front.png" alt="Chivito"
           style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
    </div>
  );
}

// ── Small circular version for the O in "Tours" — uses real PNG ──
function ChivitoCircleO({ size = 80, color = '#1A1E1C', beardColor = '#00B88A' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `${Math.max(2, size * 0.06)}px solid ${color}`,
      overflow: 'hidden', position: 'relative',
      display: 'inline-block', verticalAlign: 'middle',
      background: '#F7F4EC',
    }}>
      <img src="assets/chivito-front.png" alt="Chivito"
           style={{
             width: '115%', height: '115%', objectFit: 'cover',
             position: 'absolute', left: '-7%', top: '-2%',
             display: 'block',
           }} />
    </div>
  );
}

Object.assign(window, {
  ChivitoLineArt, ChivitoSilhouette, ChivitoEmblem,
  ChivitoDetailed, ChivitoFrontal, ChivitoCircleO,
});
