# Estructura Contable — Borondo Tours SAS
**Versión:** 2.0  
**Fecha:** Septiembre 2026  
**Elaborado por:** Kiro (rol: contador / revisor fiscal — >10 años exp.)  
**Estado:** Borrador técnico para validación con contador público titulado  
**Alcance de esta versión:** 100% enfocado en **Borondo Tours SAS** (B2C + gestión de operadores como proveedores). Borondo Tech SAS y el modelo de cobro B2B a operadores quedan **pendientes** hasta constituir la segunda entidad.

---

## 0. Ficha de la Entidad y Decisiones Base

| Dato | Valor confirmado |
|---|---|
| Razón social | Borondo Tours SAS |
| Constitución | Cámara de Comercio de **Cali** ✅ |
| RNT (Registro Nacional de Turismo) | **Vigente** ✅ |
| Domicilio fiscal | Santiago de Cali (Valle del Cauca) |
| Cuenta bancaria operativa | **Bold** ✅ |
| Pasarela de pago | **OnePayla** (por integrar) |
| Facturación electrónica DIAN | **NO activa** — evaluar Siigo / Alegra / Factus |
| Contador | **No contratado aún** |
| Accionista | Único (persona natural), también dueño de la futura Borondo Tech |
| Moneda funcional | COP (la pasarela convierte cualquier divisa a COP) |

> ⚠️ **Corrección de contexto vs. v1.0:** Bold es la **cuenta bancaria** (no la pasarela). OnePayla es la **pasarela de pago**. El domicilio es **Cali** (no Bogotá) → el ICA se declara y paga en Cali.

---

### D1 — Norma Contable Aplicable

**Decisión: NIIF para PYMES — Grupo 2** (Decreto 3022 de 2013, compilado en Decreto 2420 de 2015).

Criterios de Grupo 2 (se cumplen todos hoy):
- No es emisor de valores en bolsa.
- No es entidad de interés público (no capta ahorro del público).
- Planta de personal entre 11 y 200 empleados, **o** activos totales entre 500 y 30.000 SMMLV.

Con SMMLV 2026 = **$1.750.905**, el techo del Grupo 2 es:
- 30.000 SMMLV ≈ **$52.527M COP** en activos.
- Mientras Borondo Tours esté por debajo de ese activo y de 200 empleados, es Grupo 2.

> Ver ampliación de NIIF Grupo 1 y cuándo migrar en el **Anexo A**.

---

### D2 — Régimen de Renta: Ordinario (NO Régimen Simple)

**Decisión: Régimen Ordinario de Renta.**

Razones por las que el **RST no conviene** a Borondo Tours:

1. **Base sobre ingresos brutos, no utilidad.** El RST cobra entre 1,8% y 14,5% sobre *ingresos brutos*. Como Borondo Tours (bajo NIIF 15) reconoce como ingreso bruto el **100% del valor del tour** (es principal, ver D6), tributaría sobre una base enorme frente a su margen real (la comisión). En Régimen Ordinario tributa sobre la **utilidad** (ingreso − costo del operador − gastos).

   > Ejemplo: viajero paga $1.000.000, comisión Borondo $200.000. En RST la base sería ~$1.000.000; en Ordinario, la renta se calcula sobre la utilidad después de restar el pago al operador.

2. **Exclusión por socios personas jurídicas.** Si entra un fondo/inversionista persona jurídica, la empresa queda excluida del RST automáticamente (Art. 905 ET). Para una startup que busca inversión, entrar al RST es un techo.

3. **Exención de IVA a extranjeros.** El manejo limpio de la exención (Decreto 297/2016) encaja mejor en el régimen ordinario con facturación electrónica y responsabilidad de IVA.

**Conclusión:** Régimen Ordinario + Responsable de IVA.

---

### D3 — IVA

**Borondo Tours es Responsable de IVA (antes "régimen común").**

- Toda SAS que preste servicios gravados es responsable de IVA desde el primer peso; el tope de 3.500 UVT es solo para personas naturales, no para sociedades.
- Servicios turísticos: **IVA 19%**.
- **Exención (0%) para turistas extranjeros no residentes** que consuman servicios turísticos en Colombia, soportado con pasaporte/tarjeta de ingreso (Art. 481 lit. e ET, Decreto 297/2016). Requiere conservar copia del pasaporte como soporte 5 años.
- Periodicidad de declaración de IVA: **bimestral** o **cuatrimestral** según ingresos del año anterior (bimestral para grandes; una startup nueva suele iniciar cuatrimestral salvo que supere topes). El contador define la periodicidad al inscribir responsabilidades en el RUT.
- Borondo Tours actúa como **agente de retención de IVA e ICA** cuando compra a ciertos proveedores.

---

### D4 — Reconocimiento de Ingresos NIIF 15: Borondo Tours es PRINCIPAL

Es la decisión contable más importante.

#### Análisis de control (NIIF 15, Sección 23 NIIF PYMES)

| Criterio de "principal" | ¿Aplica a Borondo Tours? |
|---|---|
| Responsable de cumplir la promesa al cliente | **Sí** — responde ante el viajero si el operador falla |
| Asume riesgo de inventario / incumplimiento | **Sí** — gestiona cancelaciones, reembolsos, garantías |
| Discreción para fijar el precio al viajero | **Sí** — define el precio final, aplica markup, Coins, descuentos |
| Controla el servicio antes de transferirlo | **Sí** — arma la reserva, manifiesto, coordina la operación |

**Conclusión: Borondo Tours actúa como PRINCIPAL.**

Consecuencias contables:
- **Ingreso bruto = 100% del valor del tour** vendido al viajero (cuenta 4105).
- **Costo de ventas = lo liquidado al operador** (cuenta 6105).
- **Margen bruto = comisión que retiene Borondo Tours** (`borondo_amount`).

**Fase 1 (hoy, sin split):** el viajero paga el 100% → llega a Borondo Tours (vía OnePayla → Bold) → Borondo Tours liquida al operador. Se reconoce ingreso bruto del 100% al prestarse el servicio.

**Fase 2 (con split payment):** aunque el dinero del operador le llegue directo, si Borondo Tours **sigue siendo principal** (responde ante el cliente), contablemente **se sigue reconociendo el ingreso bruto** y el pago al operador como costo. El split solo cambia el **flujo de caja**, no el reconocimiento contable. Solo cambiaría a "agente" (reconocer solo comisión) si contractualmente Borondo Tours deja de ser responsable frente al viajero.

> 📌 **Nota para el sistema:** `booking.total_price` = ingreso bruto (4105). `operator_amount` = costo (6105). `borondo_amount` = margen. Estos tres campos alimentan directamente los asientos.

---

### D5 — Borondo Coins: Pasivo por Contratos con Clientes

Bajo NIIF 15 (obligación de desempeño adicional), los Coins otorgados en una venta son un **derecho de descuento futuro material** → se difiere parte del ingreso.

**Tratamiento riguroso (el correcto bajo NIIF):**
Al vender un tour y otorgar Coins, se separa el precio de la transacción entre (a) el servicio prestado hoy y (b) los Coins (ingreso diferido hasta que se redimen o expiran).

**Tratamiento práctico inicial (aceptable para el volumen actual):**
Registrar los Coins otorgados como un **pasivo estimado** por su valor de redención esperado, contra un gasto de mercadeo/fidelización.

#### Cálculo del valor del pasivo (accionable)

```
Pasivo Coins = Σ (Coins en circulación) × (valor COP por Coin) × (tasa de redención esperada)
```

- **Valor COP por Coin:** definir la equivalencia oficial. Recomendación: **1 Coin = $1 COP** de descuento (simple, auditable, y evita confusión). Si el negocio ya usa otra equivalencia, ajustarla aquí.
- **Tasa de redención esperada (breakage):** sin historia, la industria de loyalty usa **60%–80%** de redención (20%–40% breakage). **Recomendación inicial: provisionar al 70%** de redención. A los 12 meses, recalcular con datos reales.
- **Ejemplo:** 5.000.000 Coins en circulación × $1 × 70% = **$3.500.000** de pasivo.

**Cuenta:** `2805 — Pasivo por contratos con clientes / Borondo Coins`.

> El % de Coins que se otorga por nivel de lealtad **debe ser menor que el ingreso publicitario** que financia el programa (regla de negocio ya definida en steering `05-business-rules`). Contablemente, el ingreso por publicidad (4115) debe superar el gasto/pasivo por Coins (6110/2805) — esto se vigila con un reporte mensual de margen del programa.

---

## 1. Plan Único de Cuentas (PUC) — Borondo Tours SAS

Base: Decreto 2650 de 1993, adaptado a NIIF PYMES. Las cuentas marcadas `(CR)` son de naturaleza crédito (correctoras del activo).

### CLASE 1 — ACTIVOS

```
11  DISPONIBLE
    1105  Caja
          110505  Caja general
          110510  Caja menor
    1110  Bancos
          111005  Bold — cuenta bancaria operativa principal
          111010  Cuenta recaudo OnePayla (dinero en tránsito de la pasarela)
          111015  Banco — cuenta para dispersión a operadores
    1120  Cuentas de ahorro

13  DEUDORES (CUENTAS POR COBRAR)
    1305  Clientes
          130505  Cartera viajeros (cotizaciones/reservas por cobrar)
    1330  Anticipos y avances
          133005  Anticipos a operadores turísticos
          133010  Anticipos a proveedores de servicios
    1355  Deudores varios
          135505  Empleados y colaboradores
          135510  OnePayla — pagos en proceso de dispersión
    1360  Cuentas por cobrar partes relacionadas
          136005  Borondo Tech SAS (cuando se constituya)   ← PENDIENTE
    1380  Deudas de difícil cobro
    1399  Provisión cuentas por cobrar (CR)

15  PROPIEDAD, PLANTA Y EQUIPO
    1524  Equipo de cómputo y comunicación
    1528  Equipo de oficina
    1592  Depreciación acumulada (CR)

16  INTANGIBLES
    1605  Licencias y software adquirido
    1698  Amortización acumulada (CR)

17  DIFERIDOS / OTROS ACTIVOS
    1705  Gastos pagados por anticipado
          170505  Seguros prepagados
          170510  Arrendamientos prepagados
          170515  Suscripciones SaaS pagadas por anticipado
    1710  Anticipo de impuestos y contribuciones
          171005  Retención en la fuente que nos practicaron (anticipo renta)
          171010  Anticipo de renta
          171020  Saldo a favor IVA
    1905  Depósitos en garantía
```

### CLASE 2 — PASIVOS

```
22  PROVEEDORES
    2205  Proveedores nacionales
          220505  Operadores turísticos por liquidar (payouts pendientes)
          220510  Proveedores de servicios generales

23  CUENTAS POR PAGAR
    2335  Costos y gastos por pagar
    2365  Retención en la fuente por pagar (renta)
          236505  Retefuente por servicios (4% / 6%)
          236510  Retefuente por honorarios (10% / 11%)
          236515  Retefuente por arrendamientos (3,5%)
          236525  Retefuente por compras (2,5%)
    2367  Retención de ICA por pagar (agente retenedor Cali)
    2368  Retención de IVA por pagar (ReteIVA)
    2370  IVA
          237005  IVA generado (débito fiscal — ventas 19%)
          237010  IVA descontable (crédito fiscal — compras/gastos)
    2380  Acreedores varios

25  OBLIGACIONES LABORALES
    2505  Salarios por pagar
    2510  Cesantías consolidadas
    2515  Intereses sobre cesantías
    2520  Prima de servicios
    2525  Vacaciones consolidadas
    2530  Aportes seguridad social por pagar (salud, pensión, ARL)
    2535  Aportes parafiscales (SENA, ICBF, Caja de Compensación)

24  IMPUESTOS, GRAVÁMENES Y TASAS
    2404  Impuesto de renta y complementarios por pagar
    2408  IVA por pagar (saldo neto del período)
    2412  Impuesto de Industria y Comercio (ICA Cali) por pagar

27  PASIVOS ESTIMADOS Y PROVISIONES / DIFERIDOS
    2705  Ingresos recibidos por anticipado
          270505  Reservas pagadas pendientes de prestar el servicio
          270510  Cotizaciones pagadas (Split Fare en curso)
    2710  Provisiones (litigios, contingencias)

28  OTROS PASIVOS
    2805  Pasivo por contratos con clientes — Borondo Coins
          280505  Coins en circulación (valor estimado de redención)
    2815  Depósitos recibidos en garantía
```

### CLASE 3 — PATRIMONIO

```
31  CAPITAL SOCIAL
    3115  Aportes sociales / capital suscrito y pagado (SAS)
32  PRIMA EN COLOCACIÓN
    3205  Prima en colocación de acciones (rondas de inversión futuras)
33  RESERVAS
    3305  Reserva legal (10% de utilidad neta hasta 50% del capital)
    3315  Reservas ocasionales / estatutarias
36  RESULTADOS DEL EJERCICIO
    3605  Utilidad del ejercicio
    3610  Pérdida del ejercicio (CR)
37  RESULTADOS DE EJERCICIOS ANTERIORES
    3705  Utilidades acumuladas
    3710  Pérdidas acumuladas (CR)
38  ADOPCIÓN POR PRIMERA VEZ (ORI)
    3805  Ganancias/pérdidas por adopción NIIF (transición)
```

### CLASE 4 — INGRESOS

```
41  OPERACIONALES
    4105  Ingresos por servicios turísticos (PRINCIPAL — 100% del tour)
          410505  Tours — residentes colombianos (IVA 19%)
          410510  Tours — extranjeros con pasaporte (IVA exento)
          410515  Tours propios Borondo Tours (Fase 2+)
    4110  Ingresos por comisión (solo si en algún caso opera como AGENTE puro)
    4115  Ingresos por publicidad en plataforma
          411505  Banners checkout / confirmación
          411510  Rewarded ads
    4130  Ingresos por penalidades de cancelación (retenidas por Borondo)
    4135  Otros ingresos operacionales (recargos, tarifas de servicio)
42  NO OPERACIONALES
    4210  Financieros (rendimientos, intereses ganados)
    4250  Recuperaciones
    4295  Diversos
```

### CLASE 5 — GASTOS (Administración y Ventas)

```
51  OPERACIONALES DE ADMINISTRACIÓN
    5105  Gastos de personal administrativo (sueldos + prestaciones + aportes)
    5110  Honorarios
          511005  Honorarios contador / outsourcing contable
          511006  Honorarios revisor fiscal
          511010  Honorarios legales
    5115  Impuestos
          511505  ICA Cali (gasto del período)
          511510  GMF (4×1000)
    5120  Arrendamientos (oficina / coworking)
    5125  Contribuciones y afiliaciones (RNT, gremios como ANATO)
    5130  Seguros
    5135  Servicios
          513505  Servicios públicos
          513510  Internet y comunicaciones
          513525  Software y suscripciones administrativas (ej. software contable)
    5140  Gastos legales (registro mercantil, notariado)
    5145  Mantenimiento y reparaciones
    5155  Gastos de viaje
    5160  Depreciaciones
    5165  Amortizaciones
    5195  Diversos
52  OPERACIONALES DE VENTAS
    5205  Gastos de personal de ventas (agentes internos + comisiones + prestaciones)
    5235  Servicios — marketing
          523505  Publicidad y pauta digital (Google, Meta)
          523510  Producción de contenidos / fotografía
          523515  Herramientas CRM y marketing
    5245  Gastos de viaje comercial / FAM trips
    5299  Provisión cartera incobrable
53  NO OPERACIONALES
    5305  Gastos financieros (intereses, comisiones bancarias Bold)
    5315  Gastos extraordinarios
    5395  Multas, sanciones (NO deducibles fiscalmente — marcar)
54  IMPUESTO DE RENTA
    5405  Impuesto de renta corriente
    5410  Impuesto diferido
```

### CLASE 6 — COSTOS DE VENTAS / PRESTACIÓN DEL SERVICIO

```
61  COSTO DE SERVICIOS TURÍSTICOS
    6105  Costo de tours — liquidación a operadores (modelo principal)
          610505  Pago a operadores por servicios prestados
          610510  Comisión de la pasarela OnePayla (% por transacción)
          610515  Porción del operador en Split Fare (Fase 2)
    6110  Costo del programa de lealtad (Coins otorgados)
    6115  Costo de cancelaciones y reembolsos
          611505  Reembolsos reales (retracto, fuerza mayor operador)
          611510  Chargebacks asumidos
    6120  Costo de adquisición (comisiones a agentes externos, referidos)
```

> **Nota:** Bajo NIIF PYMES muchas empresas de servicios manejan el "costo del servicio" en la Clase 6 o directamente en la Clase 7 (costos y gastos). Se usa Clase 6 aquí para separar claramente el **margen bruto** (ingreso − costo operador) del resto de gastos. El contador puede consolidarlo si lo prefiere.

---

## 2. Registros Contables Tipo (Asientos)

### 2.1 Venta a residente colombiano (Fase 1 — Borondo recibe 100%)

```
(a) Viajero paga (OnePayla → Bold). Servicio aún no prestado:
    Db  1110.111005  Bold                                 $1.190.000
        Cr  2705  Ingresos recibidos por anticipado                 $1.000.000
        Cr  2370.237005  IVA generado (19%)                           $190.000
    (Si OnePayla descuenta su comisión antes de dispersar, ver 2.4)

(b) Se presta el servicio (se ejecuta el tour):
    Db  2705  Ingresos recibidos por anticipado           $1.000.000
        Cr  4105.410505  Ingresos por tours                         $1.000.000

(c) Liquidación al operador (su parte; comisión Borondo = $200.000):
    Db  6105.610505  Costo de tours — operador              $800.000
        Cr  2205.220505  Operadores por liquidar                      $800.000

    Al pagar al operador:
    Db  2205.220505  Operadores por liquidar                $800.000
        Cr  1110  Bancos                                              $800.000
```
Margen bruto de la operación: $1.000.000 − $800.000 = **$200.000**.

### 2.2 Venta a extranjero (IVA exento)

```
(a) Pago:
    Db  1110.111005  Bold                                  $1.000.000
        Cr  2705  Ingresos recibidos por anticipado                 $1.000.000
    (IVA = 0 — Decreto 297/2016; conservar copia de pasaporte 5 años)

(b) Prestación:
    Db  2705                                                $1.000.000
        Cr  4105.410510  Tours extranjeros (exento)                 $1.000.000
```

### 2.3 Otorgamiento de Borondo Coins (provisión del pasivo)

```
Al otorgar Coins (ej. 1% de un tour de $500.000 = 5.000 Coins ≈ $5.000, al 70% redención = $3.500):
    Db  6110  Costo programa de lealtad                        $3.500
        Cr  2805.280505  Pasivo Borondo Coins                          $3.500

Al redimir Coins en una compra futura (descuento aplicado):
    Db  2805.280505  Pasivo Borondo Coins                      $3.500
        Cr  4105  Ingresos por tours (mayor ingreso reconocido)       $3.500
```

### 2.4 Comisión de la pasarela OnePayla

```
Si OnePayla retiene su comisión (ej. 2,99% + IVA) antes de dispersar:
    Db  6105.610510  Comisión OnePayla                          $29.900
    Db  2370.237010  IVA descontable                             $5.681
        Cr  1110.111010  Recaudo OnePayla                              $35.581
```

### 2.5 Cancelación con penalidad (franja 5–9 días: 60% penalidad, 40% Coins)

```
Reserva pagada $1.000.000 (en 2705), viajero cancela:
    Db  2705  Ingresos recibidos por anticipado           $1.000.000
        Cr  4130  Ingresos por penalidades (60%)                    $600.000
        Cr  2805  Pasivo Borondo Coins (40% devuelto en Coins)      $400.000
```

---

## 3. Retenciones — Borondo Tours como Agente Retenedor

Al ser sociedad, Borondo Tours **retiene en la fuente** cuando paga a sus proveedores. Tarifas más comunes (2026):

| Concepto | Base mínima (aprox.) | Tarifa retefuente | ReteICA Cali | ReteIVA |
|---|---|---|---|---|
| Servicios generales | 4 UVT | 4% (declarante) / 6% (no declarante) | según actividad | 15% del IVA si aplica |
| Honorarios/consultoría | 0 (desde $1) | 10% / 11% | — | 15% del IVA |
| Compra de bienes | 27 UVT | 2,5% | según actividad | — |
| Arrendamientos | 27 UVT | 3,5% | — | — |

- **Operadores turísticos:** al liquidarles, aplicar retefuente por servicios (4%/6% según si el operador es declarante de renta). Esto ya está contemplado en la lógica de `payouts` del sistema (retenciones sobre el bruto del operador).
- **ReteICA Cali:** Borondo Tours retiene ICA a proveedores ubicados/actuando en Cali según la actividad. La tarifa de servicios en Cali llega hasta **10×1.000**; el contador parametriza por actividad (Acuerdo distrital de Cali).
- **UVT 2026 = $52.374** (Resolución DIAN 000238/2025).

> Las retenciones practicadas se declaran y pagan **mensualmente** (formulario 350).

---

## 4. Facturación Electrónica — Comparativo de Proveedores

Borondo Tours **debe** emitir factura electrónica de venta con validación previa DIAN. Como el sistema ya contempla integración vía API (steering `02-tech-stack`), la elección debe priorizar **calidad de API** además de precio.

### 4.1 Comparativo funcional / costo / integración

| Criterio | **Siigo** | **Alegra** | **Factus** |
|---|---|---|---|
| Naturaleza | Software contable + FE completo (ERP) | Software contable + FE (nube, ágil) | **Proveedor tecnológico API-first** (solo FE) |
| Facturación electrónica DIAN | ✅ Completa | ✅ Completa | ✅ Completa |
| Contabilidad integrada (PUC, IVA, exógena) | ✅ Fuerte (nativo Colombia) | ✅ Buena | ❌ No es contable, solo emite documentos |
| Nómina electrónica | ✅ | ✅ (módulo) | ❌ |
| Documento soporte (proveedores no obligados) | ✅ | ✅ | ✅ |
| Nota crédito / débito | ✅ | ✅ | ✅ |
| API para integrar con la plataforma | ✅ (API Siigo) | ✅ (API robusta, buena doc) | ✅ **(su producto ES la API)** |
| Facilidad de integración técnica | Media | Media-Alta | **Alta** (pensada para devs) |
| Modelo de precio | Suscripción mensual por plan | Suscripción mensual + planes gratis limitados | **Por volumen de documentos / bolsas** (hay tier gratuito de prueba) |
| Ideal para | Llevar TODA la contabilidad + FE en un solo lugar | PYME que quiere contabilidad simple + FE | Emitir FE desde la plataforma propia, contabilidad aparte |
| Multiempresa (Tours + Tech futura) | ✅ (según plan) | ✅ | Bolsa multiempresa para empresas de software |

> ⚠️ **Nota sobre precios exactos:** las tarifas cambian con frecuencia y dependen de la categorización/plan. **No fijo cifras exactas aquí para no dejar datos desactualizados**; deben cotizarse directo con cada proveedor. Referencia pública de orden de magnitud (2026): APIs de FE tipo Factus/Plemsi parten desde ~$20.000 COP/mes en bolsas pequeñas; suites contables como Siigo/Alegra manejan planes mensuales más altos por incluir contabilidad completa.

### 4.2 Recomendación según arquitectura

Hay **dos decisiones independientes**: (1) quién lleva la contabilidad, (2) quién emite la factura electrónica desde la plataforma.

**Escenario recomendado (híbrido, óptimo para BorondoTours):**

- **Contabilidad + impuestos + exógena → Siigo** (o Alegra). Es lo que usará el contador. Siigo tiene la ventaja de estar ya mencionado en el roadmap técnico y ser el estándar contable colombiano.
- **Emisión de FE automática desde la plataforma (checkout) → Factus** por su API-first, o la propia API de Siigo/Alegra si se quiere todo en uno.

**Regla de decisión:**
- Si el equipo de dev quiere **la integración más rápida y barata por documento** para emitir la factura al confirmar el pago → **Factus**.
- Si se prefiere **un solo proveedor** para contabilidad + FE y menos piezas → **Siigo** (API) o **Alegra** (API).

**Mi recomendación:** empezar con **Siigo para contabilidad** (lo lleva el contador) y evaluar **Factus como capa de emisión API** conectada al checkout. Confirmar con el contador que se contrate, porque él operará la herramienta a diario.

---

## 5. Estructura de Revisoría Fiscal

### 5.1 ¿Borondo Tours está obligada a tener revisor fiscal?

Hay **dos posturas** vigentes en 2026 que debes conocer:

**Postura A — Por topes (Art. 203 C.Co. + Ley 43/1990, parágrafo 2 Art. 13):**
Obligatorio si al cierre del año anterior los **activos brutos ≥ 5.000 SMMLV** (≈ **$8.754M COP** con SMMLV 2026) **o** los **ingresos brutos ≥ 3.000 SMMLV** (≈ **$5.252M COP**). Si Borondo Tours está por debajo de ambos, bajo esta postura **no** estaría obligada aún.

**Postura B — Toda sociedad por acciones:**
El Art. 203 del Código de Comercio señala que **las sociedades por acciones** deben tener revisor fiscal. Como la **SAS es una sociedad por acciones**, hay doctrina (y fuentes como Gerencie.com) que sostienen que **toda SAS estaría obligada**, independientemente de topes. Este punto ha sido debatido; parte de la doctrina y la Supersociedades han matizado que para la SAS priman los topes de la Ley 43/1990 salvo que los estatutos lo exijan.

> **Recomendación prudente (revisor fiscal experimentado):** No dejar el punto al azar. Aunque por topes hoy podrías no estar obligada, **la ambigüedad legal + la búsqueda de inversión** hacen recomendable **nombrar revisor fiscal desde ya** (o al menos dejar previsto en estatutos). Un inversionista serio lo exigirá en due diligence. Costo-beneficio favorable.

### 5.2 Diferencia contador vs. revisor fiscal (no son lo mismo)

| | **Contador** | **Revisor Fiscal** |
|---|---|---|
| Función | Prepara y lleva la contabilidad | **Fiscaliza y dictamina** la contabilidad (control independiente) |
| Relación | Puede ser empleado o outsourcing | **Independiente** — no puede ser el mismo contador que lleva los libros |
| Nombramiento | Gerencia | **Asamblea de accionistas**, inscrito en Cámara de Comercio |
| Responsabilidad | Elaborar información | Dictaminar EE.FF., reportar irregularidades a la DIAN/Supersociedades |
| Firma | Firma EE.FF. como preparador | **Dictamina** EE.FF. (opinión de auditoría) |

> ⚠️ **Incompatibilidad clave:** la persona/firma que lleva la contabilidad **NO** puede ser el revisor fiscal de la misma empresa. Son roles independientes por diseño.

### 5.3 Plan de implementación de revisoría fiscal (base funcional)

**Paso 1 — Nombramiento (cuando aplique/se decida):**
- Revisor fiscal **principal + suplente** (ambos Contadores Públicos con tarjeta profesional vigente).
- Nombrados por la **asamblea de accionistas**, acta e inscripción en Cámara de Comercio de Cali.
- Puede ser una **firma de revisoría** (recomendado para startups: más barato que un RF dedicado y da respaldo).

**Paso 2 — Alcance del trabajo del RF (mínimo):**
- Dictamen anual sobre los estados financieros.
- Revisión del cumplimiento tributario (IVA, retenciones, renta, ICA, exógena).
- Verificación del control interno sobre el recaudo (OnePayla → Bold), liquidaciones a operadores y pasivo de Coins.
- Revisión de que la exención de IVA a extranjeros esté correctamente soportada.
- Reporte de hallazgos a la administración.

**Paso 3 — Honorarios estimados (referencia de mercado 2026):**
- Firma de revisoría para PYME/startup: rango típico **$500.000 – $2.000.000 COP/mes** según volumen de transacciones y periodicidad de visitas. Cuenta 511006.

**Paso 4 — Papeles de trabajo y periodicidad:**
- Visitas mensuales o trimestrales según volumen.
- Actas de revisoría, pruebas selectivas, conciliaciones bancarias Bold vs. libros, arqueo del pasivo de Coins.

---

## 6. Estados Financieros y Obligaciones (Calendario)

### 6.1 Estados financieros (NIIF PYMES)
1. Estado de Situación Financiera (Balance).
2. Estado de Resultados Integral.
3. Estado de Cambios en el Patrimonio.
4. Estado de Flujos de Efectivo (método directo recomendado).
5. Notas (revelaciones NIIF PYMES).

Frecuencia: balance de prueba **mensual**; EE.FF. completos **trimestral** (gerencial); EE.FF. dictaminados **anual**.

### 6.2 Calendario tributario Borondo Tours

| Obligación | Frecuencia | Autoridad |
|---|---|---|
| IVA (formulario 300) | Bimestral o cuatrimestral (según ingresos) | DIAN |
| Retención en la fuente (formulario 350) | **Mensual** | DIAN |
| Renta personas jurídicas (formulario 110) | **Anual** | DIAN |
| Información exógena (medios magnéticos) | Anual (abr–jun) | DIAN |
| ICA + ReteICA | Según calendario de **Cali** | Alcaldía de Cali |
| Factura electrónica | Por cada venta (tiempo real) | DIAN |
| RNT — renovación | **Anual** (ene–mar) | MinCIT |

> **Alerta operativa:** el RNT se renueva cada año entre enero y marzo; no renovarlo suspende la operación turística legal. Agendar recordatorio.

---

## 7. Checklist de Acciones (Borondo Tours)

### 🔴 ALTA (0–30 días)
- [ ] **Contratar contador** (outsourcing contable). Es el primer paso — sin él, lo demás no opera.
- [ ] Verificar responsabilidades en el **RUT** (responsable de IVA, retención en la fuente, renta) y actividad económica (CIIU 7911/7912 agencias de viajes).
- [ ] **Activar facturación electrónica DIAN** — decidir proveedor (recomendado: Siigo contabilidad + evaluar Factus API para el checkout).
- [ ] Configurar el **PUC** de este documento en el software contable elegido.
- [ ] Definir la **equivalencia oficial del Borondo Coin** (recomendado 1 Coin = $1 COP) y registrar el pasivo inicial (cuenta 2805) con los Coins ya otorgados.
- [ ] Conciliar la cuenta **Bold** y la cuenta de recaudo **OnePayla** en el PUC.

### 🟡 MEDIA (30–90 días)
- [ ] Decidir y, si aplica, **nombrar revisor fiscal** (asamblea + inscripción en CC Cali). Recomendado contratar firma de revisoría.
- [ ] Parametrizar **retenciones** (retefuente, ReteICA Cali, ReteIVA) para pagos a operadores y proveedores.
- [ ] Definir la **periodicidad de IVA** con el contador.
- [ ] Establecer el reporte mensual de **margen del programa de Coins** (ingreso publicidad vs. costo Coins).
- [ ] Documentar el soporte de **exención de IVA a extranjeros** (flujo de guardado del pasaporte 5 años).

### 🟢 BAJA / PENDIENTE (depende de Borondo Tech)
- [ ] **[PENDIENTE]** Estructura contable de **Borondo Tech SAS** (cuando se constituya).
- [ ] **[PENDIENTE]** Contrato intercompany y precios de transferencia Tours ↔ Tech.
- [ ] **[PENDIENTE]** Modelo de cobro B2B de la plataforma a los operadores.
- [ ] Evaluar migración a **NIIF Grupo 1** si entra inversión grande (ver Anexo A).

---

## Anexo A — NIIF Grupo 1 (ampliación)

**¿Qué es el Grupo 1?** Es el marco de **NIIF Plenas** (las NIIF "completas" del IASB, no la versión PYMES). Aplica a las empresas más grandes o de interés público.

### ¿Quién pertenece al Grupo 1?
1. **Emisores de valores** (inscritos en el Registro Nacional de Valores y Emisores — cotizan en bolsa).
2. **Entidades de interés público** (captan/administran ahorro del público: bancos, aseguradoras, etc.).
3. Empresas grandes que cumplen **todos** estos criterios:
   - Planta de personal **> 200 empleados**, **y/o**
   - Activos totales **> 30.000 SMMLV** (≈ $52.527M COP en 2026), **y**
   - Que además cumplan condiciones de ser subordinada/matriz de un grupo que aplique Plenas, o realizar operaciones en el extranjero, importaciones/exportaciones significativas, etc.

### Diferencias clave Grupo 1 (Plenas) vs. Grupo 2 (PYMES)

| Tema | Grupo 2 (PYMES) — **aplica hoy** | Grupo 1 (Plenas) |
|---|---|---|
| Norma | NIIF para PYMES (1 solo libro, ~35 secciones) | Set completo NIIF/IAS + interpretaciones |
| Ingresos | Sección 23 | NIIF 15 completa (5 pasos detallados) |
| Arrendamientos | Operativo/financiero (simple) | **NIIF 16** (todo al balance como derecho de uso) |
| Instrumentos financieros | Secciones 11–12 (simplificado) | NIIF 9 (deterioro esperado, más complejo) |
| Impuesto diferido | Requerido pero simplificado | Completo |
| Costo de cumplimiento | **Bajo** | **Alto** (más revelaciones, más trabajo) |

### ¿Cuándo le conviene a Borondo Tours pasar a Grupo 1?
- **No conviene voluntariamente** en etapa temprana: más costo, más complejidad, sin beneficio.
- **Se vuelve obligatorio** si: supera los topes (200 empleados / 30.000 SMMLV activos con las demás condiciones), capta ahorro del público, o emite valores.
- **Escenario realista:** si Borondo Tours hace una ronda de inversión grande con un fondo que consolida bajo NIIF Plenas, o si crece hasta superar los topes, deberá migrar. **Revisar anualmente** con el revisor fiscal.

> Para una startup que busca inversión pero aún no cotiza ni capta ahorro público, **Grupo 2 es lo correcto**. Migrar a Grupo 1 antes de tiempo es un gasto innecesario.

---

## Anexo B — Notas y Advertencias

> ⚠️ Este documento es una **guía técnica** con criterios contables y fiscales colombianos vigentes a septiembre 2026. **No reemplaza** la asesoría de un Contador Público titulado ni el dictamen de un Revisor Fiscal. Debe ser **validado y firmado** por el profesional que se contrate antes de operar.

> 📌 Cifras de UVT ($52.374), SMMLV ($1.750.905) y tarifas son de referencia 2026 y deben confirmarse cada año (la DIAN publica la UVT en diciembre).

> 🔄 **Documento vivo.** Actualizar cuando: se contrate contador/RF, se active la FE, se constituya Borondo Tech, se active el split payment, o cambien tarifas/UVT.

**Pendientes explícitos (fuera de alcance de esta v2.0):**
- Estructura contable de **Borondo Tech SAS**.
- Modelo de cobro **B2B a operadores** vía la plataforma.
- Precios de transferencia intercompany.

---

*Versión 2.0 — Septiembre 2026 | Enfocada en Borondo Tours SAS | Próxima revisión: al contratar contador*
