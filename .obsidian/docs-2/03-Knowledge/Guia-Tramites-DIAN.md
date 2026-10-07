# Guía de Trámites DIAN — Habilitación Fiscal de Borondo Tours SAS
**Versión:** 1.0  
**Fecha:** Septiembre 2026  
**Elaborado por:** Kiro (rol: administrador / contador)  
**Complementa:** [[Estructura-Contable]] · [[Pipeline-Facturacion-y-Declaracion]]  
**Objetivo:** Paso a paso para dejar a Borondo Tours legalmente lista para facturar electrónicamente y declarar. Ejecutable por el CEO / administrador.

| Dato | Valor |
|---|---|
| NIT | 902.080.308-5 (DV=5 según RUT oficial; último dígito calendario = **8**) |
| Domicilio | Santiago de Cali |
| Representante legal | CEO (Christopher) |
| Correo tributario | christopher.epe@borondotours.com |

> ⚠️ Esta guía describe el trámite estándar en el portal DIAN (MUISCA). La DIAN cambia su interfaz con frecuencia; los nombres de los botones pueden variar levemente. Si un paso no coincide, buscar el equivalente por nombre de la función.

---

## Aclaración clave: la "firma" para la DIAN

Hay **tres cosas distintas** que se suelen confundir:

| Elemento | Qué es | Para qué sirve | Costo |
|---|---|---|---|
| **Firma PNG del CEO** | Imagen escaneada de la firma manuscrita | Solo la **representación gráfica** de la factura (que se vea la firma). NO tiene validez ante DIAN | — |
| **Instrumento de Firma Electrónica (IFE)** | Mecanismo de la DIAN: usuario + contraseña + código al correo | **Firmar declaraciones y trámites** en el portal DIAN (RUT, renta, etc.) | **Gratis** (lo emite la DIAN) |
| **Certificado de firma digital** | Certificado criptográfico de una entidad certificadora | Que el **software de facturación** firme los XML de las facturas | Lo provee el proveedor (Siigo/Factus) |

> El PNG NO reemplaza al IFE. El CEO necesita generar su **IFE** en la DIAN (Paso 2).

---

## PASO 0 — Insumos que se necesitan antes de empezar

- [ ] Cédula del representante legal (CEO).
- [ ] Certificado de existencia y representación legal (Cámara de Comercio de Cali, < 30 días).
- [ ] Correo institucional operativo: christopher.epe@borondotours.com.
- [ ] Celular de contacto.
- [ ] RUT actual en PDF (descargar en Paso 1).
- [ ] Acceso al portal DIAN con usuario del representante legal.

---

## PASO 1 — Revisar y actualizar el RUT

> El RUT **ya existe** (se generó con el NIT al constituir la SAS). Aquí se revisa y se le agregan las responsabilidades que falten.

### 1.1 Ingresar al portal
1. Ir a **www.dian.gov.co** → "Usuario Registrado".
2. Ingresar como: **NIT** (persona jurídica) → 902080308.
3. Autenticarse con el usuario del representante legal (si no tiene, crear cuenta — Paso 2 lo cubre).

### 1.2 Descargar el RUT actual
1. Menú **"Registro Único Tributario"** → **"Consultar"** / **"Descargar RUT"**.
2. Guardar el PDF. Revisar la **casilla 53 (Responsabilidades)** y la **casilla 46 (actividad económica / CIIU)**.

### 1.3 Verificar responsabilidades (casilla 53)
Confirmar que estén (o agregarlas si faltan):

| Código | Responsabilidad | ¿Necesaria para Borondo Tours? |
|---|---|---|
| **05** | Impuesto de renta y complementario régimen ordinario | ✅ Sí |
| **48** | Impuesto sobre las ventas – IVA | ✅ Sí (servicios turísticos gravados) |
| **07** | Retención en la fuente a título de renta | ✅ Sí (agente retenedor) |
| **09** | Retención en la fuente en el impuesto sobre las ventas (ReteIVA) | ✅ Sí (si va a retener IVA) |
| **42** | Obligado a llevar contabilidad | ✅ Sí |
| **52** | Facturador electrónico | ✅ Sí (se activa al habilitarse — Paso 3) |
| **14** | Informante de exógena | ⚠️ Puede aplicar según topes |

### 1.4 Verificar actividad económica (CIIU, casilla 46)
Debe estar registrada la actividad turística. Códigos CIIU relevantes:
- **7911** — Actividades de las agencias de viaje
- **7912** — Actividades de operadores turísticos
- **7990** — Otros servicios de reserva y actividades relacionadas

> **Confirmar cuál quedó registrada.** Si Borondo Tours actúa como agencia + operador, puede tener una principal y una secundaria.

### 1.5 Actualizar el RUT (si falta algo)
1. Menú **"Registro Único Tributario"** → **"Actualizar"**.
2. Modificar la casilla 53 (responsabilidades) agregando los códigos que falten.
3. **Firmar** la actualización con el **IFE** (Paso 2).
4. Descargar el RUT actualizado.

> Actualizar el RUT es **gratis** y se puede hacer en línea si ya se tiene el IFE. Si hay problemas, se agenda cita presencial en la DIAN de Cali.

---

## PASO 2 — Generar el Instrumento de Firma Electrónica (IFE) del CEO

> Sin el IFE, el CEO no puede firmar el RUT ni las declaraciones. Es gratis.

1. Portal DIAN → ingresar con el usuario del representante legal.
2. Menú **"Sistema de Firma Electrónica"** o **"Habilitar mi cuenta"** → **"Firma Electrónica"**.
3. El sistema pide **verificar la identidad** (preguntas de seguridad y/o código enviado al correo registrado en el RUT → confirmar que sea christopher.epe@borondotours.com).
4. Definir una **contraseña de firma** (distinta a la del portal). **Guardarla en un gestor seguro.**
5. El IFE queda activo. Con él se firman todos los trámites electrónicos.

> ⚠️ Si el correo registrado en el RUT NO es el institucional, primero actualizar el correo en el RUT (Paso 1.5), porque los códigos de firma llegan a ese correo.

---

## PASO 3 — Habilitarse como Facturador Electrónico

1. Portal DIAN → menú **"Factura Electrónica"** → **"Habilitación"**.
2. Completar el **registro como facturador electrónico**.
3. Seleccionar el **modo de operación**:
   - **Software de un proveedor tecnológico** (recomendado: Siigo o Factus) → se elige esta opción.
   - (Alternativas: software propio o el gratuito de la DIAN — no recomendadas para el volumen de BorondoTours.)
4. Realizar las **pruebas de habilitación** (set de pruebas): la DIAN exige emitir unos documentos de prueba en ambiente de testing antes de autorizar producción. **Esto lo hace el proveedor tecnológico (Siigo/Factus) por ti** — es parte de su servicio de onboarding.
5. Al aprobar las pruebas, la DIAN habilita la **emisión en producción**.

---

## PASO 4 — Solicitar la Resolución de Numeración

> Es el rango de números de factura autorizado por la DIAN. Sin resolución vigente, no se puede facturar.

1. Portal DIAN → **"Numeración de Facturación"** → **"Solicitar rango"**.
2. Definir:
   - **Prefijo**: ej. `BT` (Borondo Tours) — máx. 4 caracteres alfanuméricos.
   - **Rango**: ej. del **1 al 5000** (según volumen esperado).
   - **Modalidad**: Factura electrónica de venta.
3. La DIAN emite la resolución con: prefijo, rango y **vigencia (típicamente 24 meses)**.
4. Cargar esa resolución en el software (Siigo/Factus) para que las facturas salgan con numeración válida.

> **Control:** monitorear que no se agote el rango ni venza la resolución. Alerta cuando quede < 10% del rango.

---

## PASO 5 — Conectar el Proveedor Tecnológico

Según lo definido en [[Estructura-Contable]] §4:
- **Contabilidad:** Siigo (o Alegra).
- **Emisión desde la plataforma (checkout):** Factus (API) o la API del mismo Siigo.

Pasos con el proveedor elegido:
1. Contratar el plan.
2. Cargar los datos de la empresa: NIT, RUT actualizado, resolución de numeración, logo (marca — steering `12-brand-identity`).
3. Cargar el **certificado de firma digital** (lo tramita el proveedor).
4. Ejecutar el **set de pruebas** con la DIAN (Paso 3.4).
5. Integrar la **API** con el checkout (webhook `PAYMENT_CONFIRMED` → emisión — ver [[Pipeline-Facturacion-y-Declaracion]] §3).
6. Emitir la primera factura real y verificar el **CUFE** en el portal DIAN.

---

## Orden de ejecución (resumen)

```
[1] IFE del CEO (Paso 2)  ← desbloquea todo lo demás
      ▼
[2] Revisar + actualizar RUT (Paso 1)  ← agregar responsabilidades
      ▼
[3] Habilitarse como facturador (Paso 3)
      ▼
[4] Resolución de numeración (Paso 4)
      ▼
[5] Conectar proveedor + set de pruebas (Paso 5)
      ▼
[6] Emitir primera factura real ✅
```

> El IFE va primero porque se necesita para firmar la actualización del RUT.

---

## Insumos que Kiro necesita del CEO para acompañar cada paso

| # | Insumo | Para qué |
|---|---|---|
| 1 | RUT actual en PDF | Ver qué responsabilidades faltan (Paso 1) |
| 2 | Certificado de Cámara de Comercio | Confirmar representante legal y datos |
| 3 | CIIU registrado | Confirmar actividad turística correcta |
| 4 | Decisión de proveedor (Siigo/Factus) | Arrancar Paso 5 |
| 5 | Prefijo y rango de numeración deseado | Solicitar resolución (Paso 4) |
| 6 | Comisión % de OnePayla | Asiento del costo de pasarela |
| 7 | Capital social suscrito | Balance de apertura |

---

## Links relacionados
- [[Estructura-Contable]] — PUC, régimen, revisoría fiscal
- [[Pipeline-Facturacion-y-Declaracion]] — flujo técnico factura + calendario
- Steering `12-brand-identity` — logo/marca para la representación gráfica

---

*Versión 1.0 — Septiembre 2026 | Pendiente: descargar RUT real para confirmar estado actual de responsabilidades.*
