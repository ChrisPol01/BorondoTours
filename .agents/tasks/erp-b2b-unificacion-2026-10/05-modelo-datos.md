# 05 — Impacto en el modelo de datos: app de gestión unificada (Agencia + Operador) y CRM

Rol: data-modeler + domain-rules (fábrica SDLC). Fecha: 2026-10. Investigación de solo lectura; no se
crearon migraciones ni se tocó código. Sin PII.

---

## Resumen (respuesta corta)

1. **El costo de migración en código es cero.** `packages/db/src/schema/index.ts` es un placeholder
   (`export {};`), no hay ninguna `pgTable`/`pgEnum` ni migración en `services/`, `packages/`, `apps/` o
   `infra/`, y no existe `drizzle.config.*` (DECISIONES-PENDIENTES #32). Todo el cambio es **documental**
   (Modelo-Datos-Core, Specs H/I/K, steering 04/05). Es el momento más barato para corregir el modelo de tenant.
2. **Tenant unificado — recomendación: `Organizations` + `OrganizationModules`.** `Operators` (§2) se
   renombra a `Organizations` (misma PK, mismos campos fiscales, que aplican igual a una agencia) y los
   módulos contratados viven en una tabla `OrganizationModules` (módulo, estado, quién lo activó). Se
   descartan los flags `is_operator`/`is_agency` (no permiten suspender un módulo ni auditar su activación).
   BorondoTours misma es una fila (`is_platform = true`) con el módulo AGENCY (y OPERATOR en F2).
   `Users.operator_id` pasa a `Users.organization_id`; las tablas del módulo operador conservan su columna
   `operator_id` (FK → Organizations), así casi nada de Spec-G/I/K se reescribe.
3. **CRM: 9 tablas nuevas para MVP, generalizando lo existente en vez de duplicarlo.** `Contacts`
   (clientes de la agencia, distintos de `Users`), `Leads` (lead/oportunidad unificados, estilo Odoo),
   `PipelineStages` configurables con `system_key` para que el webhook siga moviendo tarjetas,
   `LeadEvents` (generaliza `QuoteActions`; las notas son eventos), `CrmTasks`, `Tags`/`ContactTags`,
   `MessageTemplates` y `Consents` (generaliza `UserConsents` de la Política de Datos). Empresas y la
   bandeja WhatsApp Cloud API quedan como posterior. Los mensajes WhatsApp, cuando lleguen, van a
   **DynamoDB** (patrón ADR-003) con el índice de conversaciones en PostgreSQL.
4. **Reglas de dominio: hay que modelar el canal de venta.** La regla actual asume que toda venta pasa por
   la pasarela de BorondoTours y BorondoTours es principal (NIIF 15). Con la venta propia del operador eso
   ya no es cierto. Se propone `Bookings.seller_organization_id` + `collection_mode` + snapshot financiero,
   y 5 canales con reglas distintas de comisión, payout, factura y retenciones. La comisión de BorondoTours
   sobre la venta directa del operador es una **decisión de negocio pendiente** (propuesta: 0% en MVP).
   `packages/domain` tiene hoy una sola función (`calculateBookingTotal`); se listan 11 funciones nuevas o
   cambiadas, todas con tests obligatorios.
5. **Hay contradicciones previas que bloquean el diseño** y conviene cerrar antes de implementar: la base
   de la comisión del agente tiene 3 definiciones incompatibles, `Quotations`/`QuoteActions`/
   `AgentCommissions` difieren entre el Core y Spec-H, y las 5 tablas de Spec-I no están en el Core
   (`ManifestPassengers` además choca con `ManifestCheckins`).

---

## 1. Evidencia de partida

| Hecho | Evidencia |
|---|---|
| Schema Drizzle vacío | `packages/db/src/schema/index.ts`: comentario "TODO: Definir tablas… placeholder" y `export {};`. `client.ts` solo crea el cliente. |
| Sin tablas ni migraciones en el repo | búsqueda `pgTable\|pgEnum\|CREATE TABLE` en `services/**`, `packages/**`, `apps/**`, `infra/**`: 0 resultados. |
| Ningún aislamiento de tenant en código | búsqueda `operator_id\|operatorId\|tenant` en servicios y paquetes: solo `operatorIds` como filtro de búsqueda en `packages/contracts/src/schemas/tours.ts`. |
| Dominio financiero casi vacío | `packages/domain/src/pricing/calculate-booking-total.ts` es la única función. `Domain-Financiero.md` documenta además `calculateAgentCommission`, `calculateFreelancerCommission`, `calculateCancellationPenalty`, `calculateOperatorPayout`, `calculateSplitPayment` y `calculateIvaOnMargin`, sin implementar. |
| Tenant = operador | Core §1 `Users.operator_id` "obligatorio si role = OPERATOR_*"; Spec-I RF-I01 "aislamiento total entre operadores"; Política de Datos §5.2 "SOLO visibles por usuarios con su mismo `operator_id`". Los usuarios internos de BorondoTours tienen `operator_id = null`. |
| BorondoTours es principal | `Reglas-Negocio-Detalle.md` §NIIF 15 y `Estructura-Contable.md` D7: ingreso bruto = 100% de lo facturado; `borondo_amount` = margen. |
| El CRM actual es la cotización | Spec-H RF-H02/H03: la tarjeta del Kanban **es** la cotización; columnas fijas Cotizado → Reserva → Pagado → Ejecución → Completado → Perdido, con transiciones automáticas por webhook y cron. |
| Propiedad del lead ligada a la cotización | Core §33 `QuoteActions.created_at` "cada acción renueva el contador de 90 días"; Spec-H §12 `Quotes.ownership_expires_at`. |
| Chat actual es efímero y por instancia | ADR-003 (actualización 2026-09-27): PK `CHAT#TOUR#{tour_instance_id}`, exportación a S3 al terminar el tour y borrado. No sirve como bandeja CRM de largo plazo. |
| vocero-crm ya es multi-organización a nivel de esquema | `drizzle/0000_absurd_the_santerians.sql` del repo: todas las tablas (`contact`, `lead`, `pipeline_stage`, `conversation`, `message`, `template`, `meta_credentials`) llevan `organization_id`; `contact_org_phone_uq (organization_id, phone)`; `lead_contact_uq (contact_id)`; mensajes en PostgreSQL. |

### Diferencias de vocero-crm con nuestras convenciones (a corregir al adoptar su estructura)

| vocero-crm | Convención BorondoTours (Core "Convenciones", steering 04) |
|---|---|
| PK `text` | `uuid v4` generado por la app |
| `status`/`kind`/`direction` como `text` libre | `ENUM` de PostgreSQL |
| `contact.archived_at` (soft delete) | sin soft delete; `status = ARCHIVED` |
| `ON DELETE cascade` desde `organization` | `RESTRICT`: nunca borrar en cascada datos comerciales o financieros |
| Credenciales Meta/Zoom/Google cifradas en tabla (`token_cipher/iv/tag`) | Secrets Manager (stack). En BD solo la referencia (ARN) |
| `lead_contact_uq`: un lead por contacto | un viajero repite viajes: N leads por contacto |
| Mensajes en PostgreSQL | DynamoDB para alto volumen de escritura (ADR-003) |
| Sin consentimientos ni horario de contacto | Ley 1581 y Ley 2300 obligatorios |

---

## 2. Tenant unificado (pregunta 1)

### Opciones evaluadas

| Opción | Descripción | Pros | Contras |
|---|---|---|---|
| A. Flags en `Operators` | `is_operator`, `is_agency` | Cambio mínimo en docs | El nombre engaña para una agencia pura y para BorondoTours. No se puede suspender solo un módulo (p. ej. sacar a un operador del marketplace y dejarle el CRM). Sin auditoría de activación. Cada módulo nuevo es otro boolean. |
| **B. `Organizations` + `OrganizationModules`** (recomendada) | Renombrar `Operators` → `Organizations`; tabla de módulos contratados | Un solo id de tenant para todo. Módulos activables y suspendibles por separado, con quién y cuándo. Encaja directo con el sidebar (grupo Agencia / grupo Operador = módulos activos). BorondoTours entra como un tenant más: el aislamiento deja de depender de `operator_id IS NULL`. Mismo patrón que vocero-crm (`organization_id`). | Renombrar la tabla y `Users.operator_id` en el Core y Specs. Hay que definir el catálogo de módulos. |
| C. `Organizations` + extensiones 1:1 `OperatorProfiles`/`AgencyProfiles` | Separar campos del operador y de la agencia | Separación conceptual limpia | Más JOINs y dos ids posibles. Los campos de `Operators` (NIT, RNT, régimen tributario, retenciones) aplican igual a las agencias (en Colombia la agencia también tiene RNT y recibe retenciones), así que la separación aporta poco. |

**Decisión: B.** La opción A no puede representar estados por módulo, y C duplica campos que ya son
comunes. Como no hay datos ni tablas en código, el renombre no cuesta una migración.

### Regla de nombres de la clave de tenant (decisión)

- **`organization_id`** en `Users` y en todas las tablas nuevas (CRM, módulos, roles por tenant).
- **`operator_id` se conserva** en las tablas del módulo operador (`Tours`, `Vehicles`, `OperatorContracts`,
  `OperatorPayouts`, `OperatorChargebacks`, `OperatorDocuments`, `OperatorRegions`, `ProviderAgreements`,
  `CancellationPolicies`, `AgencyLinks`) como FK → `Organizations`. Ahí el nombre describe el rol en la
  transacción (el dueño del tour, el que recibe el payout) y evita reescribir Spec-G/I/K.
- Para que dos nombres no generen fugas, cada tabla declara en su schema Drizzle cuál es su columna de
  tenant y el repositorio filtra siempre por esa columna (un solo helper, ver §5).
- El steering 04 debe pasar de "tenant isolation por `operator_id`" a "tenant isolation por
  `organization_id` (`operator_id` en tablas del módulo operador)".

### Usuarios y roles

- `Users.organization_id` es NOT NULL para los 9 roles no-CLIENT (los 4 internos apuntan a la fila de
  BorondoTours) y NULL para `CLIENT`. Restricción: `CHECK ((role = 'CLIENT') = (organization_id IS NULL))`.
- No se agregan roles al enum de 10. Permiso efectivo = permisos del rol base **∩ módulos activos de la
  organización** ∪ `allow` − `deny` de `CustomRoles`. Un `OPERATOR_ADMIN` de un tenant con módulo AGENCY ve
  el grupo Agencia; sin el módulo, no.
- `CustomRoles` hoy es global (`name UNIQUE`, "creados por SUPER_ADMIN"). Pasa a tener `organization_id`
  nullable (NULL = plantilla global) y `UNIQUE(organization_id, name)`. Recursos nuevos en el jsonb de
  permisos: `crm`, `contact`, `lead`, `quote`, `task`, `template`, `conversation`, `module`.
- Un usuario pertenece a **una** organización en MVP. Los guías freelance que trabajan para varios
  operadores (Core §1 `is_provider`) necesitarán `OrganizationMemberships` en F2.
- `OPERATOR_AGENT` tiene dos definiciones: Spec-I RF-I01 lo define como "Soporte (lectura)"; Stack-Tecnologico §RBAC
  como "Agente de ventas del operador". Con el módulo de agencia, la segunda es la útil: es quien vende en
  el CRM del operador. Decisión del usuario (ver §7).

### Migración desde lo actual

Al no existir tablas, la migración consiste en estos pasos sobre la documentación (en orden):

1. Core §2: renombrar `Operators` → `Organizations` (nota "antes Operators"), agregar `is_platform`, `slug`,
   `status`, y marcar `commission_pct` como deprecado a favor de `OperatorContracts` (hoy hay dos fuentes
   de la comisión: `Operators.commission_pct` y `OperatorContracts.commission_pct`).
2. Core §1: `Users.operator_id` → `Users.organization_id` con el CHECK de arriba.
3. Nueva tabla `OrganizationModules`. Seed: fila de BorondoTours con `AGENCY_CRM` y `AGENCY_SALES`.
4. Spec-H RF-H19 ("Gestión de Tenants / Operadores externos") pasa a gestionar organizaciones y módulos.
5. Si en el futuro ya hubiera datos, el equivalente físico es `ALTER TABLE … RENAME` (no destructivo).

---

## 3. Entidades de CRM para la agencia (pregunta 2)

### Mapa: qué existe, qué se generaliza, qué es nuevo

| Necesidad CRM | Existe hoy | Propuesta |
|---|---|---|
| Cliente de la agencia | `Users` (CLIENT, cuenta B2C de BorondoTours) y datos sueltos en `Quotations.client_name/email/phone` | **Nueva `Contacts`** por organización. Un contacto no es un `Users`: un operador no debe poder crear ni ver cuentas B2C de BorondoTours. Vínculo opcional `user_id` solo dentro del tenant BorondoTours. |
| Empresa (cliente corporativo, colegio) | — | `CrmCompanies` (posterior); `Contacts.company_id` nullable desde ya. |
| Lead / oportunidad | La tarjeta = `Quotations` | **Nueva `Leads`** (lead y oportunidad en una sola tabla, como `crm.lead` de Odoo). Un lead tiene 0..N cotizaciones. |
| Etapas del pipeline | Columnas fijas de Spec-H RF-H02 | **Nueva `PipelineStages`** por organización, con `system_key` para las etapas automáticas. |
| Timeline / notas | `QuoteActions` (§33) | **Generalizar `QuoteActions` → `LeadEvents`** (`lead_id` + `quotation_id` nullable). La nota es un evento `NOTE_ADDED` con cuerpo: no hace falta una tabla de notas. |
| Actividades/tareas planeadas | — | **Nueva `CrmTasks`** (mutable: pendiente/hecha). Distinta del timeline, que es inmutable. |
| Etiquetas | — | **Nuevas `Tags` + `ContactTags`** (y `LeadTags` si se pide). |
| Plantillas de mensaje | Template de email SES y texto wa.me en RF-H08 (sin tabla) | **Nueva `MessageTemplates`** (EMAIL / WHATSAPP; categoría MARKETING / UTILITY para Ley 2300 y Meta). |
| Conversaciones WhatsApp | Solo links `wa.me` (RF-H08) | `Conversations` en PostgreSQL + mensajes en DynamoDB `BorondoCrmMessages` (posterior). |
| Idempotencia del webhook de Meta | `WebhookEvents` (§38, provider ONEPAY/SIIGO) | **Reusar**: agregar `META_WHATSAPP` al enum `provider`. |
| Consentimientos | `UserConsents` (Política §6, no está en el Core) | **Generalizar a `Consents`**: sujeto `user_id` o `contact_id`, más `controller_organization_id` y canal. |
| Comisión del vendedor | `AgentCommissions` (§16) | Extender con organización pagadora y base de cálculo (§4). |

### Relación con las tablas existentes

```
Organizations 1─N Contacts 1─N Leads 1─N Quotations 0..1─1 Bookings 1─N AgentCommissions
                                  │            │
                                  └─N LeadEvents (quotation_id opcional)
Leads N─1 PipelineStages(system_key)      Bookings.contact_id → Contacts (venta de agencia)
```

- `Quotations` gana `organization_id`, `lead_id`, `contact_id`. Los campos `client_name/email/phone`
  salen de la cotización (PII duplicada sin cifrar) y se leen del contacto.
- `Bookings.user_id` hoy es NOT NULL. Una venta de agencia del operador no tiene cuenta B2C. Propuesta:
  `user_id` nullable + `contact_id` nullable + `CHECK (user_id IS NOT NULL OR contact_id IS NOT NULL)`.
  Alternativa descartada: crear un `Users` CLIENT "sombra" por cada contacto, porque convierte a
  BorondoTours en responsable de datos que son del operador y cruza la frontera de tenant.
- **Propiedad del lead (90 días)** pasa de la cotización al lead: `Leads.owner_user_id`,
  `last_significant_at`, `ownership_expires_at`. Cada `LeadEvents` con `is_significant = true` renueva el
  contador. Son interacciones significativas las de RF-H04: nota, reenvío del link, apertura del link por el
  cliente, cambio de precio o pax. La vigencia de 72h de la cotización (Reglas-Negocio) es otro reloj y se
  mantiene en `Quotations.expires_at`.
- **Etapas configurables sin romper la automatización.** El webhook OnePay.la y los crons de RF-H02 apuntan a
  `system_key` (QUOTED, RESERVED, PAID, IN_EXECUTION, COMPLETED, LOST), no al id ni al nombre. La
  organización puede renombrar estas etapas y agregar las suyas antes de QUOTED (p. ej. "Nuevo",
  "Contactado", "Calificado"). Las etapas con `system_key` no se borran. La máquina de estados (no se puede
  mover de PAID a QUOTED) vive en `packages/domain`.

### Conversaciones y mensajes WhatsApp: ¿PostgreSQL o DynamoDB?

**Decisión: índice de conversaciones en PostgreSQL y mensajes en DynamoDB.**

- `Conversations` (PostgreSQL) guarda contacto, lead, agente asignado, `last_message_at`,
  `unread_count`, `window_expires_at` (ventana de 24h de Meta) y `status`. La bandeja necesita
  ordenar, filtrar por agente y hacer JOIN con contactos y leads: eso es relacional.
- Los mensajes van a una tabla DynamoDB `BorondoCrmMessages`:
  PK `ORG#{organization_id}#CONV#{conversation_id}`, SK `{timestamp}#{message_id}`,
  GSI `wa_message_id` para aplicar los webhooks de estado (sent/delivered/read) de forma idempotente.
  Es el mismo argumento de ADR-003 (ráfagas de escritura que no deben competir con bookings y payouts).
  `dynamodb-local` ya está en `docker-compose.yml`.
- **No reusar `BorondoChat`**: su ciclo de vida es por instancia de tour, con exportación y borrado al
  terminar. La bandeja CRM es de largo plazo y su retención la define legal (Política §1 dice "plazo por
  definir" para chat). Se necesita extender ADR-003 o un ADR nuevo. Es decisión del usuario; no se resuelve aquí.
- Las credenciales WABA por tenant van a Secrets Manager. En la BD solo queda
  `OrganizationChannels.secret_arn`, no el token cifrado como en vocero-crm.

### Consentimientos (Ley 1581) y contacto comercial (Ley 2300)

- **Responsable del tratamiento según el canal.** En la venta B2C, BorondoTours es responsable y el
  operador es encargado (Política §3.3). En la venta propia del operador por su módulo de agencia es al
  revés: el operador es responsable de sus contactos y BorondoTours es encargado. Por eso `Consents` registra
  `controller_organization_id`, y la Política de Datos y los ToS del marketplace deben actualizarse (tarea de legal).
- Consentimientos separados y no premarcados: `PRIVACY_POLICY`, `MARKETING_EMAIL`, `MARKETING_WHATSAPP`,
  `MEDICAL_DATA`, `PASSPORT_DATA`. El contacto importado por CSV (función de vocero-crm) entra **sin**
  consentimiento de marketing: solo puede recibir mensajes transaccionales hasta que haya opt-in.
- PII cifrada en reposo (Política §5.1): `Contacts.phone_enc`, `email_enc`, `document_number_enc`. Para
  buscar y deduplicar sin descifrar: `phone_hash` y `email_hash` (HMAC-SHA256 con pepper en Secrets
  Manager), `UNIQUE(organization_id, phone_hash)`. El nombre queda en claro para búsqueda pg_trgm, igual que
  `Users.first_name` hoy.
- Derecho de cancelación: se anonimiza el contacto (`status = ANONYMIZED`), no se borra, y se registra en
  `DataDeletionLog`, que se generaliza con `contact_id`.

---

## 4. Reglas de dominio afectadas (pregunta 3)

### 4.1 Canales de venta (nuevo concepto)

Hoy `Bookings.source` (WEB_B2C, AGENT_QUOTE, AGENCY_LINK, QUICK_SALE) describe el origen, pero no quién
vendió ni quién cobró. Con la app unificada, eso decide la comisión, el payout, la factura y las
retenciones. Propuesta: `Bookings.seller_organization_id`, `Bookings.operator_id` (dueño del tour,
desnormalizado) y `Bookings.collection_mode` (BT_GATEWAY | OPERATOR_EXTERNAL). El canal se deriva de los tres:

| Canal | Vende | Cobra | Comisión BorondoTours | Comisión del vendedor | OperatorPayout | Factura de BorondoTours / principal |
|---|---|---|---|---|---|---|
| `BT_B2C` | BorondoTours (web) | OnePay.la de BorondoTours | `OperatorContracts.commission_pct` + markup | — | Sí | Sí / BorondoTours principal |
| `BT_AGENT` | Agente interno de BorondoTours | OnePay.la de BorondoTours | igual | `AgentCommissions` sobre `borondo_amount` | Sí | Sí / principal |
| `OPERATOR_DIRECT` | El operador vende sus propios tours desde su módulo de agencia | Por fuera (efectivo, transferencia, pasarela propia) | **Decisión de negocio pendiente.** Propuesta MVP: 0% (`OperatorContracts.direct_sale_fee_pct` default 0) | Comisión interna del operador a su vendedor (opcional, la paga el operador) | No | No / el operador es el vendedor |
| `OPERATOR_DIRECT_BT_LINK` | El operador vende lo suyo, pero cobra con link OnePay.la de BorondoTours | BorondoTours | `direct_sale_fee_pct` (decisión) | igual que arriba | Sí (neto del fee) | Sí / principal: hay que confirmarlo con el contador |
| `PARTNER_RESALE` (posterior) | Una organización con módulo AGENCY vende tours de **otro** operador | OnePay.la de BorondoTours | `commission_pct` del operador dueño | Comisión de agencia aliada, pagada por BorondoTours desde `borondo_amount` | Sí, al operador dueño, y una liquidación a la agencia aliada | Sí / principal |
| `AGENCY_LINK` (existe, Spec-I RF-I10) | Agencia externa sin tecnología | Por fuera, la confirma el operador | Hoy no definido; mismo tratamiento que `OPERATOR_DIRECT` | — | No | No |

Reglas comunes a todos los canales:
- Cupos con `SELECT FOR UPDATE` sobre `TourInstances` en **todos** los canales, también en
  `OPERATOR_DIRECT`. Si no, la venta directa del operador produce overbooking con el B2C.
- Reserva confirmada nunca se borra; precio congelado al crear el booking (esto exige el snapshot de abajo).
- Cancelación: con `OPERATOR_DIRECT` la política aplicable es la del operador. BorondoTours no registra
  `PenaltyIncome` porque no cobró.
- Riesgo de desintermediación: un operador podría registrar como venta directa a un cliente que llegó por
  el B2C para no pagar comisión. El modelo no puede impedirlo por completo (cruzar contactos entre tenants
  violaría la privacidad). Se mitiga con: el manifiesto no expone contacto completo de clientes B2C (ya en
  Spec-I RF-I24b para reseñas), reporte de mezcla de canales por operador para el SUPER_ADMIN y cláusula en los ToS.

### 4.2 Snapshot financiero en `Bookings` (falta hoy)

`calculateBookingTotal` devuelve `operatorPrice`, `commissionAmount`, `borondoAmount`, `ivaOnMargin`,
`netBorondo` y `operatorGross`, pero `Bookings` (§8) no guarda ninguno. Las reglas contables los usan
(`Reglas-Negocio-Detalle` §NIIF 15 cita `borondo_amount` y `operator_amount`). Sin snapshot, un cambio
de contrato reescribe la historia. Columnas nuevas: `operator_commission_pct_snapshot`,
`operator_amount_cop`, `borondo_amount_cop`, `markup_cop`, `iva_on_margin_cop`,
`seller_commission_pct_snapshot`, `seller_commission_amount_cop`.

### 4.3 Comisión del agente: hay que unificar antes de codificar

| Fuente | Base | Cálculo |
|---|---|---|
| `Modelo-Comisiones.md` §H-19 | "subtotal antes de IVA del booking" | % mensual del agente |
| Spec-H RF-H10, `Reglas-Negocio-Detalle`, steering 05 | `borondo_amount` | `borondo_amount × rate individual` |
| `Domain-Financiero.md` §6 | `borondo_amount` del **equipo** | escala colectiva por tramos (0/3/5/7/10%), repartida en proporción a las ventas |
| Core §16 `AgentCommissions` | `commission_pct` (base no dicha) | status PENDING/APPROVED/PAID (Spec-H usa PENDING/PAID/VOIDED) |

Recomendación: tomar la regla del steering 05 (`borondo_amount × rate`) como canónica para los agentes de
BorondoTours, y dejar la escala colectiva de Domain-Financiero como **modo opcional** por organización.
Para el vendedor de un operador en `OPERATOR_DIRECT`, `borondo_amount` es 0, así que la base debe ser
configurable: `AgentCommissions.base_kind` (BORONDO_AMOUNT | SELLER_MARGIN | SUBTOTAL_PRE_IVA) y
`organization_id` (quién paga). Lo decide el usuario (ver §7).

Venta colaborativa (RF-H05): la comisión va al `owner_user_id` del lead si su propiedad sigue vigente. El
agente que cierra recibe una comisión de asistencia (`assist_rate`). Hacen falta dos filas en
`AgentCommissions` con `role_in_sale` OWNER | ASSIST.

### 4.4 Retenciones (ADR-009/010)

- `calculateOperatorPayout` (Domain-Financiero §9) aplica ReteFuente de **servicios** (4/6%) sobre
  `operatorGross`. Excluye los bookings con `collection_mode = OPERATOR_EXTERNAL`, porque no hay
  dinero que liquidar.
- La liquidación de una agencia aliada (`PARTNER_RESALE`) es un pago por **comisión/intermediación**, con
  otra tarifa de ReteFuente (ADR-009 lista honorarios al 10–11%; la tarifa de comisiones la valida el
  contador). Propuesta: generalizar `OperatorPayouts` con `payout_kind` (OPERATOR_SERVICE |
  AGENCY_COMMISSION) en lugar de crear otra tabla de liquidaciones, y agregar `AGENCY_COMMISSION` al enum
  `ServiceTaxes.service_kind` (ADR-010: BorondoTours decide QUÉ impuesto aplica y Siigo calcula CUÁNTO).
- Si `direct_sale_fee_pct > 0` con cobro externo, BorondoTours tendría que **facturar el fee al operador**
  (cuenta por cobrar). Eso no existe en el modelo; queda como posterior y depende de la decisión de negocio.

### 4.5 Funciones de `packages/domain` a crear o cambiar

Todas puras, en COP enteros con `Math.floor` como el código existente, y con tests obligatorios (finanzas
y máquinas de estado, steering 04/06).

| Función | Estado | Propósito |
|---|---|---|
| `calculateBookingTotal` | **Cambiar** | Recibir los términos del canal (`commissionPct` puede ser 0, `sellerCommissionPct`) sin romper la firma actual (parámetro opcional) y devolver los campos del snapshot. |
| `resolveSaleChannel` | Nueva | `(sellerOrgId, operatorOrgId, platformOrgId, collectionMode, source)` → canal de §4.1. |
| `resolveCommissionTerms` | Nueva | canal + contrato vigente → `{borondoPct, sellerPct, isBorondoPrincipal, generatesPayout, issuesInvoice}`. |
| `calculateAgentCommission` | **Cambiar/implementar** | Unificar las 3 definiciones con `baseKind` y modo INDIVIDUAL / TEAM_TIERS. |
| `splitCollaborativeCommission` | Nueva | Reparto OWNER/ASSIST de RF-H05. |
| `calculatePartnerAgencyCommission` | Nueva (posterior) | Comisión de la agencia aliada sobre `borondo_amount`. |
| `calculateWithholdings` | Nueva (extraer de `calculateOperatorPayout`) | Retenciones por `serviceKind` (servicio vs comisión) y perfil fiscal del beneficiario. |
| `calculateOperatorPayout` | **Cambiar/implementar** | Excluir cobro externo; usar `calculateWithholdings`; `payoutKind`. |
| `computeLeadOwnership` + `isSignificantInteraction` | Nueva | 90 días desde la última interacción significativa; aviso 7 días antes (RF-H04). |
| `canTransitionStage` | Nueva | Máquina de estados de `system_key` (sin PAID → QUOTED, LOST solo manual). |
| `requiresDiscountApproval` | Nueva | Descuento > 10% → PENDING_APPROVAL (RF-H06b). |
| `isCommercialContactAllowed` | Nueva | Ley 2300: horario permitido para mensajes de categoría MARKETING. Horario de referencia: lunes a viernes 7:00–19:00 y sábados 8:00–15:00, sin domingos ni festivos; legal debe validarlo. Los transaccionales no tienen restricción. |

El chequeo de módulos activos (`hasModule`) no es lógica financiera: va en el middleware RBAC de
`services/1-core`, no en `packages/domain`.

---

## 5. Tenant isolation en datos (pregunta 4)

### Clasificación de tablas

| Tipo | Tablas | Columna de tenant |
|---|---|---|
| Propias de un tenant (directas) | `Organizations` (fila propia), `OrganizationModules`, `Users` (staff), `CustomRoles` (nullable = global), y todas las del CRM: `Contacts`, `Leads`, `PipelineStages`, `LeadEvents`, `CrmTasks`, `Tags`, `ContactTags`, `MessageTemplates`, `Conversations`, `OrganizationChannels`, `Consents` (controlador) | `organization_id` |
| Del módulo operador (directas) | `Tours`, `Vehicles`, `OperatorDocuments`, `OperatorContracts`, `OperatorPayouts`, `OperatorChargebacks`, `OperatorRegions`, `ProviderAgreements`, `CancellationPolicies`, `AgencyLinks` | `operator_id` |
| Indirectas, vía padre (**riesgo**) | `TourPriceRanges`, `TourAddOns`, `TourInstances`, `ReadinessChecklistItems`, `OperationalClosure`, `TourInstanceNotes`, `TourIncidents`, `FieldExpenses`, `ManifestCheckins`, `BookingPassengers`, `BookingAddOns`, `PlanComponents`, `ResourceUnavailability`, `PremiumAllocations`, `TourEditRequests` | ninguna |
| Multi-parte (las ven varios tenants con proyecciones distintas) | `Bookings` (operador dueño, organización vendedora, BorondoTours), `Quotations` (vendedora), `AgentCommissions` (pagadora y beneficiario), `Reviews` (operador en solo lectura, sin datos de contacto), `Invoices` | `operator_id` + `seller_organization_id` |
| Globales | `Taxes`, `ServiceTaxes`, `Ads`, `AdImpressions`, `WebhookEvents`, `Regions` (con `is_global`), `Providers` (compartidos) | — |

### Recomendaciones

1. **Desnormalizar `operator_id`** en `TourInstances`, `Bookings`, `FieldExpenses`, `TourIncidents`,
   `PremiumAllocations` y `TourEditRequests`: son las que se listan por operador (radar, calendario,
   finanzas, gastos). Índices: `INDEX(operator_id, instance_date)` en TourInstances,
   `INDEX(operator_id, status, created_at)` y `INDEX(seller_organization_id, created_at)` en Bookings. El
   resto de las indirectas se lee siempre después de autorizar el padre.
2. **FK compuestas contra fugas entre tenants:** `UNIQUE(organization_id, id)` en `Contacts`, `Leads`,
   `PipelineStages` y `Tags`, y FK `(organization_id, contact_id) → Contacts(organization_id, id)` (igual
   para `stage_id`, `lead_id`, `tag_id`). Así PostgreSQL impide que un lead del tenant A apunte a un
   contacto o etapa del tenant B, aunque la aplicación tenga un bug.
3. **Un único helper de repositorio** que reciba `ctx.organizationId` y la columna de tenant declarada por
   tabla. Ninguna query de tenant se escribe sin él. Los tests de RBAC/tenant (obligatorios) cubren lectura
   cruzada por id adivinado en cada endpoint.
4. **BorondoTours como tenant.** Los usuarios internos tienen `organization_id` = la fila de la plataforma.
   El acceso transversal del SUPER_ADMIN es un bypass explícito y auditado en `AdminAuditLog` (citado en la
   Política §5.2 pero ausente del Core). Elimina el patrón frágil `operator_id IS NULL ⇒ ve todo`.
5. **RLS de PostgreSQL** como segunda defensa en F2 (`SET LOCAL app.organization_id` por transacción). Antes
   hay que verificar cómo se comporta el pinning de sesiones de RDS Proxy con `SET`; no lo verifiqué. En el
   MVP: middleware, helper, FK compuestas y tests.
6. **Búsqueda.** El GIN pg_trgm sobre `Contacts.full_name` no filtra por tenant. Se necesita la extensión
   `btree_gin` para `GIN(organization_id, full_name gin_trgm_ops)`, o filtrar primero por
   `organization_id` con btree. Es una extensión nueva de PostgreSQL: requiere aprobación.
7. **DynamoDB y S3 con prefijo de organización** (`ORG#{id}#…`, `s3://…/org/{id}/…`). La tabla
   `BorondoConnections` (ADR-003) debe llevar `organization_id` en el `room` para que el ka-ching o el
   leaderboard de un tenant no se difundan a otro.

### Riesgos de fuga detectados en el modelo actual

| Riesgo | Dónde | Mitigación |
|---|---|---|
| `Providers` es global y editable: el operador A podría ver o cambiar los datos de contacto que cargó el operador B | Core §42 | Edición solo por SUPER_ADMIN o por la organización creadora (`created_by_organization_id`). Los acuerdos (`ProviderAgreements`) son privados por operador. |
| `Regions` creadas por un operador (K-RF12) son visibles para todos | Core §40 (sin dueño) | `owner_organization_id` nullable (NULL = global). |
| `CustomRoles.name UNIQUE` global | Core §23 | `UNIQUE(organization_id, name)`. |
| Deduplicar contactos por teléfono global revela que la persona es cliente de otro tenant | CRM nuevo | Unicidad solo por `(organization_id, phone_hash)`. Nunca índice global. |
| Leaderboard y KPIs del gerente agregan sin filtro | Spec-H RF-H13/H15 | Agregados siempre por `organization_id`. |
| `ManifestPassengers` guarda PII sin cifrar y sin `operator_id` | Spec-I §15 | Consolidar en `BookingPassengers` (ver §7). |
| `AgencyLinks` público: el token resuelve al operador | Spec-I RF-I10 | El token solo autoriza escribir en su `tour_instance_id`; rate limit (ya en Spec-I §16). |
| Ghost Login entre tenants | Spec-H RF-H18 | Ya auditado. Agregar `target_organization_id` a `GhostLoginAuditLog`. |

---

## 6. Cambios propuestos al Modelo-Datos-Core (pregunta 5)

Marcas: **[MVP]** = necesario para la app unificada con CRM básico. **[POST]** = fase siguiente.
Tipos y formato del Core. Todas las tablas llevan `created_at`/`updated_at`, como dice el Core.

### 6.1 Tablas modificadas

```
Organizations (antes Operators, §2)                                      [MVP]
  + is_platform: boolean (default: false)   ← UNIQUE parcial WHERE is_platform = true (solo BorondoTours)
  + slug: string (UNIQUE)
  + status: enum (ACTIVE, SUSPENDED, ARCHIVED)
  ~ commission_pct                         ← DEPRECADO: fuente = OperatorContracts vigente
  ~ onboarding_status                      ← aplica al módulo OPERATOR (ver OrganizationModules.status)
  (resto de campos fiscales sin cambio: aplican a operador y agencia)

Users (§1)                                                               [MVP]
  ~ operator_id → organization_id: uuid FK | null
                  ← CHECK ((role = 'CLIENT') = (organization_id IS NULL)); internos = fila de BorondoTours
  INDEX(organization_id, role)

CustomRoles (§23)                                                        [MVP]
  + organization_id: uuid FK | null        ← null = plantilla global
  ~ UNIQUE(name) → UNIQUE(organization_id, name)

Bookings (§8)                                                            [MVP]
  ~ user_id: uuid FK | null                ← CHECK (user_id IS NOT NULL OR contact_id IS NOT NULL)
  + contact_id: uuid FK | null             ← Contacts del vendedor (venta de agencia)
  + operator_id: uuid FK                   ← desnormalizado de Tours (aislamiento)
  + seller_organization_id: uuid FK        ← quién vendió (BorondoTours, el operador u otra agencia)
  + seller_user_id: uuid FK | null         ← reemplaza la semántica de agent_id (se mantiene agent_id como alias hasta ajustar Spec-H)
  + lead_id: uuid FK | null
  + quotation_id: uuid FK | null
  + collection_mode: enum (BT_GATEWAY, OPERATOR_EXTERNAL)
  + sale_channel: enum (BT_B2C, BT_AGENT, OPERATOR_DIRECT, OPERATOR_DIRECT_BT_LINK, PARTNER_RESALE, AGENCY_LINK)
  + external_payment_method: enum (CASH, TRANSFER, NEQUI, CARD_OWN_GATEWAY, OTHER) | null
  + external_payment_reference: string | null
  ~ source: enum + OPERATOR_DIRECT
  + operator_commission_pct_snapshot: decimal(6,4)
  + operator_amount_cop: decimal(14,2)
  + borondo_amount_cop: decimal(14,2)
  + markup_cop: decimal(14,2) (default: 0)
  + iva_on_margin_cop: decimal(14,2)
  + seller_commission_pct_snapshot: decimal(6,4) | null
  + seller_commission_amount_cop: decimal(14,2) (default: 0)
  INDEX(operator_id, status, created_at) · INDEX(seller_organization_id, created_at)

TourInstances (§7)                                                       [MVP]
  + operator_id: uuid FK                   ← desnormalizado; INDEX(operator_id, instance_date)

Quotations (§25)                                                         [MVP]
  + organization_id: uuid FK               ← organización vendedora
  + lead_id: uuid FK
  + contact_id: uuid FK
  - client_name, client_email, client_phone ← se leen de Contacts (PII sin cifrar duplicada)
  + discount_amount_cop: decimal(14,2) | null
  + discount_approved_by: uuid FK | null
  ~ status: enum (DRAFT, PENDING_APPROVAL, SENT, OPENED, PAID, EXPIRED, CANCELED)
  INDEX(organization_id, status) · INDEX(lead_id)

QuoteActions (§33) → LeadEvents (generalizada)                           [MVP]
  - id: uuid (PK)
  - organization_id: uuid FK
  - lead_id: uuid FK
  - quotation_id: uuid FK | null
  - event_type: enum (CREATED, STAGE_CHANGED, NOTE_ADDED, QUOTE_CREATED, PRICE_CHANGED,
                      LINK_GENERATED, LINK_SENT_EMAIL, LINK_SENT_WHATSAPP, LINK_OPENED,
                      MESSAGE_SENT, MESSAGE_RECEIVED, TASK_COMPLETED, REASSIGNED, EXPIRED, WON, LOST)
                      ← une los enums del Core §33 y de Spec-H §12
  - actor_user_id: uuid FK | null          ← null si es acción del cliente o del sistema
  - is_significant: boolean                ← true renueva la propiedad de 90 días (RF-H04)
  - body: text | null                      ← nota; sin PII de terceros
  - metadata: jsonb | null                 ← {from_stage, to_stage, to_user, reason}
  - created_at: timestamp                  ← inmutable (solo inserción)
  INDEX(lead_id, created_at) · INDEX(organization_id, created_at)

AgentCommissions (§16)                                                   [MVP]
  + organization_id: uuid FK               ← quién paga (BorondoTours u operador)
  + lead_id: uuid FK | null
  + quotation_id: uuid FK | null
  + role_in_sale: enum (OWNER, ASSIST)
  + base_kind: enum (BORONDO_AMOUNT, SELLER_MARGIN, SUBTOTAL_PRE_IVA)
  + base_amount_cop: decimal(14,2)
  ~ commission_pct → commission_rate_snapshot: decimal(6,4)
  ~ status: enum (PENDING, APPROVED, PAID, VOIDED)
  + paid_by: uuid FK | null · payment_method: enum (TRANSFER, NEQUI, CASH, OTHER) | null
  INDEX(organization_id, period, status) · INDEX(agent_id, period)

AgentCommissionHistory (§17)                                             [MVP]
  + organization_id: uuid FK
  + mode: enum (INDIVIDUAL, TEAM_TIERS)
  + base_kind: enum (igual que arriba)

OperatorContracts (§15)                                                  [MVP]
  + direct_sale_fee_pct: decimal(6,4) (default: 0)   ← fee de BorondoTours en OPERATOR_DIRECT* (decisión de negocio)
  + partner_resale_allowed: boolean (default: false) ← autoriza que otras agencias revendan [POST]

OperatorPayouts (§14)                                                    [POST]
  + payout_kind: enum (OPERATOR_SERVICE, AGENCY_COMMISSION)
  ~ operator_id → payee_organization_id     ← (o mantener operator_id y documentar que es el beneficiario)

ServiceTaxes (§50)                                                       [POST]
  ~ service_kind: enum + AGENCY_COMMISSION, DIRECT_SALE_FEE

WebhookEvents (§38)                                                      [POST]
  ~ provider: enum + META_WHATSAPP

AgencyLinks (Spec-I §15, entra al Core) · PremiumAllocations             [MVP]
  + agency_organization_id: uuid FK | null  ← si la agencia ya es una organización de la plataforma
  + operator_id en PremiumAllocations (desnormalizado)

GhostLoginAuditLog (§24)                                                 [MVP]
  + target_organization_id: uuid FK | null

Providers (§42) · Regions (§40)                                          [MVP]
  + Providers.created_by_organization_id: uuid FK | null
  + Regions.owner_organization_id: uuid FK | null   ← null = taxonomía global
```

### 6.2 Tablas nuevas

```
OrganizationModules                                                      [MVP]
  - id: uuid (PK)
  - organization_id: uuid FK
  - module_key: enum (OPERATOR_INVENTORY,      ← tours, instancias, cupos, edit requests (Spec-I §4-5)
                      OPERATOR_OPERATIONS,     ← manifiesto, radar, planificación, cierre (Spec-I §6-8, Spec-K)
                      OPERATOR_TEAM_FLEET,     ← equipo y vehículos (Spec-I §10)
                      OPERATOR_FINANCE,        ← liquidaciones y revenue (Spec-I §12)
                      OPERATOR_FIELD_APP,      ← App 4 móvil [POST, F3]
                      MARKETPLACE_LISTING,     ← publicar en el B2C de BorondoTours
                      AGENCY_CRM,              ← contactos, leads, pipeline, tareas
                      AGENCY_SALES,            ← cotizaciones, venta rápida, comisiones de vendedores
                      AGENCY_WHATSAPP_INBOX,   ← bandeja WhatsApp Cloud API [POST]
                      AGENCY_PARTNER_RESALE)   ← revender tours de otros operadores [POST]
  - module_group: enum (OPERATOR, AGENCY, PLATFORM)  ← grupo colapsable del sidebar (derivable; se guarda para consultas)
  - status: enum (PENDING_REVIEW, ACTIVE, SUSPENDED)
  - settings: jsonb | null                 ← p. ej. {commission_mode: 'INDIVIDUAL'}
  - activated_by: uuid FK | null           ← SUPER_ADMIN
  - activated_at: timestamp | null
  - suspended_at: timestamp | null
  - suspension_reason: text | null
  - created_at / updated_at
  - UNIQUE(organization_id, module_key)

Contacts                                                                 [MVP]
  - id: uuid (PK)
  - organization_id: uuid FK
  - company_id: uuid FK | null             ← CrmCompanies [POST]
  - user_id: uuid FK | null                ← solo si organization = BorondoTours y el contacto tiene cuenta B2C
  - full_name: string
  - phone_enc: bytea | null                ← AES-256/KMS (Política §5.1)
  - phone_hash: string | null              ← HMAC-SHA256 para deduplicar y buscar
  - email_enc: bytea | null
  - email_hash: string | null
  - document_type: enum (CC, CE, PASSPORT, NIT, TI) | null
  - document_number_enc: bytea | null
  - country: string (default: 'CO')
  - city: string | null
  - language: string (default: 'es')
  - source: enum (MANUAL, CSV_IMPORT, WHATSAPP, WEB_FORM, B2C, REFERRAL, AGENCY_LINK)
  - owner_user_id: uuid FK | null          ← vendedor responsable
  - status: enum (ACTIVE, ARCHIVED, ANONYMIZED)
  - created_by: uuid FK
  - created_at / updated_at
  - UNIQUE(organization_id, id) · UNIQUE(organization_id, phone_hash) · INDEX(organization_id, owner_user_id)
  - GIN(organization_id, full_name gin_trgm_ops)  ← requiere btree_gin (aprobación)

PipelineStages                                                           [MVP]
  - id: uuid (PK)
  - organization_id: uuid FK
  - name: string
  - position: integer
  - kind: enum (OPEN, WON, LOST)
  - system_key: enum (QUOTED, RESERVED, PAID, IN_EXECUTION, COMPLETED, LOST) | null
                                           ← destino de transiciones automáticas; no borrable
  - is_active: boolean (default: true)
  - created_at / updated_at
  - UNIQUE(organization_id, id) · UNIQUE(organization_id, system_key) WHERE system_key IS NOT NULL
  - INDEX(organization_id, position)
  > Seed por organización al activar AGENCY_CRM: Nuevo, Contactado + las 6 etapas con system_key.

Leads                                                                    [MVP]
  - id: uuid (PK)
  - organization_id: uuid FK
  - contact_id: uuid FK                    ← FK compuesta (organization_id, contact_id)
  - stage_id: uuid FK                      ← FK compuesta (organization_id, stage_id)
  - title: string                          ← p. ej. "Pasadía grupo empresa, marzo"
  - status: enum (OPEN, WON, LOST, EXPIRED)
  - lost_reason: enum (PRECIO, DISPONIBILIDAD, COMPETENCIA, NO_RESPONDE, OTRO) | null
  - lost_note: text | null
  - source: enum (WEB_B2C, AGENT_MANUAL, REFERIDO, FAST_SALE, WHATSAPP, AGENCY_LINK)
  - estimated_value_cop: decimal(14,2) | null
  - expected_travel_date: date | null
  - pax_estimate: integer | null
  - interest_tour_id: uuid FK | null
  - owner_user_id: uuid FK                 ← dueño del lead (RF-H04)
  - last_significant_at: timestamp
  - ownership_expires_at: timestamp        ← last_significant_at + 90 días (computeLeadOwnership)
  - position: integer (default: 0)         ← orden en la columna del kanban
  - won_booking_id: uuid FK | null
  - created_by: uuid FK
  - created_at / updated_at
  - UNIQUE(organization_id, id)
  - INDEX(organization_id, stage_id, position) · INDEX(organization_id, owner_user_id, status)
  - INDEX(ownership_expires_at) WHERE status = 'OPEN'  ← job diario de expiración

CrmTasks                                                                 [MVP]
  - id: uuid (PK)
  - organization_id: uuid FK
  - lead_id: uuid FK | null
  - contact_id: uuid FK | null
  - assigned_to: uuid FK
  - task_type: enum (CALL, WHATSAPP, EMAIL, MEETING, FOLLOW_UP, OTHER)
  - title: string
  - due_at: timestamp
  - status: enum (PENDING, DONE, CANCELED)
  - completed_at: timestamp | null
  - created_by: uuid FK
  - created_at / updated_at
  - INDEX(organization_id, assigned_to, status, due_at)

Tags · ContactTags                                                       [MVP]
  Tags: id, organization_id, name, color_token (token semántico, no hex), created_at · UNIQUE(organization_id, name)
  ContactTags: contact_id, tag_id, organization_id, created_at · PK(contact_id, tag_id)
               · FK compuestas por organization_id

MessageTemplates                                                         [MVP]
  - id: uuid (PK)
  - organization_id: uuid FK
  - channel: enum (EMAIL, WHATSAPP)
  - category: enum (TRANSACTIONAL, MARKETING)  ← Ley 2300 y categorías de Meta (UTILITY/MARKETING)
  - name: string
  - language: string (default: 'es')
  - body: text                             ← variables {{contact_first_name}}, {{tour}}, {{link}}
  - provider_template_id: string | null    ← id aprobado en Meta [POST]
  - approval_status: enum (DRAFT, PENDING, APPROVED, REJECTED)
  - is_active: boolean (default: true)
  - created_by: uuid FK
  - created_at / updated_at
  - UNIQUE(organization_id, channel, name, language)

Consents (generaliza UserConsents de Politica-Datos-Personales §6)       [MVP]
  - id: uuid (PK)
  - controller_organization_id: uuid FK    ← responsable del tratamiento
  - user_id: uuid FK | null
  - contact_id: uuid FK | null             ← CHECK (exactamente uno de user_id / contact_id)
  - consent_type: enum (PRIVACY_POLICY, MARKETING_EMAIL, MARKETING_WHATSAPP, MEDICAL_DATA, PASSPORT_DATA)
  - consent_version: string
  - capture_channel: enum (WEB_FORM, WHATSAPP_OPT_IN, IN_PERSON_SIGNED, CSV_IMPORT_ATTESTED)
  - evidence_ref: string | null            ← id del mensaje o del documento firmado (sin PII)
  - given_at: timestamp
  - revoked_at: timestamp | null
  - ip_address: string | null              ← retención 90 días
  - user_agent: string | null
  - INDEX(contact_id, consent_type) · INDEX(user_id, consent_type)

DataDeletionLog · AdminAuditLog (Política §4.2 y §5.2; hoy fuera del Core) [MVP]
  DataDeletionLog + contact_id: uuid FK | null, organization_id: uuid FK
  AdminAuditLog: id, actor_user_id, target_organization_id, action, resource, resource_id, created_at

OrganizationChannels                                                     [POST]
  - id, organization_id, channel: enum (WHATSAPP_CLOUD, EMAIL_SES)
  - external_account_id: string            ← WABA / phone_number_id
  - display_identifier: string | null      ← número enmascarado
  - secret_arn: string                     ← Secrets Manager; nunca el token en BD
  - status: enum (CONNECTED, DISCONNECTED, ERROR)
  - UNIQUE(organization_id, channel) · UNIQUE(external_account_id)

Conversations                                                            [POST]
  - id, organization_id, contact_id, lead_id | null, channel_id FK
  - assigned_to: uuid FK | null
  - status: enum (OPEN, PENDING, CLOSED)
  - last_message_at, last_inbound_at, window_expires_at (24h Meta), unread_count
  - INDEX(organization_id, assigned_to, last_message_at) · UNIQUE(organization_id, contact_id, channel_id) WHERE status <> 'CLOSED'

DynamoDB BorondoCrmMessages                                              [POST]
  PK ORG#{organization_id}#CONV#{conversation_id} · SK {timestamp}#{message_id}
  direction (IN|OUT), type (TEXT|TEMPLATE|MEDIA|SYSTEM), body, template_id, status (PENDING|SENT|DELIVERED|READ|FAILED),
  sender_user_id, media_s3_key (prefijo org/), wa_message_id · GSI-1 wa_message_id (idempotencia)
  Retención: definir con legal (no reusar la política de BorondoChat)

CrmCompanies                                                             [POST]
  id, organization_id, legal_name, nit_hash, city, status, created_at/updated_at · UNIQUE(organization_id, nit_hash)

OrganizationMemberships (usuario en varias organizaciones)               [POST]
  id, user_id, organization_id, role, custom_role_id, status · UNIQUE(user_id, organization_id)
```

### 6.3 Tablas de Spec-I que deben entrar al Core (no están entre las 54) [MVP]

`TourEditRequests`, `PremiumAllocations`, `AgencyLinks` y `TourInstanceStates`, con `operator_id`
desnormalizado. **`ManifestPassengers` no debería entrar tal cual** (ver §7, C7).

Conteo resultante: 54 + 9 [MVP] nuevas (OrganizationModules, Contacts, PipelineStages, Leads, CrmTasks,
Tags, ContactTags, MessageTemplates, Consents) + 2 de privacidad (DataDeletionLog, AdminAuditLog) + 4 de
Spec-I. `LeadEvents` reemplaza a `QuoteActions` y `Organizations` a `Operators`, así que no suman.

---

## 7. Contradicciones previas y decisiones para el usuario

| # | Contradicción / decisión | Evidencia | Recomendación |
|---|---|---|---|
| C1 | Base de la comisión del agente (3 definiciones) | `Modelo-Comisiones.md` H-19 vs Spec-H RF-H10 / steering 05 vs `Domain-Financiero.md` §6 | Canónica: `borondo_amount × rate` (steering 05); escala de equipo como modo opcional. **Decide el usuario.** |
| C2 | `Quotations` (Core §25) vs `Quotes` (Spec-H §12): nombre, cliente inline vs FK, enums de estado, campos de propiedad | Core §25, Spec-H §12 | El Core gana por regla, pero debe absorber descuento y aprobación; la propiedad pasa a `Leads`. |
| C3 | `QuoteActions`: enums distintos en el Core y en Spec-H | Core §33, Spec-H §12 | Unión de ambos en `LeadEvents`. |
| C4 | `AgentCommissions` / `AgentCommissionHistory` / `AgentProfiles` difieren; `AgentProfiles` no está en el Core | Core §16-17, Spec-H §12 | Adoptar la forma de §6.1. `monthly_goal_cop` va en `AgentCommissionHistory` o en `OrganizationModules.settings`. |
| C5 | `OPERATOR_AGENT`: soporte de lectura (Spec-I) vs agente de ventas (Stack) | Spec-I RF-I01, Stack-Tecnologico §RBAC | Agente de ventas del operador (lo pide el módulo de agencia). **Decide el usuario.** |
| C6 | Comisión de BorondoTours sobre la venta directa del operador | No definida en ningún doc | Propuesta: 0% en MVP con `direct_sale_fee_pct` configurable. **Decisión de negocio.** |
| C7 | `ManifestPassengers` (Spec-I) duplica `BookingPassengers` y es incompatible con `ManifestCheckins.booking_passenger_id`: un pasajero manual no podría hacer check-in | Core §9, §32; Spec-I §15 | Toda venta, incluida la manual y la de link de agencia, crea `Bookings` + `BookingPassengers` (`source` AGENCY_LINK/OPERATOR_DIRECT, estado HOLD con `hold_expires_at`). El manifiesto es una consulta sobre `BookingPassengers`. Hay que agregar `HOLD_AGENCY`/`RELEASED` al enum de `Bookings.status` o mapearlos a HOLD/EXPIRED. |
| C8 | Tablas de privacidad citadas pero ausentes del Core | Política §3.1, §4.2, §5.2 | Entran al Core (§6.2). |
| C9 | Enum de `Tours.status` distinto en el Core, Spec-I (`PENDING_CREATE_REVIEW`, `SUSPENDED`) y Spec-H (`UNLISTED`) | Core §4, Spec-I §15, Spec-H RF-H19 | Unificar en el Core. Suspender la organización implica pausar el módulo MARKETPLACE_LISTING, no tocar cada tour. |
| C10 | `Taxes`/`ServiceTaxes` tienen `deleted_at` (soft delete) contra la convención 3 del Core | Core §49-50 | Cambiar por `is_active`/`status`. |
| C11 | `Bookings` no guarda snapshot financiero | Core §8 vs `calculateBookingTotal` y Reglas §NIIF 15 | §4.2. |
| C12 | Dos fuentes de la comisión del operador | `Operators.commission_pct` y `OperatorContracts` | `OperatorContracts` vigente es la única fuente. |
| C13 | Bandeja WhatsApp: almacenamiento y retención | ADR-003 cubre solo el chat de tour | Extender ADR-003 o un ADR nuevo, a decidir por el usuario. Plazo de retención: legal. |
| C14 | Revender tours de otros operadores (`PARTNER_RESALE`) | Brief: "ventas internas", sin aclarar si son solo de tours propios | MVP solo tours propios. Reventa en F2 con tarifa de agencia aliada. **Confirmar con el usuario.** |

Las decisiones pendientes #1 (Hono/NestJS), #2 (Astro/Vite) y #15 (SAM/CDK) no afectan el modelo de
datos. #32 (no hay `drizzle.config`) y #14 (scripts db) bloquean generar migraciones cuando se implemente.

---

## 8. Conclusiones y orden recomendado

1. Cerrar C1, C5, C6 y C14 con el usuario: definen columnas y funciones financieras.
2. Actualizar el Core en un solo cambio documental: Organizations, OrganizationModules, Users, CustomRoles,
   Bookings (canal y snapshot), Quotations, LeadEvents, AgentCommissions y las tablas de Spec-I y de
   privacidad. Actualizar el steering 04 (clave de tenant) y la Política de Datos (rol de responsable en la
   venta directa).
3. Resolver #32 y escribir el schema Drizzle por dominio (ownership del comentario de
   `packages/db/src/schema/index.ts`: CRM en 1-core o en un servicio de agencia; se decide en la fase contracts).
4. En `packages/domain`, implementar con tests primero las funciones de §4.5. `calculateBookingTotal`
   cambia sin romper su firma actual.
5. Aislamiento: helper de repositorio, FK compuestas y tests de lectura cruzada antes del primer endpoint
   del CRM. RLS en F2.
6. POST: bandeja WhatsApp (OrganizationChannels, Conversations, DynamoDB), CrmCompanies,
   OrganizationMemberships, PARTNER_RESALE con liquidación AGENCY_COMMISSION.

Qué no verifiqué: el comportamiento de RDS Proxy con `SET LOCAL` (pinning), la tarifa exacta de ReteFuente
para comisiones de intermediación, el horario exacto y la frecuencia de la Ley 2300, ni el tratamiento NIIF
15 del canal `OPERATOR_DIRECT_BT_LINK`. Los tres últimos los valida el contador o legal.
