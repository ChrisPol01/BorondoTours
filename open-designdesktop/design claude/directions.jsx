// Three brand directions for BorondoTours

const FONTS_LINK = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;0,9..144,900;1,9..144,400;1,9..144,600&family=Instrument+Serif:ital@0;1&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&family=Archivo:wght@400;500;600;700;900&family=Inter+Tight:wght@400;500;600;700&display=swap';

// ─── DIRECTION 1 ────────────────────────────────────────────────
// "Selva Profunda" — Deep Jungle
// Dark, cinematic, NatGeo-inspired. Photography-led.
const D1 = {
  name: '01 — Selva Profunda',
  tagline: 'Deep Jungle · Cinematic & reverent',
  desc: 'Dark editorial canvas. Cream ivory type over moody tropical imagery. Low-key luxury: think NatGeo documentary crossed with an Aesop catalog. Headlines in a display serif with sharp ink-trap details. Color appears only as accents — a single ember orange that echoes Colombian terracotta and sunset. Cream, moss, and near-black dominate.',
  palette: [
    { name: 'Noche', hex: '#121714', role: 'Bg · Primary dark' },
    { name: 'Selva', hex: '#1F2A22', role: 'Surface' },
    { name: 'Musgo', hex: '#3E4A38', role: 'Moss green' },
    { name: 'Brasa', hex: '#E8643C', role: 'Accent · ember' },
    { name: 'Hueso', hex: '#F4EEE2', role: 'Cream · text' },
    { name: 'Oro', hex: '#C9A25E', role: 'Gold highlight' },
  ],
  type: {
    display: { family: 'Fraunces, serif', weight: 600, sample: 'Borondo', style: 'italic', settings: '"opsz" 144, "SOFT" 100' },
    body: { family: 'Inter Tight, sans-serif', weight: 500, sample: 'Wander Colombia, freely.' },
    names: 'Fraunces Display / Inter Tight',
  },
  logoMotif: 'compass-star',
  mood: 'jungle-dark',
};

// ─── DIRECTION 2 ────────────────────────────────────────────────
// "Borondo Vivo" — Alive & saturated
// Duolingo-energy meets National Geographic. Bright, friendly, bold.
const D2 = {
  name: '02 — Borondo Vivo',
  tagline: 'Alive · Modern marketplace energy',
  desc: 'Bright cream paper canvas with saturated biodiversity accents — emerald rainforest, macaw red, sky cyan. Geometric sans with quirky personality (looped g, round dots) pairs with a modern serif for editorial moments. Feels startup-fresh but warm. Borrows Airbnb\'s trust and clarity, Duolingo\'s joy, and grounds both in Colombian color memory: paisa porch tiles, orchid petals, Caribbean sea.',
  palette: [
    { name: 'Crema', hex: '#FBF7EE', role: 'Paper · bg' },
    { name: 'Selva', hex: '#0E5E3F', role: 'Primary · emerald' },
    { name: 'Guacamayo', hex: '#E84A2D', role: 'Accent · macaw' },
    { name: 'Cielo', hex: '#4AB8D6', role: 'Sky cyan' },
    { name: 'Oro', hex: '#F5B342', role: 'Sun · ochre' },
    { name: 'Tinta', hex: '#141B1A', role: 'Text · near-black' },
  ],
  type: {
    display: { family: 'Archivo, sans-serif', weight: 900, sample: 'Borondo', style: 'normal', settings: '"wdth" 100' },
    body: { family: 'DM Sans, sans-serif', weight: 500, sample: 'Wander Colombia, freely.' },
    names: 'Archivo Black / DM Sans',
  },
  logoMotif: 'topo-loop',
  mood: 'paper-bright',
};

// ─── DIRECTION 3 ────────────────────────────────────────────────
// "Altiplano" — High plains premium
// Sophisticated, warm, editorial. Andean-inspired neutrals + single luxe accent.
const D3 = {
  name: '03 — Altiplano',
  tagline: 'Premium · Editorial warmth',
  desc: 'Bone white canvas, toasted terracotta, deep teal for calm. Feels like a curated travel magazine: Cereal meets Kinfolk with Colombian soul. Typography does the heavy lifting — a modern serif with confident italic swashes for headlines, a subtle humanist sans for body. Sparse use of color; imagery is warm and golden-hour. The premium direction — trust, quality, slow travel.',
  palette: [
    { name: 'Hueso', hex: '#F2ECE0', role: 'Bone · bg' },
    { name: 'Barro', hex: '#B8552E', role: 'Terracotta' },
    { name: 'Páramo', hex: '#1F4A4A', role: 'Teal · premium' },
    { name: 'Arena', hex: '#D9C8A8', role: 'Sand · surface' },
    { name: 'Tinta', hex: '#2A1F17', role: 'Ink brown' },
    { name: 'Cobre', hex: '#8B4A2B', role: 'Copper' },
  ],
  type: {
    display: { family: 'Playfair Display, serif', weight: 900, sample: 'Borondo', style: 'italic', settings: 'normal' },
    body: { family: 'Manrope, sans-serif', weight: 500, sample: 'Wander Colombia, freely.' },
    names: 'Playfair Display / Manrope',
  },
  logoMotif: 'mountain-arc',
  mood: 'paper-warm',
};

const DIRECTIONS = [D1, D2, D3];

// ─── Logo Mark SVGs ──────────────────────────────────────────────
function LogoMark({ motif, color = '#000', size = 64 }) {
  if (motif === 'compass-star') {
    // A wandering compass: asymmetric 4-point star with a loose orbit
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="29" stroke={color} strokeWidth="1" opacity="0.35" />
        <path d="M32 4 L36 28 L60 32 L36 36 L32 60 L28 36 L4 32 L28 28 Z" fill={color} />
        <circle cx="32" cy="32" r="3" fill="#F4EEE2" />
        <circle cx="50" cy="14" r="1.5" fill={color} opacity="0.6" />
      </svg>
    );
  }
  if (motif === 'topo-loop') {
    // Topographic loop — continuous line meandering, suggests a route
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path
          d="M10 44 C 14 28, 22 20, 32 22 C 42 24, 48 34, 44 42 C 40 50, 26 52, 22 44 C 18 36, 26 30, 32 32 C 38 34, 40 40, 36 42"
          stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="10" cy="44" r="3" fill={color} />
      </svg>
    );
  }
  if (motif === 'mountain-arc') {
    // Andean arch: mountain silhouette inside a sun arc
    return (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <path d="M6 44 A 26 26 0 0 1 58 44" stroke={color} strokeWidth="1.5" fill="none" opacity="0.5" />
        <path d="M8 50 L22 26 L32 38 L42 20 L56 50 Z" fill={color} />
        <circle cx="32" cy="14" r="3" fill={color} />
      </svg>
    );
  }
  return null;
}

// ─── Mood thumbnails (illustrative) ──────────────────────────────
function MoodThumb({ dir }) {
  const { mood, palette } = dir;
  if (mood === 'jungle-dark') {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: `radial-gradient(ellipse at 30% 40%, ${palette[2].hex}55 0%, ${palette[0].hex} 65%), linear-gradient(180deg, ${palette[1].hex} 0%, ${palette[0].hex} 100%)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Leaf shapes suggesting canopy */}
        <svg viewBox="0 0 400 240" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55 }}>
          <path d="M-20 0 Q 60 40 40 120 Q 80 90 100 40 Q 130 80 110 150 Q 160 100 180 30 L 0 -10 Z" fill={palette[2].hex} opacity="0.6" />
          <path d="M320 0 Q 280 60 340 100 Q 300 130 360 160 Q 330 190 420 140 L 420 0 Z" fill={palette[2].hex} opacity="0.7" />
          <circle cx="200" cy="120" r="40" fill={palette[3].hex} opacity="0.25" />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 8, color: palette[4].hex,
        }}>
          <div style={{ fontFamily: 'Fraunces, serif', fontSize: 42, fontStyle: 'italic', fontWeight: 600, letterSpacing: -1 }}>Borondo</div>
          <div style={{ fontFamily: 'Inter Tight, sans-serif', fontSize: 10, letterSpacing: 4, textTransform: 'uppercase', opacity: 0.7 }}>Wander · Colombia</div>
        </div>
      </div>
    );
  }
  if (mood === 'paper-bright') {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: palette[0].hex,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Color blocks */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '55%', height: '60%', background: palette[1].hex }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '45%', height: '55%', background: palette[2].hex }} />
        <div style={{ position: 'absolute', top: '30%', left: '40%', width: 70, height: 70, background: palette[3].hex, borderRadius: '50%' }} />
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: palette[5].hex, flexDirection: 'column', mixBlendMode: 'multiply',
        }}>
          <div style={{ fontFamily: 'Archivo, sans-serif', fontSize: 48, fontWeight: 900, letterSpacing: -2 }}>BORONDO</div>
        </div>
      </div>
    );
  }
  if (mood === 'paper-warm') {
    return (
      <div style={{
        width: '100%', height: '100%',
        background: `linear-gradient(160deg, ${palette[0].hex} 0%, ${palette[3].hex} 100%)`,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Mountain silhouette */}
        <svg viewBox="0 0 400 240" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d="M0 240 L 60 150 L 120 190 L 180 120 L 240 170 L 300 100 L 360 160 L 400 140 L 400 240 Z" fill={palette[1].hex} opacity="0.85" />
          <path d="M0 240 L 80 200 L 160 220 L 240 190 L 320 215 L 400 195 L 400 240 Z" fill={palette[2].hex} opacity="0.9" />
          <circle cx="310" cy="60" r="22" fill={palette[5].hex} opacity="0.7" />
        </svg>
        <div style={{
          position: 'absolute', top: 20, left: 24, color: palette[4].hex,
        }}>
          <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 44, fontWeight: 900, fontStyle: 'italic', letterSpacing: -1, lineHeight: 0.95 }}>Borondo</div>
          <div style={{ fontFamily: 'Manrope, sans-serif', fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', marginTop: 4, fontWeight: 600 }}>Tours · Colombia</div>
        </div>
      </div>
    );
  }
  return null;
}

// ─── Hero mock thumbnail (small landing page preview) ───────────
function HeroMock({ dir }) {
  const { palette, mood } = dir;
  const darkBg = mood === 'jungle-dark';
  const textColor = darkBg ? palette[4].hex : palette[5].hex;
  const nav = darkBg ? `${palette[4].hex}20` : `${palette[5].hex}10`;

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: darkBg ? palette[0].hex : palette[0].hex,
    }}>
      <MoodThumb dir={dir} />
      {/* Overlay nav */}
      <div style={{
        position: 'absolute', top: 10, left: 10, right: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 10px',
        background: darkBg ? 'rgba(244,238,226,0.08)' : 'rgba(20,20,20,0.06)',
        backdropFilter: 'blur(8px)',
        borderRadius: 100,
        border: `1px solid ${darkBg ? 'rgba(244,238,226,0.15)' : 'rgba(20,20,20,0.08)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: textColor }}>
          <LogoMark motif={dir.logoMotif} color={textColor} size={14} />
          <div style={{
            fontFamily: dir.type.display.family, fontSize: 11, fontWeight: 700,
            fontStyle: mood === 'jungle-dark' ? 'italic' : 'normal', letterSpacing: -0.2,
          }}>BorondoTours</div>
        </div>
        <div style={{
          fontSize: 7, color: textColor, display: 'flex', gap: 8, fontFamily: dir.type.body.family, fontWeight: 500,
        }}>
          <span>Tours</span><span>Operators</span><span>Coins</span>
        </div>
        <div style={{
          padding: '3px 8px', background: palette[3]?.hex || palette[1].hex, color: '#fff',
          borderRadius: 100, fontSize: 7, fontFamily: dir.type.body.family, fontWeight: 700,
        }}>Explore</div>
      </div>
    </div>
  );
}

// ─── Direction card ──────────────────────────────────────────────
function DirectionCard({ dir, index }) {
  const darkSurface = dir.mood === 'jungle-dark';
  return (
    <div style={{
      width: 560, background: '#fff', borderRadius: 14, overflow: 'hidden',
      boxShadow: '0 2px 10px rgba(0,0,0,0.06), 0 20px 40px rgba(0,0,0,0.08)',
      fontFamily: '-apple-system, system-ui, sans-serif',
      border: '1px solid rgba(0,0,0,0.06)',
    }}>
      {/* Top — big mood thumbnail */}
      <div style={{ height: 260, position: 'relative' }}>
        <MoodThumb dir={dir} />
      </div>

      {/* Content */}
      <div style={{ padding: '24px 26px 28px' }}>
        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#999', textTransform: 'uppercase' }}>
            Direction {index + 1}
          </div>
        </div>
        <div style={{
          fontFamily: dir.type.display.family,
          fontSize: 32, fontWeight: dir.type.display.weight,
          fontStyle: dir.type.display.style,
          letterSpacing: -0.5, lineHeight: 1.05,
          color: '#141414', marginBottom: 6,
        }}>
          {dir.name.split(' — ')[1]}
        </div>
        <div style={{
          fontFamily: dir.type.body.family, fontSize: 13, color: '#666',
          marginBottom: 20, letterSpacing: 0.2,
        }}>
          {dir.tagline}
        </div>
        <div style={{
          fontFamily: dir.type.body.family, fontSize: 13.5, lineHeight: 1.55,
          color: '#3a3a3a', marginBottom: 22, textWrap: 'pretty',
        }}>
          {dir.desc}
        </div>

        {/* Palette */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#999', textTransform: 'uppercase', marginBottom: 8 }}>
          Palette
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 20 }}>
          {dir.palette.map(c => (
            <div key={c.hex}>
              <div style={{
                width: '100%', aspectRatio: '1', background: c.hex, borderRadius: 6,
                border: c.hex === '#FBF7EE' || c.hex === '#F4EEE2' || c.hex === '#F2ECE0' ? '1px solid rgba(0,0,0,0.08)' : 'none',
              }} />
              <div style={{ fontSize: 9, fontWeight: 600, color: '#222', marginTop: 4, fontFamily: 'ui-monospace, monospace' }}>{c.hex}</div>
              <div style={{ fontSize: 8.5, color: '#888', marginTop: 1 }}>{c.name}</div>
            </div>
          ))}
        </div>

        {/* Typography */}
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#999', textTransform: 'uppercase', marginBottom: 8 }}>
          Typography
        </div>
        <div style={{
          padding: '14px 16px', background: darkSurface ? dir.palette[0].hex : dir.palette[0].hex,
          borderRadius: 8, marginBottom: 20, border: '1px solid rgba(0,0,0,0.06)',
        }}>
          <div style={{
            fontFamily: dir.type.display.family,
            fontSize: 44, fontWeight: dir.type.display.weight, fontStyle: dir.type.display.style,
            letterSpacing: -1, lineHeight: 1,
            color: darkSurface ? dir.palette[4].hex : dir.palette[5].hex,
          }}>
            Borondo
          </div>
          <div style={{
            fontFamily: dir.type.body.family, fontSize: 13, fontWeight: 500, marginTop: 8,
            color: darkSurface ? `${dir.palette[4].hex}cc` : `${dir.palette[5].hex}cc`,
          }}>
            {dir.type.body.sample}
          </div>
          <div style={{
            fontSize: 10, color: darkSurface ? `${dir.palette[4].hex}88` : '#999',
            marginTop: 12, fontFamily: 'ui-monospace, monospace', letterSpacing: 0.5,
          }}>
            {dir.type.names}
          </div>
        </div>

        {/* Logo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#999', textTransform: 'uppercase', marginBottom: 8 }}>
              Mark
            </div>
            <div style={{
              background: darkSurface ? dir.palette[0].hex : dir.palette[0].hex,
              borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(0,0,0,0.06)', height: 96,
            }}>
              <LogoMark motif={dir.logoMotif}
                color={darkSurface ? dir.palette[4].hex : dir.palette[5].hex} size={56} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: '#999', textTransform: 'uppercase', marginBottom: 8 }}>
              Hero preview
            </div>
            <div style={{
              borderRadius: 8, overflow: 'hidden', height: 96, border: '1px solid rgba(0,0,0,0.06)',
            }}>
              <HeroMock dir={dir} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────
function App() {
  return (
    <DesignCanvas>
      {/* Intro section */}
      <div style={{
        padding: '0 60px 40px', maxWidth: 1200,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 4, color: '#999', textTransform: 'uppercase', marginBottom: 12 }}>
          BorondoTours · Brand exploration
        </div>
        <div style={{
          fontFamily: 'Fraunces, serif', fontSize: 56, fontWeight: 500, fontStyle: 'italic',
          letterSpacing: -2, lineHeight: 1, color: '#1a1a1a', marginBottom: 16,
        }}>
          Three directions.
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.55, color: '#444', maxWidth: 620, textWrap: 'pretty' }}>
          Each takes a different stance on how BorondoTours should feel — the name translates to <i>wandering freely</i>, and the question is whether we lean into reverence for Colombia's wild, marketplace energy, or editorial premium warmth. Tell me which to build out.
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 14, fontFamily: 'ui-monospace, monospace' }}>
          Pan: drag · Zoom: pinch / ⌘-scroll
        </div>
      </div>

      <DCSection title="" subtitle="" gap={32}>
        {DIRECTIONS.map((d, i) => (
          <DCArtboard key={d.name} label={d.name} width={560} height="auto" style={{ background: 'transparent', boxShadow: 'none' }}>
            <DirectionCard dir={d} index={i} />
          </DCArtboard>
        ))}
      </DCSection>

      {/* Comparison notes */}
      <div style={{ padding: '20px 60px 60px', maxWidth: 1800, display: 'flex', gap: 40 }}>
        <div style={{ flex: 1, fontFamily: 'DM Sans, sans-serif' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#999', textTransform: 'uppercase', marginBottom: 10 }}>
            How to choose
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: '#3a3a3a', textWrap: 'pretty', maxWidth: 720 }}>
            <b>01 Selva Profunda</b> if you want BorondoTours to feel like a luxury documentary — reverent, cinematic, photo-led. The premium segment will feel at home, international travelers respond to it, but some Colombians may read it as "foreign gaze."<br/><br/>
            <b>02 Borondo Vivo</b> if you want marketplace energy and joy first — saturated, friendly, visibly alive. This is the most Duolingo-adjacent, closest to Airbnb's ease. Best for dual-audience scale; weakest for ultra-premium positioning.<br/><br/>
            <b>03 Altiplano</b> if you want the magazine-quality, slow-travel premium — warm, terracotta-grounded, editorial. Splits the difference but leans sophisticated. Strong wordmark moment.
          </div>
        </div>
        <DCPostIt top={0} right={60} rotate={3} width={220}>
          My take: <b>02 Borondo Vivo</b> best hits all four personality pillars at once. But 03 has the strongest wordmark. Tell me which.
        </DCPostIt>
      </div>
    </DesignCanvas>
  );
}

Object.assign(window, { App, DIRECTIONS, LogoMark, MoodThumb, HeroMock, DirectionCard });
