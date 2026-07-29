// Landing page — scrolltelling with glass navbar

function GlassNav({ lang, setLang }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 20, left: 20, right: 20, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 22px',
      background: 'rgba(247, 244, 236, 0.12)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: '1px solid rgba(247, 244, 236, 0.25)',
      borderRadius: 999,
      boxShadow: scrolled
        ? '0 12px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(255,255,255,0.1)'
        : '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.4)',
      transition: 'all 0.4s ease',
      color: '#F7F4EC',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ChivitoFrontal size={36} color="#F7F4EC" beardColor="#2DE5A8" />
        <div style={{
          fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 500,
          fontSize: 22, letterSpacing: -0.5, lineHeight: 1,
        }}>
          Borondo<span style={{ marginLeft: 4 }}>Tours</span>
        </div>
      </div>

      {/* Menu */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 36,
        fontFamily: 'Instrument Sans, sans-serif', fontSize: 14, fontWeight: 500,
      }}>
        {[
          { es: 'Tours', en: 'Tours' },
          { es: 'Operadores', en: 'Operators' },
          { es: 'Coins', en: 'Coins' },
          { es: 'Diario', en: 'Journal' },
        ].map((item, i) => (
          <a key={i} href="#" style={{ color: '#F7F4EC', textDecoration: 'none', opacity: 0.9 }}
             onMouseEnter={e => e.target.style.opacity = '1'}
             onMouseLeave={e => e.target.style.opacity = '0.9'}>
            {item[lang]}
          </a>
        ))}
      </div>

      {/* Right — lang + CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
                style={{
                  background: 'rgba(247,244,236,0.1)',
                  border: '1px solid rgba(247,244,236,0.2)',
                  color: '#F7F4EC',
                  padding: '6px 12px', borderRadius: 999,
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600,
                  letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase',
                }}>
          {lang === 'es' ? 'ES · EN' : 'EN · ES'}
        </button>
        <button style={{
          background: 'linear-gradient(135deg, #2DE5A8 0%, #00B88A 100%)',
          color: '#1A1E1C', border: 'none',
          padding: '10px 20px', borderRadius: 999,
          fontFamily: 'Instrument Sans, sans-serif', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', letterSpacing: 0.2,
          boxShadow: '0 4px 16px rgba(0,184,138,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}>
          {lang === 'es' ? 'Reservar' : 'Book now'}
        </button>
      </div>
    </nav>
  );
}

function Landing() {
  const [lang, setLang] = React.useState('es');
  const [activeScene, setActiveScene] = React.useState(0);

  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = window.innerHeight;
      const idx = Math.min(Math.floor(y / h), SCENES.length - 1);
      setActiveScene(Math.max(0, idx));
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ background: BT_COLORS.tinta, minHeight: '500vh', color: BT_COLORS.hueso, fontFamily: BT_TYPE.body }}>
      <GlassNav lang={lang} setLang={setLang} />

      {/* Fixed scene stage */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1 }}>
        {SCENES.map((s, i) => (
          <div key={s.id} style={{
            position: 'absolute', inset: 0,
            opacity: activeScene === i ? 1 : 0,
            transition: 'opacity 1.2s cubic-bezier(.4,0,.2,1)',
          }}>
            <s.Comp />
          </div>
        ))}
        {/* Bottom fade for legibility */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 40%, rgba(26,30,28,0.55) 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Scroll-synced text overlays */}
      {SCENES.map((s, i) => (
        <section key={s.id} style={{
          position: 'relative', zIndex: 10,
          height: '100vh', padding: '0 80px',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          pointerEvents: 'none',
        }}>
          <div style={{
            maxWidth: 820, marginBottom: 100,
            opacity: activeScene === i ? 1 : 0,
            transform: activeScene === i ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s cubic-bezier(.4,0,.2,1)',
            pointerEvents: 'auto',
          }}>
            <div style={{
              fontFamily: BT_TYPE.mono, fontSize: 12, letterSpacing: 4,
              textTransform: 'uppercase', color: BT_COLORS.chivitoBright, marginBottom: 20,
            }}>{s.eyebrow}</div>
            <h2 style={{
              fontFamily: BT_TYPE.display, fontStyle: 'italic', fontWeight: 500,
              fontSize: 120, letterSpacing: -4, lineHeight: 0.92,
              margin: 0, color: BT_COLORS.hueso,
              textShadow: '0 4px 40px rgba(0,0,0,0.4)',
              textWrap: 'balance',
            }}>
              {lang === 'es' ? s.title : (s.lang.en?.title || s.title)}
            </h2>
            <p style={{
              fontSize: 20, lineHeight: 1.45, margin: '24px 0 32px',
              maxWidth: 620, color: BT_COLORS.niebla,
              textShadow: '0 2px 12px rgba(0,0,0,0.4)',
            }}>
              {lang === 'es' ? s.sub : (s.lang.en?.sub || s.sub)}
            </p>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
              <button style={{
                padding: '14px 28px', borderRadius: 999,
                background: 'rgba(247,244,236,0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(247,244,236,0.3)',
                color: BT_COLORS.hueso,
                fontFamily: BT_TYPE.body, fontSize: 14, fontWeight: 600,
                cursor: 'pointer', letterSpacing: 0.3,
              }}>
                {lang === 'es' ? 'Ver este tour →' : 'See this tour →'}
              </button>
              <div style={{
                fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 2,
                color: BT_COLORS.nieblaDark, textTransform: 'uppercase',
              }}>{s.stat}</div>
            </div>
          </div>
        </section>
      ))}

      {/* Scene indicator */}
      <div style={{
        position: 'fixed', right: 40, top: '50%', transform: 'translateY(-50%)',
        zIndex: 50, display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        {SCENES.map((s, i) => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            color: BT_COLORS.hueso,
          }}>
            <div style={{
              width: activeScene === i ? 40 : 20, height: 2,
              background: activeScene === i ? BT_COLORS.chivitoBright : 'rgba(247,244,236,0.35)',
              transition: 'all 0.4s ease',
            }} />
            <div style={{
              fontFamily: BT_TYPE.mono, fontSize: 10, letterSpacing: 2,
              textTransform: 'uppercase',
              opacity: activeScene === i ? 1 : 0.5,
              transition: 'opacity 0.4s ease',
            }}>{`0${i + 1} · ${s.id}`}</div>
          </div>
        ))}
      </div>

      {/* Scroll hint on first scene */}
      <div style={{
        position: 'fixed', bottom: 40, left: '50%', transform: 'translateX(-50%)',
        zIndex: 50, color: BT_COLORS.hueso, textAlign: 'center',
        opacity: activeScene === 0 ? 0.85 : 0,
        transition: 'opacity 0.6s ease',
        fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
      }}>
        <div style={{ marginBottom: 12 }}>{lang === 'es' ? 'Desliza para viajar' : 'Scroll to journey'}</div>
        <div style={{
          width: 1, height: 32, background: BT_COLORS.chivitoBright, margin: '0 auto',
          animation: 'scrollLine 1.6s ease-in-out infinite',
        }} />
      </div>

      <style>{`
        @keyframes scrollLine { 0% { transform: scaleY(0); transform-origin: top; } 50% { transform: scaleY(1); transform-origin: top; } 51% { transform-origin: bottom; } 100% { transform: scaleY(0); transform-origin: bottom; } }
        @keyframes fogDrift { 0% { transform: translateX(-5%); } 100% { transform: translateX(5%); } }
      `}</style>
    </div>
  );
}

Object.assign(window, { Landing, GlassNav });
