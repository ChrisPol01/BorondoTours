---
tags: [spec, b2b, operadores, proveedores, manifiesto, radar, multi-agencia, links-agencia]
created: 2026-04-01
updated: 2026-04-01
status: listo-para-implementar
kiro-spec: .kiro/specs/flujo-i-b2b-operadores.md
---

# 📋 Spec I — B2B Portal de Operadores: Inventario, Manifiesto y Radar

> **App 3 del sistema BorondoTours.** Portal exclusivo para operadores turísticos externos (proveedores). Cada operador gestiona su inventario de tours, ve su manifiesto de pasajeros consolidado de TODAS las agencias, monitorea operaciones en campo y controla sus finanzas.
>
> **Propuesta de valor diferencial:** El manifiesto se llena solo. Los pasajeros que compran por el B2C de BorondoTours o por cotización de un agente aparecen automáticamente. Los que vienen de agencias externas (sin tecnología) se registran con un link público sin login. El operador ve TODO en un solo lugar.
>
> **Visión multi-agencia:** El sistema está diseñado para que el operador sea el proveedor central y múltiples agencias (BorondoTours + externas) vendan sobre el mismo inventario. BorondoTours es un canal más, no el único.

---

## 1. Objetivos de negocio

- Eliminar WhatsApp + Excel como herramienta de gestión de pasajeros y operaciones del operador
- Convertir el manifiesto auto-llenado en el gancho que retiene operadores en la plataforma
- Permitir que agencias externas sin tecnología alimenten datos al operador con un simple link
- Dar al operador visibilidad financiera completa: revenue real, proyecciones y estacionalidad
- Posicionar BorondoTours como plataforma indispensable para operadores (no solo como un canal de ventas más)
- Ofrecer un Radar de operaciones que reemplace los grupos de WhatsApp del coordinador en campo

---

## 2. Roles del Operador (jerarquía interna)

### RF-I01 — Equipo del operador con roles propios
**Contexto:** Cada operador tiene su propia estructura organizacional dentro del portal B2B. Los roles del operador son independientes de los roles de BorondoTours.

**Criterios de aceptación:**
- [ ] 5 roles dentro de cada operador:

| Rol | Código | Descripción | Accede a |
|---|---|---|---|
| Admin del operador | `OPERATOR_ADMIN` | Dueño/gerente del operador. Gestiona todo. | Dashboard, inventario, finanzas, equipo, config |
| Coordinador | `OPERATOR_COORD` | Jefe de operaciones en campo | Radar, manifiestos, asignaciones, incidentes |
| Soporte | `OPERATOR_AGENT` | Personal de apoyo (lectura) | Manifiestos (read-only), tours, reservas |
| Guía | `OPERATOR_GUIDE` | Guía turístico del operador | App 4 Mobile (check-in, estados, gastos) |
| Conductor | `OPERATOR_DRIVER` | Conductor/transportista del operador | App 4 Mobile (GPS pasivo) |

- [ ] Todos los roles tienen `operator_id` en su registro de usuario (obligatorio)
- [ ] El `OPERATOR_ADMIN` puede crear/editar usuarios de su propio equipo
- [ ] Un usuario de operador SOLO ve datos de su propio `operator_id` (aislamiento total entre operadores)
- [ ] Al crear un operador desde el panel SUPER_ADMIN (Spec-H RF-H19): se crea automáticamente un usuario `OPERATOR_ADMIN` con credenciales temporales

> ⚠️ **Impacto en RBAC:** Estos 5 roles REEMPLAZAN los `AGENCY_ADMIN`, `GUIDE` y `DRIVER` del RBAC anterior. El antiguo `COORD` interno de BorondoTours se mantiene como rol separado en el ERP (Spec-G). Ver sección de migración en dependencias.

---

## 3. Dashboard del Operador

### RF-I02 — Vista principal del OPERATOR_ADMIN
**Criterios de aceptación:**
- [ ] Panel con KPIs principales (selector de período: semana / mes / trimestre / año):
  - Revenue bruto total (suma de bookings CONFIRMED × precio)
  - Revenue por canal: BorondoTours B2C vs BorondoTours ERP (agentes) vs Agencias externas
  - Ocupación promedio: `(cupos vendidos / cupos disponibles) × 100` por período
  - # Tours ejecutados vs # Tours cancelados
  - Top 3 tours más vendidos del período
- [ ] Gráfico de tendencia mensual de revenue (line chart, últimos 12 meses)
- [ ] Gráfico de estacionalidad: heatmap con los meses del año × revenue histórico (para que el operador vea cuándo vende más y planifique)
- [ ] Proyección de ingresos: suma del revenue de bookings CONFIRMED para tours de los próximos 30 días
- [ ] Sección de liquidaciones: total PENDING, total PAID del período, enlace directo a la vista de finanzas

### RF-I03 — Dashboard de ocupación visual
**Criterios de aceptación:**
- [ ] Calendario mensual con barras de ocupación por día (similar al semáforo B2C pero con datos internos)
- [ ] Cada día muestra: # tours programados, % ocupación promedio, revenue estimado
- [ ] Los días con ocupación < 30% se marcan en rojo (alerta de baja demanda)
- [ ] Al hacer clic en un día: desglose de cada instancia de tour con cupos vendidos vs disponibles

---

## 4. Gestión de Inventario (Tours y Instancias)

### RF-I04 — Crear tour (flujo de publicación blindado)
**Contexto:** El operador crea el tour pero NO se publica directamente. Pasa por revisión de BorondoTours.

**Criterios de aceptación:**
- [ ] Formulario de creación con wizard de 4 pasos:
  1. **Info básica**: nombre, descripción (Markdown), categoría, dificultad, duración, ciudad, coordenadas (pin en Mapbox), punto de encuentro
  2. **Multimedia**: subir 3–10 fotos (S3), video URL (YouTube/TikTok), orden de galería drag & drop
  3. **Pricing y reglas**: precio base, regla de pax (por edad o estatura), rangos de precio por categoría, **add-ons** opcionales (con nombre, precio, tiempo/duración de uso, y cantidad máxima permitida por reserva).
  4. **Revisión**: preview de cómo se verá el tour en el B2C + botón "Enviar a revisión"
- [ ] Al enviar: el tour queda en estado `PENDING_REVIEW`
- [ ] BorondoTours (SUPER_ADMIN o GERENTE) revisa y aprueba → `PUBLISHED` o rechaza con comentarios → `REJECTED`
- [ ] El operador recibe notificación por email al cambiar de estado
- [ ] Tours en `REJECTED` se pueden editar y reenviar
- [ ] El operador ve la cola de tours pendientes de revisión con indicador de tiempo en espera

### RF-I05 — Solicitud de edición post-publicación
**Contexto:** Una vez publicado, el tour está "blindado". Pero el operador puede necesitar ajustes.

**Criterios de aceptación:**
- [ ] Botón "Solicitar cambio" en la vista del tour publicado
- [ ] Se abre un formulario con los campos actuales pre-llenados (el operador modifica solo lo que necesita)
- [ ] Campos editables: descripción, fotos, video URL, add-ons, punto de encuentro, instrucciones
- [ ] Campos que requieren aprobación: precio base, capacidad máxima, regla de pax, categoría
- [ ] Al enviar: se crea una `TourEditRequest` con estado `PENDING_EDIT`
- [ ] BorondoTours revisa el diff (qué cambió) y aprueba/rechaza
- [ ] Si se aprueba: los cambios se aplican al tour publicado inmediatamente
- [ ] El tour sigue visible y vendible mientras la solicitud está pendiente (no se despublica)
- [ ] Historial de solicitudes de edición con fecha, cambios y estado

### RF-I06 — Gestión de instancias (fechas + cupos)
**Criterios de aceptación:**
- [ ] Calendario mensual para programar instancias del tour
- [ ] Crear instancia: fecha, hora de salida, hora estimada de fin, cupos totales, precio override (opcional)
- [ ] Bulk create: generar instancias recurrentes (ej. "todos los sábados de julio a septiembre, 6:00 AM, 40 cupos")
- [ ] Bloquear fecha manualmente (festivos, mantenimiento, clima previsto)
- [ ] El operador ve en cada instancia: cupos totales / vendidos BorondoTours / vendidos agencias externas / reservados premium / disponibles
- [ ] Si una instancia tiene 0 ventas y faltan > 5 días: el operador puede cancelarla (soft cancel → notificación a BorondoTours)

---

## 5. Pool Híbrido de Cupos (Multi-Agencia)

### RF-I07 — Cupos compartidos con reserva premium por agencia
**Contexto:** Por defecto, todos los cupos están en un pool compartido. El primer canal que vende, se queda el cupo. Pero el operador puede reservar cupos para agencias de alto volumen.

**Criterios de aceptación:**
- [ ] Por defecto: todos los cupos de la instancia están en pool compartido (`pool_cupos = capacity`)
- [ ] El operador puede crear "reservas premium" por agencia:
  - Asignar N cupos a una agencia específica (ej: "Agencia Viajes Colombia tiene 10 cupos reservados")
  - Los cupos reservados NO se venden por el B2C ni por otros canales
  - Si la agencia no usa los cupos reservados **3 días antes del tour**: los cupos vuelven automáticamente al pool compartido (BullMQ cron)
  - El operador recibe notificación cuando los cupos premium se liberan
- [ ] Fórmula de cupos disponibles:
  ```
  cupos_disponibles = capacity - vendidos_borondo - vendidos_agencias - cupos_reservados_premium_activos
  ```
- [ ] En el calendario del operador, cada instancia muestra una barra de stack visual:
  - 🟢 Vendidos BorondoTours | 🔵 Vendidos agencias externas | 🟡 Reservados premium | ⬜ Disponibles
- [ ] El B2C de BorondoTours solo ve `cupos_disponibles` (no sabe que hay cupos reservados premium)

---

## 6. Manifiesto de Pasajeros (el corazón de la App 3)

### RF-I08 — Vista consolidada del manifiesto por tour-instancia
**Contexto:** El manifiesto unifica TODOS los pasajeros de TODAS las fuentes (B2C, ERP agente, links de agencia externa) en una sola lista. Se llena automáticamente para los canales digitales y manualmente para las agencias externas.

**Criterios de aceptación:**
- [ ] Accesible desde la vista de cualquier instancia de tour (botón "Ver manifiesto")
- [ ] Tabla con columnas:
  - # | Nombre completo | Documento (CC/Pasaporte) | Teléfono | Tipo pax (Adulto/Niño/Bebé)
  - Contacto emergencia | Condiciones médicas | Hotel / Punto recogida
  - Agencia origen (BorondoTours B2C / BorondoTours Agente [nombre] / Agencia externa [nombre])
  - Estado pago (CONFIRMED / HOLD / HOLD_AGENCY / PENDING)
  - Estado check-in (⬜ Pendiente / ✅ Confirmado / ❌ No Show)
- [ ] **Auto-fill desde B2C:** cuando un cliente compra por el portal B2C, sus datos se copian automáticamente al manifiesto. Datos disponibles: nombre, email, teléfono (del registro). Datos faltantes: documento, emergencia, hotel → se solicitan en el checkout (RF-C expandido)
- [ ] **Auto-fill desde ERP agente:** cuando un agente cierra una cotización, los datos del cliente se copian al manifiesto
- [ ] **Fill manual desde link de agencia:** los datos que la agencia externa sube por el link público (RF-I10) aparecen automáticamente en el manifiesto
- [ ] **Fill manual directo:** el operador o coordinador puede agregar pasajeros manualmente (para ventas directas sin pasar por ningún canal digital)
- [ ] Barra de progreso: "{X} de {Y} pasajeros con datos completos" (incentiva al operador a completar datos faltantes)
- [ ] Filtro rápido: por agencia de origen, por estado de pago, por estado de check-in
- [ ] Búsqueda por nombre o documento

### RF-I09 — Exportar manifiesto
**Criterios de aceptación:**
- [ ] Botón "Exportar para el guía" → genera PDF optimizado para campo:
  - Encabezado: nombre del tour, fecha, hora, punto de encuentro, nombre del guía asignado
  - Tabla de pasajeros: nombre, documento, teléfono, hotel, condiciones médicas, agencia
  - Espacio para firma manual de check-in (por si no hay señal para la App 4)
  - Número de póliza del seguro médico del tour
  - QR code que enlaza al manifiesto digital en la App 4
- [ ] Botón "Exportar completo" → CSV con todos los campos (para contabilidad del operador)
- [ ] Botón "Exportar por agencia" → genera un CSV/PDF filtrado por cada agencia de origen (para conciliación con agencias externas)

---

## 7. Links de Agencia (canal para agencias sin tecnología)

### RF-I10 — Generar link público por tour-instancia
**Contexto:** El operador genera un link único que envía por WhatsApp a la agencia externa. La agencia abre el link y registra pasajeros. Sin login, sin cuenta, sin fricción.

**Criterios de aceptación:**
- [ ] En la vista de una instancia de tour: botón "Generar link para agencia"
- [ ] Modal para configurar el link:
  - Nombre de la agencia externa (texto libre — para identificar en el manifiesto)
  - Cupos máximos que puede reservar con este link (ej: "máximo 15 de los 40 disponibles")
  - Vigencia del link (por defecto: 72h, configurable)
  - Nota interna del operador (no visible para la agencia)
- [ ] El sistema genera una URL única: `https://borondotours.com/agencia/{token_unico}`
- [ ] El operador puede copiar el link o enviarlo directamente por WhatsApp (`wa.me` pre-llenado)
- [ ] Cada link tiene un token UUID único e irrepetible (no adivinable)
- [ ] El operador puede ver todos los links activos de una instancia y desactivar cualquiera

### RF-I11 — Vista pública del link de agencia (lo que ve la agencia externa)
**Criterios de aceptación:**
- [ ] Al abrir el link, la agencia externa ve una página pública (sin login) con:
  - Logo de BorondoTours + nombre del operador
  - Nombre del tour, fecha, hora de salida, cupos disponibles con este link
  - Badge "Powered by BorondoTours" (branding sutil)
- [ ] Formulario para registrar pasajeros:
  - Botón "Agregar pasajero" (repite el bloque de campos para cada persona)
  - Por cada pasajero:
    - Nombre completo (obligatorio)
    - Documento CC/Pasaporte (obligatorio)
    - Teléfono (obligatorio)
    - Tipo pax: Adulto / Niño / Bebé (obligatorio)
    - Contacto de emergencia: nombre + teléfono (obligatorio)
    - Condiciones médicas relevantes (opcional, textarea)
    - Hotel / punto de recogida (opcional si el tour tiene recogida)
  - Total de pasajeros registrados vs cupos disponibles (validación en tiempo real)
- [ ] Al enviar: los pasajeros se agregan al manifiesto del operador con estado `HOLD_AGENCY`
- [ ] Mensaje de confirmación: "¡Listo! {N} pasajeros registrados. Referencia: {código}. El operador confirmará el pago."
- [ ] El operador recibe notificación push/email: "La agencia {nombre} registró {N} pasajeros en {tour} del {fecha}"

### RF-I12 — Confirmar pago de agencia externa
**Contexto:** La agencia externa pagó al operador por fuera del sistema (transferencia bancaria, efectivo, Nequi). El operador confirma manualmente el pago.

**Criterios de aceptación:**
- [ ] En el manifiesto, los pasajeros `HOLD_AGENCY` tienen un botón "Confirmar pago"
- [ ] Al hacer clic: modal con campo "Método de pago" (Transferencia / Nequi / Efectivo / Otro) y campo "Referencia" (opcional)
- [ ] Al confirmar: los pasajeros pasan a estado `CONFIRMED` y los cupos se descuentan definitivamente del pool
- [ ] Si pasan 48h sin confirmar: los cupos se liberan automáticamente (BullMQ job) y el operador recibe alerta
- [ ] Los pasajeros `HOLD_AGENCY` liberados quedan en estado `RELEASED` en el historial (no se borran)
- [ ] El operador puede extender el plazo de hold manualmente (+24h, +48h) antes de que expire

---

## 8. Radar de Operaciones (OPERATOR_COORD)

### RF-I13 — Grid de tours del día con semáforo
**Contexto:** El coordinador del operador ve todos los tours del día de un vistazo. Cada tour es una tarjeta con un pill de color que refleja el estado en tiempo real reportado por el guía desde la App 4.

**Criterios de aceptación:**
- [ ] Vista tipo grid/cuadrícula de tarjetas (responsive: 3 cols desktop, 2 tablet, 1 mobile)
- [ ] Cada tarjeta muestra:
  - Nombre del tour + hora de salida
  - Nombre del guía asignado + nombre del conductor
  - Pax confirmados / capacidad total
  - Pill de estado con color dinámico:
    - ⚪ `PENDIENTE` — el tour no ha iniciado todavía
    - 🔵 `EN_RUTA` — el guía reportó inicio
    - 🟡 `DUDA` — el guía tiene una duda operativa
    - 🟠 `PROBLEMA` — hay un problema pero no es urgente
    - 🔴 `URGENCIA` — requiere atención inmediata del coordinador (dispara Alerta Emergente/Toast)
    - ⚫ `TERMINADO` — el tour finalizó
  - Los cambios de estado actualizan el pill en tiempo real (Socket.io push desde App 4)
- [ ] Las tarjetas con estado 🔴 `URGENCIA` disparan un Toast, suben automáticamente a la fila #1 del grid, y parpadean.
- [ ] Opciones rápidas en la tarjeta: el Guía (desde App 4) o el Coordinador/Gerente (desde el Radar) pueden marcar la urgencia como "Resuelta".
- [ ] Reasignación manual: un `GERENTE` interno o el `OPERATOR_COORD` pueden consultar guías/flota libre en sistema, pero reasignarán manualmente (ej. vía llamada externa) antes de actualizar en el Radar.
- [ ] Filtro: por tour, por guía, por estado actual
- [ ] Selector de fecha para ver tours de otros días (historial)

### RF-I14 — Manifiesto en vivo (al hacer clic en tarjeta del Radar)
**Criterios de aceptación:**
- [ ] Al hacer clic en una tarjeta: se abre un panel lateral (drawer) con el manifiesto de esa instancia
- [ ] El estado de check-in de cada pasajero se actualiza en tiempo real:
  - ⬜ Pendiente (el guía aún no lo ha escaneado)
  - ✅ Check-in OK (el guía escaneó el QR del pasajero)
  - ❌ No Show (el guía lo marcó como ausente)
  - ↩️ Llegó tarde (revirtió un No Show)
- [ ] Barra de progreso: "{X} de {Y} pasajeros confirmados en campo"
- [ ] El coordinador puede ver quién falta y contactar al pasajero directo (botón de llamada/WhatsApp)
- [ ] Al completarse el check-in: el coordinador ve un resumen rápido (total presentes, total no show)

### RF-I15 — Mapa GPS de vehículos en tiempo real
**Criterios de aceptación:**
- [ ] Mapa Mapbox con marcadores de cada vehículo en ruta del operador
- [ ] Cada marcador muestra: placa del vehículo, nombre del tour, hora de inicio
- [ ] Actualización cada 30 segundos (ping GPS desde App 4 del conductor/guía).
- [ ] El mapa se activa automáticamente 1 hora antes del tour (cuando el GPS del empleado se enciende).
- [ ] **Granularidad del Tracking:** El tracking solo ocurre si el Operador al asginar una flota/guía a una instancia de tour le dio "check" a la opción "Obligar/Mostrar GPS en app". Si no tiene el check, a ese recurso no se le pedirá ubicación en campo.
- [ ] Si un vehículo pierde señal en ruta, en el radar se sustituye temporalmente el pill por `⚠️ Sin conexión (Revisar última actualización)`.
- [ ] Al hacer clic en un marcador: popup con detalle del tour + link al manifiesto.
- [ ] Trail de ruta: línea que muestra el recorrido que ha hecho el vehículo.

### RF-I16 — Timeline de estados y alertas
**Criterios de aceptación:**
- [ ] Panel lateral derecho (siempre visible en el Radar) con timeline cronológico
- [ ] Cada entrada del timeline muestra: hora, tour, guía, cambio de estado (ej: "14:30 — Tour Eje Cafetero — Guía Juan → 🔵 EN_RUTA")
- [ ] Las entradas 🔴 URGENCIA se resaltan con fondo rojo + notificación sonora (audio alert similar al Ka-ching)
- [ ] El coordinador puede agregar una nota a cualquier entrada del timeline (ej: "Llamé al guía, todo OK")
- [ ] Al hacer clic en una entrada: salta a la tarjeta del tour correspondiente en el grid
- [ ] Los eventos de NO_SHOW también aparecen en el timeline (ej: "15:10 — María García marcada como NO SHOW")

---

## 9. Excepciones y Fuerza Mayor

### RF-I17 — Cancelación por fuerza mayor (OPERATOR_COORD)
**Criterios de aceptación:**
- [ ] Botón "Cancelar por fuerza mayor" en la tarjeta del tour (Radar)
- [ ] Modal obligatorio con:
  - Tipo de cancelación: CLIMA, DESASTRE_NATURAL, BLOQUEO_VIAL, ORDEN_PUBLICA, FALLA_MECANICA, OTRO
  - Descripción detallada (obligatorio, mín. 50 caracteres)
  - Adjuntar evidencia (foto/documento — S3)
- [ ] Al confirmar: el tour pasa a estado `CANCELLED_FORCE_MAJEURE`
- [ ] **Notificación Inmediata al Pasajero:** El sistema dispara automáticamente Correos y SMS informando a todos los `CLIENT`: *"El tour [nombre] se ha cancelado por [motivo]"*.
- [ ] **Impacto en clientes de BorondoTours:** cada booking CONFIRMED recibe Coins Restringidos al operador (ver Spec-E, Modelo-Comisiones). Si algún cliente escala a Soporte y la agencia decide aplicar un reembolso real al método de pago (Tarjeta), este se verá reflejado en el balance B2B del Operador como un *Contracargo por Soporte*.
- [ ] **Impacto en agencias externas:** los pasajeros `HOLD_AGENCY` o `CONFIRMED` quedan en estado `CANCELLED_BY_OPERATOR`. El operador debe gestionar el reembolso directamente con la agencia (fuera del sistema).
- [ ] BorondoTours (SUPER_ADMIN, GERENTE) recibe notificación inmediata con los detalles.
- [ ] El incidente queda registrado en el log inmutable de la instancia (Spec-G RF-G08).
- [ ] El OperatorPayout de esa instancia se recalcula (reteniendo deducciones si hay contracargos/reembolsos directos).

---

## 10. Gestión de Equipo del Operador

### RF-I18a — Onboarding checklist del operador (primer login)
**Contexto:** Cuando el OPERATOR_ADMIN entra por primera vez (credenciales temporales enviadas por BorondoTours), ve un checklist de activación no bloqueante. Puede usar el portal sin completarlo, pero el dashboard muestra el % de completitud hasta terminar todas las tareas.

**Criterios de aceptación:**
- [ ] Al detectar primer login (`first_login: true` en el registro de usuario): mostrar banner de bienvenida con el checklist
- [ ] Ítems del checklist (en orden sugerido):
  1. ✏️ Completar perfil de la empresa (nombre, logo, descripción, teléfono, ciudad) → RF-I21
  2. 🚌 Agregar primer vehículo al catálogo (placa, tipo, capacidad) → RF-I19
  3. 👷 Invitar primer miembro del equipo (mínimo 1: guía o coordinador) → RF-I18
  4. 🗺️ Crear primer tour (iniciar wizard de 4 pasos) → RF-I04
  5. 🔒 Cambiar contraseña temporal por una definitiva
- [ ] Cada ítem tiene un botón de acción directo que lleva a la pantalla correspondiente
- [ ] El checklist es accesible desde el dashboard hasta que todos los ítems estén completados
- [ ] Al completar el 100%: banner de celebración "¡Tu cuenta está lista! 🎉" y el checklist desaparece
- [ ] El OPERATOR_ADMIN puede agregar usuarios de su equipo directamente desde el checklist (acceso rápido a RF-I18)

### RF-I18 — Crear y gestionar equipo (OPERATOR_ADMIN)
**Criterios de aceptación:**
- [ ] Tabla de miembros del equipo con: nombre, rol, email, teléfono, estado (ACTIVE/INACTIVE), fecha de ingreso
- [ ] Crear nuevo miembro: nombre, email, teléfono, rol (OPERATOR_COORD / OPERATOR_AGENT / OPERATOR_GUIDE / OPERATOR_DRIVER)
- [ ] Al crear: se envían credenciales temporales por email. Los GUIDE y DRIVER reciben también un link de descarga de la App 4
- [ ] Desactivar miembro: soft-delete. No puede loguearse pero sus datos históricos se mantienen
- [ ] El admin puede editar el perfil de cualquier miembro de su equipo

### RF-I19 — Catálogo de vehículos (OPERATOR_ADMIN / OPERATOR_COORD)
**Criterios de aceptación:**
- [ ] Tabla de vehículos: placa, capacidad, tipo (BUS/VAN/JEEP/LANCHA/OTRO), estado (ACTIVO/MANTENIMIENTO/INACTIVO)
- [ ] Documentos por vehículo: SOAT, tarjeta de propiedad, revisión técnico-mecánica (subir PDF a S3 privado)
- [ ] Alerta automática 30 días antes del vencimiento del SOAT o la revisión (BullMQ job + email al admin)
- [ ] Al asignar vehículo a una instancia: validar que el vehículo tiene capacidad suficiente para el pax total
- [ ] Historial de asignaciones por vehículo (en qué tours ha estado)

### RF-I19b — Asignación de equipo y vehículos a instancias (OPERATOR_COORD)
**Contexto:** El OPERATOR_COORD es quien asigna guía + conductor + vehículo a cada instancia de tour desde el portal B2B. BorondoTours NO hace esta asignación — solo ve el resultado en su Radar interno (Spec-G). El operador conoce a su equipo y disponibilidad.

**Criterios de aceptación:**
- [ ] En la vista de cada instancia de tour: sección "Asignaciones" con estado `SIN_ASIGNAR` / `ASIGNADO`
- [ ] Botón "Asignar equipo": abre modal con:
  - Selector de **guía** (lista del equipo con rol `OPERATOR_GUIDE`, filtrada por disponibilidad ese día — sin conflictos de horario en otras instancias)
  - Selector de **conductor** (lista del equipo con rol `OPERATOR_DRIVER`, filtrada por disponibilidad)
  - Selector de **vehículo** (catálogo de vehículos ACTIVO, filtrado por capacidad ≥ pax confirmados y sin conflicto de horario)
  - Toggle por recurso: "Obligar GPS en App 4" (si está ON, la App 4 solicitará ubicación activa a ese recurso)
- [ ] Validación en tiempo real: si el guía/conductor/vehículo tiene conflicto de horario → badge de advertencia naranja (no bloquea, solo avisa)
- [ ] Al guardar: el guía y el conductor reciben notificación push + email con los detalles de la instancia (tour, fecha, hora, punto de encuentro, pax count)
- [ ] La asignación queda visible en el Radar del operador (RF-I13) y en el Radar interno de BorondoTours (Spec-G)
- [ ] Si BorondoTours necesita reasignar recursos (emergencia), el COORD interno puede hacerlo desde Spec-G y el operador recibe notificación
- [ ] Historial de asignaciones por instancia (quién asignó, cuándo, qué cambió)

---

## 11. Configuración y Privacidad

### RF-I20 — Privacidad de GPS tracking
**Criterios de aceptación:**
- [ ] En la configuración del operador, sección "Privacidad de tracking GPS":
  - Toggle "BorondoTours puede ver el GPS de mis vehículos" (default: ON)
  - Toggle "Los clientes pueden ver el GPS de mis vehículos" (default: OFF)
  - Estos toggles aplican a TODOS los tours del operador (no por tour individual)
- [ ] Si el operador desactiva el GPS para BorondoTours: el Radar de BorondoTours (COORD interno) no ve los marcadores de ese operador
- [ ] Si el operador activa el GPS para clientes: la app B2C muestra un mini-mapa con la ubicación del bus en el chat tripartito (24h antes)
- [ ] Los cambios de privacidad quedan registrados en log de auditoría

### RF-I21 — Perfil del operador
**Criterios de aceptación:**
- [ ] Datos editables: nombre de la empresa, logo (S3), descripción breve, teléfono principal, email de contacto, dirección, ciudad
- [ ] Datos NO editables (gestionados por BorondoTours): NIT/RUT, comisión vigente, estado (ACTIVE/SUSPENDED)
- [ ] Comisión vigente visible como badge de solo lectura con nota: "Para cambios de comisión, contacta a BorondoTours"

---

## 12. Finanzas del Operador

### RF-I22 — Vista de liquidaciones
**Criterios de aceptación:**
- [ ] Tabla de liquidaciones con filtros: período (mes, quincena, custom), estado (PENDING/PAID), tour
- [ ] Cada fila muestra: booking_id, tour, fecha, cliente (nombre, sin datos personales extra), agencia origen, monto bruto, comisión BorondoTours, monto a recibir, estado
- [ ] Totales del período: monto bruto total, comisión total, monto neto a recibir, pagos recibidos
- [ ] Exportar como CSV o PDF
- [ ] Badge visual: 💰 "Te debemos $X" para PENDING total

### RF-I23 — Revenue por canal de venta
**Criterios de aceptación:**
- [ ] Gráfico de pastel/dona: % de revenue por canal (BorondoTours B2C / BorondoTours Agente / Agencias externas / Venta directa)
- [ ] Tabla de desglose por canal con: # bookings, revenue bruto, revenue neto, pax total
- [ ] El operador puede ver qué canal le genera más ingresos y decidir dónde enfocar esfuerzos

### RF-I24 — Proyección de ingresos
**Criterios de aceptación:**
- [ ] Widget "Ingresos próximos 30 días": suma del revenue de bookings CONFIRMED en instancias futuras
- [ ] Desglose por semana: gráfico de barras con revenue proyectado por semana
- [ ] Gráfico de estacionalidad: heatmap de los últimos 12 meses (qué meses vendió más históricamente)
- [ ] Los datos de proyección excluyen los bookings `HOLD_AGENCY` no confirmados

### RF-I24b — Reseñas de los tours (OPERATOR_ADMIN — solo lectura)
**Contexto:** El OPERATOR_ADMIN puede ver las calificaciones y comentarios que los clientes dejan sobre sus tours en el B2C (Spec-B Social Proof). Es solo lectura — el operador no puede responder públicamente ni editar. Puede reportar reseñas abusivas a BorondoTours.

**Criterios de aceptación:**
- [ ] Sección "Reseñas" en el perfil de cada tour del operador
- [ ] Muestra: calificación promedio (1–5 ⭐), total de reseñas, distribución por estrella (histograma)
- [ ] Listado de reseñas individuales: nombre del cliente (iniciales o primer nombre por privacidad), calificación, comentario, fecha, tour-instancia
- [ ] Las reseñas son de solo lectura — el operador NO puede responder ni editar
- [ ] Botón "Reportar reseña" → envía alerta al SUPER_ADMIN de BorondoTours para revisión (campo razón obligatorio: FALSA / OFENSIVA / IRRELEVANTE)
- [ ] El operador NO puede ver el nombre completo ni los datos de contacto del cliente que dejó la reseña
- [ ] Filtros: por calificación (1–5), por tour, por período

---

## 13. Automatizaciones y Notificaciones

### RF-I25 — Notificaciones automáticas al operador
**Criterios de aceptación:**
- [ ] Tipos de notificaciones (email + push en portal):

| Evento | Destinatario | Urgencia |
|---|---|---|
| Nueva reserva desde B2C/ERP | OPERATOR_ADMIN, OPERATOR_COORD | Normal |
| Nuevo registro de agencia via link | OPERATOR_ADMIN, OPERATOR_COORD | Normal |
| Cupos premium liberados (agencia no usó) | OPERATOR_ADMIN | Alta |
| Tour con baja ocupación (< 30%, faltan 5 días) | OPERATOR_ADMIN | Media |
| SOAT o revisión vence en 30 días | OPERATOR_ADMIN | Alta |
| Solicitud de edición de tour aprobada/rechazada | OPERATOR_ADMIN | Normal |
| Tour nuevo aprobado/rechazado por BorondoTours | OPERATOR_ADMIN | Normal |
| Guía reportó 🔴 URGENCIA | OPERATOR_COORD | Crítica (sonora) |
| Pasajero marcado como NO SHOW | OPERATOR_COORD | Normal |
| Liquidación marcada como PAID por BorondoTours | OPERATOR_ADMIN | Normal |

- [ ] El operador puede configurar qué notificaciones recibir por email vs solo en el portal
- [ ] Las notificaciones críticas (URGENCIA) siempre se envían por email + push + sonido en el Radar

### RF-I26 — Cron jobs automáticos
**Criterios de aceptación:**
- [ ] `release-premium-cupos` — 3 días antes de cada tour: liberar cupos premium no usados → pool compartido
- [ ] `release-hold-agency` — cada hora: liberar pasajeros `HOLD_AGENCY` con más de 48h sin confirmación de pago
- [ ] `alert-low-soat` — diario a las 8AM: verificar vencimientos de SOAT/revisión en los próximos 30 días
- [ ] `alert-low-occupancy` — diario a las 9AM: marcar instancias con < 30% de ocupación que son en los próximos 5 días
- [ ] `move-to-execution` — cada hora: mover bookings a estado EJECUCIÓN cuando `tour_instance.date = today`
- [ ] `close-tour-instance` — cada hora: cuando el guía reporta ⚫ TERMINADO, cerrar la instancia

---

## 14. API Endpoints

```
# Dashboard y Finanzas
GET    /api/v1/b2b/dashboard/kpis                    → KPIs del operador (OPERATOR_ADMIN)
GET    /api/v1/b2b/dashboard/occupancy                → Calendario de ocupación
GET    /api/v1/b2b/finance/payouts                    → Liquidaciones con filtros
GET    /api/v1/b2b/finance/revenue-by-channel         → Revenue por canal
GET    /api/v1/b2b/finance/projection                 → Proyección de ingresos 30 días

# Inventario
POST   /api/v1/b2b/tours                             → Crear tour (OPERATOR_ADMIN)
GET    /api/v1/b2b/tours                             → Tours del operador
GET    /api/v1/b2b/tours/:id                         → Detalle de un tour
POST   /api/v1/b2b/tours/:id/edit-request            → Solicitar edición (OPERATOR_ADMIN)
POST   /api/v1/b2b/tours/:id/instances               → Crear instancias
POST   /api/v1/b2b/tours/:id/instances/bulk           → Bulk create instancias
PATCH  /api/v1/b2b/instances/:id                      → Editar instancia (cupos, bloquear)
DELETE /api/v1/b2b/instances/:id                      → Cancelar instancia (soft)

# Cupos Premium
POST   /api/v1/b2b/instances/:id/premium-allocation   → Reservar cupos para agencia
DELETE /api/v1/b2b/instances/:id/premium-allocation/:alloc_id → Liberar reserva

# Manifiesto
GET    /api/v1/b2b/instances/:id/manifest             → Manifiesto completo
POST   /api/v1/b2b/instances/:id/manifest/passengers  → Agregar pasajero manual
PATCH  /api/v1/b2b/manifest/passengers/:id            → Editar datos pasajero
GET    /api/v1/b2b/instances/:id/manifest/export       → Exportar PDF/CSV
POST   /api/v1/b2b/manifest/passengers/confirm-payment → Confirmar pago agencia
POST   /api/v1/b2b/manifest/passengers/extend-hold    → Extender plazo de hold

# Links de Agencia
POST   /api/v1/b2b/instances/:id/agency-links          → Generar link
GET    /api/v1/b2b/instances/:id/agency-links          → Listar links activos
DELETE /api/v1/b2b/agency-links/:link_id               → Desactivar link
GET    /api/v1/public/agency/{token}                   → Vista pública del link (sin auth)
POST   /api/v1/public/agency/{token}/register          → Registrar pasajeros (sin auth)

# Radar
GET    /api/v1/b2b/radar/today                        → Tours del día (OPERATOR_COORD)
GET    /api/v1/b2b/radar/:date                        → Tours de un día específico
GET    /api/v1/b2b/radar/instances/:id/live-checkin    → Check-in en vivo
GET    /api/v1/b2b/radar/gps/vehicles                 → Posiciones GPS de vehículos

# Equipo
GET    /api/v1/b2b/team                               → Miembros del equipo
POST   /api/v1/b2b/team                               → Crear miembro
PATCH  /api/v1/b2b/team/:id                           → Editar miembro
GET    /api/v1/b2b/vehicles                           → Catálogo de vehículos
POST   /api/v1/b2b/vehicles                           → Registrar vehículo
PATCH  /api/v1/b2b/vehicles/:id                       → Editar vehículo

# Excepciones
POST   /api/v1/b2b/instances/:id/force-majeure        → Cancelar por fuerza mayor

# Configuración
GET    /api/v1/b2b/settings                           → Config del operador
PATCH  /api/v1/b2b/settings                           → Actualizar config/privacidad
```

---

## 15. Modelo de datos

```
# Extensión a Tours (campos nuevos)
Tours (extensión)
  - status: enum (DRAFT, PENDING_REVIEW, PUBLISHED, REJECTED, SUSPENDED)
  - review_notes: text | null          ← comentarios de BorondoTours al rechazar/aprobar
  - reviewed_by: uuid FK | null
  - reviewed_at: timestamp | null

TourEditRequests
  - id: uuid
  - tour_id: uuid FK
  - requested_by: uuid FK (OPERATOR_ADMIN)
  - changes: jsonb                     ← diff de campos modificados
  - status: enum (PENDING_EDIT, APPROVED, REJECTED)
  - review_notes: text | null
  - reviewed_by: uuid FK | null
  - created_at: timestamp
  - resolved_at: timestamp | null

# Cupos premium
PremiumAllocations
  - id: uuid
  - tour_instance_id: uuid FK
  - agency_name: string
  - cupos_reserved: integer
  - release_at: timestamp              ← auto-release date (3 días antes del tour)
  - status: enum (ACTIVE, USED, RELEASED, CANCELLED)
  - created_by: uuid FK (OPERATOR_ADMIN)
  - created_at: timestamp

# Manifiesto de pasajeros
ManifestPassengers
  - id: uuid
  - tour_instance_id: uuid FK
  - booking_id: uuid FK | null          ← null si es fill manual o agencia externa
  - agency_link_id: uuid FK | null      ← null si viene de B2C/ERP/manual
  - source: enum (B2C, ERP_AGENT, AGENCY_LINK, MANUAL)
  - agency_name: string | null          ← nombre agencia externa (si aplica)
  - agent_name: string | null           ← nombre agente BorondoTours (si aplica)
  # Datos del pasajero
  - full_name: string
  - document_type: enum (CC, PASAPORTE, TI, CE)
  - document_number: string
  - phone: string
  - pax_type: enum (ADULTO, NINO, BEBE)
  - emergency_contact_name: string | null
  - emergency_contact_phone: string | null
  - medical_conditions: text | null
  - hotel: string | null
  - pickup_point: string | null
  # Estados
  - payment_status: enum (CONFIRMED, HOLD_AGENCY, RELEASED, CANCELLED_BY_OPERATOR)
  - checkin_status: enum (PENDING, CHECKED_IN, NO_SHOW, LATE_ARRIVAL)
  - payment_confirmed_at: timestamp | null
  - payment_method_external: string | null  ← solo para agencias externas
  - payment_reference_external: string | null
  - hold_expires_at: timestamp | null       ← para HOLD_AGENCY
  - created_at: timestamp
  - updated_at: timestamp

# Links de agencia
AgencyLinks
  - id: uuid
  - tour_instance_id: uuid FK
  - operator_id: uuid FK
  - token: string (unique, UUID)
  - agency_name: string
  - max_cupos: integer
  - cupos_used: integer (default 0)
  - expires_at: timestamp
  - is_active: boolean
  - internal_note: text | null
  - created_by: uuid FK (OPERATOR_ADMIN)
  - created_at: timestamp

# Extensión a Users para roles de operador
Users (extensiones)
  - operator_id: uuid FK | null         ← obligatorio si role es OPERATOR_*
  - operator_role: enum (ADMIN, COORD, AGENT, GUIDE, DRIVER) | null

# Radar — Estados operativos (vienen de App 4)
TourInstanceStates
  - id: uuid
  - tour_instance_id: uuid FK
  - reported_by: uuid FK (OPERATOR_GUIDE)
  - state: enum (PENDIENTE, EN_RUTA, DUDA, PROBLEMA, URGENCIA, TERMINADO)
  - note: text | null
  - created_at: timestamp               ← inmutable (solo append)
```

---

## 16. Dependencias y riesgos

| Dependencia | Riesgo | Decisión |
|---|---|---|
| Migración RBAC: 5 roles de operador | Los roles actuales (AGENCY_ADMIN, GUIDE, DRIVER) se deben reemplazar por OPERATOR_* | **Acción requerida:** Actualizar el enum de roles en la BD, el Stack-Tecnologico y todos los Guards de NestJS. Los GUIDE/DRIVER pasan a tener `operator_id` obligatorio. |
| Link público sin auth | Riesgo de spam o abuso (alguien llena cupos falsos) | Rate limiting por IP (máximo 3 registros por hora por IP). CAPTCHA si se detectan patrones sospechosos. El operador puede desactivar cualquier link. |
| GPS ping cada 30s | Costo de datos en zonas rurales de Colombia | El ping solo se activa 1h antes del tour. Si la conexión es lenta, acumula pings y los envía cuando hay señal (batch sync). |
| Cupos premium auto-release a 3 días | Si la agencia pagó pero el operador no confirmó, se pierden los cupos | Email de aviso al operador 4 días antes: "Tienes cupos premium sin confirmar pago para {tour} del {fecha}". |
| Solicitudes de edición | Si BorondoTours tarda en aprobar, el operador se frustra | SLA de 24h para revisión. Notificación al SUPER_ADMIN si hay solicitudes pendientes > 24h. |
| Manifiesto con datos personales (CC, pasaportes) | Cumplimiento de ley de protección de datos (Habeas Data Colombia) | Datos sensibles encriptados en reposo (AES-256). El operador firma ToS aceptando responsabilidad de manejo de datos personales. |
| Socket.io para Radar en tiempo real | Conexión puede caerse en zonas rurales | Fallback: polling cada 60s si el WebSocket se desconecta. Reconexión automática con exponential backoff. |

---

## 17. Integraciones con otras Specs

| Módulo | Spec relacionada | Punto de integración |
|---|---|---|
| Tour publicado → aparece en B2C | Spec-A RF-A04 | Solo tours con status `PUBLISHED` aparecen en el catálogo |
| Booking B2C → auto-fill mani