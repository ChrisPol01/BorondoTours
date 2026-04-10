---
tags: [spec, app-movil, logistica, omnicanal, react-native, expo, offline]
created: 2026-04-05
status: listo-para-implementar
kiro-spec: .kiro/specs/flujo-j-borondotours-app-movil.md
---

# 📋 Spec J — BorondoTours App (Super App Móvil)

> **React Native (Expo) app publicada en tiendas oficiales (Google Play Store y Apple App Store) bajo el nombre único "BorondoTours".**
>
> **Propuesta de valor omnicanal:** Se trata de una única descarga. La app lee el `Role` del usuario una vez inicia sesión y adapta dinámicamente todo su árbol de navegación (Bottom Tabs y UI). Si un turista entra, ve sus promos y reservas. Si entra un Guía, su cámara se vuelve un escáner y la app se enfoca en hardware y supervivencia en campo.

---

## 1. Objetivos de negocio
- Eliminar la fricción de instalar una "app secundaria de operadores" y capitalizar todo el tráfico hacia una red de crecimiento.
- Dar al cliente final la experiencia rica en notificaciones push en tiempo real (promociones, cupones).
- Dotar al Operador (Guías y Conductores) del superpoder de operar un tour sin depender de señal 3G/4G, asegurando calidad en zonas remotas o rurales.
- Agilizar los pagos pequeños de caja y las subcontrataciones mediante notificaciones estandarizadas de WhatsApp desde la App.

---

## 2. Enrutamiento por Roles (WebViews & Native)

La BorondoTours App es un híbrido inteligente. Las pantallas complejas sin hardware dependencies se pueden inyectar como WebViews con tokens persistidos, mientras que funcionalidades que lo exigen, se levantan en Nativos (Cámara, GPS, Contactos).

### RF-J01 — Árbol de Navegación Condicional
**Criterios de aceptación:**
- **Si el rol es `CLIENT`**:
  - `Home`: Discovery nativo de promociones, geolocalización de planes cercanos.
  - `Mis Tours`: Tarjetas de reservas (próximos / pasados) y acceso al QR/Voucher digital. 
  - `Wallet`: Balance de Borondo Coins.
  - `Perfil`: Ajustes personales.
- **Si el rol es `AGENT` o `SUPER_ADMIN`**:
  - Interfaz orientada al embudo de ventas. (WebView renderizando su CRM / Kanban o componentes react native listando prospectos).
- **Si el rol es `OPERATOR_ADMIN` / `OPERATOR_COORD`**:
  - Vista del Dashboard financiero y notificaciones push directas de sus flotas (Ej. `🔴 URGENCIA detectada en Tour Eje Cafetero`).
- **Si el rol es `OPERATOR_GUIDE` / `OPERATOR_DRIVER`**:
  - `Operador Mode (Default)`: Botón masivo "Tours Asignados para Hoy".
  - Tracker en Background: En conductores, inyecta lat/long al socket de operaciones al estar dentro de la ventana de 1 hora pre-tour.
  
---

## 3. Logística de Campo & Modo Supervivencia Offline

### RF-J02 — Sincronización del Manifiesto y Modo Sin Conexión
**Contexto**: Los tours hacia cascadas, montañas rurales o islas muchas veces no tienen señal de internet al iniciar la validación.

**Criterios de aceptación:**
- [ ] En la madrugada (o usando Background Fetch), la app **pre-descarga en SQLite local** el Manifiesto completo de todos los tours que tiene el guía hoy (solo pax `CONFIRMED` y `HOLD_AGENCY`).
- [ ] Si los pasajeros cancelaron antes de 5 días o están eliminados, NO se guardan en el celular del guía.
- [ ] Al perder conexión a internet, se enciende un Banner amarillo `⚠️ Modo Offline: Sincronización Pendiente`. Las operaciones continúan normales.
- [ ] Al recuperar la señal, el Service Worker purga el arreglo de eventos acumulados (Check-ins, No Shows, Gastos guardados) hacia BorondoTours backend en background y el banner desaparece.

### RF-J03 — Swipe Manual, Check-in y Contacto de Urgencia
**Criterios de aceptación:**
- [ ] Pantalla "Manifiesto del Tour". Es una `FlatList` con Tarjetas por persona.
- [ ] El guía puede escanear código QR habilitando cámara para Check-in masivo.
- [ ] Si un cliente no tiene batería o QR, el guía busca su nombre en el input persistente arriba.
- [ ] **Acción por Deslizamiento (Swipe)**: Al arrastrar la tarjeta a la derecha se cambia a **Verde (`[✅ ASISTIÓ]`)**. Si se arrastra a la Izquierda se cambia a **Rojo (`[❌ NO SHOW]`)**.
- [ ] **Acción de Rescate**: Cada tarjeta "Pendiente" y "No Show" muestra visiblemente su número telefónico. Al pinchar en él se levanta la hoja de OS (Action Sheet) donde puede:
   1. Llamar (Directamente celular).
   2. Abrir WhatsApp (Pre-llenado: _"Hola [Nombre], somos del tour de Borondo, el grupo te está esperando..."_).

---

## 4. Contabilidad de Terreno y Ticketería por Notificación 

### RF-J04 — Billetera Interna / Caja Menor (Gastos & Anticipos)
**Contexto**: El operador transfiere al guía 50.000 COP para peajes o la app prevé un presupuesto basado en cálculo parametrizado del ERP.

**Criterios de aceptación:**
- [ ] En un Tour Activo, la pestaña `💲 Caja de Tour` está habilitada.
- [ ] Permite al Guía registrar el **"Ingreso (Anticipo)"** con el que arranca.
- [ ] Permite cargar mermas al pulsar **"Nuevo Gasto"**:
  - Tomar Fotografía (Comprobante).
  - Categoría (Toll/Peaje, Comida Guiánza, Imprevisto Logístico, Compra por Convenio).
  - Monto exacto descontado (COP).
- [ ] La app guarda la foto y los gastos y los envía al S3 vinculados al `tour_instance_id`, recalculando el bolsillo disponible. Esto no entra al payout de agencias Borondo, sino que audita internamente los sobrecostos del Operador.

### RF-J05 — Avisos de Arribos y Vales a Convenios
**Contexto**: El operador tiene una alianza con Restaurante X. No todo el pax va a comer, o deciden hacerlo sobre la marcha. 

**Criterios de aceptación:**
- [ ] Si un Tour tiene actividades aliadas mapeadas previamente desde la Web, la App 4 las muestra como "Estaciones de convenio".
- [ ] Botón en la estación: **"Notificar Arribo"**: Abre WhatsApp automáticamente inyectando el número del aliado y el texto: _"Hola, el grupo de BorondoTours y el Agente [Nombre del Guía] va en camino. Requerimos [X] entradas/platos para los turistas que asisten"_.
- [ ] Permite al guía añadir un gasto especial "Gasto de Convenio" restandolo del Anticipo o de las variables operativas en caso de que sea el Guía quien deba pagar manual allí.

---

## 5. Cierre y Reporting del Recurso

### RF-J06 — Máquina de Estados Operativos & Chat Tour
**Criterios de aceptación:**
- [ ] Dropdown superior (Sticky Header): `🔵 Ejecución`, `🟡 Duda`, `🟠 Problema`, `🔴 Urgencia` (Abre incidentes, dispara SMS si el modo es offline total a los administradores B2B).
- [ ] Pestaña **"Sala de Coordinación"**: Es una Room temporal de Chat tipo WhatsApp dentro del mismo Tour Instance. 
  - Solo están activos en el chat: El Coordinador del B2B, el Chofer asignado, y los Guías asignados a ESA instancia. 
  - Al cerrar el tour, el chat queda de Read-Only.
- [ ] Al seleccionar estado `⚫ TERMINADO`: 
  - Impide apagar o cerrar el dashboard de la ruta sin llenar un miniformulario rápido (Cierre).
  - Preguntas: *¿Señale si hubo demoras o desviaciones? (Textarea Opcional)*. *¿Sobra dinero del anticipo? (Cantidad final calculada vs reportada)*.
  - Al enviarlo, el tour sale de la cola activa hacia historial del Guía.

### RF-J07 — Pestaña de Rendimiento ('Mi Performance')
**Criterios de aceptación:**
- [ ] Disponible en el Menú lateral para Guías.
- [ ] Vista del total de valoraciones que ha acumulado (Solo "Atención del Guía" filtrado gracias al RF-D09 de la Super App de usuarios).
- [ ] Feedback explícito y estrellas, dándole la habilidad al guía de entender qué opina su audiencia directa y ganar el incentivo salarial con su operadora externa.

### RF-J08 — Permisos Nativos del Dispositivo (H-45)
**Contexto:** La app requiere permisos del sistema operativo para funcionar correctamente. Se deben solicitar de forma progresiva y explicar al usuario para qué se usan.

**Criterios de aceptación:**
- [ ] **Cámara**: solicitada la primera vez que el guía intenta escanear un QR. Mensaje: "Necesitamos la cámara para escanear los códigos QR de tus pasajeros".
- [ ] **Ubicación en background**: solicitada para conductores al iniciar un tour asignado. Mensaje: "Compartir tu ubicación en segundo plano permite que el coordinador vea la ruta en tiempo real".
- [ ] **Notificaciones push**: solicitada al primer login. Mensaje: "Activa las notificaciones para recibir alertas urgentes de tus tours y asignaciones".
- [ ] **Contactos**: NO se solicita. El marcado telefónico y WhatsApp se abre vía deeplink con el número pre-cargado desde el manifiesto.
- [ ] Si el usuario deniega un permiso: mostrar banner informativo (no modal bloqueante) con botón "Activar en ajustes" que abre la pantalla de permisos del SO.
- [ ] Los permisos denegados no impiden usar el resto de la app — se degradan funcionalidades específicas con mensaje contextual.
- [ ] Al actualizar la app: no re-solicitar permisos ya otorgados.

---

## 6. Sincronización Offline y Resolución de Conflictos

### RF-J09 — Resolución de Conflictos Offline (H-43)
**Contexto:** Si el guía opera en modo offline y otro usuario (ej. el OPERATOR_COORD desde la web) modifica el mismo manifiesto, al reconectar puede haber conflictos.

**Criterios de aceptación:**
- [ ] **Estrategia de merge**: Last-Write-Wins por campo, no por registro completo.
  - Check-in del pasajero A: el campo `checked_in = true` del guía siempre prevalece sobre el valor web.
  - No Show del pasajero B: ídem — el campo `no_show = true` del guía prevalece.
  - Edición del manifiesto por el COORD (ej. agregar un pasajero de último minuto): se acepta si no hay conflicto con el campo del guía.
- [ ] Cada evento offline tiene un `sync_id` (uuid v4 generado localmente) y un `client_timestamp`.
- [ ] Al sincronizar: el backend recibe el array de eventos offline con `sync_id` para deduplicación.
- [ ] Si un `sync_id` ya fue procesado: el backend responde `409 Conflict - already processed` y el cliente lo descarta silenciosamente.
- [ ] Si hay conflicto real (ej. el pasajero fue eliminado del manifiesto por el COORD mientras el guía lo marcó como asistido): el backend acepta el check-in del guía y notifica al COORD con una alerta.
- [ ] El guía ve un badge contador "X cambios pendientes de sincronizar" mientras está offline.

### RF-J10 — Chat de Coordinación: TTL y Cola Offline (H-44)
**Contexto:** La sala de chat del tour (RF-J06) necesita política de retención y comportamiento offline.

**Criterios de aceptación:**
- [ ] **TTL de mensajes**: los mensajes de la sala de coordinación se eliminan automáticamente **1 día después** de que el tour pase a estado `⚫ TERMINADO`.
- [ ] DynamoDB TTL attribute: `expires_at = tour_completed_at + 86400 segundos`.
- [ ] Mientras está offline: los mensajes escritos se encolan localmente en SQLite (`offline_chat_queue`).
- [ ] Al reconectar: los mensajes de la cola se envían en orden cronológico. Se muestra indicador "Enviando mensajes pendientes..." en el chat.
- [ ] Si la sala ya expiró (TTL cumplido) cuando se reconecta: la cola se descarta y se notifica al guía "La sala de este tour ya cerró".
- [ ] Al cerrar la sala (tour terminado): se muestra el chat en modo Read-Only por 24h antes de desaparecer.

---

## 7. Notificaciones Push por Rol (H-55)

### RF-J11 — Sistema de Notificaciones por Rol y Permiso
**Contexto:** Cada rol recibe notificaciones push relevantes a su función. Las notificaciones se deben enrutar correctamente sin saturar al usuario.

**Matriz de notificaciones por rol:**

| Evento | CLIENT | AGENT | COORD | OP_ADMIN | OP_COORD | OP_GUIDE | OP_DRIVER |
|---|---|---|---|---|---|---|---|
| Reserva confirmada | ✅ | ✅ (si es su cotización) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Tour mañana (recordatorio) | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Urgencia en tour activo | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| No Show en manifiesto | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Nuevo operador pendiente de revisión | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ (solo SUPER_ADMIN web) |
| Cupos liberados (lista de espera) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Asignación a tour | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Pago de comisión liquidado | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

**Criterios de aceptación:**
- [ ] Las notificaciones push se envían vía **Expo Push Notifications** (abstrae APNs y FCM).
- [ ] El token de push se registra en `UserPushTokens` al hacer login en la app.
- [ ] Cada notificación tiene `data.type` (ej. `BOOKING_CONFIRMED`, `TOUR_REMINDER`, `URGENCY_ALERT`) para deeplink al contenido correcto al tap.
- [ ] El usuario puede silenciar categorías de notificaciones desde su perfil (guardado en backend, no solo en dispositivo).
- [ ] Notificaciones de urgencia (`URGENCY_ALERT`, `NO_SHOW`, `TOUR_REMINDER`) son **críticas** y NO se pueden silenciar (bypass del modo No Molestar del SO vía `sound: 'default'` con alta prioridad).
- [ ] Si el token push falla (dispositivo cambiado, token expirado): el backend elimina el token inválido de `UserPushTokens` al recibir el error de Expo.

---

## 8. API Endpoints (H-42)

```
# — Auth y Sesión —
POST /api/v1/auth/login                     ← mismo endpoint que web, responde con JWT
POST /api/v1/auth/refresh                   ← renovar access token
POST /api/v1/mobile/push-token              ← registrar/actualizar token push
DELETE /api/v1/mobile/push-token            ← eliminar token al logout

# — Manifiesto (Guía/Conductor) —
GET  /api/v1/mobile/manifest/today          ← instancias asignadas hoy (pre-download offline)
GET  /api/v1/mobile/manifest/:instance_id   ← manifiesto completo de una instancia
POST /api/v1/mobile/manifest/:instance_id/checkin
  Body: { passenger_id: uuid, status: 'CHECKED_IN' | 'NO_SHOW', sync_id: uuid, client_timestamp: ISO8601 }
POST /api/v1/mobile/manifest/sync           ← batch de eventos offline acumulados
  Body: { events: [{ sync_id, type, payload, client_timestamp }] }

# — Estado del Tour —
PATCH /api/v1/mobile/instances/:instance_id/status
  Body: { status: 'EN_EJECUCION' | 'DUDA' | 'PROBLEMA' | 'URGENCIA' | 'TERMINADO' }
POST  /api/v1/mobile/instances/:instance_id/close
  Body: { deviations?: string, surplus_cash?: number }

# — Gastos de Campo —
POST /api/v1/mobile/field-expenses
  Body: { tour_instance_id, category, amount_cop, description, receipt_s3_key?, payment_method, sync_id }
GET  /api/v1/mobile/field-expenses/:instance_id   ← gastos del tour con saldo restante

# — Chat de Coordinación —
GET  /api/v1/mobile/chat/:instance_id/messages    ← últimas N mensajes (paginación)
POST /api/v1/mobile/chat/:instance_id/messages
  Body: { text?: string, attachment_s3_key?: string, sync_id: uuid }

# — Perfil y Rendimiento —
GET  /api/v1/mobile/guide/performance       ← promedio de calificaciones y reseñas del guía
GET  /api/v1/mobile/guide/tours-history     ← tours completados con paginación

# — Cliente —
GET  /api/v1/mobile/client/bookings         ← upcoming + past
GET  /api/v1/mobile/client/wallet           ← saldo Borondo Coins
GET  /api/v1/mobile/client/voucher/:id      ← QR/PDF del voucher para check-in
```

---

## 9. Modelo de datos (tablas adicionales)

```
UserPushTokens
  - id: uuid (PK)
  - user_id: uuid FK
  - token: string                        ← Expo push token
  - device_platform: enum (IOS, ANDROID)
  - app_version: string
  - created_at: timestamp
  - updated_at: timestamp

ManifestCheckins
  - id: uuid (PK)
  - tour_instance_id: uuid FK
  - booking_id: uuid FK
  - checked_by: uuid FK                  ← OPERATOR_GUIDE
  - status: enum (CHECKED_IN, NO_SHOW)
  - sync_id: uuid (UNIQUE)               ← para deduplicación offline
  - client_timestamp: timestamp          ← hora local del dispositivo
  - server_timestamp: timestamp          ← hora de recepción del servidor
  - created_at: timestamp
```

---

## 10. Dependencias y riesgos

| Dependencia | Riesgo | Decisión |
|---|---|---|
| Expo Push Notifications | APNs requiere cuenta Apple Developer ($99/año) | Obligatorio para iOS; incluir en presupuesto Fase 3 |
| SQLite offline (Expo SQLite) | Pérdida de datos si el usuario desinstala la app | Aceptado — los datos offline se sincronizan antes de cerrar el tour |
| Background Fetch (iOS) | iOS limita el background fetch a intervalos de ~15min | Complementar con descarga manual al abrir la app por la mañana |
| DynamoDB TTL chat | TTL no es exacto (puede tardar hasta 48h en eliminar) | Aceptado — para compliance no hay datos PII en el chat |
| Permisos iOS (App Store Review) | Apple rechaza apps que piden permisos sin justificación clara | Incluir `NSLocationAlwaysUsageDescription` detallado en Info.plist |

---

## Links relacionados
- [[Spec-D-Client-Portal]] (wallet, reservas del cliente)
- [[Spec-F-Auth]] (JWT compartido, roles)
- [[Spec-G-ERP-Operativo]] (manifiesto, incidentes)
- [[Spec-I-B2B-Portal-Operadores]] (AgencyLinks, operador)
- [[../02-ADRs/ADR-003-DynamoDB-Chat]] (chat TTL)
- [[../03-Knowledge/Modelo-Datos-Core]] (FieldExpenses, ManifestCheckins)
