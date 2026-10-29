# Decisiones del dueño — App de gestión (fusión ERP + B2B)

Fecha: 2026-10. Respuestas a las preguntas de `00-propuesta-consolidada.md` §4. El B2C (`apps/web`) no
cambia por estas decisiones.

## D1. Venta propia del operador: 0 % para BorondoTours, fee transaccional para BorondoTech
- Si un operador vende **sus propios** tours: BorondoTours (agencia/marketplace) cobra **0 %**.
- **BorondoTech** (empresa de software, ver Estructura-Contable D1/D2) gana por dos vías:
  1. **Suscripción** por usuario y por plan (D5).
  2. **Fee por transacción** (% de cada venta procesada), modelo tipo Stripe.

### D1.1 Dos modos de cobro (`collection_mode`)
| Modo | Cómo entra el dinero | Liquidación | Cómo cobra BorondoTech su fee |
|---|---|---|---|
| `PLATFORM_GATEWAY` | Por la pasarela de la plataforma (OnePay.la), a una cuenta de la plataforma | La plataforma liquida al operador por reserva/ciclo, descontando el fee; el operador ve su apartado contable (liquidaciones, retenciones, documento soporte) | Retención automática del % en la liquidación |
| `OWN_GATEWAY` | Por la pasarela propia del operador (p. ej. Bold, banco) directo a su cuenta | No hay liquidación: la plataforma solo registra la venta (manifiesto, cupos, CRM) | Factura mensual de BorondoTech por el % de las ventas registradas (o incluido en el plan) |

**Riesgos a validar con contador y abogado antes de construir `PLATFORM_GATEWAY`:**
- Recibir dinero de terceros a nombre de BorondoTech: debe contabilizarse como **ingreso para terceros**
  (mandato), no como ingreso propio; solo el fee es ingreso. Revisar si el esquema exige figura de
  agregador/facilitador de pagos ante la pasarela o la SFC.
- IVA sobre el fee (servicio tecnológico 19 %) y retenciones que practique el operador sobre la factura de BorondoTech.
- Qué empresa es dueña de la cuenta de OnePay.la (BorondoTours SAS hoy; BorondoTech SAS por constituir).

## D2. Reventa: tarifa % fija del operador
El operador define un **% fijo de comisión para sus revendedores**. Se modela como contrato de reventa
(operador → revendedor) con historial inmutable, igual que `OperatorContracts`.

## D3. MVP con BorondoTours como cliente cero
- BorondoTours se da de alta como **agencia y operador** para probar todos los módulos.
- Mientras se convence a los operadores, BorondoTours **crea y mantiene a mano** sus tours y cupos (a partir
  del reporte que hoy envían por WhatsApp). Cuando un operador entra a la plataforma, gestiona él mismo sus
  tours y cupos, y BorondoTours ve el inventario en tiempo real sin duplicar.
- Requisito derivado: un tour creado por BorondoTours "en nombre de" un operador debe poder **transferirse**
  a ese operador cuando se registre (sin recrearlo), conservando historial y reservas.

## D4. Bandeja multicanal: imprescindible
- WhatsApp primero; también Instagram, Messenger y, si es viable, otros (Telegram, etc.).
- Cada conversación se vincula a contacto/lead y permite **agendar en calendario** y **automatizar ventas**.
- Referencia de UX: Beeper / Texts.com (bandeja multicanal de escritorio).
- Nota técnica: Beeper/Texts son apps personales, no un API para un SaaS. Los canales oficiales son
  WhatsApp Cloud API, Instagram y Messenger (Meta Graph API) y Telegram Bot API. Signal no tiene API oficial
  para empresas: queda fuera salvo que aparezca una vía oficial.

## D5. Suscripción por usuario y por plan
- Cada **plan** habilita módulos y amplía capacidades (IA, almacenamiento, número de usuarios, canales).
- Lo factura BorondoTech. Entidades nuevas: `Plans`, `PlanModules`, `PlanLimits`, `Subscriptions`,
  `UsageCounters` (IA, almacenamiento).

## D6. Cumplimiento: documentos después del registro + validación con IA
- El registro no exige documentos; se adjuntan **después de iniciar sesión** (Común › Documentos).
- La IA valida en AWS: extracción con **Amazon Textract** (OCR de documentos; Rekognition sirve para
  imágenes y rostros, no para leer certificados) + clasificación/verificación de campos con **Bedrock**.
- Contraste con fuentes oficiales (RNT, Cámara de Comercio/RUES): por verificar qué consultas públicas o API
  existen y sus términos de uso; mientras tanto, revisión humana final del SUPER_ADMIN.
- Mientras un documento obligatorio no esté validado: alerta, y bloqueo solo de publicar tours (Ley 2068).

## D7. Stack de la app de gestión = stack del B2C
Astro + React islands, mismas tecnologías e infra que el B2C (no hace falta SEO, pero se prioriza un solo
mantenimiento). Resuelve la decisión pendiente #2 con la opción (a). #1 (Hono vs NestJS) sigue pendiente,
pero no bloquea porque el orden es frontend primero.

## D8. Orden de construcción
**Frontend → MER (modelo de datos) → backend → despliegue en AWS.**

## D9. CRM base
Fork adaptado de vocero-crm (MIT). Funciones de otros CRM (Twenty, Odoo, Atomic CRM, Frappe, etc.) se toman
solo como **ideas** para agregarle al fork (sin copiar código de proyectos AGPL/GPL/LGPL).

## D10. Jerarquía de tenant: Organization ⊃ Companies
Resuelve "companies vs organizations":
- **Organization** = la cuenta cliente de la plataforma (el grupo empresarial). Tiene la **suscripción**, el plan,
  los usuarios y los módulos habilitados. Es la frontera de aislamiento (tenant).
- **Company** = cada **empresa legal** del grupo (NIT, RNT, país, régimen tributario, retenciones, pasarela,
  cuentas bancarias). Una organización tiene 1..N companies (filiales, sedes en otros países).
- Una agencia con una sola empresa legal = 1 organization + 1 company (se crean juntas en el registro).
- Lo que hoy es `Operators` (datos fiscales) pasa a **`Companies`**; `operator_id` en tablas de operador
  apunta a `Companies` (el tour lo vende/opera una empresa legal concreta). `organization_id` en usuarios,
  suscripción, CRM y permisos.
- Los usuarios pertenecen a la organization y se les da acceso a una o varias companies.

## D11. Módulos y permisos
- Módulos por defecto para toda organization: **Común, Agencia y Operador**.
- **Plataforma** solo para la organización dueña de la plataforma. No se escribe "BorondoTours" en el código:
  es una marca `is_platform_owner` en la organization, para que la operación pueda pasar a otra empresa si
  cambia el negocio.
- El **SUPER_ADMIN** (de la plataforma) habilita módulos adicionales a cada organization.
- Dentro de la organization, el admin asigna **permisos por usuario**.
- Cada usuario puede **personalizar su vista**: mostrar/ocultar y ordenar los módulos que tiene permitidos
  en su sidebar (preferencia de interfaz; no da permisos).
