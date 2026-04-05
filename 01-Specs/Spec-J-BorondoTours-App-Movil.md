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
