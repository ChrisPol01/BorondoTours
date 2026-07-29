// Mobile tour detail screen

function MobileScreen() {
  const [lang, setLang] = React.useState('es');
  const t = lang === 'es' ? {
    back: 'Volver', save: 'Guardar',
    day: 'días', pax: 'personas', alt: 'MSNM',
    includes: 'Incluye', meeting: 'Punto de encuentro',
    price: 'Desde', per: '/ persona',
    book: 'Reservar esta aventura',
    earn: 'Gana', coins: 'Borondo Coins',
    ops: 'Operador verificado',
    desc: 'Un recorrido de dos días por el páramo de Sumapaz. Caminaremos entre frailejones centenarios con un guía naturalista local. La mejor época para avistar al Colibrí Chivito.',
    rating: 'calificación',
    reviews: 'reseñas',
  } : {
    back: 'Back', save: 'Save',
    day: 'days', pax: 'guests', alt: 'MASL',
    includes: 'Includes', meeting: 'Meeting point',
    price: 'From', per: '/ person',
    book: 'Book this adventure',
    earn: 'Earn', coins: 'Borondo Coins',
    ops: 'Verified operator',
    desc: 'A two-day trek through the Sumapaz páramo. We walk among centuries-old frailejones with a local naturalist. Best season to spot the Bearded Helmetcrest.',
    rating: 'rating',
    reviews: 'reviews',
  };

  return (
    <div style={{
      minHeight: '100vh', background: BT_COLORS.niebla,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px', fontFamily: BT_TYPE.body,
    }}>
      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start' }}>
        {/* Phone */}
        <div style={{
          width: 390, height: 844, background: BT_COLORS.hueso,
          borderRadius: 52, boxShadow: '0 40px 80px rgba(0,0,0,0.2), 0 8px 20px rgba(0,0,0,0.1)',
          border: '10px solid #1A1E1C', position: 'relative', overflow: 'hidden',
        }}>
          {/* Status bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 44,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 28px', fontSize: 15, fontWeight: 600, color: BT_COLORS.hueso,
            zIndex: 30,
          }}>
            <span>9:41</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <svg width="18" height="10" viewBox="0 0 18 10" fill="currentColor"><rect x="0" y="6" width="3" height="4" rx="0.5"/><rect x="5" y="4" width="3" height="6" rx="0.5"/><rect x="10" y="2" width="3" height="8" rx="0.5"/><rect x="15" y="0" width="3" height="10" rx="0.5"/></svg>
              <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor"><path d="M7 1.5 C3 1.5 1 3 0 4 L 7 10 L 14 4 C 13 3 11 1.5 7 1.5Z"/></svg>
              <svg width="26" height="12" viewBox="0 0 26 12" fill="none"><rect x="0.5" y="0.5" width="22" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="17" height="8" rx="1" fill="currentColor"/><rect x="23" y="4" width="2" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>
            </div>
          </div>

          {/* Hero image */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 440, overflow: 'hidden' }}>
            <ParamoScene />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(26,30,28,0.6) 0%, transparent 25%, transparent 60%, rgba(238,234,226,1) 100%)',
            }} />
            {/* Top chrome — back / save */}
            <div style={{
              position: 'absolute', top: 54, left: 16, right: 16,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <button style={{
                width: 40, height: 40, borderRadius: 999,
                background: 'rgba(247,244,236,0.2)', backdropFilter: 'blur(16px)',
                border: '1px solid rgba(247,244,236,0.3)', color: BT_COLORS.hueso,
                fontSize: 16, cursor: 'pointer',
              }}>←</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={{
                  width: 40, height: 40, borderRadius: 999,
                  background: 'rgba(247,244,236,0.2)', backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(247,244,236,0.3)', color: BT_COLORS.hueso,
                  cursor: 'pointer', fontSize: 14,
                }}>♡</button>
                <button onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
                        style={{
                          padding: '0 14px', height: 40, borderRadius: 999,
                          background: 'rgba(247,244,236,0.2)', backdropFilter: 'blur(16px)',
                          border: '1px solid rgba(247,244,236,0.3)', color: BT_COLORS.hueso,
                          fontFamily: BT_TYPE.mono, fontSize: 10, fontWeight: 700, letterSpacing: 1, cursor: 'pointer',
                        }}>{lang.toUpperCase()}</button>
              </div>
            </div>

            {/* Title over image */}
            <div style={{ position: 'absolute', bottom: 100, left: 24, right: 24, color: BT_COLORS.hueso }}>
              <div style={{ fontFamily: BT_TYPE.mono, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.8, marginBottom: 8, color: BT_COLORS.chivitoBright }}>
                Tour #007 · Páramo
              </div>
              <h2 style={{
                fontFamily: BT_TYPE.display, fontStyle: 'italic', fontWeight: 500,
                fontSize: 40, letterSpacing: -1.5, lineHeight: 0.95, margin: 0,
                textShadow: '0 2px 20px rgba(0,0,0,0.4)',
              }}>
                {lang === 'es' ? 'Donde duerme el Chivito' : 'Where the Chivito sleeps'}
              </h2>
            </div>
          </div>

          {/* Scrollable content */}
          <div style={{
            position: 'absolute', top: 420, left: 0, right: 0, bottom: 0,
            background: BT_COLORS.niebla, borderTopLeftRadius: 32, borderTopRightRadius: 32,
            padding: '24px 24px 100px', overflowY: 'auto', color: BT_COLORS.tinta,
          }}>
            {/* Stats row */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
              paddingBottom: 20, borderBottom: `1px solid ${BT_COLORS.nieblaDark}`,
            }}>
              {[
                { v: '2', u: t.day },
                { v: '4–6', u: t.pax },
                { v: '3.800', u: t.alt },
              ].map(({ v, u }) => (
                <div key={u} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: BT_TYPE.display, fontStyle: 'italic', fontSize: 24, fontWeight: 500, color: BT_COLORS.paramo }}>{v}</div>
                  <div style={{ fontFamily: BT_TYPE.mono, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: BT_COLORS.piedra, marginTop: 2 }}>{u}</div>
                </div>
              ))}
            </div>

            {/* Rating + operator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: `1px solid ${BT_COLORS.nieblaDark}` }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14 }}>★</span>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>4.92</span>
                  <span style={{ color: BT_COLORS.piedra, fontSize: 12 }}>· 247 {t.reviews}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: BT_COLORS.musgoDeep, fontWeight: 600 }}>
                <span style={{ width: 14, height: 14, borderRadius: 999, background: BT_COLORS.musgo, color: '#fff', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                {t.ops}
              </div>
            </div>

            {/* Description */}
            <div style={{ padding: '18px 0', fontSize: 14, lineHeight: 1.55, color: BT_COLORS.paramo }}>
              {t.desc}
            </div>

            {/* Coin reward */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', background: BT_COLORS.hueso,
              border: `1px solid ${BT_COLORS.nieblaDark}`, borderRadius: 12, marginBottom: 16,
            }}>
              <BorondoCoin size={52} value="V" rim="#9E1B2E" />
              <div>
                <div style={{ fontSize: 12, color: BT_COLORS.piedra, fontWeight: 500 }}>{t.earn}</div>
                <div style={{ fontFamily: BT_TYPE.display, fontStyle: 'italic', fontSize: 20, fontWeight: 500, color: BT_COLORS.tinta, lineHeight: 1 }}>
                  5 {t.coins}
                </div>
              </div>
            </div>

            {/* Day itinerary teaser */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: BT_TYPE.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', color: BT_COLORS.piedra, marginBottom: 10 }}>
                {lang === 'es' ? 'Itinerario' : 'Itinerary'}
              </div>
              {[
                { d: lang === 'es' ? 'Día 1' : 'Day 1', t: lang === 'es' ? 'Ascenso · Frailejones centenarios' : 'Ascent · Century-old frailejones', tm: '06:00' },
                { d: lang === 'es' ? 'Día 2' : 'Day 2', t: lang === 'es' ? 'Avistamiento · Cumbre del páramo' : 'Spotting · Páramo summit', tm: '05:30' },
              ].map(({ d, t, tm }) => (
                <div key={d} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: `1px solid ${BT_COLORS.nieblaDark}` }}>
                  <div style={{ fontFamily: BT_TYPE.mono, fontSize: 11, color: BT_COLORS.chivito, letterSpacing: 1, width: 50, fontWeight: 600 }}>{tm}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: BT_COLORS.piedra, fontFamily: BT_TYPE.mono, letterSpacing: 1, textTransform: 'uppercase' }}>{d}</div>
                    <div style={{ fontSize: 14, color: BT_COLORS.tinta, marginTop: 2 }}>{t}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom price + CTA — sticky */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '14px 20px 28px', background: BT_COLORS.hueso,
            borderTop: `1px solid ${BT_COLORS.nieblaDark}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 10, color: BT_COLORS.piedra, fontFamily: BT_TYPE.mono, letterSpacing: 1.5, textTransform: 'uppercase' }}>{t.price}</div>
              <div style={{ fontFamily: BT_TYPE.display, fontStyle: 'italic', fontSize: 26, fontWeight: 500, color: BT_COLORS.tinta, lineHeight: 1 }}>
                $680.000 <span style={{ fontSize: 12, color: BT_COLORS.piedra, fontStyle: 'normal', fontFamily: BT_TYPE.body }}>{t.per}</span>
              </div>
            </div>
            <button style={{
              flex: 1, padding: '14px 20px',
              background: BT_COLORS.tinta, color: BT_COLORS.hueso, border: 'none', borderRadius: 999,
              fontFamily: BT_TYPE.body, fontWeight: 700, fontSize: 14, cursor: 'pointer',
              maxWidth: 180,
            }}>{t.book}</button>
          </div>

          {/* Home indicator */}
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, borderRadius: 999, background: '#1A1E1C' }} />
        </div>

        {/* Annotation card */}
        <div style={{
          width: 300, padding: 28, background: BT_COLORS.hueso,
          borderRadius: 16, border: `1px solid ${BT_COLORS.nieblaDark}`,
        }}>
          <div style={{ fontFamily: BT_TYPE.mono, fontSize: 10, letterSpacing: 2.5, textTransform: 'uppercase', color: BT_COLORS.piedra, marginBottom: 10 }}>
            Mobile · Tour detail
          </div>
          <div style={{ fontFamily: BT_TYPE.display, fontStyle: 'italic', fontSize: 28, fontWeight: 500, lineHeight: 1, color: BT_COLORS.tinta, marginBottom: 14 }}>
            Wander, curated.
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.55, color: BT_COLORS.paramo, textWrap: 'pretty' }}>
            Pantalla de detalle del tour. Glass nav, hero con escena del páramo, stats, moneda Borondo con diseño de coin + rostro del Chivito, itinerario, y CTA sticky con precio.
          </div>
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: `1px solid ${BT_COLORS.nieblaDark}`, display: 'grid', gap: 8, fontSize: 12, color: BT_COLORS.piedra }}>
            <div>→ Tap <b style={{ color: BT_COLORS.tinta }}>{lang.toUpperCase()}</b> para cambiar idioma</div>
            <div>→ Moneda <b style={{ color: BT_COLORS.tinta }}>V</b> (rubí) se gana al completar</div>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
            <a href="Brand Guidelines.html" style={{ fontSize: 11, color: BT_COLORS.paramo, fontFamily: BT_TYPE.mono, letterSpacing: 1 }}>← BRAND</a>
            <a href="Landing.html" style={{ fontSize: 11, color: BT_COLORS.paramo, fontFamily: BT_TYPE.mono, letterSpacing: 1 }}>LANDING →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MobileScreen });
