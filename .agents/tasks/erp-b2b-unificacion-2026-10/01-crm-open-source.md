# 01 — CRM/ERP de código abierto para el módulo Agencia (y Operador)

Rol: oss-scout. Fecha de consulta: 2026-10-14 (GitHub API vía `gh api repos/<owner>/<repo>`). Solo lectura sobre el repo.

## Resumen (respuesta primero)

- No existe un CRM open source que encaje "tal cual" con nuestro stack (Astro + React 19 islands, Tailwind 4, Drizzle + PG16, Hono en Lambda). Todo candidato exige portar.
- **Base recomendada: `kevinrivm/vocero-crm` (MIT)** para portar ESTRUCTURA y copiar selectivamente lógica pura (con aviso MIT). Es el único con Drizzle + Postgres + TypeScript estricto + React 19, en español y con foco WhatsApp, que es exactamente el canal que Spec-H quiere reemplazar ("WhatsApp + Excel"). Su modelo de datos ya filtra todo por `organization_id` con un helper obligatorio (`scoped()`), lo que facilita volverlo multi-tenant.
- **Complemento: `marmelab/atomic-crm` (MIT)** como referencia de UI y de entidades CRM clásicas (empresas, contactos, deals, tareas, notas). Usa React 19 + Tailwind 4 + shadcn/Radix: el más cercano a nuestro frontend, pero acoplado a `ra-core` (react-admin) y Supabase; se toma estructura de pantallas, no dependencias.
- **Twenty (58k★), Odoo, Frappe CRM, EspoCRM, SuiteCRM: solo inspiración funcional.** Son más robustos y con más estrellas, pero sus licencias (AGPL-3.0 / LGPL-3.0 / GPL) o su stack (NestJS+GraphQL+Redis, Python, PHP) hacen inviable copiar código en un SaaS propietario multi-tenant. Krayin es MIT pero PHP/Laravel: inspiración (tiene módulo de cotizaciones).
- Los CRM específicos de turismo encontrados son inmaduros (≤21★, sin licencia o GPL): descartados.
- Lo que NINGÚN candidato trae y hay que construir desde nuestro dominio: comisiones de agente con historial inmutable, propiedad del lead 90 días, venta colaborativa, vinculación cotización → OnePay.la → Booking, cupos con `SELECT FOR UPDATE`. Eso vive en `packages/domain` y Spec-H.
- Estimación gruesa del módulo CRM de Agencia portando desde vocero: **L** (sin bandeja WhatsApp Cloud API: **M**; con agente IA/Laboratorio: XL, recomendado fuera de alcance).

## 1. Tabla comparativa

Estrellas, licencia, último push y lenguaje: `gh api repos/...` el 2026-10-14. "no verificado" = no comprobado en la fuente.

| Proyecto | ★ | Último push | Licencia (SPDX) | Implicación SaaS propietario multi-tenant | Stack | Multi-tenant | i18n | Calidad | Esfuerzo de port |
|---|---|---|---|---|---|---|---|---|---|
| [kevinrivm/vocero-crm](https://github.com/kevinrivm/vocero-crm) | 264 (265 forks) | 2026-10-14 | MIT | Libre: copiar/modificar/cerrar; conservar aviso de copyright | Next.js 15 App Router, React 19, TS strict + `noUncheckedIndexedAccess`, Drizzle 0.38 + postgres.js, Better Auth (plugin organization), Tailwind **3.4**, SSE en memoria, Docker | Datos sí (`organization_id` en todas las tablas); producto no (registro público se cierra tras la 1ª organización) | No (textos en español en código, sin librería) | ~100 tests vitest en `tests/unit/`, scripts e2e Playwright, CI typecheck+lint+test+build | **L** (estructura y lógica reutilizable; runtime y auth incompatibles) |
| [marmelab/atomic-crm](https://github.com/marmelab/atomic-crm) | 1.373 | 2026-10-13 | MIT | Libre, igual que arriba | React 19.1, Vite 8, Tailwind 4.1, shadcn + Radix, `ra-core` 5 (react-admin), Supabase (Postgres + RLS + auth), vitest | No (una instancia = una empresa) | Sí vía `ra-language-*` (inglés, francés; español no incluido) | TS ~5.8, vitest; cobertura no verificada | **M** para UI/entidades; quitar `ra-core` y Supabase es el costo |
| [twentyhq/twenty](https://github.com/twentyhq/twenty) | 58.324 | 2026-10-14 | AGPL-3.0 + archivos `@license Enterprise` comerciales; MIT solo en SDK/CLI, `twenty-ui`, `twenty-apps` | Copiar el núcleo obliga a liberar nuestro código servido por red (AGPL §13). Solo `twenty-ui` (MIT) sería copiable | NestJS 11, TypeORM (parcheado), GraphQL, BullMQ + Redis, React 19.2 + Jotai + Apollo + Linaria | Sí (workspaces) | Sí (Lingui) | Alta (monorepo con e2e); detalle no verificado | **XL**/inviable: choca con "sin Redis/BullMQ" y con Tailwind (Linaria) |
| [krayin/laravel-crm](https://github.com/krayin/laravel-crm) | 24.009 | 2026-10-13 | MIT | Libre | PHP 8.3, Laravel 12, Vue (no verificado versión), MySQL (no verificado) | No en el core; extensión SaaS de pago no verificada | Sí (traducciones Laravel; idiomas no verificados) | no verificado | **XL** (reescritura total); útil como referencia de "Quotes" y "Activities" |
| [espocrm/espocrm](https://github.com/espocrm/espocrm) | 3.486 | 2026-10-13 | AGPL-3.0 | Copyleft de red: no copiar | PHP 8.3, Slim 4, Doctrine DBAL 4, frontend propio | No | Sí (no verificado detalle) | no verificado | Inviable copiar; solo inspiración |
| [SuiteCRM/SuiteCRM](https://github.com/SuiteCRM/SuiteCRM) / [SuiteCRM-Core](https://github.com/SuiteCRM/SuiteCRM-Core) | 5.797 / 286 | 2026-10-07 / 2026-10-14 | AGPL-3.0 | Copyleft de red | PHP (legacy SugarCRM); Core 8 con Angular (no verificado) | No | Sí | 1.394 issues abiertos (v7) | Inviable |
| [frappe/crm](https://github.com/frappe/crm) | 3.786 | 2026-10-14 | AGPL-3.0 | Copyleft de red | Frappe Framework (Python, MariaDB), Vue 3.5 + frappe-ui, Tailwind 3.4, Vite 8 | No (sitio por cliente) | Sí (Frappe) | no verificado | Inviable copiar; buen modelo funcional (lead, deal, SLA, lost reason, status change log) |
| [odoo/odoo](https://github.com/odoo/odoo) Community | 55.027 | 2026-10-14 | LGPL-3.0 (API reporta NOASSERTION; `LICENSE` dice LGPLv3) | Usar Odoo como servicio es posible; portar código a nuestro producto arrastra LGPL sobre lo derivado. Enterprise es propietario | Python, ORM propio, OWL, PostgreSQL | Multi-company sí; multi-DB | Sí | Alta | Inviable portar; es el mapa de módulos que trajo el dueño |
| [frappe/erpnext](https://github.com/frappe/erpnext) (referencia ERP) | 40.134 | 2026-10-14 | GPL-3.0 | Copyleft | Frappe/Python | No | Sí | — | Inviable |
| [idurar/idurar-erp-crm](https://github.com/idurar/idurar-erp-crm) | 8.878 | 2026-08-14 | AGPL-3.0 | Copyleft de red | JavaScript (MERN, no verificado detalle) | no verificado | no verificado | no verificado | Inviable |
| Turismo: [mantrabrain/yatra](https://github.com/mantrabrain/yatra), [titancamp/travely](https://github.com/titancamp/travely), [moizkamran/ExcursioX](https://github.com/moizkamran/ExcursioX), [dipak24/travel-agency-crm](https://github.com/dipak24/travel-agency-crm) | 6 / 13 / 21 / 1 | 2026-10 / 2022-09 / 2024-03 / 2026-10 | sin licencia / GPL-3.0 / sin licencia / GPL-3.0 | Sin licencia = todos los derechos reservados; GPL = copyleft | WordPress PHP / C# / MERN / Laravel+Filament | No | — | Baja madurez | Descartados |

Accesibilidad: ningún candidato publica conformidad WCAG verificable (no verificado en todos). Indicios: atomic-crm usa primitivas Radix (teclado/ARIA de base); vocero tiene `tests/unit/contraste-temas.test.ts` (prueba de contraste de temas). Cualquier pieza portada debe pasar por nuestro kit y por la auditoría a11y propia.

Señales de riesgo de vocero-crm: creado 2026-07-10 (≈3 meses), 296 commits de un solo mantenedor (`kevinrivm`) y 2 commits externos; forks ≈ estrellas (265 vs 264), proporción atípica. Proyecto joven: tomarlo como base de código propia, no como dependencia que esperemos que se mantenga.

## 2. Evidencia sobre vocero-crm (revisión de código)

Árbol obtenido con `gh api repos/kevinrivm/vocero-crm/git/trees/HEAD?recursive=1`.

Estructura:
- `src/app/(app)/*` — páginas: `inbox`, `pipeline`, `contacts`, `bookings` (citas), `results`, `agent`, `lab`, `onboarding`, `settings/*` (team, templates, whatsapp, instagram, messenger, tiktok, calendar, ai, ads, branding).
- `src/app/api/**/route.ts` — ~90 route handlers Next: `pipeline/board`, `pipeline/stages`, `pipeline/leads/[id]`, `contacts` (+ `import` CSV), `conversations/[id]/messages` (+ `template`, `media`), `webhooks/wa/[webhookToken]`, `templates/sync`, `analytics/*`, `bot/*` (API para un "cerebro" externo), `dev/*-mock` (mocks de Meta, Google, Zoom).
- `src/server/*` — lógica de servidor por dominio: `inbox/` (ingest, send, window, webhook, identity, outbound-cap), `whatsapp/` (connect, templates, media), `dispatch/` (outbox + worker), `leads/` (priority, stage-history), `analytics/`, `agenda/`, `ai/`, `lab/`.
- `src/lib/db/schema.ts` (1.245 líneas, un solo archivo), `src/lib/db/tenant.ts`, `src/lib/db/ids.ts`, `drizzle/0000..0019_*.sql` (20 migraciones versionadas).
- `src/components/*` — por pantalla (`pipeline/`, `inbox/`, `contacts/`, `results/`) + `ui/` mínimo (button, card, badge, input, label, switch, textarea, empty-state).

Patrones confirmados en código:
- `src/lib/db/tenant.ts` → `scoped(organizationColumn, organizationId, ...conditions)`: lanza error si falta el tenant. Equivale a nuestra regla de tenant isolation por `operator_id`; portable casi literal.
- `src/lib/api.ts` → `withAuth()` + `parseBody()` con Zod (422) + `apiError()` con `{error:{code,message}}`. Se traduce a middleware Hono + `onError` con nuestro sobre `{data,error,meta}`.
- `src/app/api/pipeline/board/route.ts` → GET con etapas ordenadas + tarjetas (lead ⨝ contact ⟕ conversation). Ojo: carga todo el tablero sin paginación (contra nuestra regla de cursor).
- `src/lib/nav.ts` → modelo de menú sin React (`NavGroup{title?, items}`) filtrado por banderas y rol, con test unitario (`tests/unit/nav.test.ts`). Es justo el patrón para el sidebar con grupos colapsables "Agencia" / "Operador" por módulos activos del tenant.
- `src/lib/db/ids.ts` → IDs `text` con nanoid y prefijo (`ct_`, `ld_`…). Choca con nuestra convención UUID v4.
- `src/server/events/bus.ts` → `EventEmitter` en proceso para SSE ("una instancia = un proceso"). No sirve en Lambda.
- `src/server/auth/registration.ts` → `isPublicSignupAllowed()` cierra el registro tras la primera organización: single-tenant de producto.
- `src/server/media-dir.ts` y `mediaAsset.storagePath` → adjuntos en disco local. En AWS va a S3 privado.
- Credenciales de canal cifradas (`tokenCipher/tokenIv/tokenTag`, AES-GCM en `src/lib/crypto`): patrón útil; en nuestro stack los secretos van a Secrets Manager/KMS.

Tablas del schema (vocero) agrupadas:
- Auth Better Auth: `user`, `session`, `account`, `verification`, `organization`, `member` (role owner/admin/member), `invitation`.
- CRM: `contact` (canal, `wa_identity`, `phone`, `name`, `notes`, `ficha` jsonb, `source`, `ai_paused`, `archived_at`), `pipeline_stage` (`position`, `kind` open/won/lost), `lead` (`stage_id`, `position`, `amount_cents`, `currency`, `priority` alta/media/baja, `last_activity_at`), `lead_stage_event` (from/to stage, actor, `loss_reason`, `loss_note`).
- Bandeja: `conversation` (canal, `ai_enabled`, `handoff_*`, `last_inbound_at` para ventana 24h, `unread_count`), `message` (`wa_message_id` único, direction, status, `origin`), `media_asset`, `template` (plantillas WhatsApp con estado de aprobación), `meta_credentials`, `instagram_/messenger_/tiktok_credentials`.
- Agenda: `calendar_settings`, `booking` (= cita/reunión, NO reserva de tour), `offered_slot`, `zoom_/google_credentials`.
- IA y atribución: `agent_profile`, `kb_entry`, `agent_test_run`, `agent_test_case`, `ai_credentials`, `ad_attribution` (CTWA), `conversion_event`, `capi_settings`.

## 3. Recomendación concreta: qué tomar de cuál

| Fuente | Qué | Cómo | Por qué |
|---|---|---|---|
| vocero-crm | `scoped()` tenant helper, `parseBody` Zod, modelo `NavGroup` + su test | Copiar y adaptar (MIT, conservar aviso) | Lógica pura, sin dependencias de Next; cumple nuestra regla de tenant y Zod |
| vocero-crm | Modelo de bandeja WhatsApp: `conversation`, `message`, `template`, `media_asset`, ventana de 24 h (`server/inbox/window.ts`), tope de salientes, errores de envío Meta (`lib/meta/send-errors.ts`), ingest idempotente por `wa_message_id`, sincronización de plantillas | Portar estructura a Hono (`services/7-chat` según mapa de servicios) + Drizzle/DynamoDB; copiar funciones puras con sus tests | Es lo más costoso de descubrir (reglas de Meta) y está probado con tests |
| vocero-crm | Kanban: `pipeline_stage.kind`, `lead.position`, `lead_stage_event` con motivo de pérdida, drag & drop con `@dnd-kit` | Portar estructura; las columnas de Spec-H son fijas y derivadas de estados (ver §4) | Reaprovecha UX y auditoría de movimientos |
| vocero-crm | Import CSV de contactos (`lib/contact-import.ts`, `server/contacts-import.ts`), búsqueda (`lib/search.ts`), analítica de embudo (`server/analytics/sales.ts`) | Portar | Útiles para RF-H15 (dashboard) y alta de clientes |
| vocero-crm | Pantallas `inbox`, `pipeline`, `contacts`, `results` | Solo inspiración de flujo; rehacer con kit `bt-*` (`ui-kit.ts`, `fig-runtime.css`) y diseño de Figma | Su UI usa Tailwind 3 y componentes propios; la regla 18 prohíbe estilos por pantalla |
| vocero-crm | Better Auth, SSE en memoria, worker de dispatch en proceso, media en disco, agente IA + Laboratorio, canales IG/Messenger/TikTok vía Zernio, Docker/Caddy | NO tomar | Choca con Spec-F (JWT propio, refresh tokens), con Lambda (sin procesos largos) y con el alcance F1/F2 |
| atomic-crm | Entidades `companies`, `contacts`, `deals`, `tasks`, `contactNotes`/`dealNotes`, `tags`; layouts de ficha de contacto/empresa y lista de tareas | Inspirarse / portar estructura de pantalla con nuestros componentes | Mismo React 19 + Tailwind 4; cubre "actividades/tareas" y "empresas" (agencias aliadas, clientes corporativos) que vocero no tiene |
| krayin | Módulo de cotizaciones (quote con líneas de producto) y actividades | Solo inspiración funcional | MIT pero PHP; útil para validar el diseño de Quotations con líneas (PlanComponents) |
| frappe/crm | `crm_lost_reason`, `crm_status_change_log`, `crm_service_level_agreement`, `crm_lead_source`, `crm_territory` | Solo inspiración funcional (no leer código para copiar; AGPL) | Buenas ideas de SLA de respuesta (encaja con badge >48 h de RF-H03) |
| twenty | Modelo de objetos personalizados, vistas guardadas, timeline | Solo inspiración | AGPL + Redis/BullMQ/GraphQL fuera de stack |
| odoo | Mapa de módulos (CRM, Ventas, Facturación, Inventario, Planificación, Field Service, Gastos, Empleados, Calendario, Discuss) | Solo inspiración funcional para el catálogo de módulos activables | LGPL y Python; es la referencia visual que trajo el dueño |

Regla práctica para el equipo: de proyectos AGPL/GPL/LGPL no se copia código ni se "traduce línea a línea"; se documenta la idea funcional con palabras propias.

## 4. Mapa de entidades: vocero-crm → dominio BorondoTours (Modelo-Datos-Core)

Referencias: `docs/03-Knowledge/Modelo-Datos-Core.md` §1 Users, §2 Operators, §8 Bookings, §16 AgentCommissions, §17 AgentCommissionHistory, §25 Quotations, §28 RefreshTokens, §33 QuoteActions. `packages/db/src/schema/index.ts` hoy es un placeholder (`export {}`), así que no hay schema Drizzle real con el que chocar.

| vocero-crm | BorondoTours | Notas / brecha |
|---|---|---|
| `organization` | `Operators` (tenant por `operator_id`) + BorondoTours como agencia interna (roles internos con `operator_id = null`) | La unificación pide un tenant que pueda ser agencia, operador o ambos con módulos activables. Hoy el Core no tiene esa entidad: decisión del data-modeler (p. ej. `Operators` + banderas de módulo, o una tabla `Tenants`). No se resuelve aquí |
| `user`, `session`, `account`, `verification` (Better Auth) | `Users` + `RefreshTokens` (Spec-F) | No portar Better Auth; mantener auth propia (access token en memoria) |
| `member.role` (owner/admin/member) | `Users.role` (10 roles) + `custom_role_id` (`CustomRoles` §23) | Nuestro RBAC es más rico; `canConfigure()` ≈ OPERATOR_ADMIN / GERENTE / SUPER_ADMIN |
| `invitation` | Sin tabla en el Core | Necesaria para que OPERATOR_ADMIN invite equipo (propuesta nueva) |
| `contact` | Sin tabla en el Core. `Quotations` guarda `client_name/email/phone` en línea; el cliente final es `Users` (CLIENT) | Propuesta: tabla de contactos CRM por tenant, vinculable a `Users` al convertir. PII cifrada y consentimiento Ley 1581 |
| `pipeline_stage` (configurable) | Columnas fijas de Spec-H RF-H02: Cotizado, Reserva, Pagado, Ejecución, Completado, Perdido (+ Pendiente Aprobación de RF-H06) | Derivar la columna de `Quotations.status` + `Bookings.status`; transiciones automáticas por webhook OnePay.la. Etapas configurables solo si un operador-agencia lo pide (fuera de F1) |
| `lead` (tarjeta) | `Quotations` (la tarjeta es la cotización) | `amount_cents` integer → `total_cop` decimal; `priority` no existe (Spec-H usa badge de urgencia >48 h derivado). Falta `owner_agent_id` explícito (Spec-H RF-H04 lo exige; Core tiene `agent_id`) |
| `lead_stage_event` | `QuoteActions` (timeline inmutable, renueva los 90 días de propiedad) | Enum actual: CREATED, SENT_EMAIL, SENT_WHATSAPP, LINK_OPENED, PRICE_CHANGED, NOTE_ADDED, REASSIGNED. Faltaría STAGE_CHANGED / MARKED_LOST con motivo, si se adopta el patrón `loss_reason` |
| `conversation`, `message`, `media_asset`, `template`, `meta_credentials` | Sin tablas en el Core; el stack pone chat en DynamoDB y adjuntos en S3 | Propuesta nueva (servicio 7-chat). Credenciales Meta en Secrets Manager, no en tabla |
| `booking` (cita/reunión) | NO es `Bookings`. Sin equivalente | Colisión de nombre: si se porta, llamarlo `Appointments`. Fuera de alcance F1 |
| — | `Bookings` | Se crea cuando paga la cotización (`source: AGENT_QUOTE`, `agent_id`), Spec-H RF-H09. Ningún CRM candidato lo cubre |
| — | `AgentCommissions`, `AgentCommissionHistory` | Ningún candidato tiene comisiones con historial inmutable; se construye con `packages/domain` y tests obligatorios |
| `ad_attribution`, `conversion_event` | `Ads`/`AdImpressions` (§29-30) son publicidad en checkout, otro concepto | Atribución CTWA es opcional futura (servicio 9-ads) |
| `agent_profile`, `kb_entry`, `agent_test_*`, `ai_credentials` | Sin equivalente | Fuera de alcance |
| atomic-crm `companies` / `tasks` / `notes` | Sin tablas en el Core | Candidatas si se quiere "empresas cliente" y "tareas/actividades" del agente |

## 5. Riesgos

Legales:
- AGPL-3.0 (Twenty, Frappe CRM, EspoCRM, SuiteCRM, IDURAR): servir código derivado por red obliga a publicar nuestro código. No copiar ni traducir línea a línea.
- LGPL-3.0 (Odoo Community) y GPL-3.0 (ERPNext, travely): copyleft sobre lo derivado. Solo referencia funcional.
- Twenty tiene además archivos con licencia comercial (`@license Enterprise`).
- MIT (vocero, atomic-crm, krayin): obligación de conservar el aviso de copyright y licencia en las partes copiadas. Recomendación: archivo `THIRD_PARTY_NOTICES` y comentario de origen en cada archivo copiado.
- Repos sin licencia (yatra, ExcursioX): todos los derechos reservados; no usar.
- WhatsApp Cloud API: políticas de Meta (plantillas aprobadas, ventana de 24 h, opt-in). Ley 1581: consentimiento explícito para contactar y para guardar conversaciones; PII de contactos cifrada; retención del chat pendiente con legal. Ley 2300: mensajes comerciales solo en horario permitido (el tope de salientes de vocero no lo contempla; hay que añadir la regla de horario).

Técnicos:
- Runtime: vocero asume proceso largo (SSE con `EventEmitter`, worker de dispatch, media en disco). En Lambda hay que usar API Gateway WebSocket o polling con TanStack Query, SQS/EventBridge para el outbox y S3 para adjuntos.
- Spec-H pide Socket.io y BullMQ (RF-H02, RF-H04, RF-H09, RF-H13), prohibidos por el steering 02. Esto ya es una contradicción de documentación que conviene registrar en `DECISIONES-PENDIENTES` antes de diseñar el tiempo real.
- Next.js App Router → Astro + islands: las páginas son client components grandes (`pipeline-client.tsx`, `inbox-client.tsx`); hay que partirlas en islas y pasar a TanStack Query/Nanostores. Afectado por la decisión pendiente #2 (Astro vs Vite) y el backend por la #1 (Hono vs NestJS); no se resuelven aquí.
- Convenciones: IDs nanoid `text` → UUID v4; montos `integer` en centavos → `decimal` COP; Tailwind 3 → 4; Drizzle 0.38 (vocero) vs 0.35 (`packages/db`); sin i18n → `t('ns:key')`; un `schema.ts` de 1.245 líneas → tablas por servicio según ownership de `packages/db/src/schema/index.ts`.
- Paginación: `pipeline/board` carga todo; nuestra API exige cursor.
- Mantenimiento: vocero tiene un solo mantenedor y 3 meses de vida; tratar el código portado como propio (fork lógico), sin esperar upstream.
- Aislamiento: el modelo de vocero aísla por organización, pero Spec-H añade aislamiento por agente (cada AGENT ve solo sus tarjetas) y vista consolidada del GERENTE; eso es RBAC adicional con tests obligatorios.

## 6. Estimación gruesa de esfuerzo

| Bloque | Tamaño | Base |
|---|---|---|
| Modelo de datos CRM (contactos, ajustes a Quotations/QuoteActions, invitaciones, tenant con módulos) en Drizzle + migraciones | M | Estructura de vocero + Core |
| Kanban de cotizaciones (RF-H02/H03/H16) con columnas derivadas, drag & drop, timeline, filtros, cursor | M | vocero `pipeline/*` + kit `bt-*` |
| Propiedad 90 días, venta colaborativa, aprobación de descuento, comisiones (`packages/domain` + tests) | L | Sin base OSS; Spec-H |
| Contactos (CRUD, import CSV, búsqueda, consentimiento Ley 1581) | S-M | vocero `contacts/*` |
| Bandeja WhatsApp Cloud API (webhook firmado, ingest idempotente, envío, plantillas, ventana 24 h, horario Ley 2300, S3) | L | vocero `server/inbox`, `server/whatsapp` |
| Tiempo real en Lambda (WebSocket API GW o polling) | M | Nuevo; depende de resolver la contradicción Socket.io |
| Sidebar Agencia/Operador por módulos activables | S | Patrón `lib/nav.ts` |
| Agente IA + Laboratorio, Instagram/Messenger/TikTok, atribución CTWA | XL | Fuera de alcance recomendado |

Total módulo CRM de Agencia (sin IA ni canales extra): **L**. Sin bandeja WhatsApp (solo `wa.me` como hoy dice RF-H07): **M**. Módulo de Operador: ningún CRM aporta (inventario de tours, cupos, manifiesto, flota, liquidaciones salen de Spec-G/I/K); Odoo sirve solo como mapa funcional.

## 7. Próximos pasos sugeridos (no implementados)

1. Data-modeler: proponer entidad de tenant con módulos (agencia/operador) y tablas CRM nuevas (contactos, invitaciones, conversaciones) en `Modelo-Datos-Core.md`.
2. Registrar en `docs/DECISIONES-PENDIENTES.md` la contradicción Spec-H (Socket.io/BullMQ) vs steering 02.
3. Si se aprueba vocero como base: crear `THIRD_PARTY_NOTICES` y portar primero `scoped()`, `nav` y la bandeja con sus tests unitarios.
4. Diseñar en Figma Kanban, ficha de contacto y bandeja con el kit `bt-*` antes de portar UI (regla 18, subagente `figma-sync`).
