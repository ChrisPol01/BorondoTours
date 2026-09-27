# 🤝 Handoff — Estructura y Operación Contable de Borondo Tours SAS

> Documento de traspaso para continuar el trabajo contable/fiscal de **Borondo Tours SAS**.
> Léelo completo antes de tocar nada. Al final hay una lista clara de qué sigue.
>
> **Rol de trabajo:** el CEO (Christopher) + el asistente operan las finanzas. El contador externo
> solo revisa y firma. La meta es estar **por encima y más preparados que el contador**.

---

## 1. Contexto del negocio

- **Borondo Tours SAS** — agencia/operador turístico en Cali. Marketplace B2C de tours en Colombia
  (los viajeros descubren, reservan y pagan tours de operadores locales).
- La plataforma es serverless en AWS (Lambda). Documentada en el vault de Obsidian del repo.
- **Borondo Tech SAS NO está constituida todavía** → **todo el trabajo contable se enfoca 100% en Borondo Tours**.
  La estructura de dos entidades (Tours + Tech) queda diferida hasta que Tech exista.
- Los **operadores turísticos son proveedores** de Borondo Tours (el portal B2B es trabajo futuro).

---

## 2. Datos fiscales confirmados (del RUT oficial)

> Fuente: archivo "RUT Borondo Tours.pdf" en Drive (Unidad compartida "Agencia BorondoTours",
> Drive file ID `183CUWDcmf9Mt7GQe4nYkRhtUrZ6xe7i2`). **Ya leído y verificado.**

| Dato | Valor |
|---|---|
| Razón social | BORONDOTOURS S.A.S. |
| **NIT** | **902.080.308** · **DV = 5** (confirmado por el RUT, no 7 como se dijo al inicio) |
| **Último dígito para calendario DIAN** | **8** (el número base termina en 8) |
| Correo del RUT | BORONDO.TOURS01@GMAIL.COM |
| Correo de trabajo del CEO | christopher.epe@borondotours.com |
| Domicilio / seccional | Santiago de Cali (Impuestos de Cali) |
| Dirección | CR 29 B 41-53 |
| Constitución | 18-06-2026 · matrícula 00012903 48 |
| CIIU principal | **7911** (agencias de viaje) |
| CIIU secundarios | **7912** (operadores turísticos), **7990** (otros servicios de reservas) |
| Rep. legal principal | EPE EPE CHRISTOPHER — CC 1.192.780.137 |
| Rep. legal suplente | SALCEDO MOLINA ANGIE NATHALIA — CC 1.005.874.591 |

### Responsabilidades marcadas en el RUT (casilla 53)
`05` renta · `07` retefuente · `14` exógena · `33` INC · `42` contabilidad · `48` IVA

- ⚠️ **Código 33 (Impuesto Nacional al Consumo) está MAL** — Borondo Tours no vende
  comida/bebida en establecimiento propio. **Hay que quitarlo.** (Lo puso la propia DIAN al constituir.)
- ⚠️ **FALTA el código 52 (facturador electrónico)** — se debe agregar cuando se habilite la
  facturación electrónica.

### Parámetros fiscales 2026 (para cálculos)
- UVT 2026: **$52.374**
- SMMLV 2026: **$1.750.905**
- Sanción mínima (10 UVT): **$523.740**
- Calendario tributario: Decreto 2229/2023.

---

## 3. Decisiones contables tomadas (y por qué)

| Tema | Decisión | Razón |
|---|---|---|
| Régimen de renta | **Ordinario** (NO Régimen Simple/RST) | El RST grava ingresos brutos — pésimo para un marketplace que factura el 100% del tour. Además el RST excluye empresas con socios personas jurídicas, lo que bloquearía una futura ronda de inversión. |
| Norma contable | **NIIF para PYMES — Grupo 2** | Cumple criterios (< 30.000 SMMLV en activos, < 200 empleados). Grupo 1 solo si crece o capta inversión grande (hay un Anexo A en Estructura-Contable con la ruta a Grupo 1). |
| Modelo de ingreso (NIIF 15) | **Borondo Tours es PRINCIPAL, no agente** | Controla la reserva, asume riesgo ante el viajero y fija el precio final. → reconoce **ingreso bruto 100%** + **costo del operador**. (No reconoce solo la comisión). Regla ya escrita en el steering `05-business-rules.md`. |
| Borondo Coins | **Pasivo (cuenta 2805)** | Recomendación: 1 Coin = $1 COP; provisionar al **70% de redención** (30% de breakage estimado). |
| Facturación electrónica | **Híbrido Siigo (contabilidad) + Factus (API de emisión)**; Alegra como alternativa | Aún NO hay proveedor contratado — decisión final pendiente. |
| Revisor fiscal | **Recomendado nombrarlo ya** | Ambigüedad legal 2026 sobre si toda SAS está obligada + lo exige el due diligence de inversión. |
| FONTUR | **Aplica: 2,5 por mil sobre ingresos turísticos, trimestral** | Hallazgo del archivo CIIU del cliente. Obligación real de agencias/operadores. |

---

## 4. Entregables ya creados

Todos en `c:\Users\Administrador\BorondoTours\.obsidian\docs\03-Knowledge\`:

| Archivo | Contenido |
|---|---|
| `Estructura-Contable.md` (v2.0) | PUC completo de Borondo Tours, régimen, NIIF, tratamiento de Coins, revisoría fiscal, Anexo A (ruta a NIIF Grupo 1). |
| `Pipeline-Facturacion-y-Declaracion.md` (v1.0) | Flujo de factura con validación previa DIAN, CUFE, calendario por dígito 8, arquitectura Lambda `invoice-emitter`. |
| `Guia-Tramites-DIAN.md` (v1.0) | Paso a paso: RUT, firma electrónica (IFE), habilitación como facturador, resolución de numeración. |
| `Manual-Operacion-Contable.md` (v1.0) | Operación diaria, ciclo de caja con asientos, proveedores/documento soporte, las 10 obligaciones (incl. FONTUR), automatización, división de tareas nosotros/contador. |

Steering actualizado: `c:\Users\Administrador\BorondoTours\.kiro\steering\05-business-rules.md`
(sección "Reconocimiento de Ingresos — NIIF 15 Principal vs Agente").

> ✅ El **DV del NIT ya fue corregido a 5** en todos los documentos (antes decía 7 por un error inicial del CEO).

---

## 5. Las 10 obligaciones tributarias (resumen — detalle en Manual-Operacion-Contable.md)

Fechas calculadas para **último dígito de NIT = 8**:

| # | Obligación | Frecuencia | Fecha aprox. (dígito 8) |
|---|---|---|---|
| 1 | Retención en la fuente | Mensual | ~día 22–24 del mes siguiente |
| 2 | IVA | Bimestral | ~11 mar / 13 may / 9 jul / 9 sep / 11 nov |
| 3 | Renta personas jurídicas | Anual | ~22–25 mayo (desde 2027, sobre AG 2026) |
| 4 | FONTUR (2,5 × mil turístico) | Trimestral | abr / jul / oct / ene |
| 5 | Información exógena | Anual | según resolución DIAN |
| 6 | ICA Cali | Bimestral/anual | según calendario distrital de Cali |
| 7 | Avisos y tableros | Anual (con ICA) | con la declaración de ICA |
| 8 | Retención ICA (si aplica) | según Cali | — |
| 9 | Aportes seguridad social (si hay nómina) | Mensual | según PILA |
| 10 | Auto-retención especial de renta (si aplica) | Mensual | con retención |

---

## 6. 🚧 Bloqueos y pendientes

### Bloqueo activo: trámite del RUT en la DIAN
- El **representante legal no está habilitado en línea** en el portal MUISCA, y el RUT de la empresa
  aparece incompleto ("adjuntar documentos pendiente").
- Se intentó por Playwright y manualmente ("a nombre propio" y "a nombre de un tercero") — **no permite** actualizar.
- **Solución real:** cita presencial en la DIAN Cali (o PQRS) para: (a) habilitar al rep. legal,
  (b) completar el RUT de la empresa, (c) **quitar código 33**, (d) **agregar código 52**.
- ✋ **Acuerdo con el cliente:** dejar este trámite como PENDIENTE y **simular que el RUT ya está resuelto**
  para poder avanzar con la estructura y operación contable. Cuando el CEO resuelva el RUT, se levanta el pendiente.

### Pendientes de dato (para que la operación quede exacta)
- [ ] **Tarifa exacta de ICA Cali para CIIU 7911** (buscar en acuerdo municipal de Cali).
- [ ] **Capital social suscrito y pagado** (de los estatutos de la SAS) — necesario para el balance de apertura.
- [ ] **Movimientos reales desde el 18-06-2026** (aportes, gastos de constitución, compras, primeras ventas).
- [ ] Confirmar **inscripción en FONTUR**.
- [ ] **Equivalencia oficial del Borondo Coin** en COP (se recomendó 1:1).
- [ ] **Decisión final del proveedor de facturación electrónica** (Siigo+Factus vs Alegra).
- [ ] Confirmar si se **nombra revisor fiscal** ya.

---

## 7. ▶️ Próximo paso (3 opciones ofrecidas al cliente)

El asistente propuso arrancar por la **opción 1** porque no depende de más datos y cubre el mayor riesgo:

1. **Automatización de recordatorios tributarios** — calendario con las 10 obligaciones y fechas por
   dígito 8, en Google Calendar (vía MCP) o como definición para AWS EventBridge. Evita la sanción mínima.
2. **Balance de apertura** — requiere capital social + movimientos desde 18-06-2026 (ver pendientes).
3. **Tarifa exacta de ICA Cali CIIU 7911** — dato puntual para cerrar el cálculo del ICA.

> El cliente aún no eligió cuál de las 3 seguir. **Empezar preguntándole eso**, o proceder con la 1
> si quiere avanzar sin bloqueos.

---

## 8. Notas técnicas / entorno

- **Vault de docs contables:** `c:\Users\Administrador\BorondoTours\.obsidian\docs\03-Knowledge\`
  (ruta canónica). Ojo: existe una copia paralela bajo `.kiro/steering/.obsidian/docs/...` —
  **la fuente de verdad es la de `.obsidian/docs/`**, no la de steering.
- **Google Workspace MCP:** usuario `christopher.epe@borondotours.com`. Proyecto Google Cloud
  **borondoTours (610031470722)**. Drive API ya habilitada. El scope `drive.file` limita qué archivos ve el MCP.
- **Drive — Unidad compartida "Agencia BorondoTours"** (ID `0AAcjQcU90-DLUk9PVA`):
  - "RUT Borondo Tours.pdf" (`183CUWDcmf9Mt7GQe4nYkRhtUrZ6xe7i2`) — ✅ leído.
  - "CIIU Agencia BorondoTours.xlsx" (`11AFRISa7nXhaQIYszW68wiajiaX06_9w`) — ✅ leído (confirma FONTUR e IVA turismo).
  - "PROVEEDORES TOURS.xlsx" (`12y9889uRm9AhqVaBFwP5Ap_pbzimL-ec`) — ⬜ NO leído aún (útil para el módulo de proveedores).
  - "RUT GRUPO GLOBAL ACTUALIZADO.pdf" (`1ntPqn7BbqMMciV-pKH4om_ayhKpjf6GE`) — otra entidad, NO investigada.
- **Playwright NO puede operar el portal DIAN** (corre en sesión separada sin las credenciales del CEO).
- Banco: **Bold**. Pasarela de pago: **OnePayla** (Bold = banco, OnePayla = pasarela — no confundir).
- La firma del CEO en **PNG NO sirve** para la DIAN — se necesita **Instrumento de Firma Electrónica (IFE)**
  generado en el portal.

---

## 9. Cómo continuar (para la compañera)

1. Lee los 4 documentos de la sección 4 (son la base completa).
2. Pregúntale al CEO cuál de las 3 opciones de la sección 7 seguir (o arranca por la 1).
3. Ve completando los "pendientes de dato" de la sección 6 a medida que el CEO los aporte.
4. Mantén la regla de oro: **nosotros operamos, el contador revisa y firma** — dejar todo documentado
   y calculado para que el contador solo valide.
5. No borres el bloqueo del RUT: cuando el CEO confirme que lo resolvió presencialmente, actualiza
   la sección 6 y agrega el código 52 / quita el 33 en la doc.
