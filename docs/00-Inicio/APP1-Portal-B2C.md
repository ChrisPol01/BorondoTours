---
tags: [resumen, app1, b2c, portal, cliente, flujos]
created: 2026-04-05
updated: 2026-04-05
spec-detallada: "[[../01-Specs/Spec-A-Discovery]]  · [[../01-Specs/Spec-B-Tour-Detail]] · [[../01-Specs/Spec-C-Checkout]] · [[../01-Specs/Spec-D-Client-Portal]] · [[../01-Specs/Spec-E-Loyalty]] · [[../01-Specs/Spec-F-Auth]]"
---

# 📱 APP 1: Portal B2C — Web Pública y Privada del Cliente

> **Roles que acceden:** `CLIENT` (portal privado) · Público general (catálogo sin login).
> **Ruta base:** `/` (pública) · `/mis-reservas` (privada).
> **Specs de referencia:** Spec-A · Spec-B · Spec-C · Spec-D · Spec-E · Spec-F.

---

## Flujo A: Búsqueda y Descubrimiento (Discovery)

* **Búsqueda Tolerante:** Input de texto libre que soporta hasta 2 *typos* (errores ortográficos) respondiendo en < 50ms (Meilisearch fase 2, ILIKE fase 1).
* **Filtros (Faceted):** Sliders de precio, selectores de fecha y checkboxes de categoría con actualización de resultados en tiempo real (TanStack Query).
* **Mapa de Exploración:** Renderizado de Colombia (Mapbox) con *Clustering* de pines. Hover muestra precio, clic abre mini-tarjeta con datos del tour.
* **Cross-Selling Geográfico:** Al finalizar una compra, el sistema sugiere tours a menos de 50km de distancia usando PostGIS (`ST_DWithin`).

---

## Flujo B: Visualización de Producto (Tour Detail)

* **Multimedia:** Carrusel de fotos y botón nativo para ver la experiencia en TikTok/Instagram.
* **Calendario Semáforo (Disponibilidad):** 🟢 Verde (>50%) · 🟡 Naranja (<50%) · 🔴 Rojo (<10%) · ⚪ Gris (fechas pasadas o ≤ 2 días hábiles antes del tour — cierre operativo).
* **Precios:** Visualización de descuentos con tachado y badge de ahorro.
* **Social Proof:** Reseñas (1–5 estrellas) restringidas exclusivamente a clientes con reservas en estado `COMPLETED`.

---

## Flujo C: Checkout y Transacciones

* **Wizard con Onboarding:** Si el cliente no tiene sesión, inicia/registra (Google OAuth o Email + OTP) sin perder su selección de tour y fecha.
* **Selector Dinámico de Pax:** Contadores de incremento basados en la regla del proveedor (por edades o estatura mínima). Preview del precio total en tiempo real.
* **Upselling (Add-ons):** Checkboxes para servicios adicionales (ej. seguro extra, transporte, almuerzo) que suman al subtotal con descripción y precio individual.
* **Lógica Fiscal (IVA):** Radio button de residencia en Colombia. Si el cliente NO es residente: IVA = 0%, pero el botón de pago se bloquea hasta adjuntar foto del pasaporte (S3 privado con Presigned URL).
* **Divide tu Cuenta (Split Fare):** Genera múltiples links de pago Onepayla para grupos. La reserva principal queda en `HOLD_GROUP` hasta alcanzar el 100% del pago entre todos los participantes.
* **Pasarela Onepayla:** Integración mediante API/Webhook con referencia única `BOOK-{id}`, impuestos exactos y monto total. El webhook confirma el pago y desencadena toda la lógica de booking.

---

## Flujo D: Autenticación, Landing y Scrollytelling

* **Landing Page Zig-Zag:** Diseño inmersivo de pantalla dividida con GSAP ScrollTrigger. Un video de fondo avanza/retrocede según el scroll del usuario (*Scrollytelling*); el lado derecho muestra grids de Tours en Promoción, Más Vendidos y Servicios Destacados.
* **Auth Gate (Captura de Leads):** Al hacer clic en un tour desde el grid de la landing, se bloquea la navegación con un Modal de Login/Registro. El usuario debe autenticarse antes de ver el detalle del tour.
* **MFA — OTP por email:** Validación en dos pasos para proteger la cuenta y la billetera de Borondo Coins. Fase 2: OTP también por SMS.
* **Redirección post-login:** `CLIENT` siempre va a `/mis-reservas`. Los roles internos son redirigidos automáticamente a sus respectivas apps (ver Stack-Tecnologico RBAC).

---

## Flujo E: Panel Privado y Autogestión del Cliente

* **Header Dinámico:** Avatar de "Mi Perfil" (edición de datos personales — la cédula no se puede cambiar una vez registrada) y botón "Mis Reservas".
* **Tablero Kanban del Cliente (Mis Reservas):**
  * **Cotizaciones:** Tarjetas con link de pago activo. Clic en "Ir a pagar" abre el link Onepayla directamente.
  * **Próximos Viajes:** Botones activos si faltan ≥ 5 días: `[Reservar otra fecha]` `[Agregar Personas]` `[Cancelar Viaje]` (reembolso a Borondo Coins). Si faltan < 5 días: botones bloqueados, penalidad del 100%.
  * **Completadas:** Historial de tours realizados. Opción de calificar con modal de 1–5 estrellas + comentario (solo si el booking está en `COMPLETED`).
* **Gamificación y Wallet:**
  * 5 niveles de viajero: Explorador → Aventurero → Descubridor → Nómada → Embajador (basados en COP acumulado en compras).
  * Mapa interactivo de Colombia con los departamentos "conquistados" por el cliente (cada tour visitado colorea el departamento).
  * Billetera **Borondo Coins**: coins libres (usables en cualquier tour) y coins restringidos (solo usables en tours del operador que los generó — ej. cancelación por fuerza mayor).
* **Chat Tripartito:** Se habilita automáticamente 24h antes del tour. El cliente puede chatear con el Guía asignado y con un agente de BorondoTours (supervisión). Histórico de chat disponible por 90 días (DynamoDB TTL).
* **Feedback Modal:** Al finalizar el tour, la app muestra un modal bloqueante (no se puede cerrar sin interactuar) para recolectar calificación de 1–5 estrellas y comentario.
