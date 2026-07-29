// Hero scenes for scrolltelling
// Each scene = a CSS/SVG "placeholder" for the eventual video.
// They suggest páramo → selva → costa → cafetal progressions.

function ParamoScene({ progress = 0 }) {
  // Misty páramo — frailejones, fog, distant mountains
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          #B8BFB8 0%,
          #8E9890 35%,
          #5E685E 65%,
          #3E4540 100%)`,
      }} />
      {/* Distant mountains */}
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
        {/* Far layer */}
        <path d="M0 620 L200 520 L400 580 L600 480 L800 560 L1000 470 L1200 540 L1400 460 L1600 530 L1800 450 L1920 510 L1920 1080 L0 1080 Z"
              fill="#6C7970" opacity="0.7" />
        {/* Mid layer */}
        <path d="M0 720 L180 640 L360 700 L540 620 L720 700 L900 600 L1080 680 L1260 600 L1440 680 L1620 620 L1800 700 L1920 660 L1920 1080 L0 1080 Z"
              fill="#4E5C54" opacity="0.85" />
        {/* Near layer */}
        <path d="M0 820 L160 780 L320 820 L480 760 L640 810 L800 740 L960 800 L1120 760 L1280 820 L1440 770 L1600 820 L1760 790 L1920 830 L1920 1080 L0 1080 Z"
              fill="#2D3626" />
        {/* Frailejones silhouettes */}
        {Array.from({ length: 14 }).map((_, i) => {
          const x = 60 + i * 140 + (i % 2) * 30;
          const scale = 0.5 + ((i * 7) % 5) * 0.15;
          return (
            <g key={i} transform={`translate(${x} ${820 + (i % 3) * 20}) scale(${scale})`} fill="#1F2A22" opacity="0.9">
              <rect x="-4" y="0" width="8" height="120" />
              {[0, 40, 80, 120, 160, 200, 240, 280, 320].map(a => (
                <ellipse key={a} cx="0" cy="-4" rx="6" ry="18" transform={`rotate(${a})`} />
              ))}
              <circle r="9" />
            </g>
          );
        })}
      </svg>
      {/* Fog overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 60%, transparent 0%, rgba(232,228,220,0.5) 80%)`,
        mixBlendMode: 'screen',
      }} />
      {/* Drifting fog */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, rgba(238,234,226,0.35) 0%, transparent 50%, rgba(238,234,226,0.2) 100%)`,
        animation: 'fogDrift 20s ease-in-out infinite alternate',
      }} />
    </div>
  );
}

function SelvaScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, #2D3626 0%, #1A241A 50%, #0D1410 100%)`,
      }} />
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
        {/* Canopy */}
        <g>
          {Array.from({ length: 40 }).map((_, i) => {
            const x = (i * 70) % 2000;
            const y = -20 + (i % 3) * 60;
            const r = 80 + (i % 4) * 30;
            return <circle key={i} cx={x} cy={y} r={r} fill="#1F2A22" opacity={0.7 + (i % 3) * 0.1} />;
          })}
        </g>
        {/* Mid leaves */}
        {Array.from({ length: 25 }).map((_, i) => {
          const x = (i * 95) % 1920;
          const y = 200 + (i % 4) * 80;
          return (
            <g key={i} transform={`translate(${x} ${y})`}>
              <path d={`M 0 0 Q 40 -20 60 30 Q 50 60 0 40 Z`} fill="#3E4A38" opacity="0.8" />
            </g>
          );
        })}
        {/* Light rays */}
        <path d="M800 0 L820 0 L900 1080 L840 1080 Z" fill="#D4C896" opacity="0.1" />
        <path d="M1200 0 L1220 0 L1280 1080 L1220 1080 Z" fill="#D4C896" opacity="0.08" />
      </svg>
    </div>
  );
}

function CostaScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          #F0DAB8 0%,
          #E8C89A 25%,
          #7FB8C8 50%,
          #4A8CA8 75%,
          #2A5268 100%)`,
      }} />
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
        <circle cx="1450" cy="220" r="80" fill="#F4E4B8" opacity="0.9" />
        <circle cx="1450" cy="220" r="140" fill="#F4E4B8" opacity="0.25" />
        {/* Horizon line */}
        <line x1="0" y1="540" x2="1920" y2="540" stroke="#2A5268" strokeWidth="1" opacity="0.5" />
        {/* Wave ripples */}
        {[560, 600, 640, 680, 720, 760].map((y, i) => (
          <path key={y} d={`M 0 ${y} Q 480 ${y - 6 + (i % 2) * 12} 960 ${y} T 1920 ${y}`}
                stroke="#F0DAB8" strokeWidth="1" fill="none" opacity={0.3 - i * 0.04} />
        ))}
        {/* Palm silhouettes */}
        <g transform="translate(200 900)" fill="#1A1E1C" opacity="0.85">
          <rect x="-6" y="-240" width="12" height="240" />
          <path d="M 0 -240 Q -60 -300 -120 -280 Q -80 -260 -10 -240" />
          <path d="M 0 -240 Q 60 -300 120 -280 Q 80 -260 10 -240" />
          <path d="M 0 -240 Q -80 -220 -140 -180 Q -60 -220 -10 -240" />
          <path d="M 0 -240 Q 80 -220 140 -180 Q 60 -220 10 -240" />
        </g>
        {/* Sand */}
        <path d="M 0 900 Q 960 870 1920 900 L 1920 1080 L 0 1080 Z" fill="#E8C89A" />
      </svg>
    </div>
  );
}

function CafetalScene() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg,
          #F4D49C 0%,
          #D9A968 25%,
          #8B6C3E 55%,
          #4E5C3E 100%)`,
      }} />
      <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
        {/* Rolling hills — Quindío */}
        <path d="M0 500 Q 240 420 480 480 T 960 450 T 1440 470 T 1920 440 L 1920 700 L 0 700 Z"
              fill="#7A8F5E" opacity="0.85" />
        <path d="M0 620 Q 300 560 600 600 T 1200 580 T 1920 600 L 1920 800 L 0 800 Z"
              fill="#4E5C3E" opacity="0.9" />
        {/* Rows of coffee plants — diagonal stripes */}
        {Array.from({ length: 30 }).map((_, i) => (
          <line key={i}
                x1={-200 + i * 80} y1="800"
                x2={-200 + i * 80 + 200} y2="1080"
                stroke="#2D3626" strokeWidth="2" opacity="0.35" />
        ))}
        {/* Hacienda silhouette */}
        <g transform="translate(1400 540)" fill="#1A1E1C" opacity="0.85">
          <rect x="0" y="0" width="80" height="60" />
          <path d="M-10 0 L 40 -30 L 90 0 Z" />
          <rect x="12" y="20" width="12" height="20" fill="#B89448" />
          <rect x="54" y="20" width="12" height="20" fill="#B89448" />
        </g>
      </svg>
      {/* Warm glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 40%, rgba(245,179,66,0.35) 0%, transparent 60%)`,
      }} />
    </div>
  );
}

const SCENES = [
  { id: 'paramo', Comp: ParamoScene,
    eyebrow: 'Capítulo 01 · Páramo',
    title: 'Donde el Chivito vive.',
    sub: 'A 3.500 metros, entre niebla y frailejones, comienza todo.',
    stat: '2.800 MSNM · 4°C',
    lang: { en: { title: 'Where the Chivito lives.', sub: 'At 3,500 meters, among fog and frailejones, it all begins.' } },
  },
  { id: 'selva', Comp: SelvaScene,
    eyebrow: 'Capítulo 02 · Selva',
    title: 'Donde el río habla.',
    sub: 'El Amazonas colombiano: 1.600 especies de aves, 40.000 de plantas.',
    stat: '12 días · 6 PAX',
    lang: { en: { title: 'Where the river speaks.', sub: 'Colombian Amazon: 1,600 bird species, 40,000 plants.' } },
  },
  { id: 'costa', Comp: CostaScene,
    eyebrow: 'Capítulo 03 · Costa',
    title: 'Donde el mar canta.',
    sub: 'Palomino, Tayrona, La Guajira — donde la selva toca el Caribe.',
    stat: 'Nivel del mar · 32°C',
    lang: { en: { title: 'Where the sea sings.', sub: 'Palomino, Tayrona, La Guajira — where jungle meets Caribbean.' } },
  },
  { id: 'cafetal', Comp: CafetalScene,
    eyebrow: 'Capítulo 04 · Cafetal',
    title: 'Donde el tiempo se tuesta.',
    sub: 'Haciendas del Eje Cafetero — Quindío, Risaralda, Caldas.',
    stat: '1.400 MSNM · Cosecha',
    lang: { en: { title: 'Where time slow-roasts.', sub: 'Coffee axis haciendas — Quindío, Risaralda, Caldas.' } },
  },
];

Object.assign(window, { SCENES, ParamoScene, SelvaScene, CostaScene, CafetalScene });
