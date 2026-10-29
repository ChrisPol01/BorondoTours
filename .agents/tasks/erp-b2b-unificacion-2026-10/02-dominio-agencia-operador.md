# 02 — Dominio: qué necesita una Agencia y un Operador (app de gestión unificada)

Rol: product-manager + business-analyst. Investigación de solo lectura. Sin PII.
Fuentes internas leídas: Spec-G, Spec-H, Spec-I, Spec-K, Spec-J (parte operador), Spec-F (RF-F02b),
APP2, APP3, Stack-Tecnologico §RBAC, Modelo-Datos-Core §1-3, Modelo-Comisiones, ADR-009, ADR-010,
Inventario-Funcionalidades-MVP, `packages/db/src/schema/index.ts`, `apps/erp/src`, `apps/b2b/src`.

---

## 0. Resumen (respuesta primero)

1. **Los specs cubren bien al operador y a BorondoTours como agencia, pero no existe el concepto de "agencia externa con cuenta".**
   Hoy "agencia" significa una de dos cosas: BorondoTours misma (roles internos `GERENTE`/`AGENT`, Spec-H) o un texto
   libre `agency_name` en `AgencyLinks` y `PremiumAllocations` (Spec-I §15). El modelo de datos solo aísla por
   `operator_id` (Modelo-Datos-Core §1, `Users.operator_id`) y cada usuario tiene **un solo** `role` y **un solo**
   `operator_id`. Para unificar ERP + B2B, el cambio de dominio que hay que hacer es pasar de "operador" a
   **organización (tenant) con capacidades activables** (`AGENCY`, `OPERATOR`, y `PLATFORM` solo para BorondoTours).
   Lo demás es reubicar pantallas que ya están especificadas.
2. **El mercado ya resolvió este modelo.** Bókun documenta que cualquier vendor puede actuar a la vez como
   proveedor y como revendedor, con acceso en tiempo real al inventario del otro y comisión para quien revende
   ([Bókun docs](https://docs.bokun.io/es/docs/marketplace-pro/marketplace/how-to-create-contracts-to-add-resellers-or-suppliers-pro)).
   Rezdy tiene un portal de agentes con tarifas comisionables y un modo "vista cliente" que oculta la comisión
   ([Rezdy FAQ](https://rezdy-legacy.zendesk.com/hc/en-us/articles/19867762035100-Agent-Marketplace-FAQ)). La ley colombiana
   también lo reconoce: las agencias de viajes se clasifican en Viajes y Turismo, **Operadoras** y Mayoristas
   ([Decreto 1074/2015, compilado](https://encolombia.com/derecho/decretos/decreto-mincit/normas-regulan-agencias-viajes/)).
   O sea, el operador que vende es legalmente común.
3. **De los 36 módulos tipo Odoo, 17 aplican** (con su equivalente en turismo), 6 quedan absorbidos por otros y 13
   no aplican. Propongo 4 grupos en el sidebar: **AGENCIA** (7 módulos), **OPERADOR** (9), **COMÚN** (6) y
   **PLATAFORMA** (solo BorondoTours, 5). El dueño imaginó tres grupos; el cuarto existe porque aprobar tours,
   gestionar tenants, Ads y Ghost Login no son funciones de agencia, y ponerlos bajo "Agencia" expondría
   funciones de plataforma a tenants externos.
4. **MVP en plazo cerrado**: shell + tenancy + Común (perfil, equipo, documentos con RNT) + Operador (inventario,
   cupos, manifiesto, AgencyLinks, asignaciones, flota básica, liquidaciones de solo lectura) + Agencia (catálogo,
   clientes, CRM kanban, cotizaciones con link de pago, venta rápida, comisiones) + Plataforma (revisión de tours,
   tenants y contratos). Radar, planificación (Spec-K), Siigo, bandeja WhatsApp, PQRS y gamificación pasan a la fase siguiente.
5. **Hallazgos de requisitos que bloquean o afectan**: (a) Spec-G RF-G07 cita "4 Casos Matemáticos" de
   `Modelo-Comisiones` que **no existen** en ese documento; (b) `OPERATOR_AGENT` tiene dos definiciones
   (Spec-I: soporte de solo lectura; Stack-Tecnologico: agente de ventas del operador); (c) la plataforma digital debe
   verificar el RNT de quienes publican (Ley 2068 art. 38 / Decreto 1836/2021), y Spec-F manda los documentos a Deep
   Glacier a los 15 días, lo que choca con controlar vencimientos.

---

## 1. Qué cubre cada spec hoy

| Spec / doc | Estado | Para AGENCIA | Para OPERADOR |
|---|---|---|---|
| Spec-G ERP Operativo | `fase-2` | Solo BT: creación de tours propios (`BORONDO_INTERNAL_ID`, comisión 0 %), comisión por operador (RF-G06), liquidaciones (RF-G07), incidentes (RF-G08/09) | Tours e instancias (RF-G01/02, `SELECT FOR UPDATE`), asignar guía/vehículo (RF-G03/04), seguros por instancia (RF-G05), vista limitada del operador (RF-G10) |
| Spec-H ERP Agencia | `listo-para-implementar` | Todo lo comercial de BT: redirección por rol (H01), Kanban CRM (H02/H03), propiedad del lead 90 días y venta colaborativa (H04/H05), cotización y descuento con aprobación (H06/H06b), link OnePay.la (H07-H09), comisiones de agentes (H10/H11/H17), gamificación (H12-H14), dashboard del gerente (H15/H16), venta rápida (H24), reportes (H22) | Solo como objeto administrado por BT: gestión de tenants/operadores (H19), yield score interno (H23) |
| Spec-I B2B Operadores | `listo-para-implementar` | Agencias externas **sin cuenta**: AgencyLinks (I10/I11), confirmación de pago manual (I12), cupos premium por `agency_name` (I07) | Núcleo del operador: 5 roles (I01), dashboard y ocupación (I02/I03), wizard de tour con revisión (I04/I05), instancias y baja demanda (I06), pool de cupos (I07), manifiesto (I08/I09), radar y GPS (I13-I16), fuerza mayor (I17), onboarding, equipo y flota (I18a/I18/I19/I19b), privacidad GPS (I20), perfil (I21), finanzas (I22-I24), reseñas (I24b), notificaciones y crons (I25/I26) |
| Spec-K Planificación | `requisitos-listos` | — | Calendarios de guías, conductores y unificado (K01-K03), disponibilidad (K04), proveedores por región (K05), contingencias (K06-K08), checklist de alistamiento (K09), cierre operativo (K10), reportes (K11), regiones (K12), notas (K13), operaciones en lote (K14), panel del guía (K15) |
| Spec-J App Móvil (operador) | Fase 3, no existe | `AGENT` ve el CRM en WebView (J01) | Manifiesto offline (J02), check-in QR/swipe (J03), caja menor (J04), convenios (J05), estados + chat de coordinación (J06/J10), rendimiento del guía (J07), notificaciones por rol (J11) |
| APP2 | Resumen | Igual a Spec-H + Spec-F | — |
| APP3 | Resumen | Igual que Spec-I (AgencyLinks) | Añade documentos legales del operador (cámara de comercio, RNT, pólizas de RC) que Spec-I no detalla |
| Spec-F RF-F02b | — | — | Registro Empresa/Freelancer con RNT, RUT, cámara de comercio y tarjeta profesional del guía |

Estado del código: `apps/erp` y `apps/b2b` solo tienen `Base.astro`, `index.astro` y `global.css`.
`packages/db/src/schema/index.ts` es un placeholder (`export {}`). No hay deuda de código que migrar, solo de documentación.

### Inconsistencias encontradas (afectan la unificación)

| # | Dónde | Problema | Recomendación |
|---|---|---|---|
| I-1 | Spec-G RF-G07 ↔ `Modelo-Comisiones.md` | RF-G07 manda aplicar "4 Casos Matemáticos (B2C Full, B2C Reserva, B2B Agencia Full, B2B Agencia Split)" que no aparecen en `Modelo-Comisiones` | Definirlos antes de construir liquidaciones. En el modelo unificado son más de 4 casos (ver §6) |
| I-2 | Spec-I RF-I01 ↔ Stack-Tecnologico §RBAC | `OPERATOR_AGENT` = "Soporte (lectura)" vs "Agente de ventas del operador (manifiesto manual, AgencyLinks)" | Adoptar la segunda definición: es el rol natural del vendedor en el grupo Agencia del operador |
| I-3 | Spec-G §8 ↔ Spec-G RF-G07 | `OperatorPayouts` tiene `booking_id` (una fila por reserva) pero RF-G07 dice que se liquida por ciclo | Payout por ciclo + líneas por booking |
| I-4 | Spec-F RF-F02b ↔ cumplimiento | Los documentos pasan a Deep Glacier 15 días después de la auditoría, pero RNT, pólizas y SOAT vencen y deben renovarse | Guardar los metadatos (número, vigencia) en caliente y solo archivar el binario |
| I-5 | Spec-H RF-H01 / APP2 | Rutas `/erp/*` y `/operador/*` separadas por app | Una sola base con grupos; reescribir la tabla de redirección |
| I-6 | Spec-H RF-H09 | Al pagar una cotización, acredita Borondo Coins | Coins en pausa (Spec-E). No construirlo en el MVP |

---

## 2. Investigación externa

> Contenido parafraseado por cumplimiento de licencias. Ninguna cita supera 30 palabras.

### 2.1 Software de operadores y agencias (qué módulos son estándar)

| Producto | Lo relevante para nosotros | Fuente |
|---|---|---|
| Bókun | Cada vendor puede ser proveedor y revendedor a la vez, mediante **contratos**; el revendedor cobra comisión. Tiene un área de agentes con términos por agente y enlaces de alta | [contratos](https://docs.bokun.io/es/docs/marketplace-pro/marketplace/how-to-create-contracts-to-add-resellers-or-suppliers-pro), [agentes](https://docs.bokun.io/it/docs/booking-agents-pro/booking-agents/how-to-add-booking-agents-to-bokun-pro) |
| Rezdy | Marketplace de revendedores con tarifas públicas o pactadas; el pago entre proveedor y revendedor lo liquida la plataforma; modo "vista cliente" que oculta comisiones | [marketplace](https://rezdy-legacy.zendesk.com/hc/articles/19867795040412), [FAQ agentes](https://rezdy-legacy.zendesk.com/hc/en-us/articles/19867762035100-Agent-Marketplace-FAQ) |
| Rezdy (precios) | Cobra distinto la reserva online (3 %) y la reserva offline o de agente (tarifa fija) | [TicketingHub](https://www.ticketinghub.com/blog/rezdy-pricing) |
| Zaui / FareHarbor / Rezdy / Checkfront / Bókun | Lo común: inventario con disponibilidad en tiempo real, channel manager/OTAs, mostrador de venta presencial o telefónica, cobros por etapas, gestión de transporte y asientos | [Zaui comparativa](https://www.zaui.com/resources/blog/tour-operator-software-comparison) |
| Software de agencias (Ezus, Travefy, mTrip) | Lo común: cotización/presupuesto, itinerario entregable (enlace/PDF/app), CRM, facturación, pagos, portal del cliente | [Ezus](https://ezus.io/es/articulo/travel-agency-software-for-small-business), [Travefy](https://travefy.com/esp), [mTrip](https://www.mtrip.com/es/mejor-software-agencias-viajes/) |
| Práctica de agencias | Usan un conjunto de herramientas (reservas a proveedores, CRM, pagos, itinerarios, back office), no una sola | [PHPTravels](https://phptravels.com/es/software-used-by-travel-agents) |

Conclusión: el par **inventario + distribución con contratos** (operador) y **CRM + cotización + cobro + comisión**
(agencia) es el núcleo en todas las herramientas. Nuestros specs ya tienen ambos. Lo que falta frente al mercado:
contratos de reventa entre tenants, tarifas netas para revendedores, comprobante o itinerario para el viajero y PQRS.

### 2.2 Obligaciones colombianas que afectan la gestión

| Obligación | Qué exige | Impacto en módulos | Fuente |
|---|---|---|---|
| Ley 2068/2020 art. 38 + Decreto 1836/2021 | Las plataformas digitales de servicios turísticos y sus anunciantes deben tener RNT y pagar parafiscales | **Común › Documentos/Cumplimiento**: bloquear la publicación de tours de un tenant sin RNT vigente; mostrar el RNT del prestador | [Ladevi](https://colombia.ladevi.info/plataformas/plataformas-digitales-servicios-turisticos-deberan-tener-rnt-n36969), [Fontur](https://fontur.com.co/es/comunicados/mincomercio-reglamento-el-pago-de-parafiscales-y-el-registro-nacional-de-turismo-para) |
| RNT (renovación anual) | Inscripción y renovación periódica en la plataforma RNT (gratuita); la fecha exacta del plazo está por verificar en el Decreto 1836/2021 | Alerta de vencimiento del RNT por tenant y por guía | [CC Putumayo](https://ccputumayo.org.co/reactivacion-y-renovacion-rnt/) |
| Contribución parafiscal FONTUR | 2,5 por mil de los ingresos operacionales, se liquida y paga trimestralmente; aplica a agencias de viajes, entre otros | **Contabilidad**: reporte trimestral de ingresos operacionales por tenant (la base exacta para intermediarios la debe validar el contador) | [Fontur](https://www.fontur.com.co/es/comunicados/mincomercio-y-fontur-invitan-prestadores-de-servicios-turisticos-y-beneficiarios-del), [MinCIT](https://www.mincit.gov.co/minturismo/analisis-sectorial-y-promocion/preguntas-frecuentes-relacionadas-con-formalizacio/31-cual-es-el-porcentaje-de-la-contribucion-parafi) |
| Reglas de agencias (Decreto 1074/2015) | Dar al usuario un comprobante de los servicios contratados, informar completo, guardar archivo de soportes y **convenios escritos** cuando se intermedian servicios de otro prestador | **Agencia › Ventas**: voucher/comprobante. **Distribución**: contrato de reventa registrado. **Documentos**: archivo de soportes | [reglas agencias](https://encolombia.com/derecho/decretos/decreto-mincit/reglas-agencias-viajes/) |
| Guías: tarjeta profesional | Obligatoria para ejercer (Corte Constitucional C-147/18); el guionaje se reglamenta en el Decreto 1379/2021 | **Equipo**: número y vigencia de la tarjeta profesional del `OPERATOR_GUIDE`; ítem del checklist de alistamiento (K-RF09) | [MinCIT](https://www.mincit.gov.co/prensa/noticias/turismo/fallo-corte-constitucional-guias-turismo), [Decreto 1379](https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=172994) |
| NTS obligatorias | Certificación obligatoria para turismo de aventura y para NTS-AV009 (transporte turístico terrestre); implementar la NTS de turismo sostenible es obligatorio para todos. Desde junio de 2025, aventura requiere nivel sobresaliente | **Documentos**: certificados NTS por categoría de tour; validar en la revisión del tour (I-RF04) | [MinCIT FAQ](https://www.mincit.gov.co/minturismo/preguntas-frecuentes/preguntas-frecuentes), [Ámbito Jurídico](https://www.ambitojuridico.com/noticias/comercial/turismo-de-aventura-necesitara-certificacion-sobresaliente-en-seguridad-para) |
| Facturación electrónica / Documento Soporte | Compras a no obligados a facturar se soportan con Documento Soporte electrónico (Res. DIAN 000167/2021, transmisión obligatoria desde agosto de 2022) | **Contabilidad**: liquidación a operadores `LOCAL_MICRO`/`NO_RESPONSABLE_IVA` (ya previsto en ADR-009/010, Siigo F2) | [DIAN](https://www.dian.gov.co/impuestos/Paginas/Sistema-de-Factura-Electronica/Documento-Soporte-adquisiciones-no-obligados.aspx), [Ingefact](https://ingefact.com/articulos/documento-soporte-no-obligados-a-facturar) |
| IVA 0 % a no residentes | La exención del art. 481 lit. d) ET aplica aunque quien contrate sea una persona jurídica (p. ej. una agencia), si el beneficiario acredita que no es residente | **Agencia › Cotizaciones**: la exención va por **pasajero beneficiario**, no por comprador. Ampliar el toggle de RF-H06 | [Oficio DIAN 14767/2025](https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_14767_2025.htm), [Decreto 297/2016](https://www.cancilleria.gov.co/normograma/compilacion/docs/decreto_0297_2016.htm) |
| Retenciones | ReteFuente, ReteICA territorial y ReteIVA sobre el bruto del operador; Siigo autoritativo en F2 | **Contabilidad**: aplica igual cuando paga BT. Si un tenant agencia paga a un tenant operador fuera de BT, la retención es suya, no nuestra | ADR-009, ADR-010 |
| Ley 1480 retracto | 5 días hábiles en ventas a distancia (links por WhatsApp, cotización remota) para servicios que no empiezan antes de 5 días | **Agencia › Ventas**: el tenant que vende es el proveedor frente al consumidor; mostrar condiciones antes de pagar; PQRS | [Ámbito Jurídico](https://www.ambitojuridico.com/noticias/comercial/tributario-y-contable/que-son-las-ventas-no-tradicionales-o-distancia-para) |
| Ley 1581 | Cada tenant agencia es **responsable** del tratamiento de sus clientes; BT actúa como **encargado** (SaaS). En ventas B2C, BT es responsable y el operador recibe datos del manifiesto | **Clientes** aislado por tenant; contrato de transmisión/encargo; consentimiento por tenant | Regla 07, Spec-I §16 |
| Pólizas | APP3 lista pólizas de RC como documento legal; Spec-G RF-G05 pide seguro médico por instancia. La obligatoriedad exacta por actividad y por transporte especial **queda por validar con legal** | **Documentos** con vencimiento; ítem del checklist K-RF09 | APP3 Flujo A, Spec-G RF-G05 |

---

## 3. Clasificación de los módulos tipo Odoo

Leyenda: **A** = Agencia, **O** = Operador, **A+O** = ambos, **Abs.** = absorbido por otro módulo, **N/A** = no aplica.

| Módulo Odoo | Clase | Equivalente en turismo | Respaldo |
|---|---|---|---|
| CRM | A | Pipeline Kanban de leads/cotizaciones, propiedad 90 días | H02-H05 |
| Sales | A | Cotización, link mágico de pago, voucher, paquetes (`PlanComponents` §39) | H06-H09, H24 |
| Point of Sale | A+O | Venta rápida en oficina o punto de encuentro con pago manual; pasajero manual en el manifiesto | H24, I-RF08 |
| Accounting | A+O | O: liquidaciones, retenciones, chargebacks. A: comisiones de agentes, cuentas con operadores. Ambos: Siigo, reporte FONTUR | G07, I22-I24, H10/H11/H17, H22, ADR-009/010 |
| Inventory | O | Tours, instancias, cupos, add-ons con stock, pool de cupos | G01/G02, I04-I07 |
| Purchase | A+O | O: proveedores regionales y acuerdos (restaurante, hospedaje, transporte). A: compra a operadores a tarifa neta | K05; reventa **NUEVO** |
| Field Service | O | Radar, estados del tour, check-in, GPS, fuerza mayor | I13-I17, J02-J06 |
| Planning | O | Calendarios de guías y conductores, asignaciones, contingencias, alistamiento | K01-K03, K06-K09, K14, I19b |
| Time Off | O | Indisponibilidad de guías y conductores | K04 (`ResourceUnavailability` §45) |
| Expenses | O | Caja menor del guía (anticipos, gastos con foto) | J04, `FieldExpenses` §21 |
| Rental → Flota | O | No es alquiler: es **flota** (vehículos, documentos, capacidad) | G04, I19 |
| Maintenance | O | Vehículo en `MANTENIMIENTO`, revisión técnico-mecánica, avería → reasignación | I19, K07 |
| Employees | A+O (Común) | Equipo del tenant, perfiles de agente (`AgentProfiles`), tarjeta profesional del guía | I18, H10; tarjeta **NUEVO** |
| Appraisals | O | Rendimiento del guía y reportes operativos | J07, K11 |
| Helpdesk | A+O | PQRS (Ley 1480), reclamos, tickets por baja demanda | I-RF06 lo menciona; módulo **NUEVO** |
| Sign | A+O (Común) | Aceptación registrada de ToS y tratamiento de datos, contratos de reventa, descargos de responsabilidad en aventura | Spec-I §16 (ToS); **NUEVO** |
| Documents | Común | RNT, RUT, cámara de comercio, pólizas, NTS, SOAT, tarjeta de propiedad, seguros por instancia | `OperatorDocuments` §3, G04/G05, I19 |
| Discuss | O | Sala de coordinación del tour (coordinador, guía, conductor) | J06, J10 |
| Live Chat | A | Bandeja WhatsApp de la agencia (estructura de vocero-crm) | H08 solo usa `wa.me`; bandeja **NUEVO** |
| Calendar | A+O | O: calendario de ocupación/instancias. A: agenda de seguimientos | I03, I06; seguimientos **NUEVO** |
| Events | Abs. | Salidas grupales y eventos = instancias con cupo | Inventory |
| Appointments | Abs. | Se reservan instancias de tour, no citas | Inventory / Sales |
| Barcode | Abs. | QR de check-in | Field Service (J03) |
| Attendances | Abs. | Asistencia de pasajeros (check-in), no de empleados | Field Service |
| Timesheets | Abs. | Historial de asignaciones del guía para calcular pagos | Planning (G03) |
| Quality | Abs. | Widget de calidad (rating, no-show, quejas) | Dashboard O (I-RF02 H-39) |
| Website | N/A (MVP) | Micrositio o widget de reserva directa del tenant. El B2C ya es la vitrina | Fuera de alcance |
| Email Marketing | N/A (MVP) | Campañas a clientes propios; exige consentimiento (Ley 1581) y horario (Ley 2300) | Fuera de alcance |
| Subscriptions | N/A | Solo tendría sentido para que BT cobre el SaaS a los tenants (ver pregunta 6) | — |
| Project | N/A | — | — |
| Manufacturing, Shop Floor, PLM, Repairs | N/A | Armar paquetes ya está en `PlanComponents` (Sales) | — |
| Recruitment, eLearning | N/A | — | — |

Módulos de turismo que **no están en la lista de Odoo** y son imprescindibles:
- **Manifiesto** (O): el "corazón" de App 3 (I08/I09).
- **Distribución / Canales** (O): AgencyLinks, cupos premium, agencias aliadas y contratos de reventa (I07, I10-I12 + **NUEVO**).
- **Catálogo de reventa** (A): tours propios y de otros operadores con contrato, para cotizar (H06 usa el catálogo; filtro por contrato **NUEVO**).
- **Cumplimiento** (Común): vigencias de RNT, NTS, pólizas y tarjetas profesionales, con alertas.

---

## 4. Árbol de módulos propuesto (sidebar)

Regla de visibilidad: un grupo aparece si el tenant tiene esa capacidad activa. Dentro del grupo, cada módulo
aparece según el rol y los permisos (`CustomRoles` §23, `permissions.allow/deny`). Un tenant solo operador ve
Operador + Común. Uno solo agencia ve Agencia + Común. Uno mixto ve ambos. BorondoTours ve los cuatro.

### 4.1 AGENCIA

| Módulo | Propósito | Pantallas principales | Roles | Respaldo |
|---|---|---|---|---|
| Inicio agencia | KPIs comerciales del tenant | Dashboard (ventas, conversión, leads activos, comisión pendiente) | GERENTE, OPERATOR_ADMIN; AGENT/OPERATOR_AGENT ven el suyo | H15 |
| CRM | Pipeline de oportunidades | Kanban (6 columnas + Perdido), drawer de lead con timeline, leads sin dueño, vista del equipo | AGENT, GERENTE, OPERATOR_AGENT, OPERATOR_ADMIN | H02-H05, H16 |
| Clientes | Libreta de contactos del tenant | Lista, ficha (historial de reservas y cotizaciones), import CSV, consentimientos | Ídem CRM | Implícito en H06; **NUEVO** como módulo (vocero-crm: contactos) |
| Cotizaciones y ventas | Armar, aprobar, cobrar | Nueva cotización, aprobación de descuento, link de pago, envío, venta rápida, voucher | Ídem + GERENTE/OPERATOR_ADMIN aprueba | H06-H09, H24 |
| Catálogo | Qué puedo vender | Tours propios + tours de operadores con contrato; disponibilidad real; tarifa neta vs pública ("vista cliente") | Ídem | A05/H06; contratos **NUEVO** |
| Comisiones | Lo que gana cada vendedor | Mis comisiones, liquidar período, metas | AGENT, OPERATOR_AGENT (propias); GERENTE, OPERATOR_ADMIN (equipo) | H10, H11, H14, H17 |
| Bandeja | Conversaciones con clientes | Bandeja WhatsApp con vínculo a lead/cliente | AGENT, OPERATOR_AGENT | **NUEVO** (estructura vocero-crm) |

### 4.2 OPERADOR

| Módulo | Propósito | Pantallas principales | Roles | Respaldo |
|---|---|---|---|---|
| Inicio operador | KPIs operativos y financieros | Dashboard, ocupación (calendario), proyección, estacionalidad | OPERATOR_ADMIN; COORD (BT) por operador | I02, I03, I24 |
| Inventario | Tours y fechas | Lista de tours, wizard de 4 pasos, solicitudes de cambio, instancias (calendario, bulk, bloqueos), add-ons | OPERATOR_ADMIN; OPERATOR_COORD (instancias) | G01/G02, I04-I06 |
| Distribución | Por qué canales vendo | Cupos premium por agencia, AgencyLinks, agencias aliadas (directorio), contratos de reventa | OPERATOR_ADMIN, OPERATOR_AGENT | I07, I10-I12; contratos **NUEVO** |
| Manifiesto | Pasajeros por instancia | Manifiesto consolidado, completar datos, confirmar pago de agencia, exportar PDF/CSV | OPERATOR_COORD, OPERATOR_AGENT, OPERATOR_ADMIN | I08, I09, I12 |
| Planificación | Quién va a cada salida | Asignar guía/conductor/vehículo, calendarios por recurso, indisponibilidad, operaciones en lote, checklist de alistamiento | OPERATOR_COORD, OPERATOR_ADMIN; COORD (BT) | I19b, K01-K04, K09, K14 |
| Operación en campo | Día del tour | Radar (grid semáforo), manifiesto en vivo, mapa GPS, timeline, fuerza mayor, contingencias | OPERATOR_COORD; COORD (BT) | I13-I17, K06-K08 |
| Flota | Vehículos | Catálogo, documentos y vencimientos, estado de mantenimiento, historial | OPERATOR_ADMIN, OPERATOR_COORD | G04, I19 |
| Proveedores | Aliados regionales | Directorio por región, acuerdos, vencimientos | OPERATOR_ADMIN | K05, K12 |
| Finanzas operador | Lo que BT me debe | Liquidaciones (con retenciones y chargebacks), revenue por canal, cierre operativo, caja menor | OPERATOR_ADMIN | G07, I22, I23, K10, J04 |

Reseñas (I24b) va como pestaña de cada tour en Inventario, no como módulo.

### 4.3 COMÚN

| Módulo | Propósito | Pantallas | Roles | Respaldo |
|---|---|---|---|---|
| Perfil de empresa | Datos del tenant y capacidades | Datos editables y bloqueados (NIT, comisión, estado), capacidades activas, checklist de onboarding | OPERATOR_ADMIN (o admin del tenant) | I21, I18a |
| Equipo | Usuarios y roles | Miembros, invitar, roles/permisos, perfil de agente (tasa, meta), tarjeta profesional de guías | Admin del tenant, GERENTE | I18, H10 |
| Documentos y cumplimiento | Legal y vencimientos | Documentos del tenant, vehículos y guías; tablero de vencimientos (RNT, NTS, pólizas, SOAT); aceptaciones firmadas | Admin del tenant; SUPER_ADMIN verifica | `OperatorDocuments` §3, F-RF02b, G05; tablero **NUEVO** |
| PQRS | Peticiones y reclamos | Bandeja, SLA, vínculo a reserva | Admin, AGENT/OPERATOR_AGENT | **NUEVO** (Ley 1480) |
| Notificaciones | Bandeja y preferencias | Bandeja, preferencias email/portal | Todos | I25, J11 |
| Configuración | Ajustes del tenant | Políticas de cancelación propias (§27), privacidad GPS, regiones, integraciones | Admin del tenant | I20, K12, ADR-007 |

### 4.4 PLATAFORMA (solo tenant BorondoTours)

| Módulo | Pantallas | Roles | Respaldo |
|---|---|---|---|
| Revisión de tours | Cola de creación/edición con diff y SLA de 24 h | SUPER_ADMIN, GERENTE | I04, I05 |
| Tenants y contratos | Alta, suspensión, verificación de documentos, contratos de comisión inmutables, capacidades | SUPER_ADMIN | H19, G06 |
| Radar global | Operaciones de todos los operadores con filtro | COORD, GERENTE | G08/G09, K03 |
| Finanzas plataforma | Reportes consolidados, payouts, chargebacks | SUPER_ADMIN, GERENTE | H22, G07 |
| Administración | Usuarios, Ghost Login, Ads, yield/boost | SUPER_ADMIN | H18, H20, H23 |

---

## 5. Priorización (plazo muy cerrado)

Criterio: el MVP debe permitir que un tenant mixto venda y opere sin WhatsApp + Excel, y que BT cumpla con la
verificación del RNT. Todo lo que depende de la App 4 (móvil, Fase 3) o de Siigo (F2) sale del MVP.

| Prioridad | Módulos | Justificación |
|---|---|---|
| **MVP** | Shell con 4 grupos + tenancy por capacidades; Común: Perfil, Equipo, Documentos (con vigencia de RNT), Notificaciones básicas; Operador: Inventario, Manifiesto, Distribución (AgencyLinks + confirmar pago), Planificación mínima (asignar guía/conductor/vehículo con aviso de conflicto, I19b), Flota básica, Finanzas operador (solo lectura de liquidaciones); Agencia: Catálogo (propio + BT), Clientes, CRM, Cotizaciones y ventas (link OnePay.la, venta rápida), Comisiones (cálculo y liquidación manual); Plataforma: Revisión de tours, Tenants y contratos | Specs `listo-para-implementar` (H, I) o ya en el inventario Fase 1/2 (#41-#46, #93-#100). Cubre las dos caras del tenant mixto. RNT es obligación legal de la plataforma |
| **Fase siguiente** | Spec-K completo (calendarios, indisponibilidad, contingencias, alistamiento, cierre), Operación en campo (radar, GPS, check-in) y caja menor, contratos de reventa entre tenants con tarifa neta, Bandeja WhatsApp, PQRS, gamificación (Ka-ching, leaderboard, metas), Proveedores, reseñas, Siigo y reporte FONTUR, pool premium con auto-liberación, Ghost Login, Ads | El radar y el check-in no sirven sin App 4. La reventa entre tenants necesita resolver las preguntas de §7. WhatsApp exige Meta WABA, costos y Ley 2300. Siigo es F2 por ADR-010 |
| **Fuera de alcance** | Website/micrositio, Email Marketing, Subscriptions, eLearning, Recruitment, Manufacturing/PLM/Shop Floor/Repairs, Project, channel manager con OTAs (Viator, etc.), Borondo Coins | No mueven la operación ni el cumplimiento. Coins está en pausa (Spec-E). Las OTAs son otro producto |

---

## 6. Casos borde del modelo unificado

| # | Caso | Riesgo | Recomendación |
|---|---|---|---|
| CB-1 | Operador vende **sus propios** tours desde su módulo Agencia | Cobrarle comisión de marketplace por una venta que no generó BT lo empuja a vender por fuera | Nuevo `source = TENANT_DIRECT`. Si cobra fuera de BT (efectivo, transferencia): comisión 0 % y la reserva entra al manifiesto y consume cupo. Si usa el link OnePay.la de BT: BT está en el flujo del dinero (principal, NIIF 15) y cobra una **tarifa de procesamiento/plataforma**, no la comisión del contrato. Rezdy hace algo parecido: cobra distinto online y offline ([TicketingHub](https://www.ticketinghub.com/blog/rezdy-pricing)). **Pregunta 1** |
| CB-2 | Tenant agencia vende tours de **otro** operador | ¿Quién paga la comisión del revendedor? ¿Baja el ingreso de BT? | El contrato del operador con BT no cambia (`OperatorContracts`). La comisión del revendedor sale del `borondo_amount` con la fórmula que ya existe para agentes (`borondo_amount × rate`, RF-H10), con `ResellerContract` inmutable. Alternativa: tarifa neta definida por el operador (modelo Bókun). Requiere convenio escrito (Decreto 1074). **Pregunta 2** |
| CB-3 | Conflicto con el B2C | El revendedor rebaja precio o "roba" clientes del B2C; el yield score se filtra | Paridad: el revendedor no puede vender por debajo del precio público salvo un descuento dentro de su comisión (misma regla del 10 % de H06b). Los clientes de la agencia son de la agencia (responsable Ley 1581) y no se mezclan con los de B2C. `yield_score` y `featured_boost` nunca se muestran a los tenants (H23) |
| CB-4 | Agencia externa que hoy entra por AgencyLinks sin login y ahora puede tener cuenta | Dos identidades de la misma agencia; datos duplicados; rompe el canal sin fricción | Mantener AgencyLinks (es el gancho de I-RF10). Añadir un directorio de agencias por operador donde `agency_name` pasa a ser `partner_id` con un `tenant_id` opcional. Si la agencia tiene cuenta, el link se emite a su tenant y sus pasajeros aparecen en su CRM. `HOLD_AGENCY` y la liberación a 48 h no cambian |
| CB-5 | BorondoTours como tenant agencia + operador + plataforma | Rol de plataforma mezclado con el de agencia; los tours propios con 0 % de comisión distorsionan los reportes | BT es un tenant con las tres capacidades. Los tours propios usan `BORONDO_INTERNAL_ID` (RF-G01). Los reportes de plataforma excluyen las ventas internas de BT o las separan. Los agentes de BT venden tours de todos los operadores (es el caso actual de Spec-H) |
| CB-6 | Cupos compartidos entre los canales del mismo tenant y de terceros | Overbooking entre el B2C, la agencia propia, revendedores y AgencyLinks | Un solo pool por instancia con `SELECT FOR UPDATE` (regla 05). Cupos premium asignados a `partner_id`/`tenant_id`, no a texto. El revendedor solo lee `cupos_disponibles` (I07). Toda venta de cualquier canal descuenta en la misma transacción |
| CB-7 | Tenant isolation | Hoy solo existe `operator_id`. Quotes, AgentCommissions y clientes no tienen dueño de tenant: un AGENT externo vería leads de BT | `tenant_id` obligatorio en todas las tablas de agencia (`Quotations`, `QuoteActions`, `AgentCommissions`, `AgentProfiles`, clientes). El operador ve del revendedor solo los datos del pasajero que necesita para operar (manifiesto), nunca el pipeline ni los precios de venta del revendedor. Recomendable RLS en PostgreSQL como segunda barrera (decisión del arquitecto) |
| CB-8 | Usuario en varios tenants o con dos sombreros (vende y coordina) | `Users.role` y `Users.operator_id` son únicos | Tabla de membresías `user × tenant × rol base` y permisos con `CustomRoles` (§23). Se mantienen los 10 roles. Para tenants externos: admin = `OPERATOR_ADMIN`, vendedor = `OPERATOR_AGENT`. `GERENTE`/`AGENT` siguen siendo de BT. **Pregunta 3** |
| CB-9 | Liquidación cuando vende un revendedor y el pago entra por BT | Faltan casos en el cálculo (I-1) | Ampliar los "4 casos" a: B2C full, B2C reserva (Split Fare), agente BT, revendedor full, revendedor split, venta directa del tenant fuera de BT (sin payout), y AgencyLink (sin payout, pago externo) |
| CB-10 | Cancelación o fuerza mayor de un tour vendido por un revendedor | ¿Quién reembolsa? ¿Coins (en pausa)? | Si el pago entró por BT: aplica ADR-007, que hoy usa Coins como crédito (en pausa) y necesita una definición alternativa. Si fue pago externo: como `CANCELLED_BY_OPERATOR` de I-RF17, cada tenant gestiona su reembolso. **Pregunta 7** |
| CB-11 | Retenciones entre tenants | Un tenant agencia que paga directamente a un operador debe practicar sus propias retenciones | BT solo retiene cuando BT paga (ADR-009). Para pagos entre tenants por fuera de BT, el sistema solo registra; no calcula impuestos ajenos |
| CB-12 | Operador suspendido con reventas activas | Revendedores siguen ofreciendo | Suspender bloquea la venta en todos los canales, incluidos los revendedores (I-RF21 H-35) |

---

## 7. Preguntas abiertas para el dueño del producto

1. Cuando un operador vende **sus propios tours** desde el módulo Agencia: ¿comisión 0 % si cobra por fuera de BT y tarifa de plataforma si usa OnePay.la de BT? ¿Cuál sería esa tarifa?
2. Cuando una agencia vende tours de **otro** operador: ¿su comisión sale del margen de BT (como los agentes internos) o el operador define una tarifa neta para revendedores?
3. ¿Aceptas mantener los 10 roles y usar `OPERATOR_ADMIN`/`OPERATOR_AGENT` como admin y vendedor de cualquier tenant externo (también los de solo agencia), o prefieres nombres neutros (p. ej. `TENANT_ADMIN`)? Lo segundo cambia el RBAC canónico.
4. ¿Las agencias **sin tours propios** (solo revenden) entran a la app en el MVP, o el MVP es solo para operadores que también venden?
5. ¿Un tenant puede vender tours de cualquier operador publicado o solo de los que aceptaron un contrato de reventa con él?
6. ¿BT cobra a los tenants por usar la app (suscripción por módulos activables) o el negocio sigue siendo solo comisión?
7. Con Borondo Coins en pausa, ¿cómo se compensa al cliente en cancelaciones por fuerza mayor de ventas hechas por revendedores (crédito interno, reembolso, lo que decida el tenant)?
8. Para los proveedores que ya tienen su propia app: ¿basta con que publiquen inventario y reciban el manifiesto (sin usar el módulo Agencia), o se espera integración por API/iCal?
9. ¿La bandeja de WhatsApp (estilo vocero-crm) es imprescindible para el MVP, o alcanza con los botones `wa.me` de RF-H08?
10. ¿El cumplimiento (RNT vigente, NTS de aventura, tarjeta profesional del guía) debe **bloquear** la publicación o la asignación, o solo alertar?

---

## 8. Conclusiones y recomendaciones (sin implementar)

1. **Modelo de dominio primero**: crear `Organizations` (tenant) con `capabilities` y `Memberships` (usuario × tenant × rol),
   y añadir `tenant_id` a las tablas de agencia. Va en `Modelo-Datos-Core.md` antes de cualquier pantalla. Es lo único
   que impide reutilizar Spec-H tal como está para tenants externos.
2. **Corregir los specs antes de construir**: definir los casos de liquidación (I-1 + CB-9), unificar la definición de
   `OPERATOR_AGENT` (I-2), payout por ciclo (I-3), vigencias en caliente (I-4), tabla de redirección única (I-5), quitar Coins
   del MVP (I-6). Propongo un **Spec-M "App de Gestión Unificada"** que referencie G/H/I/K por código RF en vez de duplicarlos,
   y que agregue lo NUEVO: tenancy, Distribución con contratos de reventa, Clientes, Bandeja, PQRS y tablero de cumplimiento.
3. **Sidebar en 4 grupos** (Agencia, Operador, Común, Plataforma). La visibilidad sale de capacidades + rol + `CustomRoles`, sin código por tenant.
4. **API por dominio, no por app**: los prefijos actuales `/api/v1/erp/*` y `/api/v1/b2b/*` asumen dos apps. Conviene que el
   arquitecto los reorganice por dominio (agencia, operador, plataforma) dentro de `/api/v1/`. Depende de la decisión
   pendiente **#1** (Hono vs NestJS). La app web unificada depende de **#2** (Astro vs Vite) porque es una SPA de back office pesada.
   No se resuelven aquí.
5. **Cumplimiento como producto**: verificar el RNT es obligación de BT como plataforma (Ley 2068 art. 38). Un tablero de
   vencimientos (RNT, NTS, pólizas, SOAT, tarjeta profesional) es barato y agrega valor visible al operador.
6. **Reutilizar el kit y el diseño**: las pantallas nuevas (Kanban, bandeja, tableros) deben salir del kit `bt-*`
   (steering 18) y replicarse en Figma con `figma-sync`. Lo cubre el informe de frontend, no este.
