# Propuesta consolidada — App de Gestión Unificada (Agencia + Operador)

Fuentes: `01-crm-open-source.md`, `02-dominio-agencia-operador.md`, `03-arquitectura-tenancy-rbac.md`,
`04-ux-sidebar-ia.md`, `05-modelo-datos.md`. Estado: propuesta, sin código. Fecha: 2026-10.

> **Actualización:** el dueño respondió las decisiones; ver `06-decisiones-dueno.md`. Cambios clave:
> tenant = **Organization ⊃ Companies** (no `Organizations` + `OrganizationModules` a secas), módulos por
> defecto Común/Agencia/Operador, Plataforma solo para la organización dueña, stack igual al B2C (Astro),
> bandeja multicanal imprescindible, suscripción por usuario/plan, fee transaccional de BorondoTech, y
> orden frontend → MER → backend → AWS.

## 0. Alcance (aclaración del dueño)
Todo este documento es SOLO para la app nueva de gestión (fusión ERP + B2B). El B2C (`apps/web`) se deja
como está: su sidebar, su kit y sus pantallas no cambian por esta propuesta. El B2C se valida aparte,
función por función.

## 1. Qué se construye
Una sola app, `apps/gestion` (`gestion.borondotours.com`), que reemplaza a `apps/erp` y `apps/b2b`
(hoy son scaffolds idénticos de 7 archivos; unificar no cuesta código, solo documentación).

Cada empresa es una **organización** con **módulos activables**. El sidebar muestra solo lo que la
organización tiene contratado y el rol puede usar.

| Grupo del sidebar | Quién lo ve | Módulos MVP | Fase siguiente |
|---|---|---|---|
| **Agencia** | Organizaciones con módulo Agencia (agencias, operadores que venden, BorondoTours) | Inicio, CRM (kanban), Clientes, Cotizaciones y ventas (link OnePay.la, venta rápida), Catálogo, Comisiones | Bandeja WhatsApp, gamificación |
| **Operador** | Organizaciones con módulo Operador | Inicio, Inventario (tours, instancias, cupos), Manifiesto, Distribución (AgencyLinks, confirmar pago), Planificación mínima (asignar guía/conductor/vehículo), Flota, Finanzas (liquidaciones, solo lectura) | Spec-K completo, Operación en campo (radar, GPS, check-in), Proveedores, caja menor |
| **Común** | Todas | Perfil de empresa, Equipo, Documentos y cumplimiento (vigencia del RNT), Notificaciones | PQRS, Configuración avanzada |
| **Plataforma** | Solo personal de BorondoTours | Revisión de tours, Organizaciones y contratos (activar módulos) | Radar global, Finanzas plataforma, Ghost Login, Ads |

Fuera de alcance: Website, Email Marketing, Subscriptions, eLearning, Recruitment, manufactura, OTAs,
Borondo Coins (en pausa).

## 2. Decisiones técnicas propuestas (consenso de los 5 informes)
| Tema | Propuesta | Nota |
|---|---|---|
| Tenant | `Operators` → **`Organizations`** + tabla **`OrganizationModules`** (módulo, estado, quién y cuándo lo activó). BorondoTours es una fila con `is_platform`. | El informe 03 lo llamaba `TenantModules`; se unifica el nombre con el 05. Schema Drizzle vacío: sin migración de datos. |
| Clave de tenant | `organization_id` en `Users` y tablas nuevas (CRM); `operator_id` (FK a Organizations) se conserva en tablas del módulo Operador | Evita reescribir Spec-G/I/K |
| Roles | Se mantienen los 10 roles. Permiso = rol base × módulo (matriz en `packages/domain`) + `CustomRoles` con alcance por organización | Un usuario = una organización en MVP; membresías múltiples en F2 (guías freelance) |
| CRM | Portar ESTRUCTURA de vocero-crm (MIT, conservando aviso); UI de referencia atomic-crm (MIT); Twenty/Odoo/Frappe/EspoCRM/SuiteCRM solo inspiración (AGPL/LGPL/GPL) | 9 tablas nuevas que generalizan `QuoteActions` y `UserConsents` |
| Canal de venta | `Bookings.seller_organization_id` + `collection_mode` + snapshot financiero; 5 canales con reglas de comisión, payout, factura y retención | Requiere decisiones de negocio (§4) |
| WhatsApp | Índice de conversaciones en PostgreSQL, mensajes en DynamoDB; token WABA en Secrets Manager | Fase siguiente; necesita ampliar ADR-003 |
| Componentes | La app de gestión usa **solo `@borondo/ui` (React)**, con los mismos tokens y marca. El B2C conserva su kit sin cambios | Decisión del usuario (§4) |
| Sidebar (solo app de gestión) | Componente nuevo `AppSidebar` en `@borondo/ui`: patrón disclosure WAI-ARIA, grupos Agencia/Operador/Común/Plataforma independientes, grupo de la ruta activa abierto, estado recordado; con un solo grupo se aplana; no contratado = oculto; Ctrl+K. Ítem activo con pill turquesa sólida (contraste ≥ 3:1) | No reutiliza ni modifica el sidebar del B2C |
| Pantallas | 7 plantillas: lista, tablero, calendario, detalle, formulario/wizard, panel lateral, en vivo | Se replican en Figma con `figma-sync` |
| ADR | **ADR-013** "App de gestión unificada y módulos por organización" (ADR-012 está reservado para #1) | Borrador en el informe 03 §5 |

## 3. Correcciones de specs antes de construir
1. Spec-G RF-G07 cita "4 casos de liquidación" que no existen; en el modelo unificado son 7 (B2C full, B2C reserva, agente BT, revendedor full, revendedor split, venta directa del operador, AgencyLink).
2. `OPERATOR_AGENT`: adoptar "agente de ventas del operador" (Stack-Tecnologico) en lugar de "soporte de solo lectura" (Spec-I).
3. Payout por ciclo con líneas por reserva (hoy `OperatorPayouts` tiene `booking_id`).
4. Documentos: vigencias (RNT, pólizas, SOAT) en caliente; solo el archivo pasa a Glacier.
5. Una sola tabla de redirección post-login (Spec-F RF-F01b); `/erp/*` y `/operador/*` redirigen.
6. Quitar Borondo Coins del flujo de cotizaciones (Spec-E en pausa).
7. Nuevo **Spec-M "App de Gestión Unificada"** que referencia G/H/I/K por código RF y agrega lo nuevo (organizaciones y módulos, Clientes, Distribución con contratos de reventa, cumplimiento).

## 4. Decisiones que necesitamos del dueño
**Negocio (bloquean el módulo Agencia para operadores):**
1. Operador que vende **sus propios** tours por su módulo Agencia: ¿0 % si cobra por fuera de BorondoTours y una tarifa de plataforma si usa OnePay.la de BorondoTours? ¿Cuál?
2. Agencia que vende tours de **otro** operador: ¿su comisión sale del margen de BorondoTours o el operador fija una tarifa neta para revendedores?
3. ¿Entran al MVP las agencias que solo revenden (sin tours propios)?
4. ¿Bandeja de WhatsApp en el MVP, o bastan los botones `wa.me`? (CRM: M sin bandeja, L con bandeja)
5. ¿BorondoTours cobrará suscripción por módulos o solo comisión?
6. ¿El cumplimiento (RNT, NTS de aventura, tarjeta del guía) bloquea la publicación/asignación o solo alerta?

**Técnicas (pendientes del proyecto):**
7. **#2 Astro vs Vite** para la app de gestión (recomendación técnica: SPA para gestión, Astro solo B2C). Bloquea el shell.
8. **#1 Hono vs NestJS** (el código es Hono; Spec-F cita NestJS). Bloquea auth/RBAC reales.
9. Componentes: ¿la app de gestión se construye solo con `@borondo/ui` (React)? El B2C no se toca.

## 5. Plan incremental (PRs)
| PR | Contenido | Tamaño | Depende de |
|---|---|---|---|
| 0 | ADR-013, DECISIONES-PENDIENTES nuevas, Spec-M, correcciones de specs (§3), Modelo-Datos-Core | M | — |
| 1 | Piezas que le faltan a `packages/ui` para la gestión (AppSidebar, sectionHead, statCard, emptyState, tabla, kanban) + `figma-sync`. Sin cambios en `apps/web` | M | 9 |
| 2 | `apps/gestion` shell: layout, sidebar accesible, registro de módulos, i18n; retirar erp y b2b | M | 7 |
| 3 | Auth y RBAC reales (JWT RS256, refresh rotativo, módulos y permisos, tests) | L | 8 |
| 4 | Drizzle: organizations, organization_modules, users, custom_roles + seed BorondoTours | M | 3 |
| 5 | Módulo Operador F1 (3–4 PRs) | XL | 2–4 |
| 6 | Módulo Agencia para BorondoTours (CRM, cotizaciones, comisiones) (2–3 PRs) | XL | 2–4 |
| 7 | Activar Agencia para operadores + contratos de reventa | L | 6, decisiones 1–3 |
| 8 | Despliegue `gestion.dev.borondotours.com` | M | #15, #13 |

Siguiente paso de la fábrica: con las decisiones 1–6 respondidas, lanzar `factory-discovery`
(feature "App de gestión unificada") para producir PRD, casos borde y cumplimiento firmados.
