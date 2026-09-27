# Design Spec — Checkout

- **Fuente:** 21-2-Proceso de reservas usuario pagina web.png[cite: 1]
- **Ruta:** /checkout[cite: 1]
- **Viewport del mockup:** desktop ~1024[cite: 1]
- **Resumen (2–3 líneas):** Pantalla de proceso de checkout completa que ilustra los cuatro estados apilados: Datos del viaje, Pasajeros, Pago y Confirmación final. Incluye sidebar de navegación de cuenta, stepper superior y formularios dinámicos con resumen lateral.

## 1. Estructura general (secciones de arriba a abajo)
1. Navegación global (Navbar + Sidebar) — layout fijo en L (INFERIDO) — alto ~100vh
2. Stepper de progreso — flex row centrado — alto ~88px
3. Paso 1: Datos del viaje — grid 2 columnas (contenido + resumen) — alto ~600px
4. Paso 2: Pasajeros — grid 2 columnas (formularios + resumen) — alto ~600px
5. Paso 3: Pago — grid 3 columnas (resumen + métodos + opciones) — alto ~500px
6. Paso 4: Confirmación — full width hero con grid de 3 cards horizontales — alto ~400px

## 2. Detalle por sección

### Sección: Navegación global y Stepper
- **Layout:** Sidebar fijo izquierdo, Navbar fijo superior. Stepper bajo navbar.
- **Fondo:** Sidebar y Navbar en `bg-azul-profundo`. Contenido en `bg-blanco-niebla`.
- **Elementos:**
  - Sidebar links — texto: "Mi Panel", "Mis Tours", "Mis Reservas", "Favoritos", "Mensajes", "Borondo Coins", "Configuración", "¿Necesitas ayuda? Estamos aquí para ti", "Ir a soporte".
  - Navbar links — texto: "Destinos", "Experiencias", "Nosotros", "Blog", "Contacto".
  - Navbar perfil — texto: "Andrés / Aventurero Nivel 2".
  - Stepper — texto: "1 Datos del viaje" (activo), "2 Pasajeros", "3 Pago".
- **Tabla de medidas (por elemento):**

  | Elemento | Ancho | Alto | Padding | Gap/Margin | Tipografía (px/rol) | Color (token) | Radio | Sombra | Certeza |
  |---|---|---|---|---|---|---|---|---|---|
  | Sidebar | ~240px | 100vh | 24px | gap 16px | 16px / Body1 | azul-profundo | — | — | ~ |
  | Navbar | full | 88px | px-page-gutter| gap 24px | 16px / Body1 | azul-profundo | — | — | medido |
  | Stepper | full | ~88px | 24px | gap 32px | 16px / Body1 | turquesa (activo) | — | border-b | medido |

- **Componente:** Reutiliza `Navbar`, `Sidebar` (si existe en layout cuenta). Nuevo `CheckoutStepper`.
- **Isla React:** Sí — `CheckoutWizardIsland client:load` — motivo: Flujo de checkout requiere validación estricta y estado global.
- **Estados:** default, activo (paso 1), inactivo (pasos futuros).

### Sección: Paso 1 - Datos del viaje
- **Layout:** Grid 2 columnas (70% / 30%), gap 24px (`gap-6`).
- **Fondo:** `bg-blanco-niebla` (fondo página). Cards en `bg-surface-page` (blanco).
- **Elementos:**
  - Título — texto: "Resumen del tour"
  - Detalle — texto: "Valle del Cocora y Salento Mágico", "Eje Cafetero, Colombia", "20 - 22 de mayo, 2025", "3 días / 2 noches". Badge: "Confirmado"
  - Viajeros — texto: "Número de viajeros", "Selecciona cuántas personas viajarán", "2", "2 adultos"
  - Add-ons — texto: "Add-ons opcionales", "Mejora tu experiencia agregando actividades o servicios adicionales.", "Seguro de viaje premium", "Cobertura médica ampliada y asistencia 24/7.", "$25.000 COP por persona", "Traslado privado desde/hacia el aeropuerto", "$80.000 COP por grupo", "Noche adicional en Salento", "$120.000 COP por habitación", "Cena especial típica", "$45.000 COP por persona".
  - Resumen Parcial — texto: "Resumen parcial", "2 viajeros", "Precio base del tour", "$1.450.000", "2 adultos", "$1.450.000", "Add-ons seleccionados", "Seguro de viaje (2)", "$50.000", "Cena especial (2)", "$90.000", "Subtotal", "$1.590.000", "IVA (19%)", "$302.100", "Total parcial", "$1.892.100 COP".
  - Botón — label: "Continuar a pasajeros ->" — estilo: primario turquesa — datos: contract-backed
  - Trust badge — texto: "Reserva segura", "Tus datos están protegidos".
- **Tabla de medidas (por elemento):**

  | Elemento | Ancho | Alto | Padding | Gap/Margin | Tipografía (px/rol) | Color (token) | Radio | Sombra | Certeza |
  |---|---|---|---|---|---|---|---|---|---|
  | Cards (Resumen, Add-ons)| full | — | 24px | mb 24px | — | surface-page | rounded-card | shadow-card | medido |
  | Título tour | — | — | — | mb 8px | 20px / H4 | negro-volcanico | — | — | medido |
  | Total parcial | — | — | — | mt 16px | 28px / H3 | turquesa | — | — | medido |

- **Componente:** Nuevo `CheckoutStepOne`.
- **Isla React:** Sí — parte de `CheckoutWizardIsland`.
- **Estados:** default, checked (checkboxes add-ons).

### Sección: Paso 2 - Pasajeros
- **Layout:** Grid 2 columnas. Columna izquierda con sub-cards apiladas.
- **Fondo:** `bg-blanco-niebla`. Cards `bg-surface-page`.
- **Elementos:**
  - Título — texto: "Información de los pasajeros"
  - Botón — label: "+ Agregar pasajero" — estilo: secundario outline
  - Pasajero 1 — texto: "1", "Nombre(s)", "Andrés Felipe", "Apellido(s)", "Gil Restrepo", "Tipo de documento", "Cédula de ciudadanía", "Número de documento", "1.234.567.890", "Nacionalidad", "Colombiana", "Condiciones médicas o alergias (opcional)", "Sin información registrada".
  - Pasajero 2 — texto: "2", "Nombre(s)", "María Fernanda", "Apellido(s)", "López García", "Tipo de documento", "Pasaporte", "Número de documento", "AX1234567".
  - Alerta — texto: "Eres extranjero: puedes ser elegible para IVA exento.", "Sube una foto de tu pasaporte para aplicar el beneficio." — Botón: "Subir pasaporte".
  - Contacto — texto: "Contacto de emergencia", "Nombre completo", "Juan Carlos Gil", "Teléfono", "+57 300 555 1234", "Parentesco", "Padre".
  - Resumen — texto: "Resumen de tu reserva", "Tour (2 adultos)"... "Total parcial", "$1.892.100 COP", "Volver", "Continuar a pago ->".
- **Tabla de medidas (por elemento):**

  | Elemento | Ancho | Alto | Padding | Gap/Margin | Tipografía (px/rol) | Color (token) | Radio | Sombra | Certeza |
  |---|---|---|---|---|---|---|---|---|---|
  | Card Pasajero | full | — | 24px | gap 16px | — | surface-page | rounded-card | shadow-card | medido |
  | Input Label | — | — | — | mb 4px | 12px / Label | negro-volcanico | — | — | medido |
  | Alerta Info | full | — | 16px | mt 16px | 14px / Body2 | bg-azul-condor/10| rounded-panel | — | medido |

- **Componente:** Nuevo `TravelerForm`, reusa `StatusMessage` (info).
- **Isla React:** Sí — parte de `CheckoutWizardIsland`.
- **Estados:** default, filled (inputs con datos).

### Sección: Paso 3 - Pago
- **Layout:** Grid 3 columnas (resumen lateral, pago central, opciones derecha).
- **Fondo:** `bg-blanco-niebla`.
- **Elementos:**
  - Resumen — texto: "Resumen y pago", "Precio base...", "Descuento por Borondo Coins -$100.000", "Total a pagar $1.792.100 COP" (turquesa).
  - Coins — texto: "Aplicar Borondo Coins", "100.000", "Tienes 12.500 Coins disponibles", "Descuento aplicado -$100.000 COP".
  - Métodos — texto: "Métodos de pago", "Tarjeta de crédito / débito", "PSE", "Nequi / Daviplata", "Pagos 100% seguros con ONEPAYLA", "Número de tarjeta", "1234 1234 1234 1234", "Fecha de expiración MM/AA", "CVV 123".
  - Opciones — texto: "Opciones adicionales", "Dividir el pago entre viajeros", "Cada viajero recibirá un link de pago individual.", "Se generarán 2 links de pago", "Cada uno por $896.050 COP", "Acepto las condiciones de cancelación", "Ver política de cancelación completa".
  - Botón — label: "Confirmar y pagar $1.792.100 COP" — estilo: CTA dorado — datos: contract-backed. "Al continuar aceptas nuestros Términos y Condiciones".
- **Tabla de medidas (por elemento):**

  | Elemento | Ancho | Alto | Padding | Gap/Margin | Tipografía (px/rol) | Color (token) | Radio | Sombra | Certeza |
  |---|---|---|---|---|---|---|---|---|---|
  | Columna Pago | full | — | 24px | gap 24px | — | surface-page | rounded-card | shadow-card | medido |
  | Botón Pagar | full | 44px | 16px | mt 24px | 16px / Button | dorado | rounded-control| — | medido |

- **Componente:** Nuevo `PaymentMethodsWidget`, `CoinSliderWidget`.
- **Isla React:** Sí — `CheckoutWizardIsland client:load`.
- **Estados:** default, focus (inputs tarjeta), toggled (dividir pago).

### Sección: Paso 4 - Confirmación
- **Layout:** Hero full-width con contenido centrado y grid 3 columnas (cards) solapado.
- **Fondo:** Imagen de paisaje con overlay oscuro (`bg-negro-volcanico/40`).
- **Elementos:**
  - Título — texto: "¡Tu aventura está confirmada!" (con icono check verde y emoji fiesta).
  - Subtítulo — texto: "Hemos enviado los detalles de tu reserva a andres.gil@email.com"
  - Card 1 (Resumen) — texto: "Resumen de tu reserva", "Valle del Cocora y Salento Mágico", "20 - 22 de mayo, 2025", "3 días / 2 noches", "2 viajeros", "Confirmado", "Total pagado $1.792.100 COP".
  - Card 2 (Pasos) — texto: "Próximos pasos", "Revisa tu email...", "Nuestro equipo te contactará...", "Prepárate para vivir...". Caja arena: "Punto de encuentro", "Calle 12 # 4-35, Armenia, Quindío", "20 de mayo, 2025 - 07:00 AM".
  - Card 3 (Docs) — texto: "Tus documentos", "Voucher de reserva PDF - 245 KB", "Factura electrónica PDF - 198 KB", "Póliza de seguro PDF - 312 KB".
  - Botones (footer hero) — "Descargar todos los documentos" (turquesa), "Agregar al calendario" (secundario), "Ir a mis reservas" (secundario).
- **Tabla de medidas (por elemento):**

  | Elemento | Ancho | Alto | Padding | Gap/Margin | Tipografía (px/rol) | Color (token) | Radio | Sombra | Certeza |
  |---|---|---|---|---|---|---|---|---|---|
  | Hero bg | full-bleed | ~400px | 64px | — | — | negro-volcanico/40 | — | — | ~ |
  | Cards inf | ~340px | — | 24px | gap 24px | 14px / Body2 | surface-page | rounded-card | shadow-card | medido |
  | Caja Punto | full | — | 16px | mt 16px | 14px / Body2 | arena | rounded-panel | — | medido |

- **Componente:** Reutiliza `ResponsiveImage` (fondo), Nuevo `CheckoutSuccessHero`.
- **Isla React:** No (Astro estático) — o isla si pertenece al SPA. Idealmente vista final Astro.
- **Estados:** Success default.

## 3. Componentes nuevos requeridos
| Componente | Tipo (Astro/Island) | Props sugeridas | Reusa |
|---|---|---|---|
| CheckoutWizardIsland | Island | `tourId, basePrice, user` | Card, Button, StatusMessage |
| CheckoutStepper | Island | `currentStep` | — |
| PaymentMethodsWidget | Island | `amount, onPaymentSubmit` | Button, Input |
| CheckoutSuccessHero | Astro | `reservationData` | Card, Button, ResponsiveImage |

## 4. Tokens usados (solo los que aparecen)
- **Colores:** azul-profundo, turquesa, verde, dorado, blanco-niebla, negro-volcanico, arena, surface-page.
- **Tipografía:** H1 (Confirmación), H3 (Total precio), H4 (Títulos cards), Body1, Body2, Label, Button.
- **Radios/elevación/glass:** rounded-card, rounded-control, rounded-panel, shadow-card.
- **Degradados:** ninguno (overlay sólido en hero confirmación).

## 5. Iconografía
| Significado | lucide-react sugerido | Dónde aparece |
|---|---|---|
| Buscar, Favorito, Notificación | Search, Heart, Bell | Navbar global |
| Pasajeros | Users | Resumen parcial |
| Subir documento | Upload | Alerta pasaporte |
| Info | Info | Mensajes / Alertas |
| Check de confirmación | CheckCircle2 | Paso 4, tags confirmados |
| Ubicación | MapPin | Resumen del tour |
| Descargar | Download | Documentos paso 4 |
| Archivo PDF | FileText | Documentos paso 4 |
| Calendario | Calendar | Resumen del tour |
| Bloqueado/Seguro | Lock | Botón de pagar |

## 6. Estados globales de la pantalla
- Flujo multipaso de checkout (Datos -> Pasajeros -> Pago -> Confirmación).

## 7. Responsive (INFERIDO salvo que el mockup muestre ambos)
- **Desktop → Mobile:** El layout global colapsa a 1 columna. El sidebar se vuelve menú hamburguesa. Las columnas 2 y 3 del grid (resumen, pago) se apilan verticalmente bajo el formulario activo. Las 3 cards de confirmación se apilan a 1 columna.

## 8. Accesibilidad — checklist específico de esta pantalla
- [ ] Inputs con label explícito: todos los formularios de pasajeros y pago.
- [ ] Imágenes decorativas vs informativas: Imagen del tour debe tener `alt` con el nombre del tour.
- [ ] Orden de foco de teclado: Lógico siguiendo el formulario activo y luego el resumen.
- [ ] Modales/drawers con focus trap: No aplica en lo visible, pero el stepper debe anunciar cambios de paso por screen reader.

## 9. Clasificación de datos
- **contract-backed:** Todos los bloques (precios, add-ons, pasajeros, pagos y recibo final).
- **visual-only:** ¿"Borondo Coins"? (a confirmar si existe lógica en contrato).

## 10. Gaps y preguntas para confirmar (NO inventado)
1. ¿El layout de cuenta/sidebar aplica realmente para usuarios invitados (anónimos) o el checkout tiene un layout "limpio" (sin sidebar) para maximizar conversión?
2. ¿Los 4 pasos son rutas de Astro separadas (`/checkout/step-1`, etc.) o es una sola SPA island `CheckoutWizardIsland`?
3. En el paso 4, ¿el componente de "Punto de encuentro" usa datos fijos o dinámicos del CMS?