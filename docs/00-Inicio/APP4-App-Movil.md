---
tags: [resumen, app4, movil, guia, conductor, gps, checkin, logistica]
created: 2026-04-05
updated: 2026-04-05
spec-detallada: "Pendiente — Spec-J (por crear)"
---

# 🚐 APP 4: App Móvil Logística (React Native / Expo)

> **Roles que acceden:** `OPERATOR_GUIDE` · `OPERATOR_DRIVER`.
> **Plataformas:** Android (Play Store) + iOS (App Store).
> **Tecnología:** React Native con Expo — reutiliza lógica TypeScript del frontend web, con acceso nativo a GPS, cámara y SMS.
> **Acceso:** Mismo login unificado del sistema. Al hacer login, `OPERATOR_GUIDE` y `OPERATOR_DRIVER` son redirigidos automáticamente a `/field`.
> **Spec de referencia:** Spec-J (pendiente de creación).

---
## 📱 6. APP 4: BorondoTours App (Omnicanal)

*Nota: Publicada en tiendas (Play Store / App Store) nativamente. Su contenido y layout dependen del `Role` del usuario logueado en Expo.*

  

* **Enrutamiento por Rol:** Los *Clientes* ven sus reservas y promos; los *Agentes* su CRM Kanban; los *Operadores* su Dashboard; y los *Guías/Conductores* operan el despliegue logístico en terreno.

* **Modo Field Service (Conductores y Guías):** Inicio de sesión. GPS se activa automáticamente en background 1 hora antes de la recogida (si fue exigido por la operadora) y se apaga al terminar.

* **Manifiesto Offline & Check-in:** Precarga del manifiesto (solo `CONFIRMED` o `HOLD_AGENCY`). En ruta sin señal (3G/4G), advierte: *"Modo Offline: Sincronización pendiente"*. Escáner de código QR dinámico. Opcionalmente, búsqueda por nombre/cédula del pasajero para "Check-in Manual" haciendo **Swipe-Right** (Asistió) o **Swipe-Left** (No Show).

* **Gestión Rápida de Pasajero:** Tarjeta de cada pax contiene atajo directo a **Llamar o Escribir a WhatsApp** frente a retrasos.

* **Caja Menor, Tickets y Avisos a Convenios:** Sección para contabilidad en terreno del guía. Registra anticipos y gasta (ingresando monto + foto + categoría). Además, al llegar a un restaurante o atracción con convenio, botón "Notificar Llegada" que abre WhatsApp auto-llenado (*"Somos BorondoTours, llegamos con XX pasajeros para el convenio..."*) y contabiliza "Tickets" consumidos.

* **Máquina de Estados & Chat Operativo:** Dropdown superior para reportar: `🔵 Ejecución`, `🟡 Duda`, `🟠 Problema`, `🔴 Urgencia` (dispara SMS nativo y abre incidentes en B2B), `⚫ Terminado` (abre un rápido *Formulario de Cierre de Tour* para reportar novedades antes de apagar). Chat temporal entre Guía-Conductor-Coordinador que se archiva al terminar.

* **Aislamiento de Gastos:** El guía toma fotos a recibos de gasolina/comida. Se suben al S3 del proveedor y no afectan la liquidación contable de BorondoTours.
## Flujo A: Modo Conductor (`OPERATOR_DRIVER`)

* **Activación automática de GPS:** Al hacer login, el conductor ve sus rutas del día asignadas. El GPS se activa automáticamente en background **1 hora antes** de la hora de recogida del primer pasajero y se apaga automáticamente al finalizar el último tour del día.
* **Transmisión de ubicación:** Ping de posición GPS cada 30 segundos hacia el servidor (visible en el Radar del operador y en el Radar interno de BorondoTours, según los toggles de privacidad configurados por el `OPERATOR_ADMIN`).
* **Zona muerta sin señal:** Si el conductor pierde conexión 3G/4G, la app almacena los pings de GPS localmente y los sincroniza al recuperar señal. En el Radar aparece `⚠️ Sin conexión (Revisar última actualización)`.

---

## Flujo B: Check-in Dinámico del Guía (`OPERATOR_GUIDE`)

* **Vista de tours del día:** Al entrar, el guía ve la lista de instancias asignadas con: nombre del tour, hora de salida, punto de encuentro, pax count total y enlace al manifiesto del tour.
* **Escáner QR:** Botón principal de check-in. Al escanear el QR del pasajero (generado en el portal B2C): animación "Bloom" verde con chulo blanco ✅ si el pasajero está en el manifiesto y no ha hecho check-in. La lista de pasajeros se reordena automáticamente — los confirmados suben, los pendientes bajan.
* **Botón `[❌ NO SHOW]`:** Para pasajeros que no aparecen al momento del tour. Es **reversible** a `[✅ ASISTIÓ]` si el pasajero llega tarde. Al marcar NO SHOW definitivo: ejecuta la retención del 100% de fondos de la agencia para ese pasajero (sin reembolso).

---

## Flujo C: Máquina de Estados Operativos

* **Dropdown de estado superior:** El guía reporta el estado actual del tour desde un selector prominente en la parte superior de la pantalla:
  * 🔵 `EN_RUTA` — Tour iniciado, todo en orden.
  * 🟡 `DUDA` — El guía tiene una pregunta operativa (no urgente).
  * 🟠 `PROBLEMA` — Hay un inconveniente que requiere atención pero no es crítico.
  * 🔴 `URGENCIA` — Requiere atención inmediata del coordinador.
  * ⚫ `TERMINADO` — El tour finalizó exitosamente.
* **Propagación en tiempo real:** Cada cambio de estado se envía via Socket.io al Radar del operador (App 3) y al Radar interno de BorondoTours (App 2 ERP). Las tarjetas correspondientes cambian de color en el Radar instantáneamente.
* **🔴 Urgencia → alerta en el Radar:** Al reportar Urgencia, la tarjeta del tour en el Radar sube automáticamente a la fila #1, parpadea y dispara una alerta sonora en el portal del coordinador. El coordinador puede marcar la urgencia como "Resuelta" desde el Radar.

---

## Flujo D: Modo Supervivencia Offline

* **Detección automática de pérdida de señal:** La app monitorea la conectividad en background. Si el guía pierde red 3G/4G mientras el tour está activo, muestra un banner de advertencia: "⚠️ Sin conexión — Modo offline activo".
* **Urgencia sin señal (SMS nativo):** Si el guía intenta reportar 🔴 Urgencia sin conexión, la app abre automáticamente la app de SMS nativa del dispositivo con un mensaje pre-llenado dirigido al número del coordinador: "🔴 URGENCIA — Tour: {nombre} · Guía: {nombre} · {hora} — {descripción del problema}".
* **Sincronización al recuperar señal:** Los logs de check-in y cambios de estado registrados offline se sincronizan automáticamente con el servidor al recuperar conectividad. El Radar se actualiza con el estado real sin necesidad de acción manual del guía.

---

## Flujo E: Aislamiento de Gastos de Campo

* **Registro de gastos del guía:** Botón "Registrar gasto" en la pantalla del tour activo. El guía toma foto al recibo (gasolina, peaje, almuerzo del equipo) con la cámara nativa.
* **Subida a S3 del operador:** Las fotos se suben al bucket S3 privado del operador con metadatos: tour_instance_id, guía, fecha, tipo de gasto (categorías predefinidas), monto declarado.
* **Aislamiento contable:** Los gastos registrados en la App 4 son de responsabilidad del operador y **no afectan la liquidación contable de BorondoTours**. Son visibles para el `OPERATOR_ADMIN` en el portal B2B para su propia contabilidad interna.

---

> ⚠️ **Estado:** Flujos de pantallas pendientes de documentación detallada en Spec-J. Los flujos aquí descritos son los requerimientos de negocio confirmados. El diseño de UX/UI de cada pantalla y los flujos de navegación interna de la app están pendientes de especificación.
