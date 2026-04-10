---
tags: [resumen, app3, b2b, operadores, proveedores, manifiesto, radar, multi-agencia]
created: 2026-04-05
updated: 2026-04-05
spec-detallada: "[[../01-Specs/Spec-I-B2B-Portal-Operadores]]"
---

# 🏭 APP 3: B2B — Portal de Proveedores / Operadores

> **Roles que acceden:** `OPERATOR_ADMIN` · `OPERATOR_COORD` · `OPERATOR_AGENT`.
> **Ruta base:** `/operador/*`.
> **Propuesta de valor diferencial:** El manifiesto se llena solo. Los pasajeros que compran por B2C o por cotización de agente aparecen automáticamente. Los de agencias externas sin tecnología se registran con un link público sin login. El operador ve TODO en un solo lugar — BorondoTours se convierte en infraestructura indispensable, no solo en un canal de ventas más.
> **Spec de referencia:** Spec-I.

---

## Flujo A: Onboarding y Activación del Operador

* **Checklist de activación (no bloqueante):** Al primer login, el `OPERATOR_ADMIN` ve un checklist de 5 pasos en el dashboard: completar perfil de empresa (logo, descripción, ciudad), agregar primer vehículo al catálogo, invitar primer miembro del equipo, crear primer tour (wizard) y cambiar la contraseña temporal. El portal es completamente usable desde el primer momento; el dashboard muestra el % de completitud hasta terminar. Al llegar al 100%: banner de celebración 🎉 y el checklist desaparece.
* **Gestión de equipo desde el primer día:** El `OPERATOR_ADMIN` crea usuarios para su equipo (`OPERATOR_COORD`, `OPERATOR_GUIDE`, `OPERATOR_DRIVER`) directamente desde el panel de equipo. Al crear cada miembro: email automático con credenciales temporales. Los `OPERATOR_GUIDE` y `OPERATOR_DRIVER` reciben también un link de descarga de la App 4 Móvil.
* **Perfil de empresa y documentos legales:** Datos editables por el operador (logo, descripción, teléfono, ciudad). Datos inmutables gestionados por BorondoTours (NIT/RUT, comisión vigente, estado ACTIVE/SUSPENDED). Documentos legales adjuntos en S3 privado (cámara de comercio, RNT, pólizas de responsabilidad civil). La comisión vigente es visible como badge de solo lectura con nota de contacto a BorondoTours.
* **Catálogo de vehículos:** Registro de flota con placa, capacidad de pasajeros, tipo (BUS/VAN/JEEP/LANCHA/OTRO) y documentos legales adjuntos en S3 privado (SOAT, tarjeta de propiedad, revisión técnico-mecánica). Alertas automáticas 30 días antes del vencimiento de cualquier documento (BullMQ job diario a las 8AM + email al admin).

---

## Flujo B: Gestión de Inventario (Tours y Cupos)

* **Wizard de creación de tour (4 pasos):** Info básica (nombre, descripción Markdown, categoría, ciudad, pin en Mapbox, punto de encuentro) → Multimedia (3–10 fotos S3, video YouTube/TikTok, orden drag & drop) → Pricing y reglas (precio base, regla de pax por edad o estatura mínima, add-ons con nombre/precio/duración/cantidad máxima) → Revisión con preview exacto de cómo se verá el tour en el B2C + botón "Enviar a revisión". El tour entra en `PENDING_REVIEW` — BorondoTours aprueba → `PUBLISHED` o rechaza con comentarios → `REJECTED` (editable y reenvíable sin restricciones).
* **Publicación blindada con solicitudes de cambio:** Una vez publicado, el tour no se puede editar directamente. El botón "Solicitar cambio" genera un `TourEditRequest` con el diff de qué cambió. BorondoTours revisa y aprueba/rechaza. El tour sigue vendible y público mientras la solicitud está pendiente. Historial inmutable de todas las solicitudes con estado y comentarios.
* **Pool híbrido de cupos (multi-agencia):** Por defecto todos los cupos están en pool compartido (primer canal que vende se lleva el cupo). El operador puede reservar cupos premium para agencias de alto volumen (ej. "10 cupos reservados exclusivamente para Agencia Colombia Viajes"). Si la agencia no usa los cupos reservados **3 días antes del tour**: los cupos vuelven automáticamente al pool compartido (BullMQ cron). El B2C solo ve los cupos disponibles reales, sin saber que existen reservas premium.
* **Bulk create de instancias y calendario de ocupación:** Generar fechas recurrentes en segundos (ej. "todos los sábados de julio a septiembre, 6AM, 40 cupos"). Calendario visual con barras de stack por instancia: 🟢 BorondoTours · 🔵 Agencias externas · 🟡 Reservados premium · ⬜ Disponibles. Los días con ocupación < 30% a menos de 5 días del tour se resaltan en rojo como alerta de baja demanda.

---

## Flujo C: Manifiesto de Pasajeros (el corazón de la App)

* **Auto-fill desde todos los canales:** Los pasajeros que compran por el portal B2C aparecen automáticamente (nombre, email, teléfono desde el perfil). Los de cotizaciones de agentes internos también se auto-llenan. Los de agencias externas entran por link público. El operador puede agregar pasajeros manuales para ventas directas sin canal digital. Barra de progreso: "{X} de {Y} pasajeros con datos completos" — incentiva al operador a completar los datos faltantes antes del tour.
* **Links de Agencia (canal sin login para agencias externas):** El operador genera una URL única (`/agencia/{token}`) que envía por WhatsApp a agencias sin tecnología. La agencia abre el link en el navegador (sin crear cuenta), ve el nombre del tour, fecha, hora y cupos disponibles, y registra los pasajeros uno a uno: nombre completo, documento CC/Pasaporte, teléfono, tipo pax (Adulto/Niño/Bebé), contacto de emergencia (nombre + teléfono), condiciones médicas relevantes y hotel/punto de recogida. Los pasajeros entran en estado `HOLD_AGENCY` y el operador recibe notificación push + email. El link tiene cupos máximos y vigencia configurables.
* **Confirmación de pago de agencia externa:** Los pasajeros en `HOLD_AGENCY` tienen un botón "Confirmar pago" en el manifiesto (el operador registra que la agencia pagó por fuera del sistema: transferencia / Nequi / efectivo / otro + referencia). Si pasan 48h sin confirmar: los cupos se liberan automáticamente (BullMQ job). El operador puede extender el plazo manualmente en incrementos de +24h o +48h antes de que expire.
* **Exportar manifiesto para el guía:** PDF de campo con encabezado (nombre del tour, fecha, hora, punto de encuentro, guía asignado), tabla de pasajeros (nombre, documento, teléfono, hotel, condiciones médicas, agencia de origen), espacio para firma manual de check-in, número de póliza del seguro médico y QR code que enlaza al manifiesto digital en la App 4 (para cuando el guía tenga señal). También exportable como CSV filtrado por agencia de origen para conciliación contable con agencias externas.

---

## Flujo D: Asignaciones de Equipo a Instancias

* **El `OPERATOR_COORD` asigna su propio equipo:** Selecciona guía + conductor + vehículo para cada instancia directamente desde el portal B2B. El sistema filtra en tiempo real por disponibilidad del día (sin conflictos de horario en otras instancias simultáneas). Si hay conflicto: badge naranja de advertencia — no bloquea la asignación, solo avisa para que el coordinador decida.
* **Toggle de GPS por recurso:** Al asignar, el coordinador puede activar "Obligar GPS en App 4" individualmente por guía y por conductor. Solo se solicita ubicación activa en la App 4 a los recursos con toggle ON. Los demás operan sin tracking de ubicación.
* **Notificación automática al equipo asignado:** Al confirmar la asignación, el guía y el conductor reciben notificación push + email con todos los detalles de la instancia: nombre del tour, fecha, hora de salida, punto de encuentro y pax count actual del manifiesto.
* **Visibilidad cruzada con BorondoTours:** La asignación queda visible simultáneamente en el Radar del operador (App 3) y en el Radar interno de BorondoTours (App 2 ERP / Spec-G). Si BorondoTours necesita reasignar por emergencia, el `OPERATOR_COORD` recibe notificación inmediata con el motivo.

---

## Flujo E: Radar de Operaciones en Tiempo Real

* **Grid semáforo del coordinador:** Cuadrícula responsive de todos los tours del día (3 cols desktop / 2 tablet / 1 mobile). Cada tarjeta muestra: nombre del tour, hora de salida, guía + conductor asignados, pax confirmados / capacidad total, y un pill de estado dinámico actualizado en tiempo real desde la App 4 via Socket.io: ⚪ Pendiente · 🔵 En Ruta · 🟡 Duda · 🟠 Problema · 🔴 Urgencia · ⚫ Terminado. Las tarjetas con 🔴 Urgencia suben automáticamente a la fila #1, parpadean y disparan alerta sonora.
* **Manifiesto en vivo:** Al hacer clic en una tarjeta del Radar: drawer lateral con el manifiesto de esa instancia actualizado en tiempo real. El coordinador ve el estado de check-in de cada pasajero: ⬜ Pendiente / ✅ Check-in OK / ❌ No Show / ↩️ Llegó tarde. Puede contactar directamente al pasajero faltante con botón de llamada o WhatsApp desde la misma tarjeta.
* **Mapa GPS de flota en tiempo real:** Mapa Mapbox con marcadores de cada vehículo en ruta, actualización cada 30 segundos (ping desde la App 4 del conductor/guía). Trail del recorrido recorrido. Se activa automáticamente 1 hora antes del tour. Si un vehículo pierde señal: marcador cambia a `⚠️ Sin conexión (Revisar última actualización)`. Al hacer clic en un marcador: popup con detalle del tour + link directo al manifiesto.
* **Timeline de alertas del día:** Panel lateral siempre visible con log cronológico de todos los eventos del día: cambios de estado, NO SHOW, urgencias, cupos liberados. Entradas de 🔴 Urgencia resaltadas con fondo rojo + notificación sonora en el portal. El coordinador puede agregar notas a cualquier entrada del timeline.
* **Fuerza Mayor:** Botón "Cancelar por fuerza mayor" en la tarjeta del Radar. Modal con tipo de cancelación (CLIMA / DESASTRE_NATURAL / BLOQUEO_VIAL / ORDEN_PUBLICA / FALLA_MECANICA / OTRO), descripción detallada obligatoria (mín. 50 caracteres) y adjuntar evidencia fotográfica o documental en S3. Al confirmar: notificación inmediata a todos los pasajeros por email + SMS, Borondo Coins Restringidos acreditados en wallets B2C (usables solo en tours de ese operador), y contracargo reflejado en el balance B2B si BorondoTours procesa un reembolso real por escalamiento al soporte.

---

## Flujo F: Finanzas, Reseñas y Privacidad

* **Dashboard de KPIs y estacionalidad:** Revenue por canal con gráfico de dona (🟢 B2C · 🔵 ERP Agentes · 🟠 Agencias externas · ⬜ Venta directa), ocupación promedio del período, top 3 tours más vendidos y heatmap de estacionalidad de los últimos 12 meses — para que el operador planifique sus picos de demanda y oferta de cupos.
* **Liquidaciones transparentes:** Tabla filtrable por período (mes / quincena / custom) y estado (PENDING/PAID) con: tour, fecha, agencia de origen, monto bruto, comisión BorondoTours, monto neto a recibir. Badge prominente 💰 "Te debemos $X.XXX.XXX" para el total pendiente. Exportable como PDF o CSV.
* **Proyección de ingresos próximos 30 días:** Widget con la suma de revenue de bookings `CONFIRMED` en instancias futuras, desglosado por semana en gráfico de barras. Excluye los `HOLD_AGENCY` no confirmados (no son ingresos seguros aún).
* **Reseñas (solo lectura):** El `OPERATOR_ADMIN` ve las calificaciones que los clientes dejan sobre sus tours en el B2C: promedio de estrellas, histograma de distribución por estrella, comentarios individuales (nombre del cliente solo con iniciales por privacidad de datos). Solo lectura — el operador no puede responder públicamente ni editar reseñas. Puede reportar reseñas abusivas (FALSA / OFENSIVA / IRRELEVANTE) para revisión del equipo BorondoTours.
* **Privacidad de tracking GPS:** Dos toggles globales en la configuración del operador: "BorondoTours puede ver el GPS de mis vehículos" (default ON) y "Los clientes pueden ver el GPS de mis vehículos" (default OFF). Si activa el toggle de clientes: la App B2C muestra un mini-mapa del bus en el chat tripartito 24h antes del tour. Toda la comunicación con los pasajeros de BorondoTours es únicamente a través del chat tripartito — el operador no tiene canal directo con los clientes del B2C.
