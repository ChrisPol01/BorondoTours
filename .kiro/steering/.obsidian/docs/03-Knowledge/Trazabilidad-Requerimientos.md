---
tags: [knowledge, trazabilidad, requerimientos, BR, FR, NFR, matriz]
created: 2026-07-05
updated: 2026-07-05
status: activo
---

# 🔗 Trazabilidad de Requerimientos — BorondoTours

> **⚠️ Nota de stack (ADR-011, 2026-07-10):** La arquitectura es **serverless-first sobre AWS Lambda**.
> Donde en las tablas de abajo se mencionen tecnologías de la arquitectura anterior, léase la equivalencia:
> **Socket.io → API Gateway WebSocket API**; **BullMQ → EventBridge Scheduler + SQS + Step Functions**;
> **ILIKE/Meilisearch → PostgreSQL `pg_trgm`** (F1-2). Estos son los requerimientos (el QUÉ); el CÓMO
> técnico vigente está en [[../02-ADRs/ADR-011-Arquitectura-Consolidada]].

> Este documento alinea los tres niveles de requerimientos para que ninguno quede huérfano:
> **Requerimiento de Negocio (BR)** → **Requerimiento Funcional (FR)** → **Requerimiento No Funcional (NFR)**.
> Fuentes: steering `05-business-rules`, `Vision-y-Objetivos`, `Modelo-Comisiones`, los Specs `01-Specs/*`
> y los NFR de `04-Tech-Design/Arquitectura-Sistema` §1.

---

## Catálogo de Requerimientos No Funcionales (NFR)

| Código | NFR | Referencia |
|---|---|---|
| NFR-PERF | Rendimiento (API p95<300ms, LCP<2.5s, webhooks<2s) | Arquitectura §1.1 |
| NFR-AVAIL | Disponibilidad y resiliencia (SLA, RTO/RPO, backups) | Arquitectura §1.2 |
| NFR-SCALE | Escalabilidad (auto-scaling ECS, tiers por fase) | Arquitectura §1.3 |
| NFR-SEC | Seguridad (TLS 1.3, JWT RS256, RBAC, AES-256 PII, rate limit, idempotencia) | Arquitectura §1.4 |
| NFR-OBS | Observabilidad (logs, métricas, tracing, alertas) | Arquitectura §1.5 |
| NFR-A11Y | Accesibilidad WCAG 2.1 AA | Stack-Tecnologico §Accesibilidad |
| NFR-I18N | Internacionalización (i18next, es→en/fr) | Stack-Tecnologico §i18n |
| NFR-LEGAL | Compliance (Ley 1581, Ley 1480, IVA/DIAN, retención de datos) | steering `07-legal-compliance` |

---

## Punto 9 — Matriz BR → FR → NFR

> Cada requerimiento de negocio queda enlazado a su(s) requerimiento(s) funcional(es) y al NFR que lo condiciona.

| BR | Requerimiento de Negocio | FR (Spec / RF) | Tabla(s) de datos | NFR |
|---|---|---|---|---|
| BR-01 | Reserva confirmada nunca se elimina, solo se cancela | Spec-C RF-C11 | Bookings | NFR-LEGAL, NFR-SEC |
| BR-02 | Cotización con vigencia de 72h (expira automática) | Spec-H RF-H07 | Quotations | NFR-AVAIL, NFR-PERF |
| BR-03 | Precio se "congela" al crear el booking | Spec-C RF-C01/02 | Bookings, BookingPassengers | NFR-PERF |
| BR-04 | Webhook OnePay.la es la única fuente de verdad del pago | Spec-C RF-C07 | WebhookEvents, Bookings | NFR-SEC (HMAC+idempotencia), NFR-AVAIL |
| BR-05 | Split Fare en HOLD_GROUP hasta 100% del pago | Spec-C RF-C06 | SplitFareParticipants | NFR-SEC |
| BR-06 | Comisión del operador: % variable, historial inmutable | Spec-G RF-G06 | OperatorContracts | NFR-SEC (audit) |
| BR-07 | Comisión agente = borondo_amount × rate del agente | Spec-H RF-H10 | AgentCommissions, AgentCommissionHistory | NFR-SEC + tests financieros |
| BR-08 | IVA 19% residentes / 0% extranjeros con pasaporte | Spec-C RF-C04 | Bookings (iva_cop) | NFR-LEGAL |
| BR-09 | Pasaporte en S3 privado, retención 5 años (DIAN) | Spec-C RF-C04 | Bookings (passport_s3_key) | NFR-SEC (SSE), NFR-LEGAL |
| BR-10 | Borondo Coins: 5 niveles, libres, no expiran | Spec-E RF-E01/03 | Wallets, WalletTransactions, LoyaltyLevels | NFR-SEC |
| BR-11 | Publicidad financia lealtad; niveles 4-5 sin ads | Spec-C ADS01/02 | Ads, AdImpressions | NFR-PERF |
| BR-12 | Cancelación escalonada en 3 franjas | Spec-C RF-C11 (ADR-007) | CancellationPolicies, PenaltyIncome | NFR-LEGAL + tests |
| BR-13 | Fuerza mayor con EPS: penalidades reducidas | ADR-007 | PenaltyIncome (is_force_majeure) | NFR-LEGAL |
| BR-14 | Reembolso bancario solo retracto/fuerza mayor/judicial | Spec-C RF-C09 | RefundRequests | NFR-LEGAL |
| BR-15 | Chargeback: BorondoTours asume, descuenta del payout | Spec-G (payouts) | OperatorChargebacks | NFR-SEC |
| BR-16 | Tour nuevo requiere aprobación PENDING_REVIEW→PUBLISHED | Spec-I RF-I04 | Tours (status) | NFR-SEC |
| BR-17 | Tour publicado: cambios vía TourEditRequest con diff | Spec-I RF-I05 | Tours, (TourEditRequest) | NFR-SEC (audit) |
| BR-18 | Cupos pool compartido + premium con release 3 días | Spec-I RF-I07 | TourInstances | NFR-PERF (cron) |
| BR-19 | Manifiesto se llena solo desde todos los canales | Spec-I RF-I08 | Bookings, BookingPassengers | NFR-PERF |
| BR-20 | AgencyLinks sin login; HOLD_AGENCY 48h | Spec-I RF-I10/11 | Bookings (source), BookingPassengers | NFR-SEC (token temporal) |
| BR-21 | Yield management interno e invisible al público | Spec-H RF-H23 | Tours, OperatorContracts | NFR-SEC |
| BR-22 | RBAC 10 roles + tenant isolation por operator_id | Spec-F RF-F01/09 | Users, CustomRoles | NFR-SEC |
| BR-23 | Habeas Data: consentimiento + ARCO + retención | Spec-F RF-F02 | Users | NFR-LEGAL, NFR-SEC |
| BR-24 | Facturación electrónica DIAN (Siigo) | ADR-004 | OperatorPayouts (siigo_document_id) | NFR-LEGAL |
| BR-25 | Liquidación al operador por ciclo | Spec-G RF-G07 | OperatorPayouts | NFR-SEC + tests |
| BR-26 | Chat tripartito 24h pre-tour, retención 90 días | Spec-D RF-D08 / Spec-J | ChatMessages (DynamoDB TTL) | NFR-AVAIL, NFR-LEGAL |
| BR-27 | App móvil con modo offline obligatorio | Spec-J RF-J09 | ManifestCheckins, FieldExpenses (sync) | NFR-AVAIL |
| BR-28 | GPS tracking con toggles de privacidad | Spec-I RF-I20 | Vehicles, TourInstances | NFR-SEC, NFR-LEGAL |
| BR-29 | Guía ve su calendario, tours e info del equipo + chat | Spec-K RF-K15 | TourInstances, ManifestCheckins, TourInstanceNotes, ChatMessages | NFR-AVAIL (offline), NFR-A11Y |
| BR-30 | Tour tiene tipo de producto (Pasadía/Pasanoche/Excursión/Personalizado/Aéreo) además de categoría | Spec-C RF-C12 | Tours (product_type, category) | NFR-PERF |
| BR-31 | Abono por tipo de producto; se configura al aprobar el tour; cliente ve monto mínimo | Spec-C RF-C12 | Tours (deposit_kind, deposit_value, full_payment_days_before) | NFR-SEC |
| BR-32 | Planes compuestos: abono por componente (tiquete 100% + admin + hotel 20%) | Spec-C RF-C13 | PlanComponents | NFR-LEGAL (tarifa Aeronáutica Civil) |
| BR-33 | Acta de compromiso de pago autorizada solo por BorondoTours; no da derecho a reembolso | Spec-C RF-C14 | Tours (is_flexible_payment) | NFR-LEGAL, NFR-SEC |
| BR-34 | Operador puede operar en varias regiones; el tour indica dónde se opera | Spec-K RF-K12 | Regions, OperatorRegions, Tours (region_id) | NFR-PERF |
| BR-35 | Proveedores compartidos entre operadores con acuerdo propio por operador | Spec-K RF-K05 | Providers, ProviderRegions, ProviderAgreements | NFR-SEC |
| BR-36 | Disponibilidad de guías/conductores; vehículos atados a conductor/proveedor | Spec-K RF-K04 | ResourceUnavailability | NFR-PERF |
| BR-37 | Checklist de alistamiento: obligatorios fijos + opcionales configurables | Spec-K RF-K09 | ReadinessChecklistItems | NFR-AVAIL |
| BR-38 | Cierre operativo post-tour con reconciliación financiera | Spec-K RF-K10 | OperationalClosure | NFR-SEC + tests |
| BR-39 | BorondoTours agente de retención: ReteFuente/ReteICA/ReteIVA sobre bruto del operador | ADR-009 | Operators (tax_regime, is_income_tax_declarant, reteica_pct), OperatorPayouts | NFR-LEGAL + tests financieros |
| BR-40 | Orquestación fiscal: BorondoTours decide qué impuestos, Siigo calcula cuánto | ADR-010 | Taxes, ServiceTaxes, Invoices | NFR-LEGAL, NFR-AVAIL (idempotencia + retry) |

> **Regla de gobierno:** todo BR nuevo debe crearse con su FR y su NFR asociados en la misma fila.
> Un BR sin FR es una intención sin plan; un FR sin NFR es una función sin garantía de calidad.

---

## Punto 10 — Tabla Consolidada (vista simple)

> Vista de una sola mirada: en qué estado está cada bloque del sistema. Sin detalle técnico.

| Módulo / Spec | App | Rol principal | ¿Qué hace? | Estado docs | Listo para IA |
|---|---|---|---|---|---|
| Spec-A Discovery | B2C | CLIENT | Buscar y descubrir tours | ✅ Completo | Alto |
| Spec-B Tour Detail | B2C | CLIENT | Ver tour + calendario semáforo | ✅ Completo | Alto |
| Spec-C Checkout | B2C | CLIENT | Reservar y pagar (IVA, OnePay.la) | ✅ Completo | Alto |
| Spec-D Client Portal | B2C | CLIENT | Ver reservas, voucher, cancelar, chat | ✅ Completo | Alto |
| Spec-E Loyalty | B2C | CLIENT | Coins, niveles, XP, referidos | ✅ Completo | Alto |
| Spec-F Auth | Transversal | Todos | Login, JWT, OAuth, RBAC 10 roles | ✅ Saneado | Alto |
| Spec-G ERP Operativo | ERP | COORD | Tours, instancias, payouts, incidentes | ✅ Completo | Medio-Alto |
| Spec-H ERP Agencia | ERP | AGENT / GERENTE | CRM Kanban, cotizaciones, comisiones | ✅ Completo | Medio-Alto |
| Spec-I B2B Operadores | B2B | OPERATOR_ADMIN | Inventario, manifiesto, radar, finanzas | ✅ Completo | Medio |
| Spec-J App Móvil | Mobile | OPERATOR_GUIDE/DRIVER | Check-in, offline, GPS, caja menor | ✅ Completo | Medio |
| Spec-K Planificación Operativa | B2B | OPERATOR_COORD / GUIDE | Calendario, proveedores, contingencia, cierre, panel guía | ✅ Requisitos + modelo de datos | Medio-Alto |
| Tipos de producto y planes de pago | B2C/ERP | CLIENT / AGENT | Pasadía/Pasanoche/Excursión/Personalizado/Aéreo + abonos | ✅ Spec-C RF-C12/13/14 + Core | Medio-Alto |
| Modelo de Datos Core | — | — | 51 tablas canónicas | ✅ Saneado (18 tablas añadidas) | Alto |
| Infraestructura (ADR-008) | — | — | AWS-first desde Fase 1 | ✅ Decidido | Medio (falta IaC) |
| Retenciones fiscales (ADR-009) | ERP/B2B | GERENTE | ReteFuente/ICA/IVA en payouts | ✅ Modelado (ADR-009 + campos) | Medio-Alto |

**Leyenda estado:** ✅ Listo · 🟡 Parcial · 🔴 Pendiente

---

## Deuda de trazabilidad restante

| # | Pendiente | Impacto |
|---|---|---|
| 1 | ✅ Hecho — `Spec-K` creado en `docs/01-Specs` con códigos RF | — |
| 2 | ✅ Hecho — modelo de datos de Spec-K en Core §40–48 | — |
| 3 | ✅ Hecho — 3 tablas diferidas consolidadas en Core §36–38 | — |
| 4 | ✅ Hecho — ADR-009 + campos fiscales en Operators/OperatorPayouts | — |
| 5 | ✅ Hecho — matriz NFR×RF (169 RF, Specs A→K) en el Anexo de este documento | — |
| 6 | ✅ Hecho — conteo del MER actualizado a 54 tablas en Arquitectura-Sistema §5 | — |
| 7 | Decidir si se elimina `.kiro/specs/operational-planning-module/` (ya existe Spec-K canónico) | Bajo |
| 8 | Normalizar "Onepayla" → "OnePay.la" en steering `02-tech-stack` | Bajo |
| 9 | Poblar contratos OpenAPI en `04-Tech-Design/API` | Medio |

---

## Links relacionados
- [[Modelo-Datos-Core]]
- [[../04-Tech-Design/Arquitectura-Sistema]]
- [[../02-ADRs/ADR-Index]]
- [[../00-Inicio/Inventario-Funcionalidades-MVP]]

---

## Anexo — Cobertura NFR por RF (verificación)

> Verificación de que cada requerimiento funcional tiene al menos un NFR asignado. Generado a partir de los Specs A→K.
> Resuelve la deuda de trazabilidad #5 ("Verificar que cada RF de los Specs A→J tiene un NFR asignado explícito").
> NFR canónicos: NFR-PERF · NFR-AVAIL · NFR-SCALE · NFR-SEC · NFR-OBS · NFR-A11Y · NFR-I18N · NFR-LEGAL.

### Spec-A — Discovery
| RF | Título | NFR primario | NFR secundario(s) |
|---|---|---|---|
| RF-A01 | Hero Section + Auth Gate | NFR-A11Y | NFR-PERF |
| RF-A02 | Scrollytelling con GSAP ScrollTrigger | NFR-PERF | NFR-A11Y |
| RF-A03 | Sección de propuesta de valor | NFR-A11Y | NFR-I18N |
| RF-A04 | Grid de tours con paginación | NFR-PERF | NFR-A11Y |
| RF-A05 | Búsqueda básica con PostgreSQL ILIKE | NFR-PERF | NFR-A11Y |
| RF-A06 | Filtros del catálogo | NFR-PERF | NFR-A11Y |
| RF-A07 | Ordenamiento | NFR-PERF | NFR-A11Y |
| RF-A08 | "Tours cerca de este destino" (PostGIS) | NFR-PERF | NFR-A11Y |
| RF-A09 | Vista mapa alternativa (Mapbox GL JS) | NFR-PERF | NFR-A11Y |
| RF-A10 | Auth Gate pre-checkout | NFR-SEC | NFR-A11Y |
| RF-A11 | SEO básico | NFR-PERF | NFR-I18N |
| RF-A12 | Performance Fase 1 (LCP, WebP, lazy load) | NFR-PERF | NFR-A11Y |

### Spec-B — Tour Detail
| RF | Título | NFR primario | NFR secundario(s) |
|---|---|---|---|
| RF-B01 | Hero del tour | NFR-A11Y | NFR-PERF |
| RF-B02 | Información esencial (above the fold) | NFR-A11Y | NFR-PERF |
| RF-B03 | Descripción completa (Markdown → HTML) | NFR-A11Y | NFR-SEC |
| RF-B04 | Add-ons del tour | NFR-A11Y | NFR-PERF |
| RF-B05 | Selector de fecha con calendario semáforo | NFR-PERF | NFR-A11Y |
| RF-B05b | Lista de espera / Notificarme (BullMQ) | NFR-AVAIL | NFR-A11Y |
| RF-B06 | Instancias de tour (TourInstances) | NFR-PERF | NFR-A11Y |
| RF-B07 | Selector de pax previo al checkout | NFR-A11Y | NFR-PERF |
| RF-B08 | Sección de reseñas y ratings | NFR-PERF | NFR-A11Y |
| RF-B09 | "Tours similares cerca de aquí" (PostGIS) | NFR-PERF | NFR-A11Y |

### Spec-C — Checkout
| RF | Título | NFR primario | NFR secundario(s) |
|---|---|---|---|
| RF-C-ADS01 | Anuncios en paso de confirmación | NFR-PERF | NFR-A11Y |
| RF-C-ADS02 | Anuncios en página de confirmación post-pago | NFR-PERF | NFR-A11Y |
| RF-C-ADS03 | Anuncios Rewarded (Coins, anti-fraude Redis) | NFR-SEC | NFR-PERF |
| RF-C01 | Auth sin perder la selección | NFR-SEC | NFR-A11Y |
| RF-C02 | Selector de pax por regla del tour | NFR-A11Y | NFR-PERF |
| RF-C03 | Add-ons opcionales (upselling) | NFR-A11Y | NFR-PERF |
| RF-C04 | IVA según residencia fiscal (pasaporte S3) | NFR-LEGAL | NFR-SEC |
| RF-C05 | Aplicar Borondo Coins como descuento | NFR-SEC | NFR-PERF |
| RF-C06 | Split Fare — responsabilidad individual (OnePay.la) | NFR-SEC | NFR-LEGAL |
| RF-C06b | Segundo cobro del saldo restante (BullMQ) | NFR-AVAIL | NFR-SEC |
| RF-C07 | Webhook de OnePay.la (HMAC + idempotencia) | NFR-SEC | NFR-AVAIL |
| RF-C08 | Datos del pasajero para manifiesto (PII) | NFR-SEC | NFR-A11Y |
| RF-C09 | Reembolso bancario por PQRS (Ley 1480) | NFR-LEGAL | NFR-SEC |
| RF-C10 | Conciliación automática de pagos (cron) | NFR-AVAIL | NFR-OBS |
| RF-C11 | Cancelación con penalidades graduales | NFR-LEGAL | NFR-SEC |
| RF-C12 | Tipo de producto y política de abono | NFR-LEGAL | NFR-SEC |
| RF-C13 | Planes compuestos (tarifa Aeronáutica Civil) | NFR-LEGAL | NFR-PERF |
| RF-C14 | Acta de compromiso de pago (flexibilidad) | NFR-LEGAL | NFR-SEC |

### Spec-D — Client Portal
| RF | Título | NFR primario | NFR secundario(s) |
|---|---|---|---|
| RF-D-LVL01 | Cálculo automático de nivel por XP | NFR-SEC | NFR-PERF |
| RF-D-LVL02 | Acreditación de Coins por compra | NFR-SEC | NFR-PERF |
| RF-D01 | Visualización del wallet | NFR-A11Y | NFR-SEC |
| RF-D02 | Uso de Coins en checkout | NFR-SEC | NFR-A11Y |
| RF-D03 | Reglas de acreditación de Coins | NFR-LEGAL | NFR-SEC |
| RF-D04 | Mapa de conquistas (Mapbox) | NFR-A11Y | NFR-PERF |
| RF-D05 | Estadísticas del perfil | NFR-A11Y | NFR-PERF |
| RF-D06 | Voucher PDF descargable (QR + PII) | NFR-SEC | NFR-A11Y |
| RF-D07 | Cancelación autónoma escalonada (ADR-007) | NFR-LEGAL | NFR-SEC |
| RF-D08 | Chat tripartito 24h pre-tour (DynamoDB TTL) | NFR-AVAIL | NFR-LEGAL |
| RF-D08b | Reprogramar reserva | NFR-A11Y | NFR-AVAIL |
| RF-D09 | Reseñas separadas Tour vs Guía (magic token) | NFR-SEC | NFR-A11Y |
| RF-D10 | Recordatorio pre-tour (Push + Email, BullMQ) | NFR-AVAIL | NFR-A11Y |
| RF-D11 | Onboarding del viajero con tooltips | NFR-A11Y | NFR-I18N |

### Spec-E — Loyalty
| RF | Título | NFR primario | NFR secundario(s) |
|---|---|---|---|
| RF-E01 | Ratio Coins:COP configurable (auditoría) | NFR-SEC | NFR-A11Y |
| RF-E02 | Fuentes de Coins multifactorial (Redis anti-abuse) | NFR-SEC | NFR-PERF |
| RF-E03 | Niveles por puntos de experiencia (XP) | NFR-SEC | NFR-A11Y |
| RF-E04 | Insignias de nivel | NFR-A11Y | NFR-PERF |
| RF-E05 | Coins libres sin restricción ni expiración | NFR-SEC | NFR-LEGAL |
| RF-E06 | Vista del wallet en portal cliente (export CSV) | NFR-A11Y | NFR-SEC |
| RF-E07 | Transacciones del wallet (trazabilidad) | NFR-SEC | NFR-OBS |
| RF-E08 | Aplicar Coins en checkout (SELECT FOR UPDATE) | NFR-SEC | NFR-PERF |
| RF-E09 | Mapa de conquistas (Fase 2) | NFR-A11Y | NFR-PERF |
| RF-E10 | Referidos (Fase 2) | NFR-SEC | NFR-A11Y |
| RF-E11 | Retos semanales/mensuales (Fase 2) | NFR-A11Y | NFR-AVAIL |

### Spec-F — Auth
| RF | Título | NFR primario | NFR secundario(s) |
|---|---|---|---|
| RF-F01 | Definición de roles RBAC (10 roles) | NFR-SEC | NFR-OBS |
| RF-F01b | Redirección post-login por rol | NFR-SEC | NFR-A11Y |
| RF-F02 | Registro con email y contraseña | NFR-SEC | NFR-A11Y |
| RF-F02b | Registro para proveedores/operadores (docs S3) | NFR-SEC | NFR-LEGAL |
| RF-F03 | Registro / Login con Google OAuth2 | NFR-SEC | NFR-A11Y |
| RF-F04 | Login con email y contraseña (bloqueo intentos) | NFR-SEC | NFR-A11Y |
| RF-F05 | Sesión y JWT (RS256, refresh rotation) | NFR-SEC | NFR-AVAIL |
| RF-F06 | OTP por email para acciones sensibles | NFR-SEC | NFR-AVAIL |
| RF-F07 | Recuperación de contraseña | NFR-SEC | NFR-A11Y |
| RF-F08 | Modal de autenticación no-bloqueante (ARIA) | NFR-A11Y | NFR-SEC |
| RF-F09 | Matriz de permisos críticos (tenant isolation) | NFR-SEC | NFR-OBS |
| RF-F10 | Fase 1: protecciones base (rate limit, Helmet, CORS) | NFR-SEC | NFR-OBS |
| RF-F11 | Fase 2: reCAPTCHA y WAF | NFR-SEC | NFR-SCALE |
| RF-F12 | Fase 3: MFA completo y sesión avanzada (audit log) | NFR-SEC | NFR-OBS |

### Spec-G — ERP Operativo
| RF | Título | NFR primario | NFR secundario(s) |
|---|---|---|---|
| RF-G01 | Crear y editar tours | NFR-SEC | NFR-A11Y |
| RF-G02 | Gestión de instancias (conteo atómico) | NFR-SEC | NFR-PERF |
| RF-G03 | Asignar guía a instancia (notif push/email) | NFR-AVAIL | NFR-SEC |
| RF-G04 | Asignar transporte (SOAT S3 + alerta) | NFR-SEC | NFR-AVAIL |
| RF-G05 | Seguros médicos (PDF S3) | NFR-SEC | NFR-LEGAL |
| RF-G06 | Configuración de comisión por operador (inmutable) | NFR-SEC | NFR-LEGAL |
| RF-G07 | Registro de liquidaciones (OperatorPayouts) | NFR-SEC | NFR-LEGAL |
| RF-G08 | Log de cambios e incidentes (inmutable) | NFR-SEC | NFR-OBS |
| RF-G09 | Alertas de urgencia internas | NFR-AVAIL | NFR-OBS |
| RF-G10 | Vista limitada del operador (tenant isolation) | NFR-SEC | NFR-A11Y |

### Spec-H — ERP Agencia
| RF | Título | NFR primario | NFR secundario(s) |
|---|---|---|---|
| RF-H01 | Redirección automática por rol | NFR-SEC | NFR-A11Y |
| RF-H02 | Tablero Kanban personal del AGENT (Socket.io) | NFR-AVAIL | NFR-A11Y |
| RF-H03 | Tarjeta de Lead/Cotización (PII cliente) | NFR-SEC | NFR-A11Y |
| RF-H04 | Propiedad del lead (90 días, BullMQ) | NFR-AVAIL | NFR-SEC |
| RF-H05 | Venta colaborativa (comisiones) | NFR-SEC | NFR-OBS |
| RF-H06 | Crear cotización manual | NFR-A11Y | NFR-SEC |
| RF-H06b | Flujo de aprobación de descuento (SLA 24h) | NFR-AVAIL | NFR-SEC |
| RF-H07 | Generar link de pago OnePay.la | NFR-SEC | NFR-PERF |
| RF-H08 | Envío del link al cliente (SES/WhatsApp) | NFR-AVAIL | NFR-A11Y |
| RF-H09 | Webhook OnePay.la → actualización Kanban | NFR-SEC | NFR-AVAIL |
| RF-H10 | Cálculo de comisión del agente (tests financieros) | NFR-SEC | NFR-LEGAL |
| RF-H11 | Panel de comisiones del agente | NFR-A11Y | NFR-SEC |
| RF-H12 | Alert sonoro "Ka-ching" (Socket.io) | NFR-AVAIL | NFR-A11Y |
| RF-H13 | Leaderboard del equipo (Socket.io) | NFR-AVAIL | NFR-A11Y |
| RF-H14 | Metas mensuales del agente | NFR-A11Y | NFR-OBS |
| RF-H15 | Vista principal del GERENTE (KPIs) | NFR-PERF | NFR-A11Y |
| RF-H16 | Vista consolidada del Kanban del equipo | NFR-SEC | NFR-A11Y |
| RF-H17 | Liquidación de comisiones del período | NFR-SEC | NFR-LEGAL |
| RF-H18 | Ghost Login (audit log obligatorio) | NFR-SEC | NFR-OBS |
| RF-H19 | Gestión de Tenants / Operadores externos | NFR-SEC | NFR-LEGAL |
| RF-H20 | Panel de Publicidad (Ads Manager) | NFR-A11Y | NFR-OBS |
| RF-H21 | Configuración global de Loyalty (historial) | NFR-SEC | NFR-OBS |
| RF-H22 | Reportes financieros consolidados | NFR-SEC | NFR-LEGAL |
| RF-H23 | Yield Management — ranking B2C (interno) | NFR-SEC | NFR-PERF |
| RF-H24 | Venta Rápida Directa (pago manual) | NFR-SEC | NFR-A11Y |

### Spec-I — B2B Portal Operadores
| RF | Título | NFR primario | NFR secundario(s) |
|---|---|---|---|
| RF-I01 | Equipo del operador con roles propios (aislamiento) | NFR-SEC | NFR-A11Y |
| RF-I02 | Vista principal del OPERATOR_ADMIN (KPIs) | NFR-PERF | NFR-A11Y |
| RF-I03 | Dashboard de ocupación visual | NFR-PERF | NFR-A11Y |
| RF-I04 | Crear tour (flujo de publicación blindado, SLA) | NFR-SEC | NFR-A11Y |
| RF-I05 | Solicitud de edición post-publicación (diff) | NFR-SEC | NFR-A11Y |
| RF-I06 | Gestión de instancias + cancelación baja demanda | NFR-AVAIL | NFR-LEGAL |
| RF-I07 | Pool híbrido de cupos (BullMQ cron) | NFR-AVAIL | NFR-PERF |
| RF-I08 | Manifiesto consolidado (PII pasajeros) | NFR-SEC | NFR-PERF |
| RF-I09 | Exportar manifiesto (PDF/CSV con PII) | NFR-SEC | NFR-LEGAL |
| RF-I10 | Generar link público por instancia (token temporal) | NFR-SEC | NFR-AVAIL |
| RF-I11 | Vista pública del link de agencia (form + PII) | NFR-SEC | NFR-A11Y |
| RF-I12 | Confirmar pago de agencia externa (release 48h) | NFR-AVAIL | NFR-SEC |
| RF-I13 | Radar: grid de tours con semáforo (Socket.io) | NFR-AVAIL | NFR-A11Y |
| RF-I14 | Manifiesto en vivo (check-in tiempo real) | NFR-AVAIL | NFR-SEC |
| RF-I15 | Mapa GPS de vehículos en tiempo real | NFR-AVAIL | NFR-LEGAL |
| RF-I16 | Timeline de estados y alertas (tiempo real) | NFR-AVAIL | NFR-OBS |
| RF-I17 | Cancelación por fuerza mayor (Coins, notif, PQRS) | NFR-LEGAL | NFR-AVAIL |
| RF-I18a | Onboarding checklist del operador (primer login) | NFR-A11Y | NFR-AVAIL |
| RF-I18 | Crear y gestionar equipo (RBAC, credenciales) | NFR-SEC | NFR-A11Y |
| RF-I19 | Catálogo de vehículos (docs S3 + alerta SOAT) | NFR-SEC | NFR-AVAIL |
| RF-I19b | Asignación de equipo y vehículos a instancias | NFR-AVAIL | NFR-SEC |
| RF-I20 | Privacidad de GPS tracking (toggles + audit) | NFR-LEGAL | NFR-SEC |
| RF-I21 | Perfil del operador (logo S3) | NFR-A11Y | NFR-SEC |
| RF-I22 | Vista de liquidaciones (chargebacks) | NFR-SEC | NFR-LEGAL |
| RF-I23 | Revenue por canal de venta (gráficos) | NFR-PERF | NFR-A11Y |
| RF-I24 | Proyección de ingresos | NFR-PERF | NFR-A11Y |
| RF-I24b | Reseñas de los tours (solo lectura, privacidad) | NFR-SEC | NFR-A11Y |
| RF-I25 | Notificaciones automáticas al operador (email/push) | NFR-AVAIL | NFR-OBS |
| RF-I26 | Cron jobs automáticos (BullMQ, SLA) | NFR-AVAIL | NFR-OBS |

### Spec-J — App Móvil
| RF | Título | NFR primario | NFR secundario(s) |
|---|---|---|---|
| RF-J01 | Árbol de navegación condicional por rol | NFR-SEC | NFR-A11Y |
| RF-J02 | Sincronización del manifiesto y modo offline (SQLite) | NFR-AVAIL | NFR-LEGAL |
| RF-J03 | Swipe check-in y contacto de urgencia (offline, QR) | NFR-AVAIL | NFR-A11Y |
| RF-J04 | Billetera interna / caja menor (foto S3) | NFR-AVAIL | NFR-SEC |
| RF-J05 | Avisos de arribos y vales a convenios (WhatsApp) | NFR-AVAIL | NFR-A11Y |
| RF-J06 | Máquina de estados operativos y chat del tour | NFR-AVAIL | NFR-LEGAL |
| RF-J07 | Pestaña de rendimiento ('Mi Performance') | NFR-A11Y | NFR-PERF |
| RF-J08 | Permisos nativos del dispositivo (GPS, cámara) | NFR-LEGAL | NFR-A11Y |
| RF-J09 | Resolución de conflictos offline (sync_id, dedup) | NFR-AVAIL | NFR-SEC |
| RF-J10 | Chat de coordinación: TTL y cola offline (DynamoDB) | NFR-AVAIL | NFR-LEGAL |
| RF-J11 | Notificaciones push por rol (Expo, RBAC) | NFR-AVAIL | NFR-SEC |

### Spec-K — Planificación Operativa
| RF | Título | NFR primario | NFR secundario(s) |
|---|---|---|---|
| K-RF01 | Calendario de planificación de guías | NFR-PERF | NFR-A11Y |
| K-RF02 | Calendario de planificación de conductores | NFR-PERF | NFR-A11Y |
| K-RF03 | Calendario unificado de operaciones (filtros) | NFR-PERF | NFR-A11Y |
| K-RF04 | Gestión de disponibilidad de recursos (notif urgente) | NFR-AVAIL | NFR-A11Y |
| K-RF05 | Gestión de proveedores y vendors por región | NFR-SEC | NFR-AVAIL |
| K-RF06 | Contingencia: reemplazo de guía (audit, SLA <24h) | NFR-AVAIL | NFR-OBS |
| K-RF07 | Contingencia: reemplazo de vehículo (evidencia S3) | NFR-AVAIL | NFR-SEC |
| K-RF08 | Contingencia: clima y eventos externos (Coins) | NFR-AVAIL | NFR-LEGAL |
| K-RF09 | Checklist de alistamiento pre-tour (SLA 48h/24h) | NFR-AVAIL | NFR-OBS |
| K-RF10 | Cierre operativo post-tour (reconciliación financiera) | NFR-SEC | NFR-LEGAL |
| K-RF11 | Dashboard de reportes operativos (métricas, export) | NFR-OBS | NFR-PERF |
| K-RF12 | Regiones configurables por operador | NFR-SEC | NFR-PERF |
| K-RF13 | Notas e instrucciones operativas por instancia (push, offline) | NFR-AVAIL | NFR-A11Y |
| K-RF14 | Operaciones en lote y programación masiva | NFR-PERF | NFR-AVAIL |
| K-RF15 | Panel del guía: calendario, detalle, chat (offline) | NFR-AVAIL | NFR-A11Y |

---

### Resumen de cobertura

| Spec | RF procesados | RF con NFR primario | RF con ⚠️ (sin NFR) |
|---|---|---|---|
| Spec-A — Discovery | 12 | 12 | 0 |
| Spec-B — Tour Detail | 10 | 10 | 0 |
| Spec-C — Checkout | 18 | 18 | 0 |
| Spec-D — Client Portal | 14 | 14 | 0 |
| Spec-E — Loyalty | 11 | 11 | 0 |
| Spec-F — Auth | 14 | 14 | 0 |
| Spec-G — ERP Operativo | 10 | 10 | 0 |
| Spec-H — ERP Agencia | 25 | 25 | 0 |
| Spec-I — B2B Portal Operadores | 29 | 29 | 0 |
| Spec-J — App Móvil | 11 | 11 | 0 |
| Spec-K — Planificación Operativa | 15 | 15 | 0 |
| **TOTAL** | **169** | **169** | **0** |

> ✅ **Resultado:** los 169 RF de los Specs A→K tienen al menos un NFR primario asignado. Ningún RF quedó marcado con ⚠️. La deuda de trazabilidad #5 queda cubierta.
