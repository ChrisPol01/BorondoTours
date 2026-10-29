# 🧭 Taxonomía de Experiencias — BorondoTours

> Fuente de verdad del enum `Tours.category` (ver [[Modelo-Datos-Core]] §4) y de las etiquetas (`Tours.tags`).
> Nombres comerciales, pensados para que el viajero entienda de inmediato. Aprobado por el usuario 2026-09-27.

## Reglas
- **Categoría** = una por tour (tema principal). **Etiquetas** = varias por tour, de la lista controlada de abajo (no texto libre).
- **Intensidad (1–5)** ordena las categorías de la más suave a la más extrema en UI (chips, footer, filtros). Es propia de la categoría.
- **Dificultad** (FACIL…EXTREMO) sigue siendo un filtro independiente por tour: un tour de Naturaleza puede ser difícil.
- **Acceso** (FACIL...EXTREMO) es un filtro independiente que permite entender al turista que tan accesible es el ingreso al sitio.
- `product_type` (Pasadía, Pasanoche, Excursión…) es otra dimensión: no mezclar con categoría.
- Marca blanca: ninguna categoría o etiqueta nombra al operador.

## Categorías (orden por intensidad)

| # | Código (`category`) | Nombre comercial | Intensidad | Icono (lucide) | Etiquetas | Ejemplos en Colombia |
|---|---|---|---|---|---|---|
| 1 | RECREACION | Recreación y Diversión | 1 | `ferris-wheel` | parques temáticos, parques de atracciones, parques acuáticos, piscinas, zoológicos y acuarios, planes en familia | Parque del Café, Panaca, Mundo Aventura, Piscilago |
| 2 | BIENESTAR | Relax y Bienestar | 1 | `flower-2` | termales, spa, yoga y retiros, baños de lodo, desconexión | Termales de Santa Rosa de Cabal, Volcán del Totumo |
| 3 | SOL_Y_PLAYA | Sol y Playa | 1 | `sun` | playas, islas, pasadía en isla, snorkel, atardeceres | Islas del Rosario, Barú, San Andrés, Palomino |
| 4 | GASTRONOMICO | Gastronomía y Café | 1 | `coffee` | ruta del café, cacao, cocina tradicional, catas, mercados | Fincas cafeteras del Quindío, cacao en Santander |
| 5 | URBANO | Ciudad y Vida Nocturna | 1 | `building-2` | city tour, arte urbano, salsa y rumba, chiva rumbera, compras | Salsa en Cali, Comuna 13, Cartagena amurallada |
| 6 | CULTURAL | Cultura e Historia | 2 | `landmark` | pueblos patrimonio, arqueología, museos, comunidades, festivales, turismo religioso | Barichara, San Agustín, Las Lajas, Carnaval de Barranquilla |
| 7 | RURAL | Vida de Campo | 2 | `tractor` | fincas, cabalgatas, agroturismo, pesca artesanal | Fincas en Antioquia, cabalgatas en Salento |
| 8 | NATURALEZA | Naturaleza y Ecoturismo | 2 | `leaf` | avistamiento de aves, avistamiento de ballenas, parques naturales, páramos, cascadas, selva | Valle del Cocora, Nuquí, Amazonas, Chingaza |
| 9 | AVENTURA | Aventura | 3–4 | `mountain` | trekking, senderismo, ciclomontañismo, canopy, rafting, torrentismo, kayak, espeleología, buceo | Ciudad Perdida, rafting en San Gil, buceo en Providencia |
| 10 | EXTREMO | Deportes Extremos | 5 | `zap` | parapente, paracaidismo, puenting, alta montaña, escalada, kitesurf | Parapente en Chicamocha, nevados, kitesurf en La Guajira |
| 11 | INTERNACIONAL | Viajes Internacionales | — | `plane` | (por destino) | Fase 2+ (tours propios / planes aéreos) |
| 12 | CRUCERO | Cruceros | — | `ship` | (por naviera/ruta) | Fase 2+ |

> Internacional y Crucero no se muestran en el B2C hasta que existan tours publicados de ese tipo.

## Uso en el producto
- **Catálogo (Spec-A RF-A06):** filtro por categoría (checkbox) + etiquetas; URL `?category=AVENTURA&tags=rafting`.
- **Experiencias (pantalla 13):** chips de categorías en orden de intensidad; cada chip lleva a `/experiencias/{slug}`.
- **TourCard / Detalle:** badge con nombre comercial + icono.
- **Footer:** columna "Experiencias" con las 6 más vendidas (inicialmente: Recreación, Sol y Playa, Naturaleza, Cultura, Aventura, Deportes Extremos).
- **SEO:** slug en español sin tildes (`recreacion-y-diversion`, `deportes-extremos`, …).
- **Búsqueda (pg_trgm):** el nombre comercial y las etiquetas se indexan junto con título y descripción.
