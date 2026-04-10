---
tags: [spec, erp, agencia, crm, agentes, cotizaciones, comisiones, super-admin, yield-management]
created: 2026-03-26
updated: 2026-03-26
status: listo-para-implementar
kiro-spec: .kiro/specs/flujo-h-erp-agencia.md
---

# 📋 Spec H — ERP Agencia: CRM, Cotizaciones y Panel Interno

> **App 2 del sistema BorondoTours.** Módulo interno para los equipos comerciales y administrativos de la agencia. No visible para el cliente final (CLIENT). Accede desde el mismo login que App 1, con redirección automática por rol.
>
> **Relación con Spec-G:** Spec-G cubre el módulo *operativo* (coordinadores, tours, guías, vehículos, incidentes). Esta spec cubre el módulo *comercial y administrativo* (agentes de ventas, CRM, cotizaciones, comisiones, gerencia, SUPER_ADMIN).

---

## 1. Objetivos de negocio

- Reemplazar WhatsApp + Excel como herramienta de seguimiento de ventas de los agentes
- Garantizar que las comisiones de los agentes sean trazables, justas y auditables
- Dar al Gerente visibilidad en tiempo real del rendimiento del equipo
- Centralizar la gestión de operadores, anuncios y configuración global en el panel del SUPER_ADMIN
- Aumentar la motivación del equipo de ventas con gamificación (Ka-ching, leaderboard, metas)

---

## 2. Arquitectura de Navegación Post-Login

### RF-H01 — Redirección automática por rol después del login
**Contexto:** El mismo endpoint de login `/api/v1/auth/login` sirve para todos los roles. El JWT contiene el `role`. El frontend redirige automáticamente según ese rol.

**Criterios de aceptación:**
- [ ] Al hacer login exitoso, el frontend evalúa `jwt.role` y redirige:

| Rol | Destino post-login |
|---|---|
| `CLIENT` | `/mis-reservas` (App 1 — portal cliente) |
| `AGENT` | `/erp/crm` (App 2 — Kanban CRM del agente) |
| `GERENTE` | `/erp/dashboard` (App 2 — dashboard de métricas de equipo) |
| `COORD` | `/erp/radar` (App 2 — radar de operaciones, ver Spec-G) |
| `SUPER_ADMIN` | `/erp/admin` (App 2 — panel de administración global) |
| `OPERATOR_ADMIN` | `/operador/dashboard` (App 3 — portal del operador) |
| `OPERATOR_COORD` | `/operador/radar` (App 3 — radar operativo del operador) |
| `OPERATOR_AGENT` | `/operador/manifiestos` (App 3 — gestión de manifiestos) |
| `OPERATOR_GUIDE` | `/field` (App 4 — app móvil o web simplificada) |
| `OPERATOR_DRIVER` | `/field` (App 4 — idem) |

- [ ] Si el usuario accede manualmente a una URL de otra app (ej. CLIENT intenta `/erp/crm`): 403 + redirigir a su dashboard correspondiente
- [ ] La misma sesión JWT es válida en ambas apps (mismo dominio o subdominios del mismo parent)
- [ ] El header/navbar cambia completamente según el rol activo (no hay elementos de B2C en el ERP y viceversa)

> ℹ️ **Nota sobre roles:** El rol `GERENTE` (Gerente de Agencia interno de BorondoTours) es **distinto** del `OPERATOR_ADMIN` (admin de operador externo — App 3). Los roles de operador usan la jerarquía `OPERATOR_*` de 5 niveles definida en Spec-F RF-F01 y Stack-Tecnologico.

---

## 3. CRM Pipeline — Kanban del Agente

### RF-H02 — Tablero Kanban personal del AGENT
**Contexto:** Cada agente tiene su propio pipeline de leads/cotizaciones. Solo ve sus propias tarjetas (excepto cuando aplica venta colaborativa).

**Columnas del pipeline:**

| # | Columna | Descripción | Transición automática |
|---|---|---|---|
| 1 | **Cotizado** | Lead al que se le envió un link de pago | Manual → Reserva si el cliente paga el % de reserva |
| 2 | **Reserva** | El cliente pagó el % de reserva (Split Fare parcial o reserva completa) | Automático vía webhook OnePay.la |
| 3 | **Pagado** | Pago total confirmado por OnePay.la webhook | Automático vía webhook OnePay.la |
| 4 | **Ejecución** | El tour está activo (fecha del tour = hoy) | Automático por cron job (BullMQ) |
| 5 | **Completado** | Tour ejecutado exitosamente | Automático cuando el guía reporta estado `⚫ Terminado` en App 4 |
| 6 | **Perdido** | Lead no se convirtió | Solo manual — el agente arrastra la tarjeta a esta columna |

**Criterios de aceptación del Kanban:**
- [ ] Drag & drop de tarjetas entre columnas (solo a columnas permitidas — no se puede mover Pagado a Cotizado)
- [ ] Columna **Perdido** al extremo derecho, visualmente diferenciada (color gris/rojo)
- [ ] Al mover a **Perdido**: modal obligatorio con campo "Razón de pérdida" (texto libre o select: PRECIO, DISPONIBILIDAD, COMPETENCIA, NO_RESPONDE, OTRO)
- [ ] Contador de tarjetas en el encabezado de cada columna
- [ ] Revenue estimado acumulado en la parte inferior de cada columna (suma de `amount` de cada tarjeta)
- [ ] Filtros: por tour, por operador, por rango de fechas, por fuente (Web B2C, Cotización Manual, Referido)
- [ ] Búsqueda por nombre de cliente o número de reserva
- [ ] Las transiciones automáticas (via webhook) actualizan el Kanban en tiempo real (Socket.io)

### RF-H03 — Tarjeta de Lead/Cotización
**Criterios de aceptación:**
- [ ] La tarjeta muestra: nombre del cliente, tour, fecha del tour, pax, monto total, fuente del lead, fecha de creación
- [ ] Badge de urgencia si la cotización tiene > 48h sin respuesta del cliente
- [ ] Badge "🔒 Propiedad de [nombre agente]" si es una cotización de otro agente en vista colaborativa
- [ ] Al hacer clic en la tarjeta: panel lateral (drawer) con:
  - Historial de acciones (timeline): quién hizo qué y cuándo
  - Botón "Reenviar link" (genera un nuevo link OnePay.la o reenvía el existente)
  - Botón "Agregar nota" (texto libre — visible solo para agentes internos)
  - Botón "Marcar como perdido"
  - Datos completos del cliente (nombre, email, teléfono)
  - Comisión estimada del agente para esta venta

---

## 4. Reglas de Propiedad del Lead y Venta Colaborativa

### RF-H04 — Propiedad del lead (90 días)
**Contexto:** El agente que genera la cotización es el "dueño" y tiene derecho a la comisión si el cliente convierte, incluso si otro agente completa la venta.

**Criterios de aceptación:**
- [ ] Al crear una cotización, se registra `owner_agent_id` con timestamp
- [ ] La propiedad del lead dura **90 días** desde la última interacción significativa
- [ ] Interacciones que **reinician el contador de 90 días**:
  - El agente añade una nota
  - El agente reenvía el link de pago
  - El cliente abre el link de pago (tracked vía redirect)
  - El agente modifica el precio o los pax de la cotización
- [ ] Si pasan 90 días sin interacción: la cotización pasa a estado `EXPIRED` y sale del Kanban
- [ ] El agente recibe email de aviso 7 días antes de que su lead expire (BullMQ job)
- [ ] Los leads expirados van a una vista "Leads sin dueño" accesible para todos los agentes y el Gerente

### RF-H05 — Venta colaborativa
**Contexto:** Si el Agente A creó la cotización pero el Agente B la atiende/cierra (porque el A está ausente o el cliente llama directo), la comisión sigue siendo del Agente A.

**Criterios de aceptación:**
- [ ] Un agente puede ver y editar cotizaciones de otros agentes solo si el `owner_agent` tiene status `INACTIVE` o si el GERENTE/SUPER_ADMIN lo autoriza explícitamente
- [ ] Al cerrar una venta sobre una cotización de otro agente activo:
  - La comisión se acredita al `owner_agent_id` (Agente A)
  - El Agente B recibe una comisión de "asistencia" configurable (ej. 10% de la comisión total — definida por el GERENTE)
- [ ] Toda transferencia de lead entre agentes queda registrada en el historial de la tarjeta con motivo
- [ ] El GERENTE puede reasignar leads libremente con nota de justificación

---

## 5. Cotizaciones y Links Mágicos de Pago

### RF-H06 — Crear cotización manual
**Contexto:** El agente construye un paquete personalizado para un cliente que llegó por WhatsApp, teléfono o referido directo.

**Criterios de aceptación:**
- [ ] Formulario de nueva cotización con:
  - Buscar cliente (por email/teléfono) o crear nuevo (nombre, email, teléfono)
  - Seleccionar tour del catálogo (con búsqueda Meilisearch/ILIKE)
  - Seleccionar instancia (fecha + hora) del tour
  - Configurar pax (misma lógica de pax_rule que el checkout B2C)
  - Seleccionar add-ons opcionales
  - Definir descuento especial (% o monto fijo — requiere aprobación del GERENTE si > 10%)
  - Toggle "Aplica IVA" (si cliente es colombiano) + campo para cédula/NIT
  - Notas internas (no visibles para el cliente)
- [ ] Preview del precio en tiempo real mientras el agente construye la cotización
- [ ] Comisión estimada del agente visible en el formulario (calculada en tiempo real)
- [ ] Al guardar: si descuento <= 10%, la cotización entra automáticamente en columna **Cotizado** del Kanban. Si es > 10%, pasa a **Pendiente Aprobación**.

### RF-H06b — Flujo de aprobación de descuento (H-33)
**Contexto:** Evitar que agentes den descuentos excesivos sin supervisión.

**Criterios de aceptación:**
- [ ] Cotizaciones con descuento > 10% quedan en estado `PENDING_APPROVAL` y no permiten generar link de pago.
- [ ] El GERENTE recibe notificación in-app y badge numérico en su menú.
- [ ] SLA de aprobación: si pasan 24h sin respuesta, el sistema cancela automáticamente la solicitud y notifica al agente.
- [ ] El GERENTE puede aprobar o rechazar (con comentario obligatorio si rechaza).
- [ ] Al aprobar, pasa a estado `COTIZADO` en el Kanban del agente generador.

### RF-H07 — Generar link de pago OnePay.la (Link Mágico)
**Contexto:** El agente genera un link de OnePay.la pre-configurado con todos los parámetros de la cotización. El cliente solo abre el link y paga, sin necesidad de navegar por el portal B2C.

**Criterios de aceptación:**
- [ ] Botón "Generar Link de Pago" en la tarjeta de cotización (si el estado es COTIZADO).
- [ ] El sistema llama a la API de OnePay.la para crear un payment link con:
  - `amount` = precio total calculado (con IVA si aplica, con descuento si aplica)
  - `reference` = `QUOTE-{quote_id}` (para identificar el pago en el webhook)
  - `expiration` = 72h por defecto (configurable por el GERENTE)
  - `description` = "BorondoTours — {nombre del tour} — {fecha}"
- [ ] El link se guarda en la cotización con: URL, fecha de creación, fecha de expiración, estado (ACTIVE/PAID/EXPIRED)
- [ ] Si el link OnePay.la expira sin pago: se puede regenerar (nuevo link, nuevo `expiration`)
- [ ] Un máximo de 1 link activo por cotización (el anterior se invalida al generar uno nuevo)
- [ ] El link incluye un redirect URL que registra cuándo el cliente lo abre (tracking de apertura)

### RF-H08 — Envío del link al cliente
**Criterios de aceptación:**
- [ ] Botones de envío rápido:
  - **"Copiar link"** → clipboard
  - **"Enviar por Email"** → abre modal con preview del email (template HTML pre-llenado con detalles del tour) → envía vía AWS SES
  - **"Enviar por WhatsApp"** → abre `https://wa.me/{phone}?text={message}` en nueva pestaña con mensaje pre-llenado
- [ ] El mensaje de WhatsApp incluye: nombre del cliente, nombre del tour, fecha, monto y el link OnePay.la
- [ ] Al enviar por cualquier canal: se registra la acción en el historial de la tarjeta
- [ ] El envío cuenta como "interacción significativa" que reinicia el contador de 90 días

### RF-H09 — Webhook OnePay.la → actualización automática del Kanban
**Criterios de aceptación:**
- [ ] El webhook `/api/v1/webhooks/onepay` distingue entre pagos B2C y pagos de cotizaciones por el prefijo del `reference`:
  - `QUOTE-{id}` → flujo de cotización (este módulo)
  - `BOOK-{id}` → flujo B2C (Spec C)
- [ ] Al recibir pago de una cotización: crear `Booking` en la BD con `source: 'AGENT_QUOTE'` y `agent_id`
- [ ] Mover la tarjeta automáticamente en el Kanban (Socket.io push al frontend del agente)
- [ ] Disparar el alert sonoro "Ka-ching" (RF-H12)
- [ ] Acreditar los Borondo Coins al cliente (misma lógica que Spec-E)
- [ ] Crear el `OperatorPayout` correspondiente (misma lógica que Spec-G RF-G07)
- [ ] Crear el registro de `AgentCommission` PENDING (RF-H10)

---

## 6. Comisiones de Agentes

### RF-H10 — Cálculo de comisión del agente
**Regla:** El agente gana un % del ingreso que retiene BorondoTours (no del precio bruto del tour).

**Fórmula:**
```
borondo_amount = precio_tour × commission_rate_operador
agent_commission = borondo_amount × agent_commission_rate
```

**Ejemplo:**
```
Tour $200.000 × comisión operador 10% = BorondoTours retiene $20.000
Agente con rate 20% → comisión agente = $20.000 × 20% = $4.000
```

**Criterios de aceptación:**
- [ ] Cada agente tiene un `agent_commission_rate` (%) configurable por el GERENTE o SUPER_ADMIN
- [ ] El rate es configurable individualmente (un agente senior puede tener 25%, uno junior 15%)
- [ ] Al confirmarse un pago: se crea `AgentCommissions` con status `PENDING`, monto calculado y referencia al booking
- [ ] Si el booking es cancelado y ya se calculó la comisión: la comisión se marca `VOIDED`
- [ ] Las comisiones `PENDING` se liquidan manualmente por el GERENTE cada período (quincena o mes)
- [ ] Al marcar `PAID` una comisión: registrar fecha, monto pagado y método (transferencia, Nequi, etc.)

### RF-H11 — Panel de comisiones del agente
**Criterios de aceptación:**
- [ ] Cada agente ve en su panel: comisiones del período actual (PENDING) y historial de períodos anteriores (PAID)
- [ ] Resumen: comisión acumulada este mes, mejor mes histórico, total acumulado all-time
- [ ] Tabla detallada: booking_id, cliente, tour, fecha de venta, monto bruto, monto comisión, estado
- [ ] Exportar historial personal como CSV
- [ ] El agente NO puede ver las comisiones de otros agentes

---

## 7. Gamificación de Ventas

### RF-H12 — Alert sonoro "Ka-ching 💰"
**Contexto:** Cuando un pago de cotización del agente se confirma por webhook, el panel suena automáticamente para celebrar la venta.

**Criterios de aceptación:**
- [ ] Al recibir el evento Socket.io de pago confirmado: reproducir audio `ka-ching.mp3` en el navegador del agente (Web Audio API)
- [ ] El audio solo suena si el agente tiene el tab activo y visible (Page Visibility API)
- [ ] Toast de celebración en pantalla: "¡Venta confirmada! 💰 {nombre_tour} — {monto}" durante 5 segundos
- [ ] El agente puede desactivar el sonido desde su perfil (toggle "Alertas sonoras")
- [ ] Solo se activa para pagos de cotizaciones propias del agente (no de otros agentes)

### RF-H13 — Leaderboard del equipo
**Contexto:** Ranking semanal/mensual de agentes visible para todo el equipo.

**Criterios de aceptación:**
- [ ] Widget en el sidebar del ERP: top 3 agentes del mes actual (nombre + revenue generado + # ventas)
- [ ] Al hacer clic: modal con ranking completo del equipo para el período seleccionable (semana / mes / trimestre)
- [ ] El ranking se basa en `revenue_generated` (suma de `borondo_amount` de sus bookings CONFIRMED)
- [ ] El agente en el puesto #1 tiene un badge dorado 🥇 en su avatar en todo el ERP
- [ ] El leaderboard se actualiza en tiempo real (Socket.io)
- [ ] Los agentes pueden ver el leaderboard pero NO las comisiones específicas de otros agentes

### RF-H14 — Metas mensuales del agente
**Criterios de aceptación:**
- [ ] El GERENTE puede fijar una meta de revenue mensual por agente (ej: $2.000.000 COP en ventas)
- [ ] El agente ve en su dashboard: barra de progreso hacia su meta del mes en curso
- [ ] Al superar la meta: badge "Meta cumplida 🎯" + notificación al GERENTE
- [ ] El GERENTE puede configurar un bono por meta: comisión extra (%) al superar el 100% de la meta

---

## 8. Dashboard del Gerente de Agencia

### RF-H15 — Vista principal del GERENTE
**Contexto:** El Gerente necesita ver el estado del equipo comercial en tiempo real y cerrar el período de comisiones.

**Criterios de aceptación:**
- [ ] Panel principal con KPIs del día/semana/mes (selector de período):
  - Revenue total confirmado (suma de `borondo_amount`)
  - Número de reservas confirmadas
  - Tasa de conversión del equipo (Cotizaciones creadas vs Pagadas)
  - Leads activos vs leads perdidos vs leads expirados
- [ ] Gráfico de revenue por día (line chart) del período seleccionado
- [ ] Gráfico de conversión por agente (bar chart): Cotizado vs Pagado por cada agente
- [ ] Tabla de agentes con columnas: nombre, ventas del período, revenue, comisión pendiente, tasa de conversión, # leads activos

### RF-H16 — Vista consolidada del Kanban del equipo
**Criterios de aceptación:**
- [ ] El GERENTE puede ver el Kanban de cualquier agente desde un selector "Ver pipeline de: [nombre agente]"
- [ ] Vista "Todos los agentes" muestra el Kanban consolidado con indicador de agente dueño en cada tarjeta
- [ ] El GERENTE puede reasignar leads entre agentes directamente desde esta vista

### RF-H17 — Liquidación de comisiones del período
**Criterios de aceptación:**
- [ ] Sección "Liquidar comisiones" con selector de período (quincenal o mensual)
- [ ] Lista de todos los agentes con su total de comisiones PENDING en ese período
- [ ] Al hacer clic en un agente: detalle de cada comisión individual (puede excluir alguna con justificación)
- [ ] Botón "Liquidar a [nombre]": registra todas las comisiones como PAID + campo de método de pago
- [ ] Resumen de liquidación exportable como PDF o CSV
- [ ] El agente recibe email automático de confirmación de liquidación con el desglose

---

## 9. Panel SUPER_ADMIN

### RF-H18 — Ghost Login
**Contexto:** El SUPER_ADMIN puede entrar temporalmente a la cuenta de cualquier usuario para resolver problemas o hacer demos.

**Criterios de aceptación:**
- [ ] En la tabla de usuarios del panel admin: botón "Ingresar como este usuario" (ícono fantasma 👻)
- [ ] Al activar Ghost Login: se genera un token temporal de 30 minutos que impersona al usuario seleccionado
- [ ] El header del ERP/App muestra un banner rojo permanente: "⚠️ Modo Ghost — Eres [nombre del usuario] — [Salir]"
- [ ] Todas las acciones realizadas en modo Ghost se registran en `GhostLoginAuditLog` (qué SUPER_ADMIN, qué usuario, qué acciones, timestamps)
- [ ] El usuario impersonado NO recibe notificación ni sabe que entró alguien más
- [ ] El Ghost Login **no puede** activar pagos reales, modificar contratos de comisión ni borrar datos críticos

### RF-H19 — Gestión de Tenants / Operadores externos
**Criterios de aceptación:**
- [ ] Tabla de operadores con: nombre, RUT/NIT, email de contacto, estado (ACTIVE/SUSPENDED/PENDING_REVIEW), comisión vigente, # tours publicados
- [ ] Crear nuevo operador: formulario con datos de la empresa + definir tasa de comisión inicial
- [ ] Al crear operador: se crea automáticamente un usuario con rol `OPERATOR_ADMIN` con credenciales temporales enviadas por email
- [ ] Suspender operador: soft-suspend (sus tours quedan `UNLISTED` automáticamente, no se aceptan nuevas reservas)
- [ ] Ver todos los tours de un operador (con opción de despublicar individualmente)
- [ ] Ver liquidaciones pendientes y pagas del operador
- [ ] Historial inmutable de contratos de comisión (no se puede editar, solo crear nuevo contrato con nueva vigencia)

### RF-H20 — Panel de Publicidad (Ads Manager)
**Contexto:** Gestión centralizada de los banners que aparecen en el flujo B2C (checkout y confirmación).

**Criterios de aceptación:**
- [ ] Tabla de anuncios activos con: título, imagen preview, posición, fechas de vigencia, prioridad, impressiones, clics, CTR
- [ ] Crear anuncio: subir imagen (S3), definir URL destino, posición (CHECKOUT_BEFORE_PAY / CONFIRMATION_TOP / CONFIRMATION_BOTTOM), fechas de vigencia, prioridad (1–10)
- [ ] Activar/desactivar anuncio con toggle (sin borrar)
- [ ] Gráfico de performance: impresiones y clics por día para el anuncio seleccionado
- [ ] Métricas de rentabilidad: ingreso estimado por publicidad (ingresos totales de anuncios del período) vs costo de Borondo Coins (costo total de Coins otorgados del período)
- [ ] El nivel mínimo de exclusión (`min_level_excluded`): dropdown para configurar desde qué nivel de lealtad el anuncio deja de mostrarse

### RF-H21 — Configuración global de Loyalty
**Criterios de aceptación:**
- [ ] Tabla de niveles de lealtad editable: umbral COP acumulado, % Coins por nivel, beneficios del nivel
- [ ] Al editar: requiere confirmación explícita ya que afecta a todos los usuarios
- [ ] Historial de cambios en la configuración de Loyalty (quién cambió qué y cuándo)
- [ ] Toggle "Congelar nivel de usuario específico" (para casos de fraude o error de sistema)
- [ ] Ajuste manual de Coins de cualquier usuario: campo usuario, monto, tipo (`MANUAL`), nota obligatoria

### RF-H24 — Venta Rápida Directa (H-31)
**Contexto:** El cliente llegó por WhatsApp/oficina y pagó directamente sin pasar por flujo de link mágico.

**Criterios de aceptación:**
- [ ] Botón "Venta Rápida" en ERP que evade el Kanban inicial.
- [ ] Formulario que elige tour, fecha, pax, addons. 
- [ ] Registro de pago manual: selecciona medio (Efectivo, Transferencia, Zelle, etc.) y carga recibo/referencia.
- [ ] El lead asume estado `PAGADO` de inmediato e ingresa la reserva al `Booking` con el agente como owner de la comisión.
- [ ] Impacta balances de caja y reportes financieros automáticos.

### RF-H22 — Reportes financieros consolidados
**Criterios de aceptación:**
- [ ] Dashboard financiero con selector de período (día, semana, mes, trimestre, año):
  - Revenue total bruto (suma de todos los pagos confirmados)
  - Comisiones retenidas por BorondoTours (suma de `borondo_amount`)
  - Pagos liquidados a operadores (suma de `OperatorPayouts` PAID)
  - Comisiones pendientes a operadores (suma de `OperatorPayouts` PENDING)
  - Ingresos publicitarios del período (suma de AdImpressions × CPM estimado — o valor real si hay contrato)
  - Costo del programa de Loyalty (suma de Coins otorgados × $1 COP)
  - Margen neto estimado: comisiones + publicidad − Loyalty − comisiones agentes
- [ ] Exportar reporte completo como PDF (para el inversionista) o CSV (para contabilidad)
- [ ] Gráfico de tendencia de revenue por mes (últimos 12 meses)

---

## 10. Yield Management — Algoritmo de Ranking B2C

### RF-H23 — Priorización automática de operadores en búsqueda B2C
**Contexto:** Cuando dos o más operadores tienen tours "del mismo tipo" (mismo destino y categoría), el sistema favorece al que paga mayor comisión a BorondoTours en los resultados de búsqueda del portal B2C.

**Criterios de aceptación:**
- [ ] Al indexar tours en Meilisearch (Fase 2) o en la query ILIKE (Fase 1): calcular `yield_score` por tour
- [ ] Fórmula del `yield_score`:
  ```
  yield_score = commission_rate_vigente × 100
  ```
- [ ] El `yield_score` se incluye como campo en el índice de Meilisearch y como columna en la tabla `Tours`
- [ ] En el ranking de búsqueda, el `yield_score` tiene peso del 30% (el 70% restante es relevancia textual + popularidad)
- [ ] El campo es interno — **no visible para el cliente ni el operador** en ninguna UI pública
- [ ] El SUPER_ADMIN puede agregar un `featured_boost` (entero 0–50) a un operador específico para posicionamiento especial (acuerdos comerciales)
- [ ] Al cambiar el `commission_rate` de un operador (nuevo contrato): el `yield_score` se recalcula y se re-sincroniza el índice en BullMQ job asíncrono

---

## 11. API Endpoints

```
# CRM y Cotizaciones
GET    /api/v1/erp/crm/pipeline               → Kanban del agente autenticado (AGENT)
GET    /api/v1/erp/crm/pipeline?agent_id=X    → Kanban de otro agente (GERENTE, SUPER_ADMIN)
POST   /api/v1/erp/quotes                     → Crear cotización (AGENT, GERENTE)
PATCH  /api/v1/erp/quotes/:id                 → Editar cotización (owner_agent o GERENTE)
POST   /api/v1/erp/quotes/:id/generate-link   → Generar link OnePay.la (AGENT, GERENTE)
POST   /api/v1/erp/quotes/:id/send            → Enviar link por email (AGENT)
PATCH  /api/v1/erp/quotes/:id/status          → Cambiar estado (drag del Kanban)
POST   /api/v1/erp/quotes/:id/approve         → Aprobar descuento > 10% (GERENTE)
POST   /api/v1/erp/quotes/:id/reject          → Rechazar descuento > 10% (GERENTE)
POST   /api/v1/erp/quotes/fast-sale           → Venta Rápida Directa (AGENT, GERENTE)
POST   /api/v1/erp/quotes/:id/reassign        → Reasignar lead a otro agente (GERENTE, SUPER_ADMIN)
GET    /api/v1/erp/quotes/unowned             → Leads sin dueño (expirados) (AGENT, GERENTE)

# Comisiones de Agentes
GET    /api/v1/erp/commissions/me             → Comisiones propias (AGENT)
GET    /api/v1/erp/commissions?agent_id=X     → Comisiones de un agente (GERENTE, SUPER_ADMIN)
GET    /api/v1/erp/commissions/team           → Resumen del equipo (GERENTE, SUPER_ADMIN)
POST   /api/v1/erp/commissions/liquidate      → Marcar batch como PAID (GERENTE, SUPER_ADMIN)

# Dashboard del Gerente
GET    /api/v1/erp/dashboard/kpis             → KPIs del equipo (GERENTE, SUPER_ADMIN)
GET    /api/v1/erp/dashboard/leaderboard      → Ranking de agentes (AGENT, GERENTE, SUPER_ADMIN)

# SUPER_ADMIN
GET    /api/v1/admin/users                    → Tabla de usuarios con filtros
POST   /api/v1/admin/ghost-login/:user_id     → Activar Ghost Login (SUPER_ADMIN)
DELETE /api/v1/admin/ghost-login              → Salir del Ghost Login
GET    /api/v1/admin/operators                → Lista de operadores
POST   /api/v1/admin/operators                → Crear operador
PATCH  /api/v1/admin/operators/:id/status     → Activar/suspender operador
GET    /api/v1/admin/ads                      → Lista de anuncios
POST   /api/v1/admin/ads                      → Crear anuncio
PATCH  /api/v1/admin/ads/:id                  → Editar anuncio
GET    /api/v1/admin/ads/:id/metrics          → Métricas de un anuncio
GET    /api/v1/admin/loyalty/levels           → Config de niveles de loyalty
PATCH  /api/v1/admin/loyalty/levels           → Actualizar niveles
POST   /api/v1/admin/loyalty/coins/adjust     → Ajuste manual de Coins
GET    /api/v1/admin/reports/financial        → Reporte financiero consolidado (con query params de período)
```

---

## 12. Modelo de datos

```
# Gestión de cotizaciones
Quotes
  - id: uuid
  - client_id: uuid FK (Users)
  - owner_agent_id: uuid FK (Users — AGENT o GERENTE)
  - tour_instance_id: uuid FK
  - pax: jsonb                         ← {adult: 2, child: 1}
  - addons: uuid[]
  - discount_amount: decimal | null
  - discount_approved_by: uuid FK | null
  - subtotal: decimal
  - iva_amount: decimal
  - total: decimal
  - source: enum (WEB_B2C, AGENT_MANUAL, REFERIDO, FAST_SALE)
  - status: enum (PENDING_APPROVAL, COTIZADO, RESERVA, PAGADO, EJECUCION, COMPLETADO, PERDIDO, EXPIRED)
  - lost_reason: string | null
  - onepay_link_url: string | null
  - onepay_link_expires_at: timestamp | null
  - onepay_link_opened_at: timestamp | null   ← tracking de apertura
  - last_interaction_at: timestamp          ← para la regla de 90 días
  - ownership_expires_at: timestamp         ← last_interaction_at + 90 días
  - created_at: timestamp
  - updated_at: timestamp

QuoteActions (historial inmutable)
  - id: uuid
  - quote_id: uuid FK
  - actor_id: uuid FK
  - action_type: enum (CREATED, LINK_GENERATED, LINK_SENT_EMAIL, LINK_SENT_WHATSAPP,
                       LINK_OPENED, NOTE_ADDED, STATUS_CHANGED, REASSIGNED, EXPIRED)
  - metadata: jsonb | null             ← e.g. { to_agent: 'uuid', reason: 'texto' }
  - created_at: timestamp

# Comisiones de agentes
AgentProfiles
  - user_id: uuid FK (1:1 con Users)
  - commission_rate: decimal           ← % del borondo_amount que recibe el agente
  - monthly_goal_cop: decimal | null
  - goal_bonus_rate: decimal | null    ← % extra si supera la meta
  - updated_by: uuid FK
  - updated_at: timestamp

AgentCommissions
  - id: uuid
  - agent_id: uuid FK (Users)
  - booking_id: uuid FK
  - quote_id: uuid FK | null           ← null si la venta fue directa desde B2C
  - borondo_amount: decimal            ← ingreso de BorondoTours en esa venta
  - commission_rate_snapshot: decimal  ← tasa vigente al momento de la venta (inmutable)
  - amount: decimal                    ← borondo_amount × commission_rate_snapshot
  - status: enum (PENDING, PAID, VOIDED)
  - paid_at: timestamp | null
  - paid_by: uuid FK | null
  - payment_method: string | null
  - period: string                     ← "2025-08" (para agrupación por período)
  - created_at: timestamp

AgentCommissionHistory (H-34)
  - id: uuid
  - agent_id: uuid FK (Users)
  - old_rate: decimal
  - new_rate: decimal
  - changed_by: uuid FK (Users)
  - created_at: timestamp

# Ghost Login Audit
GhostLoginAuditLog
  - id: uuid
  - super_admin_id: uuid FK
  - impersonated_user_id: uuid FK
  - started_at: timestamp
  - ended_at: timestamp | null
  - actions_taken: jsonb[]             ← log de acciones realizadas durante el ghost session

# Yield Management (campo adicional en tabla Tours)
# Tours (extensión al modelo existente en Spec-A)
Tours.yield_score: decimal             ← commission_rate × 100
Tours.featured_boost: integer          ← 0–50, configurable por SUPER_ADMIN
```

---

## 13. Dependencias y riesgos

| Dependencia | Riesgo | Decisión |
|---|---|---|
| Migración RBAC | Los roles `AGENCY_ADMIN`, `GUIDE` y `DRIVER` fueron reemplazados por `OPERATOR_ADMIN`, `OPERATOR_COORD`, `OPERATOR_AGENT`, `OPERATOR_GUIDE` y `OPERATOR_DRIVER` | ✅ **Resuelto:** Stack-Tecnologico, Spec-F, Spec-G y Spec-I actualizados. Requiere migración del enum `RoleEnum` en BD al implementar. |
| Ghost Login en producción | Riesgo legal si no se registra correctamente | `GhostLoginAuditLog` es obligatorio. No activar pagos reales en modo Ghost. Considerar política de privacidad y ToS. |
| Descuento > 10% requiere aprobación del Gerente | Si no se implementa, agentes pueden dar descuentos arbitrarios | Validación en backend: si `discount_amount > total × 0.10`, el status de la cotización queda en `PENDING_APPROVAL` hasta que el Gerente la apruebe desde su dashboard |
| Yield Management visible para operadores | Si un operador descubre que el % de comisión afecta su posicionamiento, puede causar fricción comercial | El campo `yield_score` y `featured_boost` son estrictamente internos. El operador solo ve su `commission_rate` en su propio portal. |
| Audio "Ka-ching" bloqueado por browsers | Los navegadores modernos bloquean audio sin interacción previa del usuario | El audio solo se reproduce si el usuario ya interactuó con la página (click/keypress). Al entrar al ERP, mostrar un banner "Activar alertas sonoras" que requiere 1 clic. |
| Regla de 90 días de lead | BullMQ job debe correr diariamente para marcar leads como `EXPIRED` | Job `expire-stale-leads` a las 2AM. Enviar email de aviso al agente 7 días antes. |

---

## 14. Integraciones con otras Specs

| Módulo | Spec relacionada | Punto de integración |
|---|---|---|
| Webhook OnePay.la (pagos de cotizaciones) | Spec-C RF-C WebhookOnePay | Distinguir por prefijo `QUOTE-` vs `BOOK-` en `reference` |
| Borondo Coins al cerrar cotización | Spec-E RF-E03 | Acreditar Coins al cliente tras pago confirmado de cotización |
| Asignación de guías/vehículos | Spec-G RF-G03/G04 | El agente puede ver qué recursos tiene asignada la instancia del tour cotizado |
| Auth y redirección post-login | Spec-F RF-F08 | GERENTE y AGENT redirigen a `/erp/crm` o `/erp/dashboard` respectivamente |
| Catálogo de tours para cotizar | Spec-A RF-A05 | El agente usa el mismo catálogo con búsqueda ILIKE/Meilisearch para armar cotizaciones |

---

## 14. Decisiones Diferidas

### H-36 — Contracargos por Canal de Soporte (Chargebacks)
**Contexto:** Un cliente abre una disputa directamente con su banco (chargeback) en lugar de seguir el proceso de PQRS de BorondoTours. El banco debita el monto de la cuenta de OnePay.la y lo devuelve al tarjetahabiente.

**Flujo actual (cubierto en Spec-C RF-C07 evento `CHARGEBACK`):**
1. OnePay.la notifica el chargeback vía webhook.
2. El sistema marca el booking como `CHARGEBACK` y crea un `OperatorChargeback`.
3. El monto se descuenta del próximo `OperatorPayout`.
4. Se notifica al SUPER_ADMIN.

**Decisión sobre el soporte:** BorondoTours NO disputa chargebacks de forma automática en Fase 1. El SUPER_ADMIN evalúa caso por caso:
- Si el chargeback es fraudulento (cliente recibió el servicio): el SUPER_ADMIN puede subir evidencia al portal de OnePay.la manualmente y notificar al operador.
- Si el chargeback es legítimo: se acepta y se descuenta al operador.
- El equipo de soporte (COORD o SUPER_ADMIN) documenta el caso con nota en `GhostLoginAuditLog` del usuario involucrado.

**Fase 2:** Evaluar integración con herramienta de gestión de chargebacks (ej. Chargebacks911 o servicio nativo de OnePay.la si lo ofrecen).

---

## Links relacionados
- [[Spec-F-Auth]]
- [[Spec-G-ERP-Operativo]]
- [[Spec-C-Checkout]]
- [[Spec-E-Loyalty]]
- [[../02-ADRs/ADR-001-Onepayla-Split-Marketplace]]
- [[../02-ADRs/ADR-003-DynamoDB-Chat]]
- [[../03-Knowledge/Modelo-Comisiones]]
- [[../00-Inicio/Stack-Tecnologico]]
