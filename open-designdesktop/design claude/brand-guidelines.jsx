// Brand guidelines scrollable page

function Section({ eyebrow, title, children, dark = false, style = {} }) {
  return (
    <section style={{
      padding: '120px 80px', position: 'relative',
      background: dark ? BT_COLORS.paramo : BT_COLORS.niebla,
      color: dark ? BT_COLORS.hueso : BT_COLORS.tinta,
      ...style,
    }}>
      {eyebrow && (
        <div style={{
          fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 4,
          textTransform: 'uppercase', opacity: 0.6, marginBottom: 16,
        }}>{eyebrow}</div>
      )}
      {title && (
        <h2 style={{
          fontFamily: BT_TYPE.display, fontWeight: 500, fontStyle: 'italic',
          fontSize: 72, letterSpacing: -2, lineHeight: 0.95, margin: '0 0 48px',
          maxWidth: 900, textWrap: 'balance',
        }}>{title}</h2>
      )}
      {children}
    </section>
  );
}

function BrandGuidelines() {
  return (
    <div style={{
      background: BT_COLORS.niebla, color: BT_COLORS.tinta,
      fontFamily: BT_TYPE.body, minHeight: '100vh',
    }}>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', padding: '64px 80px 80px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden',
        background: `linear-gradient(180deg, ${BT_COLORS.niebla} 0%, ${BT_COLORS.nieblaDark} 100%)`,
      }}>
        {/* Top meta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: BT_TYPE.mono, fontSize: 12, letterSpacing: 3, textTransform: 'uppercase' }}>
            Borondo Tours
          </div>
          <div style={{ display: 'flex', gap: 24, fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.6 }}>
            <span>Brand System v1.0</span>
            <span>Colombia · 2026</span>
          </div>
        </div>

        {/* Center — giant wordmark */}
        <div style={{ textAlign: 'center', margin: '60px 0' }}>
          <div style={{ marginBottom: 40, display: 'flex', justifyContent: 'center' }}>
            <BorondoWordmark size={160} color={BT_COLORS.tinta} beardColor={BT_COLORS.chivito} />
          </div>
          <div style={{
            fontFamily: BT_TYPE.display, fontStyle: 'italic', fontWeight: 400,
            fontSize: 28, color: BT_COLORS.paramo, letterSpacing: -0.5,
            maxWidth: 720, margin: '0 auto', lineHeight: 1.3, textWrap: 'balance',
          }}>
            Wander Colombia, freely.
            <span style={{ display: 'block', fontSize: 18, marginTop: 10, color: BT_COLORS.piedra, fontStyle: 'normal', fontFamily: BT_TYPE.body }}>
              Un sistema de marca inspirado en el páramo y su habitante más emblemático — el Colibrí Chivito.
            </span>
          </div>
        </div>

        {/* Bottom — index */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 24, fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.75 }}>
          {['01 · Marca', '02 · Logo', '03 · Color', '04 · Tipografía', '05 · Coin', '06 · Aplicaciones'].map(x => (
            <div key={x} style={{ borderTop: `1px solid ${BT_COLORS.paramo}`, paddingTop: 12 }}>{x}</div>
          ))}
        </div>

        {/* Floating Chivito illustration in bg — side-facing reference */}
        <div style={{
          position: 'absolute', right: -120, top: '20%',
          width: 720, height: 720, opacity: 0.14, pointerEvents: 'none',
          backgroundImage: 'url(assets/chivito-side.png)',
          backgroundSize: 'contain', backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          mixBlendMode: 'multiply',
        }} />
        <div style={{
          position: 'absolute', left: -80, bottom: '-5%',
          width: 480, height: 480, opacity: 0.08, pointerEvents: 'none',
          backgroundImage: 'url(assets/chivito-front.png)',
          backgroundSize: 'contain', backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          mixBlendMode: 'multiply',
          transform: 'scaleX(-1)',
        }} />
      </section>

      {/* ── 01 — MANIFESTO ─────────────────────────────────── */}
      <Section eyebrow="01 · Manifiesto" title="El Chivito vive donde pocos llegan.">
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 80, alignItems: 'start' }}>
          <div style={{ fontSize: 20, lineHeight: 1.6, color: BT_COLORS.paramo, textWrap: 'pretty', maxWidth: 640 }}>
            <p>El <b>Oxypogon guerinii</b> — el Colibrí Chivito — es endémico del páramo colombiano. Vive a 3.500 metros entre frailejones, niebla y vientos fríos. Su barba iridiscente verde y blanca lo hace imposible de confundir.</p>
            <p>Borondo Tours lleva su nombre: una invitación a <i>dar un paseo sin rumbo fijo</i>. Nuestra marca es ese espíritu — cálido como un amigo local que conoce los senderos, preciso como un naturalista, y respetuoso con cada rincón del país al que llegamos.</p>
            <p style={{ fontFamily: BT_TYPE.display, fontStyle: 'italic', fontSize: 28, lineHeight: 1.35, color: BT_COLORS.tinta, marginTop: 32 }}>
              "No vendemos tours. Abrimos senderos."
            </p>
          </div>

          {/* Pillars */}
          <div style={{ display: 'grid', gap: 16 }}>
            {[
              { k: 'Cálido', d: 'Hablamos como un parcero, no como un folleto.' },
              { k: 'Curioso', d: 'Cada destino es una pregunta, no un itinerario.' },
              { k: 'Reverente', d: 'El páramo y la selva no son fondos — son protagonistas.' },
              { k: 'Preciso', d: 'Operadores verificados. Información real. Sin filtros.' },
            ].map(({ k, d }) => (
              <div key={k} style={{
                padding: '20px 24px', background: BT_COLORS.hueso,
                border: `1px solid ${BT_COLORS.nieblaDark}`, borderRadius: 12,
              }}>
                <div style={{ fontFamily: BT_TYPE.display, fontStyle: 'italic', fontSize: 24, color: BT_COLORS.musgoDeep, marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: 14, color: BT_COLORS.piedra, lineHeight: 1.5 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── 02 — LOGO ──────────────────────────────────────── */}
      <Section eyebrow="02 · Logo system" title="Cinco expresiones del Chivito.">
        <div style={{ fontSize: 16, color: BT_COLORS.paramo, maxWidth: 620, marginBottom: 48, lineHeight: 1.55 }}>
          El sistema tiene dos lockups principales — <b>wordmark con la O del Chivito</b> para uso institucional, e <b>ícono aislado</b> para aplicaciones compactas. Debajo, cinco estilos del ave adaptables al contexto.
        </div>

        {/* Primary wordmark */}
        <div style={{
          padding: 64, background: BT_COLORS.hueso, borderRadius: 16,
          border: `1px solid ${BT_COLORS.nieblaDark}`, marginBottom: 24,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
        }}>
          <div style={{ fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: BT_COLORS.piedra }}>
            Wordmark primario · O con el Chivito
          </div>
          <BorondoWordmark size={140} color={BT_COLORS.tinta} beardColor={BT_COLORS.chivito} />
        </div>

        {/* Alt lockups */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 }}>
          <div style={{ padding: 48, background: BT_COLORS.paramo, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
            <BorondoWordmark size={64} stacked color={BT_COLORS.hueso} beardColor={BT_COLORS.chivitoBright} />
          </div>
          <div style={{ padding: 48, background: BT_COLORS.tinta, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220, gap: 20 }}>
            <ChivitoFrontal size={80} color={BT_COLORS.hueso} beardColor={BT_COLORS.chivitoBright} />
            <div style={{
              fontFamily: BT_TYPE.display, fontStyle: 'italic', fontWeight: 500,
              fontSize: 44, color: BT_COLORS.hueso, letterSpacing: -1, lineHeight: 0.9,
            }}>
              Borondo<br/>Tours
            </div>
          </div>
        </div>

        {/* 5 bird styles */}
        <div style={{ fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: BT_COLORS.piedra, marginBottom: 16 }}>
          Ícono · Cinco tratamientos
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {[
            { name: 'Line art', Comp: ChivitoLineArt },
            { name: 'Silueta', Comp: ChivitoSilhouette },
            { name: 'Emblema', Comp: ChivitoEmblem },
            { name: 'Detallado', Comp: ChivitoDetailed },
            { name: 'Frontal', Comp: ChivitoFrontal },
          ].map(({ name, Comp }) => (
            <div key={name}>
              <div style={{
                padding: 20, background: BT_COLORS.hueso, borderRadius: 12,
                border: `1px solid ${BT_COLORS.nieblaDark}`, aspectRatio: '1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Comp size={120} color={BT_COLORS.tinta} beardColor={BT_COLORS.chivito} />
              </div>
              <div style={{ marginTop: 10, fontFamily: BT_TYPE.body, fontSize: 12, fontWeight: 600 }}>{name}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 03 — COLOR ────────────────────────────────────── */}
      <Section eyebrow="03 · Paleta" title="Fríos del páramo, cálidos del liquen, iridiscente del Chivito." dark>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 32 }}>
          <Swatch name="Niebla" hex={BT_COLORS.niebla} role="Fondo principal" />
          <Swatch name="Hueso" hex={BT_COLORS.hueso} role="Fondo claro" />
          <Swatch name="Piedra" hex={BT_COLORS.piedra} role="Gris medio" />
          <Swatch name="Páramo" hex={BT_COLORS.paramo} role="Primario oscuro" />
          <Swatch name="Tinta" hex={BT_COLORS.tinta} role="Texto" />
          <Swatch name="Musgo" hex={BT_COLORS.musgo} role="Verde natural" />
        </div>
        <div style={{ fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: BT_COLORS.nieblaDark, marginBottom: 16, opacity: 0.7 }}>
          Acento · Solo 5% de la composición
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
          <div style={{
            background: BT_IRIDESCENT, height: 140, borderRadius: 12,
            padding: 20, color: BT_COLORS.hueso, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          }}>
            <div style={{ fontFamily: BT_TYPE.mono, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', opacity: 0.9 }}>
              Gradiente iridiscente
            </div>
            <div style={{ fontFamily: BT_TYPE.display, fontStyle: 'italic', fontSize: 24, fontWeight: 500 }}>
              Barba del Chivito
            </div>
          </div>
          <Swatch name="Chivito" hex={BT_COLORS.chivito} role="Iridiscente · acento" />
          <Swatch name="Liquen" hex={BT_COLORS.liquenGold} role="Ocre cálido" />
        </div>

        {/* Color ratio explanation */}
        <div style={{
          padding: '24px 32px', background: 'rgba(247,244,236,0.08)',
          borderRadius: 12, fontSize: 14, color: BT_COLORS.nieblaDark, lineHeight: 1.7,
        }}>
          <b>Proporción:</b> 60% neutros (niebla / hueso / piedra) · 30% páramo + tinta · 5% musgo · 5% chivito iridiscente.
          El verde iridiscente es <i>solo acento</i>. Nunca es el fondo principal — es el detalle brillante que hace que el sistema se sienta vivo.
        </div>
      </Section>

      {/* ── 04 — TYPE ─────────────────────────────────────── */}
      <Section eyebrow="04 · Tipografía" title="Fraunces para el alma. Instrument Sans para la voz.">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 48 }}>
          <div style={{ padding: 48, background: BT_COLORS.hueso, borderRadius: 16, border: `1px solid ${BT_COLORS.nieblaDark}` }}>
            <div style={{ fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: BT_COLORS.piedra, marginBottom: 24 }}>
              Display · Fraunces
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontWeight: 500, fontSize: 96, lineHeight: 0.9, letterSpacing: -3, color: BT_COLORS.tinta }}>
              Aa Bb
            </div>
            <div style={{ fontFamily: 'Fraunces, serif', fontStyle: 'italic', fontSize: 32, fontWeight: 400, lineHeight: 1.2, color: BT_COLORS.paramo, marginTop: 20 }}>
              Camina sin rumbo fijo.
            </div>
            <div style={{ fontFamily: BT_TYPE.mono, fontSize: 10, color: BT_COLORS.piedra, marginTop: 32, letterSpacing: 1 }}>
              400 / 500 / 600 / 700 · italic · variable opsz 9..144
            </div>
          </div>
          <div style={{ padding: 48, background: BT_COLORS.hueso, borderRadius: 16, border: `1px solid ${BT_COLORS.nieblaDark}` }}>
            <div style={{ fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: BT_COLORS.piedra, marginBottom: 24 }}>
              Body · Instrument Sans
            </div>
            <div style={{ fontFamily: BT_TYPE.body, fontWeight: 600, fontSize: 96, lineHeight: 0.9, letterSpacing: -2, color: BT_COLORS.tinta }}>
              Aa Bb
            </div>
            <div style={{ fontFamily: BT_TYPE.body, fontSize: 20, fontWeight: 500, lineHeight: 1.4, color: BT_COLORS.paramo, marginTop: 20 }}>
              El ritmo del páramo. La precisión del mapa.
            </div>
            <div style={{ fontFamily: BT_TYPE.mono, fontSize: 10, color: BT_COLORS.piedra, marginTop: 32, letterSpacing: 1 }}>
              400 / 500 / 600 / 700
            </div>
          </div>
        </div>

        {/* Scale */}
        <div style={{ fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: BT_COLORS.piedra, marginBottom: 24 }}>
          Escala tipográfica
        </div>
        <div style={{ display: 'grid', gap: 4 }}>
          {[
            { tag: 'H1', size: 80, weight: 500, family: 'display', italic: true, label: 'Senderos ocultos' },
            { tag: 'H2', size: 56, weight: 500, family: 'display', italic: true, label: 'Descubre Colombia' },
            { tag: 'H3', size: 32, weight: 600, family: 'body', label: 'Tours curados por locales' },
            { tag: 'H4', size: 22, weight: 600, family: 'body', label: 'Páramo de Sumapaz · 2 días' },
            { tag: 'Body', size: 16, weight: 400, family: 'body', label: 'Un paseo sin rumbo que termina encontrando exactamente lo que buscabas.' },
            { tag: 'Small', size: 12, weight: 500, family: 'mono', label: 'BOR-001 · 2.800 MSNM · 4 PAX' },
          ].map(({ tag, size, weight, family, italic, label }) => (
            <div key={tag} style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 24, alignItems: 'baseline', padding: '16px 0', borderBottom: `1px solid ${BT_COLORS.nieblaDark}` }}>
              <div style={{ fontFamily: BT_TYPE.mono, fontSize: 11, color: BT_COLORS.piedra, letterSpacing: 1 }}>{tag}</div>
              <div style={{
                fontFamily: family === 'display' ? BT_TYPE.display : family === 'mono' ? BT_TYPE.mono : BT_TYPE.body,
                fontSize: size, fontWeight: weight, fontStyle: italic ? 'italic' : 'normal',
                letterSpacing: size > 40 ? -1.5 : 0, lineHeight: 1.1, color: BT_COLORS.tinta,
              }}>{label}</div>
              <div style={{ fontFamily: BT_TYPE.mono, fontSize: 10, color: BT_COLORS.piedra }}>{size}px / {weight}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── 05 — COIN ─────────────────────────────────────── */}
      <Section eyebrow="05 · Borondo Coin" title="La moneda del explorador." dark style={{ background: BT_COLORS.tinta }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 18, lineHeight: 1.6, color: BT_COLORS.nieblaDark, textWrap: 'pretty' }}>
              <p>Los <b style={{ color: BT_COLORS.chivitoBright }}>Borondo Coins</b> son la recompensa por cada aventura. Se acumulan al completar tours, reseñar operadores, o referir amigos.</p>
              <p>Tres denominaciones en rojo metálico — <b>I</b> (vino) por acciones simples, <b>V</b> (rubí) por tours completos, <b>X</b> (cereza) por hitos de viajero. Canjeables en descuentos, upgrades, o experiencias exclusivas.</p>
              <p style={{ marginTop: 32, fontFamily: BT_TYPE.display, fontStyle: 'italic', fontSize: 26, color: BT_COLORS.hueso }}>
                Cada moneda lleva el rostro del Chivito — porque cada paseo es un encuentro con lo endémico.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, alignItems: 'center' }}>
            <BorondoCoin size={140} value="I" rim="#6E1420" />
            <BorondoCoin size={180} value="V" rim="#9E1B2E" />
            <BorondoCoin size={140} value="X" rim="#C41E3A" />
          </div>
        </div>
      </Section>

      {/* ── 06 — PATTERN + APPLICATIONS ───────────────────── */}
      <Section eyebrow="06 · Aplicaciones" title="Patrón y aplicaciones.">
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: BT_COLORS.piedra, marginBottom: 16 }}>
            Patrón · Frailejones + curvas topográficas
          </div>
          <div style={{ borderRadius: 16, overflow: 'hidden', border: `1px solid ${BT_COLORS.nieblaDark}` }}>
            <BrandPattern width={1400} height={240} />
          </div>
        </div>

        {/* Applications grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {/* Business card */}
          <div>
            <div style={{ fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: BT_COLORS.piedra, marginBottom: 12 }}>
              Tarjeta
            </div>
            <div style={{
              aspectRatio: '1.7', background: BT_COLORS.paramo, borderRadius: 12, padding: 24,
              color: BT_COLORS.hueso, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              position: 'relative', overflow: 'hidden', boxShadow: BT_SHADOW.med,
            }}>
              <div style={{ position: 'absolute', right: -30, top: -30, opacity: 0.15 }}>
                <ChivitoDetailed size={200} color={BT_COLORS.hueso} beardColor={BT_COLORS.chivitoBright} />
              </div>
              <BorondoWordmark size={28} color={BT_COLORS.hueso} beardColor={BT_COLORS.chivitoBright} />
              <div>
                <div style={{ fontFamily: BT_TYPE.display, fontStyle: 'italic', fontSize: 18, fontWeight: 500 }}>Valentina Ríos</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>Route Curator · Páramo</div>
                <div style={{ fontFamily: BT_TYPE.mono, fontSize: 10, opacity: 0.6, marginTop: 12, letterSpacing: 1 }}>
                  valentina@borondo.tours · +57 310 000
                </div>
              </div>
            </div>
          </div>

          {/* Tote bag */}
          <div>
            <div style={{ fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: BT_COLORS.piedra, marginBottom: 12 }}>
              Tote
            </div>
            <div style={{
              aspectRatio: '1.7', background: BT_COLORS.hueso, borderRadius: 12, padding: 24,
              position: 'relative', overflow: 'hidden', boxShadow: BT_SHADOW.med,
              border: `1px solid ${BT_COLORS.nieblaDark}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
            }}>
              <div style={{ fontFamily: BT_TYPE.display, fontStyle: 'italic', fontSize: 36, fontWeight: 500, color: BT_COLORS.tinta, letterSpacing: -1, lineHeight: 0.9, textAlign: 'center' }}>
                Anda, pues.<br/>
                <span style={{ fontSize: 18, color: BT_COLORS.musgo }}>Vamos de borondo.</span>
              </div>
              <ChivitoLineArt size={56} color={BT_COLORS.tinta} beardColor={BT_COLORS.chivito} />
            </div>
          </div>

          {/* Social post */}
          <div>
            <div style={{ fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: BT_COLORS.piedra, marginBottom: 12 }}>
              Social
            </div>
            <div style={{
              aspectRatio: '1.7', borderRadius: 12, padding: 24,
              position: 'relative', overflow: 'hidden', boxShadow: BT_SHADOW.med,
              background: `linear-gradient(165deg, ${BT_COLORS.musgoDeep} 0%, ${BT_COLORS.paramo} 55%, ${BT_COLORS.tinta} 100%)`,
              color: BT_COLORS.hueso, display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ fontFamily: BT_TYPE.mono, fontSize: 10, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.6 }}>
                Tour #007 · Páramo
              </div>
              <div style={{ fontFamily: BT_TYPE.display, fontStyle: 'italic', fontWeight: 500, fontSize: 36, lineHeight: 0.95, letterSpacing: -1 }}>
                Donde duerme<br/>el Chivito.
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <BorondoWordmark size={18} color={BT_COLORS.hueso} beardColor={BT_COLORS.chivitoBright} />
                <div style={{ fontFamily: BT_TYPE.mono, fontSize: 10, letterSpacing: 2, opacity: 0.7 }}>
                  @borondotours
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <section style={{
        padding: '80px', background: BT_COLORS.tinta, color: BT_COLORS.nieblaDark,
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 40, alignItems: 'center',
      }}>
        <div style={{ fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.6 }}>
          Borondo Tours Brand System · v1.0
        </div>
        <div>
          <BorondoWordmark size={40} color={BT_COLORS.hueso} beardColor={BT_COLORS.chivitoBright} />
        </div>
        <div style={{ fontFamily: BT_TYPE.mono, fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.6, textAlign: 'right' }}>
          Colombia · Páramo · 2026
        </div>
      </section>

      {/* Quick links */}
      <section style={{
        padding: '32px 80px', background: BT_COLORS.niebla,
        display: 'flex', gap: 24, justifyContent: 'center', borderTop: `1px solid ${BT_COLORS.nieblaDark}`,
      }}>
        <a href="Landing.html" style={{
          padding: '14px 28px', background: BT_COLORS.tinta, color: BT_COLORS.hueso,
          textDecoration: 'none', borderRadius: 999, fontFamily: BT_TYPE.body, fontWeight: 600, fontSize: 14,
        }}>→ Ver landing page (scrolltelling)</a>
        <a href="Mobile.html" style={{
          padding: '14px 28px', background: BT_COLORS.paramo, color: BT_COLORS.hueso,
          textDecoration: 'none', borderRadius: 999, fontFamily: BT_TYPE.body, fontWeight: 600, fontSize: 14,
        }}>→ Ver app mobile</a>
        <a href="Logo Reveal.html" style={{
          padding: '14px 28px', background: BT_COLORS.musgo, color: BT_COLORS.hueso,
          textDecoration: 'none', borderRadius: 999, fontFamily: BT_TYPE.body, fontWeight: 600, fontSize: 14,
        }}>→ Animación de revelación</a>
      </section>
    </div>
  );
}

Object.assign(window, { BrandGuidelines });
