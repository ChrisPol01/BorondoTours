# Pipeline de Facturación Electrónica y Declaración DIAN — Borondo Tours SAS
**Versión:** 1.0  
**Fecha:** Septiembre 2026  
**Elaborado por:** Kiro (rol: contador / revisor fiscal)  
**Complementa:** [[Estructura-Contable]]  
**Alcance:** Ciclo completo desde que el viajero paga → factura electrónica válida ante DIAN → entrega al cliente → contabilización → declaración de cada impuesto con fechas.

> ⚠️ Guía técnica. No reemplaza al contador público titulado. Fechas y UVT ($52.374) son referencia 2026 (Decreto 2229/2023, Resolución DIAN 000238/2025).

### Ficha tributaria de la empresa

| Dato | Valor |
|---|---|
| NIT | **902.080.308-5** |
| Número base | 902.080.308 |
| Dígito de verificación | 5 (según RUT oficial; NO se usa para calendario) |
| **Último dígito para calendario DIAN** | **8** |
| Domicilio | Santiago de Cali |

> Todas las fechas de este documento están calculadas para **último dígito = 8**.

> 🚨 **Aclaración importante sobre el RUT (corrige un malentendido):** el **NIT y el RUT son el mismo registro**. Si Borondo Tours ya tiene NIT `902.080.308-5`, es porque la Cámara de Comercio de Cali **ya generó el RUT** al constituir la SAS (el registro mercantil dispara el RUT automáticamente). Lo que muy probablemente falta **NO es "inscribir el RUT"**, sino **actualizar las responsabilidades** de ese RUT en la DIAN: marcar responsabilidad de IVA (código 48), agente de retención (código 07), renta régimen ordinario, y habilitar facturación electrónica. **Primera acción: entrar a la DIAN, descargar el RUT actual y verificar qué responsabilidades tiene marcadas.**

---

## 1. Visión General del Pipeline

```
[1] Viajero paga (checkout)
        │  OnePayla procesa → confirma pago (webhook)
        ▼
[2] Se dispara la EMISIÓN de la factura electrónica
        │  Sistema arma el documento (XML UBL 2.1)
        ▼
[3] Proveedor tecnológico (Siigo/Factus) firma y envía a DIAN
        │  VALIDACIÓN PREVIA (la DIAN valida ANTES de entregar al cliente)
        ▼
[4] DIAN valida → asigna CUFE → responde "documento validado"
        ▼
[5] Se entrega al CLIENTE (email + representación gráfica PDF + XML + QR)
        ▼
[6] CONTABILIZACIÓN automática (asiento en software contable)
        ▼
[7] Acumulación mensual/bimestral → DECLARACIÓN ante DIAN (cada impuesto)
```

**Principio clave (validación previa):** desde la Resolución 000030 de 2019, en Colombia la factura electrónica es de **validación previa**: la DIAN valida el documento **antes** de que se considere expedido y se entregue al cliente. Si la DIAN rechaza, no hay factura válida. Por eso el orden correcto es: emitir → validar en DIAN → entonces entregar al cliente.

---

## 2. Etapa por Etapa (detallado)

### Etapa 1 — Pago del viajero (checkout)

- El viajero paga en el checkout (OnePayla como pasarela).
- OnePayla confirma el pago vía **webhook** (regla de negocio: el webhook es la única fuente de verdad del pago — steering `05-business-rules`).
- El dinero llega a la cuenta de recaudo OnePayla y luego se dispersa a **Bold**.

**Disparador de facturación:** el evento `PAYMENT_CONFIRMED` del webhook es el que **dispara la emisión de la factura**. No se factura antes de confirmar el pago.

> **Momento del ingreso vs. momento de la factura:** ojo con la diferencia contable. La **factura** se emite al confirmar el pago, pero el **ingreso** contable se reconoce cuando se **presta el servicio** (se ejecuta el tour) — ver [[Estructura-Contable]] §2. Entre ambos, el valor vive en `2705 Ingresos recibidos por anticipado`. La factura puede emitirse como "anticipo" o como factura de venta según la política que defina el contador; lo más limpio para turismo es **facturar la venta al confirmar** y reconocer el ingreso al prestar el servicio (el IVA se causa con la factura).

### Etapa 2 — Armado del documento electrónico

El sistema (o el software de facturación) construye el XML con **UBL 2.1** e incluye:

| Campo obligatorio | Origen en BorondoTours |
|---|---|
| NIT emisor + resolución de numeración DIAN | Configuración de la empresa |
| Datos del adquiriente (cliente) | Perfil del viajero (nombre, documento, correo) |
| Número de factura (consecutivo autorizado DIAN) | Rango de numeración habilitado |
| Descripción del servicio (tour) | `booking` (nombre del tour, fecha) |
| Valor base | `total_price` sin IVA |
| **IVA 19%** o **0% (exento extranjero)** | Según residencia fiscal del viajero |
| Forma de pago (contado / OnePayla) | Método de pago |
| CUFE (lo calcula el software con SHA-256) | Generado en la firma |

**Caso IVA extranjero (exento):** si el viajero es extranjero no residente con pasaporte, la factura se emite con **IVA 0%** citando la exención (Art. 481 lit. e ET / Decreto 297/2016). Se debe conservar el soporte del pasaporte 5 años.

### Etapa 3 y 4 — Firma, envío y VALIDACIÓN PREVIA DIAN

- El **proveedor tecnológico** (Siigo, Factus, etc.) firma digitalmente el XML con el certificado y lo transmite a la DIAN.
- La DIAN ejecuta la **validación previa**: verifica estructura, numeración autorizada, cálculos, NIT.
- Si es válida → la DIAN responde con **"documento validado"** y queda registrado el **CUFE** (código único de 36 caracteres, hash SHA-256).
- Si es rechazada → el software devuelve el error; hay que corregir y reenviar. **No entregar al cliente hasta que esté validada.**

### Etapa 5 — Entrega al cliente

Una vez validada, se entrega al viajero:
- **XML** (el documento legal real).
- **Representación gráfica** (PDF legible con logo Borondo — la marca ya está definida en steering `12-brand-identity`).
- **Código QR** que lleva al portal DIAN para verificar el CUFE.
- Envío por **correo electrónico** automático (AWS SES ya está en el stack) + disponible en el portal del cliente (Mis Reservas).

### Etapa 6 — Contabilización

Al validarse la factura, se genera el asiento (ver asientos completos en [[Estructura-Contable]] §2):

```
Al emitir factura (venta a residente):
  Db  1110 Bold / 2705 según flujo de caja       $1.190.000
      Cr  4105 Ingresos por tours (o 2705 si servicio no prestado)  $1.000.000
      Cr  2370.237005 IVA generado                                    $190.000
```

Si se usa **Siigo** como contable, la factura emitida por su módulo **ya genera el asiento automáticamente**. Si se emite por **Factus (API)**, hay que **sincronizar** ese documento hacia el software contable (integración o cargue).

### Etapa 7 — Declaración (ver §4 calendario)

Los IVA generados y las retenciones practicadas se **acumulan** y se declaran según el calendario DIAN.

---

## 3. Arquitectura de Integración (cómo automatizarlo en la plataforma)

Alineado con el stack serverless (Lambda + eventos) del proyecto:

```
Webhook OnePayla (PAYMENT_CONFIRMED)
        │
        ▼
Lambda "invoice-emitter"  (nuevo — services/4-payments o servicio fiscal dedicado)
        │  1. Arma el payload de la factura desde el booking
        │  2. Llama la API del proveedor (Factus / Siigo)
        │  3. Recibe CUFE + XML + PDF
        │  4. Guarda CUFE y estado en la BD (tabla invoices)
        │  5. Encola envío de correo (SES) con XML + PDF
        ▼
Reintentos: si DIAN/proveedor falla → SQS + reintento (idempotencia por booking_id)
```

**Recomendaciones técnicas:**
- **Idempotencia:** un `booking_id` genera **una sola** factura (guardar `cufe` y `invoice_status` en la BD; si ya existe, no reemitir).
- **Cola de reintentos:** si la DIAN está caída, encolar y reintentar (la validación previa puede tardar); no bloquear el checkout del usuario.
- **Estados de la factura:** `PENDING → SENT_TO_DIAN → VALIDATED → DELIVERED` (o `REJECTED` con motivo).
- **Almacenamiento legal:** conservar el **XML** (no solo el PDF) mínimo **5 años** — es el documento con validez fiscal. Guardar en S3 con retención.
- **Numeración:** la resolución de numeración de la DIAN tiene rango y vigencia; monitorear que no se agote.

> Esta lógica encaja con el patrón de orquestación fiscal que ya existe si se implementa Siigo API en Fase 2. La tabla `invoices` y el manejo de `webhook_events` para idempotencia ya están contemplados en el modelo de datos del proyecto.

---

## 4. Calendario de Declaraciones DIAN 2026 — Borondo Tours (dígito 8)

> Fechas calculadas para **último dígito de NIT = 8**, según Decreto 2229/2023. Las declaraciones se presentan por día hábil según el dígito; el 8 cae hacia el **final** de cada ventana. Las fechas de un año dependen del calendario de festivos — **confirmar el día exacto con el contador o en el portal DIAN** antes de cada vencimiento (puede moverse 1 día por festivos).

### 4.1 IVA (Formulario 300)

Borondo Tours es responsable de IVA. La **periodicidad** depende de los ingresos del año anterior:
- **Bimestral:** ingresos brutos del año anterior ≥ 92.000 UVT (≈ $4.818M COP), **o responsables NUEVOS que inician actividades** (este es tu caso al arrancar).
- **Cuatrimestral:** ingresos brutos del año anterior < 92.000 UVT.

> 📌 **Tu caso:** al ser un responsable que apenas inicia, la DIAN te asigna **periodicidad bimestral el primer año**. A partir del segundo año, si tus ingresos quedaron por debajo de 92.000 UVT, pasas a **cuatrimestral**. El contador lo confirma al activar la responsabilidad de IVA en el RUT.

**Periodo bimestral (primer año — dígito 8):**

| Periodo | Se declara/paga en 2026 (aprox. dígito 8) |
|---|---|
| Ene–Feb | ~11 de marzo 2026 |
| Mar–Abr | ~13 de mayo 2026 |
| May–Jun | ~9 de julio 2026 |
| Jul–Ago | ~9 de septiembre 2026 |
| Sep–Oct | ~11 de noviembre 2026 |
| Nov–Dic | ~15 de enero 2027 |

**Periodo cuatrimestral (a partir del 2º año, si aplica):**

| Periodo | Se declara/paga |
|---|---|
| Ene–Abr | ~mayo |
| May–Ago | ~septiembre |
| Sep–Dic | ~enero del año siguiente |

### 4.2 Retención en la Fuente (Formulario 350) — MENSUAL

Como agente retenedor (retiene al pagar a operadores y proveedores), Borondo Tours declara **todos los meses**. La ventana va ~10 al 24 del mes siguiente; para **dígito 8** cae cerca del día **21–24**.

| Retención del mes | Se declara/paga en (dígito 8, aprox.) |
|---|---|
| Enero | ~20 febrero 2026 |
| Febrero | ~23 marzo 2026 |
| Marzo | ~23 abril 2026 |
| Abril | ~22 mayo 2026 |
| Mayo | ~22 junio 2026 |
| Junio | ~22 julio 2026 |
| Julio | ~24 agosto 2026 |
| Agosto | ~22 septiembre 2026 |
| Septiembre | ~22 octubre 2026 |
| Octubre | ~24 noviembre 2026 |
| Noviembre | ~22 diciembre 2026 |
| Diciembre | ~22 enero 2027 |

> Incluye retefuente (renta) y ReteIVA si aplica. Es la declaración **más recurrente** (mensual). **Regla clave:** si un mes NO practicaste ninguna retención, **no estás obligado a presentar la declaración de ese mes** (Art. 606 ET) — pero si la presentas, debe ser con pago. El contador decide mes a mes.

### 4.3 Renta Personas Jurídicas (Formulario 110) — ANUAL, 2 cuotas

Año gravable 2025 se declara en **2026**. Ventana oficial: **12–26 de mayo de 2026** (1ª cuota + declaración), 2ª cuota en **junio–julio**. El dígito 1 abre el 12 de mayo; el **dígito 8** cae hacia el final de la ventana.

| Concepto | Fecha 2026 (dígito 8, aprox.) |
|---|---|
| 1ª cuota + presentación declaración | ~22–25 de mayo 2026 |
| 2ª cuota (pago del saldo) | ~julio 2026 |

> ⚠️ Borondo Tours nace en 2026, así que su **primera declaración de renta será en 2027** (año gravable 2026). La fila de arriba aplica a partir de que tenga un año gravable completo. Los **grandes contribuyentes** tienen calendario distinto (feb/abr/jun) — no es tu caso.

### 4.4 Información Exógena (Medios Magnéticos) — ANUAL

Reporte anual de terceros (a quién le pagó, quién le pagó, IVA, retenciones). Se presenta a mitad de año (abril–junio típicamente), según calendario específico de exógena. **El contador prepara estos formatos** a partir de la contabilidad.

### 4.5 ICA y ReteICA — CALI (municipal, NO DIAN)

- El **ICA** se declara y paga en la **Alcaldía de Cali** según su calendario tributario propio (Departamento Administrativo de Hacienda de Cali).
- Periodicidad usual: **bimestral o anual** según el régimen del municipio.
- **ReteICA:** si Borondo Tours retiene ICA a proveedores, declara según el calendario de Cali.
- **Acción:** descargar el Calendario Tributario 2026 de Cali (cali.gov.co) y fijar las fechas.

### 4.6 RNT — Renovación anual (MinCIT, NO DIAN)

- El **Registro Nacional de Turismo** se renueva **cada año entre enero y marzo**.
- No renovar → suspensión de la operación turística legal.
- **Acción:** recordatorio anual en enero.

---

## 5. Tabla Resumen — Todas las Obligaciones

| Obligación | Autoridad | Frecuencia | Formulario | Fecha 2026 (dígito 8) |
|---|---|---|---|---|
| IVA | DIAN | Bimestral (1er año) | 300 | ~11 mar / 13 may / 9 jul / 9 sep / 11 nov |
| Retención en la fuente | DIAN | **Mensual** | 350 | ~día 22–24 del mes siguiente |
| Renta persona jurídica | DIAN | Anual (2 cuotas) | 110 | ~22–25 mayo (desde 2027) |
| Información exógena | DIAN | Anual | Formatos XML | Abr–Jun |
| Factura electrónica | DIAN | Por cada venta | XML UBL 2.1 | Tiempo real |
| ICA + ReteICA | Alcaldía Cali | Bimestral/anual | Municipal | Calendario Cali |
| RNT (renovación) | MinCIT | Anual | Plataforma RNT | Ene–Mar |

---

## 6. Checklist de Implementación del Pipeline

### 🔴 Prerrequisitos (antes de facturar el primer peso)
- [ ] **Descargar el RUT actual** desde el portal DIAN (ya existe, se generó con el NIT) y revisar qué responsabilidades tiene.
- [ ] **Actualizar responsabilidades en el RUT**: IVA (código 48), agente de retención (código 07), renta régimen ordinario, facturación electrónica.
- [ ] Obtener el **instrumento de firma electrónica (IFE)** del representante legal en la DIAN.
- [ ] Habilitarse como **facturador electrónico** en el portal DIAN y solicitar la **resolución de numeración** (rango + prefijo).
- [ ] Contratar/activar el **proveedor tecnológico** (Siigo o Factus) y **certificado de firma digital**.
- [ ] Configurar la **representación gráfica** con la marca Borondo (logo, colores — steering `12-brand-identity`).
- [ ] Confirmar con el contador la **periodicidad de IVA** (bimestral el 1er año).

### 🟡 Integración técnica
- [ ] Crear Lambda "invoice-emitter" disparada por `PAYMENT_CONFIRMED`.
- [ ] Tabla `invoices` con `cufe`, `invoice_status`, `xml_s3_key`, `booking_id` (único).
- [ ] Idempotencia por `booking_id` + cola de reintentos (SQS).
- [ ] Envío automático por correo (SES) con XML + PDF + QR.
- [ ] Almacenar XML en S3 con retención de **5 años**.
- [ ] Manejo del caso **IVA exento extranjero** en el payload.
- [ ] Sincronización factura → software contable (si se usa Factus para emitir y Siigo para contabilizar).

### 🟢 Operación mensual/anual (con el contador)
- [ ] Cierre contable mensual + conciliación Bold vs. libros.
- [ ] Declaración de **retención en la fuente** cada mes.
- [ ] Declaración de **IVA** según periodicidad.
- [ ] Declaración de **ICA Cali** según calendario municipal.
- [ ] **Renta** anual + **exógena** anual.
- [ ] **Renovar RNT** en enero.
- [ ] Fijar todas las fechas exactas según el **último dígito del NIT**.

---

## 7. Riesgos y Controles

| Riesgo | Control |
|---|---|
| DIAN rechaza la factura y se entrega al cliente sin validar | Estado `VALIDATED` obligatorio antes de enviar el correo |
| Doble facturación de un mismo booking | Idempotencia por `booking_id` en tabla `invoices` |
| Se agota el rango de numeración DIAN | Alerta cuando queda < 10% del rango |
| No se guarda el XML (solo el PDF) | El XML es el documento legal — retención 5 años en S3 |
| Declarar tarde y pagar sanción | Sanción mínima 2026 = 10 UVT = **$523.740**. Recordatorios automáticos por obligación |
| IVA extranjero mal aplicado | Validar residencia + soporte de pasaporte antes de emitir |
| Factura emitida pero servicio no prestado (reconocimiento de ingreso) | Usar cuenta `2705` hasta ejecutar el tour |

---

## Links relacionados
- [[Estructura-Contable]] — PUC, asientos, régimen, revisoría fiscal
- Steering `05-business-rules` — reglas de negocio (webhook fuente de verdad, IVA, Coins)
- Steering `12-brand-identity` — marca para la representación gráfica de la factura

---

*Versión 1.0 — Septiembre 2026 | Pendiente: fijar fechas exactas con el último dígito del NIT y confirmar periodicidad de IVA con el contador.*
