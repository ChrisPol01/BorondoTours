---
tags: [resumen, app2, erp, agencia, crm, agentes, comisiones, super-admin]
created: 2026-04-05
updated: 2026-04-05
spec-detallada: "[[../01-Specs/Spec-F-Auth]] · [[../01-Specs/Spec-G-ERP-Operativo]] · [[../01-Specs/Spec-H-ERP-Agencia]]"
---

# 💼 APP 2: ERP — Agencia Borondo y Agentes

> **Roles que acceden:** `SUPER_ADMIN` · `GERENTE` · `AGENT` · `COORD`.
> **Ruta base:** `/erp/*`.
> **Acceso:** Mismo login que APP 1. El JWT determina la redirección automática.
> **Specs de referencia:** Spec-F (Auth) · Spec-G (ERP Operativo) · Spec-H (ERP Agencia Comercial).

---

## Flujo A: Login Unificado y Redirección por Rol

* **Un solo login para todos los roles:** El mismo formulario `/login` sirve para todos los roles del sistema (internos y operadores). El JWT contiene el `role` y el frontend (TanStack Router `beforeLoad`) redirige automáticamente sin que el usuario elija.
* **Destinos post-login:** `CLIENT` → `/mis-reservas` · `AGENT` → `/erp/crm` · `GERENTE` → `/erp/dashboard` · `COORD` → `/erp/radar` · `SUPER_ADMIN` → `/erp/admin` · `OPERATOR_ADMIN` → `/operador/dashboard` · `OPERATOR_GUIDE` / `OPERATOR_DRIVER` → `/field`.
* **Aislamiento de roles:** Si un rol intenta acceder a una ruta de otro rol → 403 + redirección a su ruta correspondiente. Los roles `OPERATOR_*` solo ven recursos de su propio `operator_id` (tenant isolation por JWT claim).

---

## Flujo B: CRM Pipeline — Kanban del Agente

* **Pipeline de 6 columnas:** `Cotizado` → `Reserva` → `Pagado` → `Ejecución` → `Completado` + `Perdido` (al extremo derecho, en gris/rojo). Las transiciones Reserva/Pagado/Ejecución/Completado son automáticas (webhooks Bold + cron jobs BullMQ). Solo `Perdido` es manual con modal de razón obligatoria (PRECIO / DISPONIBILIDAD / COMPETENCIA / NO_RESPONDE / OTRO).
* **Tarjeta de Lead:** Muestra nombre del cliente, tour, fecha, pax, monto total, fuente del lead y badge de urgencia si lleva >48h sin respuesta. Al hacer clic: drawer lateral con historial de acciones (timeline inmutable), botón "Reenviar link", comisión estimada del agente y notas internas.
* **Regla de Propiedad del Lead (90 días):** El agente que genera la cotización es dueño de la comisión. La propiedad se renueva con cada interacción significativa (nota, reenvío de link, apertura del link por el cliente, modificación de precio/pax). A los 90 días sin actividad el lead pasa a `EXPIRED` y queda libre para cualquier agente. Email de aviso 7 días antes (job BullMQ diario a las 2AM).
* **Venta Colaborativa:** Si el Agente B cierra una cotización del Agente A activo, la comisión principal sigue siendo del Agente A. El Agente B recibe una comisión de "asistencia" configurable por el GERENTE (ej. 10% de la comisión total). Toda transferencia queda registrada en el historial con motivo.
* **Filtros y búsqueda:** Por tour, operador, rango de fechas, fuente (Web B2C / Cotización Manual / Referido), nombre de cliente o número de reserva. Revenue estimado acumulado visible en el pie de cada columna. Actualizaciones en tiempo real vía Socket.io.

---

## Flujo C: Cotizaciones y Links Mágicos de Pago

* **Cotización Manual:** Formulario para armar un paquete personalizado (buscar/crear cliente, seleccionar tour + instancia, configurar pax por regla del operador, add-ons, descuento especial). Si el descuento supera el 10% del total, la cotización queda en `PENDING_APPROVAL` hasta aprobación del GERENTE. Preview de precio y comisión estimada en tiempo real.
* **Link Mágico Bold:** El agente genera un link de pago Bold pre-configurado con `amount` (con IVA y descuento aplicados), `reference: QUOTE-{id}`, `expiration: 72h` y descripción del tour. El cliente solo abre el link y paga, sin necesidad de navegar por el B2C. 1 solo link activo por cotización (el anterior se invalida automáticamente al regenerar).
* **Envío Multicanal:** Botones de acción rápida: `[Copiar link]` · `[Enviar por Email]` (template HTML vía AWS SES con preview antes de enviar) · `[Enviar por WhatsApp]` (wa.me con mensaje pre-llenado: nombre, tour, fecha, monto, link). Cada envío se registra en el historial y reinicia el contador de 90 días de propiedad.
* **Webhook Bold → Kanban automático:** Al recibir el pago (`QUOTE-{id}`), el sistema crea el `Booking` con `source: AGENT_QUOTE`, mueve la tarjeta en tiempo real (Socket.io), dispara el Ka-ching del agente, acredita Borondo Coins al cliente y genera el `OperatorPayout` y `AgentCommission` correspondientes.

---

## Flujo D: Comisiones y Gamificación de Ventas

* **Fórmula de comisión del agente:** `borondo_amount = precio_tour × comisión_operador` → `comisión_agente = borondo_amount × rate_agente`. El rate es configurable individualmente por el GERENTE (ej. junior 15%, senior 25%). Las comisiones quedan en estado `PENDING` hasta la liquidación manual del período.
* **Ka-ching 💰:** Al confirmarse el pago de una cotización propia, el panel del agente reproduce `ka-ching.mp3` (Web Audio API). Solo suena si el tab está activo y visible (Page Visibility API). Toast de celebración de 5 segundos: "¡Venta confirmada! 💰 {nombre_tour} — {monto}". El agente puede desactivar el sonido desde su perfil.
* **Leaderboard del equipo:** Widget en el sidebar con el Top 3 del mes (nombre + revenue + # ventas). Modal expandible con ranking completo por período (semana / mes / trimestre) basado en `borondo_amount` generado. El #1 lleva badge dorado 🥇 en su avatar en todo el ERP. Se actualiza en tiempo real (Socket.io). Los agentes ven el ranking pero no las comisiones específicas de otros.
* **Metas mensuales:** El GERENTE fija una meta de revenue por agente. El agente ve una barra de progreso en su dashboard hacia la meta del mes en curso. Al superar la meta: badge "Meta cumplida 🎯" + notificación al GERENTE + bono de comisión extra configurable (% adicional al rate base).

---

## Flujo E: Dashboard del Gerente de Agencia

* **KPIs en tiempo real:** Selector de período (día / semana / mes). Métricas: revenue total confirmado (suma de `borondo_amount`), número de reservas, tasa de conversión del equipo (Cotizaciones creadas vs Pagadas), leads activos / perdidos / expirados. Gráfico de revenue por día (line chart) y gráfico de conversión por agente (bar chart).
* **Vista consolidada del equipo:** Selector "Ver pipeline de: [agente]" para revisar el Kanban de cualquier agente individualmente, o vista "Todos los agentes" con el Kanban consolidado con indicador del agente dueño en cada tarjeta. El GERENTE puede reasignar leads libremente con nota de justificación obligatoria.
* **Liquidación de comisiones:** Cierre de período quincenal o mensual. Lista de agentes con su total `PENDING`. Al liquidar: registra todas las comisiones como `PAID`, guarda método de pago (transferencia / Nequi / etc.) y envía email de confirmación al agente con el desglose completo. Exportable como PDF (para inversionistas) o CSV (para contabilidad).

---

## Flujo F: Panel SUPER_ADMIN

* **Ghost Login 👻:** Impersonar cualquier usuario por hasta 30 minutos. Banner rojo permanente en toda la interfaz: "⚠️ Modo Ghost — Eres [nombre del usuario] — [Salir]". Toda acción queda registrada en `GhostLoginAuditLog` (quién, a quién, qué acciones, timestamps). No puede activar pagos reales ni modificar contratos de comisión en modo Ghost.
* **Gestión de Tenants (Operadores):** Tabla de operadores con nombre, RUT/NIT, estado (ACTIVE/SUSPENDED/PENDING_REVIEW), comisión vigente y # tours publicados. Crear operador genera automáticamente un usuario `OPERATOR_ADMIN` con credenciales temporales enviadas por email. Suspender pone todos sus tours en `UNLISTED` automáticamente. Historial inmutable de contratos de comisión (solo se crean contratos nuevos con nueva vigencia — no se editan los existentes).
* **Ads Manager:** Gestión de banners en el flujo B2C (posiciones: CHECKOUT_BEFORE_PAY / CONFIRMATION_TOP / CONFIRMATION_BOTTOM). Métricas de CTR e impresiones por anuncio. Configurable el nivel de lealtad mínimo desde el cual el anuncio deja de mostrarse (usuarios premium sin publicidad). Análisis de rentabilidad: ingresos publicidad vs costo total del programa Loyalty.
* **Configuración de Loyalty:** Tabla de niveles editable (umbrales COP acumulado, % Coins por nivel, beneficios). Ajuste manual de Coins de cualquier usuario con nota obligatoria. Historial de cambios auditado con quién cambió qué y cuándo.
* **Reportes Financieros Consolidados:** Revenue bruto total, comisiones retenidas por BorondoTours, pagos liquidados a operadores, comisiones de agentes pagadas, ingresos publicitarios, costo del programa Loyalty y margen neto estimado. Gráfico de tendencia de revenue por mes (últimos 12 meses). Exportable como PDF o CSV.
* **Yield Management (Priorización B2C):** Cuando varios operadores tienen tours del mismo destino y categoría, el motor de búsqueda B2C favorece al que paga mayor comisión. Fórmula: `yield_score = commission_rate × 100` (30% del peso del ranking; el 70% restante es relevancia textual + popularidad). Campo estrictamente interno — invisible para clientes y operadores en cualquier UI pública. El SUPER_ADMIN puede agregar un `featured_boost` (entero 0–50) a un operador específico por acuerdos comerciales especiales.
