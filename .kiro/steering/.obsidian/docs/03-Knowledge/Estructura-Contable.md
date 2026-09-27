# Estructura Contable — Grupo Borondo
**Versión:** 1.0  
**Fecha:** Agosto 2026  
**Elaborado por:** Kiro (revisión contable y fiscal)  
**Estado:** Borrador para validación con contador externo

---

## 0. Contexto y Decisiones Base

Antes del PUC, se resuelven los 8 puntos abiertos. Estas decisiones son **vinculantes** para toda la arquitectura contable.

---

### D1 — Estructura Jurídica del Grupo

**Situación actual:** Solo existe **Borondo Tours SAS** (NIT activo, RNT vigente).  
**Objetivo:** Crear **Borondo Tech SAS** como segunda persona jurídica independiente.

**Decisión: Constituir Borondo Tech SAS de inmediato.**

Razones:
- Separar el riesgo operativo del negocio turístico del negocio tecnológico.
- Permitir que Borondo Tech facture a operadores externos y a Borondo Tours de forma independiente.
- Facilitar rondas de inversión futuras diferenciadas (un inversionista puede entrar solo en Tech, otro solo en Tours).
- Permite estructurar precios de transferencia de forma transparente desde el inicio (es mucho más costoso hacerlo retroactivo).

**Pasos para constituir Borondo Tech SAS:**
1. Redactar acta de constitución + estatutos (puede ser documento privado si el capital < 500 SMMLV).
2. Inscribir en Cámara de Comercio → obtener NIT.
3. Inscribir en RUT en la DIAN.
4. Abrir cuenta bancaria empresarial.
5. Firmar contrato de servicios tecnológicos entre Borondo Tech → Borondo Tours (ver D2).
6. **Costo estimado:** ~$150.000–$300.000 COP (derechos de inscripción CCB).

---

### D2 — Relación Intercompany Tours ↔ Tech

**Situación:** Mismo accionista único controla ambas. Borondo Tech proveerá el software de la plataforma.

**Decisión: Contrato de licencia + servicios administrados entre partes vinculadas.**

El contrato debe documentar:
- **Objeto:** Licencia de uso del software BorondoTours + hosting AWS + soporte técnico.
- **Modelo de precio:** Fee mensual fijo (recomendado en etapa inicial) + variable por transacción (cuando haya volumen).
  - Ejemplo Fase 1: Borondo Tours paga a Borondo Tech $X/mes fijo por la plataforma.
  - Ejemplo Fase 2+: $X fijo + 1%–2% sobre GMV (volumen bruto de reservas) cuando supere umbral.
- **Facturación de Tech a operadores:** Fee mensual o por porcentaje de ventas procesadas. Modelo recomendado: `$50.000–$150.000/mes por operador activo` (según tamaño).
- **Precio de transferencia:** Debe ser "precio de pleno mercado" (arm's length). Documentarlo con comparables de mercado (AWS costs + margen razonable). Cuando los ingresos anuales del grupo superen ~$5.000M COP, puede aplicar documentación formal de precios de transferencia (Art. 260-3 ET). Prepararse desde ahora.

> ⚠️ **Riesgo fiscal a evitar:** Si Borondo Tech le cobra a Borondo Tours montos desproporcionados que erosionen la base gravable de Tours, la DIAN puede objetar las deducciones. Mantener documentación de soporte.

---

### D3 — Régimen Fiscal

#### Borondo Tours SAS

**Decisión: Régimen Ordinario de Renta (no RST).**

Razones por las que el RST **no es conveniente** para Borondo Tours:
- El RST aplica tarifa sobre **ingresos brutos** (1.8%–14.5%). En una agencia de viajes que en la fase de arranque recibe el 100% del pago del viajero (incluyendo lo que pertenece al operador), la base gravable del RST sería artificialmente gigante frente al margen real.
- Ejemplo: Si el viajero paga $1.000.000 y la comisión de Borondo Tours es $200.000, en RST tributaría sobre $1.000.000. En Régimen Ordinario, tributa solo sobre su utilidad real.
- El RST no permite aplicar la exención de IVA para turistas extranjeros de forma limpia.
- El RST **excluye expresamente** a empresas cuyos socios sean personas jurídicas. Si en el futuro entra un fondo de inversión (persona jurídica), sale automáticamente del RST. Mejor no entrar.

**Declaraciones anuales:** Renta + CREE (si aplica). Anticipos bimestrales de ICA si factura en Bogotá.

#### Borondo Tech SAS

**Decisión: Evaluar RST al constituirse, con preferencia por Régimen Ordinario.**

Borondo Tech prestará servicios de tecnología con costos AWS altamente deducibles (opex). En Régimen Ordinario puede deducir esos costos y tributar solo sobre la utilidad. El RST no permite esto.  
**Recomendación: Régimen Ordinario también para Borondo Tech.**

---

### D4 — IVA

**Borondo Tours:** Responsable de IVA (Régimen Común).

Toda sociedad comercial es responsable de IVA desde el primer peso si sus actividades están gravadas. Los servicios turísticos están gravados con **IVA 19%**, salvo la exención para extranjeros (Decreto 297/2016 — Art. 481 ET, literal e).

Obligaciones:
- Declarar y pagar IVA bimestralmente (si ingresos < 92.000 UVT) o bimestralmente.
- Factura electrónica obligatoria (Resolución DIAN).
- Retener IVA cuando aplique (agente retenedor).

**Borondo Tech:** Responsable de IVA. Los servicios de software/tecnología están gravados con IVA 19%.

---

### D5 — Norma Contable Aplicable

**Decisión: NIIF para PYMES — Grupo 2 (Decreto 3022 de 2013, compilado en Decreto 2420 de 2015).**

Criterios para Grupo 2 (todos se cumplen actualmente):
- No son emisores de valores en bolsa.
- Activos totales < 30.000 SMMLV (~$43.500M COP en 2026).
- Empleados < 200.
- No son entidades de interés público.

Esto aplica para **ambas entidades**. Las NIIF PYMES son significativamente más simples que las plenas pero permiten presentar estados financieros comparables internacionalmente (útil para inversionistas).

**Nota de evolución:** Si alguna entidad supera los 30.000 SMMLV en activos o incorpora un socio que sea emisor de valores, debe migrar al Grupo 1 (NIIF plenas). Revisar anualmente.

---

### D6 — Borondo Coins: Tratamiento Contable

**Análisis:**

Los Borondo Coins son compromisos de descuento futuro sobre servicios. Bajo NIIF 15 (Sección 23 en NIIF PYMES), cuando se vende un tour y se otorgan Coins, existe una **obligación de desempeño adicional** (el descuento futuro) que debe separarse del ingreso principal.

**Decisión: Reconocer los Coins como Pasivo por Contratos con Clientes.**

**Mecánica contable:**

Al otorgar Coins en una venta:
```
Débito:  Ingresos por tours (reducción del ingreso reconocido)     $X
Crédito: Pasivo — Obligaciones por Borondo Coins (2805)            $X
```

Al redimir Coins en una compra posterior:
```
Débito:  Pasivo — Obligaciones por Borondo Coins (2805)            $X
Crédito: Ingresos por tours (se reconoce el ingreso diferido)      $X
```

**Valor del Coin para registro contable:**
- Usar el "precio de venta independiente" relativo: si el Coin representa un 1% de descuento sobre la venta futura esperada, el pasivo es = (valor de Coins otorgados × % de redención esperada × precio promedio de tour).
- Simplificación inicial (startup): registrar como pasivo el **valor nominal del descuento comprometido** (monto en COP que el cliente podría redimir).
- Revisión anual: ajustar por tasa de caducidad estimada (churn de Coins no redimidos). Los Coins no caducan, pero hay una tasa histórica de no-uso — cuando haya datos (12 meses), calcularla.

**Cuenta sugerida:** `2805 — Pasivo por contratos con clientes / Borondo Coins`

---

### D7 — Modelo de Ingresos NIIF 15: Principal vs. Agente

Esta es la decisión contable más importante para Borondo Tours.

**Situación actual (Fase 1 — sin Split Payment):**  
Borondo Tours recibe el 100% del pago del viajero. Luego liquida al operador.

**Situación futura (Fase 2 — con Split Payment):**  
El pago se divide en origen: comisión llega directamente a Borondo Tours, el resto al operador.

#### Análisis NIIF 15 — ¿Principal o Agente?

| Criterio | Borondo Tours |
|---|---|
| ¿Controla el servicio antes de transferirlo al cliente? | **Parcialmente sí** — gestiona la reserva, manifiesto, garantías de cancelación |
| ¿Asume el riesgo de incumplimiento del operador? | **Sí** — si el operador no cumple, Borondo Tours responde ante el viajero |
| ¿Tiene discreción para fijar el precio final al viajero? | **Sí** — puede modificar el precio sobre el base del operador |
| ¿Es responsable de la calidad del servicio? | **Sí** — como plataforma gestionada, no solo intermediaria |

**Conclusión: Borondo Tours actúa como PRINCIPAL (no como agente puro).**

Esto significa:
- **Ingreso bruto:** Se reconoce el 100% del valor del tour vendido al viajero como ingreso.
- **Costo del tour:** El pago al operador (neto de comisión) se registra como **costo de ventas / costo de servicios prestados**.
- Impacto: el P&L muestra ingresos brutos altos y un costo de ventas equivalente. El margen bruto = comisión de Borondo Tours.

**Excepción cuando Borondo Tours sea agente puro** (en el futuro, si así se acuerda contractualmente con algún operador específico): solo se reconoce la comisión como ingreso. Documentar en el contrato con el operador cuál modelo aplica para cada caso.

> 📌 **Nota para el sistema:** El campo `borondo_amount` en la base de datos representa la comisión que retiene Borondo Tours. El ingreso contable BRUTO es `operator_price + borondo_amount` cuando actúa como principal.

---

## 1. Plan Único de Cuentas (PUC) Adaptado

Base: Decreto 2650 de 1993 (PUC Colombia), adaptado para NIIF PYMES.

---

### 1.1 PUC — BORONDO TOURS SAS
*(Agencia de viajes / Marketplace turístico gestionado)*

#### CLASE 1 — ACTIVOS

```
11  DISPONIBLE
    1105  Caja
          110505  Caja general
          110510  Caja menor
    1110  Bancos (cuentas corrientes y de ahorro)
          111005  Bancolombia — CTA corriente operativa
          111010  Bancolombia — CTA recaudo Onepayla
          111015  [Banco futuro — dispersión operadores]
    1120  Cuentas de ahorro

12  INVERSIONES (no aplica Fase 1 — reservado)

13  DEUDORES
    1305  Clientes (viajeros — cartera por cobrar)
          130505  Cartera viajeros — pagos pendientes
          130510  Anticipo reservas pendientes de confirmar
    1330  Anticipos y avances
          133005  Anticipo a operadores turísticos
          133010  Anticipo a proveedores de servicios
    1355  Deudores varios
          135505  Empleados y colaboradores
    1360  Cuentas por cobrar — partes relacionadas
          136005  Borondo Tech SAS (intercompany)
    1380  Deudas de difícil cobro
    1399  Provisión deudores (CR)

14  INVENTARIOS (no aplica — servicios)

15  PROPIEDADES, PLANTA Y EQUIPO
    1504  Equipo de computación y comunicación
          150405  Computadores y portátiles
          150410  Equipos de oficina
    1592  Depreciación acumulada (CR)

16  INTANGIBLES
    1605  Software adquirido / licencias
    1698  Amortización acumulada intangibles (CR)

17  DIFERIDOS
    1705  Gastos pagados por anticipado
          170505  Seguros prepagados
          170510  Arrendamientos prepagados
          170515  Subscripciones SaaS prepagadas

19  OTROS ACTIVOS
    1905  Depósitos en garantía
    1910  Activos por impuesto diferido
```

#### CLASE 2 — PASIVOS

```
21  OBLIGACIONES FINANCIERAS
    2105  Bancos nacionales (créditos)
    2120  Obligaciones leasing

22  PROVEEDORES
    2205  Proveedores nacionales — operadores turísticos
          220505  Por pagar a operadores (liquidaciones pendientes)
          220510  Anticipos recibidos de operadores (no aplica)
    2210  Proveedores de servicios generales

23  CUENTAS POR PAGAR
    2305  Cuentas por pagar a contratistas
    2310  Costos y gastos por pagar
    2315  Deudas con socios / accionistas (préstamos del dueño)
    2360  Dividendos por pagar
    2365  Retención en la fuente por pagar
          236505  Retefuente sobre servicios (3.5%)
          236510  Retefuente sobre pagos al exterior
          236515  Retefuente sobre arrendamientos
          236520  Auto-retención en la fuente
    2367  Retención ICA por pagar
    2368  Retención IVA por pagar
    2370  IVA por pagar
          237005  IVA generado (ventas gravadas 19%)
          237010  IVA descontable (compras y gastos)
          237015  IVA exento para extranjeros (control)

24  IMPUESTOS GRAVÁMENES Y TASAS
    2404  Impuesto de industria y comercio (ICA)
    2408  Impuesto sobre la renta por pagar
    2412  IVA por pagar (saldo neto — ver 2370)

25  OBLIGACIONES LABORALES
    2505  Salarios por pagar
    2510  Cesantías consolidadas
    2515  Intereses sobre cesantías
    2520  Prima de servicios
    2525  Vacaciones consolidadas
    2530  Prestaciones sociales por pagar
    2535  Aportes a pensión y ARL por pagar
    2540  Aportes a EPS por pagar
    2550  Aportes parafiscales (SENA, ICBF, Caja Comp.)

27  DIFERIDOS — PASIVOS
    2705  Ingresos recibidos por anticipado
          270505  Reservas confirmadas — pago anticipado del viajero
          270510  Cotizaciones pagadas anticipadamente
    2710  Abonos diferidos

28  OTROS PASIVOS
    2805  Pasivo por contratos con clientes — Borondo Coins
          280505  Coins acumulados por redimir (saldo en circulación)
    2810  Pasivo por contratos con clientes — obligaciones pendientes
    2815  Depósitos recibidos en garantía (de operadores)

29  BONOS Y PAPELES COMERCIALES (no aplica Fase 1)
```

#### CLASE 3 — PATRIMONIO

```
31  CAPITAL SOCIAL
    3105  Capital suscrito y pagado
          310505  Capital Borondo Tours SAS

32  SUPERÁVIT DE CAPITAL
    3205  Prima en colocación de acciones (si hay rondas futuras)

33  RESERVAS
    3305  Reserva legal (10% de utilidades — obligatoria hasta 50% capital)
    3310  Reservas estatutarias
    3315  Reservas ocasionales

34  REVALORIZACIÓN DEL PATRIMONIO (NIIF — ajuste transición)

36  RESULTADOS DEL EJERCICIO
    3605  Utilidad del ejercicio
    3610  Pérdida del ejercicio (CR)

37  RESULTADOS DE EJERCICIOS ANTERIORES
    3705  Utilidades acumuladas
    3710  Pérdidas acumuladas (CR)
```

#### CLASE 4 — INGRESOS

```
41  OPERACIONALES — VENTA DE SERVICIOS TURÍSTICOS

    4105  Ingresos por tours — nacionales (gravados IVA 19%)
          410505  Tours — residentes colombianos (IVA 19%)
          410510  Tours — extranjeros con pasaporte (IVA 0% — exento)
          410515  Tours BorondoTours propios (Fase 2+)

    4110  Ingresos por comisiones de intermediación
          411005  Comisión marketplace — operadores nacionales
          411010  Comisión por agentes externos

    4115  Ingresos por publicidad en plataforma
          411505  Banners — checkout
          411510  Banners — confirmación de reserva
          411515  Anuncios patrocinados (rewarded ads)

    4120  Ingresos por programa de lealtad (reconocimiento diferido)
          412005  Coins redimidos → ingreso reconocido

    4130  Ingresos por penalidades de cancelación
          413005  Penalidades cobradas a viajeros
          413010  Penalidades retenidas (operador no cobró — ingreso neto BT)

    4135  Otros ingresos operacionales
          413505  Ingresos por servicios de agencia (cotizaciones manuales)
          413510  Recargos y tarifas de servicio

42  NO OPERACIONALES
    4210  Ingresos financieros
          421005  Intereses ganados (rendimientos en cuenta)
          421010  GMF recuperado (si aplica)
    4250  Recuperaciones
    4295  Otros ingresos no operacionales
```

#### CLASE 5 — GASTOS OPERACIONALES DE ADMINISTRACIÓN

```
51  GASTOS DE PERSONAL — ADMIN
    5105  Sueldos y salarios administrativos
    5110  Horas extras y recargos
    5115  Auxilio de transporte
    5120  Cesantías (provisión)
    5125  Intereses sobre cesantías
    5130  Prima de servicios
    5135  Vacaciones
    5140  Aportes a pensión
    5145  Aportes a EPS
    5150  Aportes ARL
    5155  Parafiscales (SENA, ICBF, Caja)

52  HONORARIOS — ADMIN
    5205  Honorarios contables y revisoría fiscal
    5210  Honorarios legales y notariales
    5215  Honorarios de consultoría

53  IMPUESTOS — ADMIN
    5305  ICA (Industria y Comercio)
    5310  GMF (4×1000)
    5315  Predial (si hay sede propia)

54  ARRENDAMIENTOS — ADMIN
    5405  Arrendamiento oficina / coworking

55  SEGUROS — ADMIN
    5505  Seguros generales (oficina, responsabilidad civil)
    5510  SOAT vehículos (si aplica)

56  SERVICIOS — ADMIN
    5605  Energía, agua, telecomunicaciones
    5610  Internet y telefonía
    5615  Correo y mensajería
    5620  Aseo y vigilancia
    5625  Servicio de tecnología — Borondo Tech SAS (intercompany)
          562505  Fee mensual plataforma BorondoTours
          562510  Fee por transacción procesada
          562515  Soporte técnico y desarrollo adicional

57  GASTOS LEGALES — ADMIN
    5705  Gastos de registro mercantil
    5710  Autenticaciones y notariado
    5715  Publicaciones legales

58  MANTENIMIENTO — ADMIN
    5805  Mantenimiento equipos de oficina
    5810  Mantenimiento software / licencias

59  DEPRECIACIONES Y AMORTIZACIONES — ADMIN
    5905  Depreciación equipo de cómputo (5 años)
    5910  Amortización intangibles / licencias
```

#### CLASE 6 — COSTOS DE VENTAS / SERVICIOS

```
61  COSTO DE SERVICIOS TURÍSTICOS PRESTADOS
    6105  Costo tours — pago a operadores (modelo principal)
          610505  Pago a operadores nacionales por tours realizados
          610510  Comisión Onepayla (pasarela de pago — % sobre transacción)
          610515  Costo Split Fare — porción del operador (Fase 2)

    6110  Costo programas de lealtad
          611005  Coins otorgados a viajeros (gasto al momento de otorgar)
          611010  Publicidad interna que financia los Coins

    6115  Costos de cancelación y reembolsos
          611505  Reembolsos bancarios reales (retracto, fuerza mayor operador)
          611510  Chargeback asumidos por BorondoTours

    6120  Costos de adquisición de clientes
          612005  Comisiones a agentes de viajes externos
          612010  Referidos y afiliados
```

#### CLASE 7 — GASTOS OPERACIONALES DE VENTAS

```
71  GASTOS DE PERSONAL — VENTAS
    7105  Sueldos agentes comerciales
    7110  Comisiones a agentes internos BorondoTours
    7115  Prestaciones sociales comerciales

72  HONORARIOS — VENTAS
    7205  Marketing digital / agencias

73  SERVICIOS — VENTAS
    7305  Publicidad y pauta digital (Google, Meta, etc.)
    7310  Marketing de contenidos
    7315  Fotografía y producción audiovisual
    7320  Herramientas CRM y marketing automation
    7325  Participación en ferias y eventos turísticos

75  GASTOS DE REPRESENTACIÓN — VENTAS
    7505  Atención a clientes y FAM trips

79  PROVISIONES — VENTAS
    7905  Provisión cartera incobrable viajeros
```

#### CLASE 8 / 9 — COSTOS Y GASTOS NO OPERACIONALES

```
81  NO OPERACIONALES — GASTOS FINANCIEROS
    8105  Intereses bancarios (créditos)
    8110  Comisiones bancarias
    8115  Diferencia en cambio (mínima — COP funcional)
    8120  GMF (4×1000) — cuentas no exentas

83  GASTOS EXTRAORDINARIOS
    8305  Pérdidas en retiro de activos
    8310  Multas y sanciones fiscales (no deducibles)

84  IMPUESTO DE RENTA
    8405  Impuesto de renta corriente
    8410  Impuesto diferido (activo o pasivo)
```

---

### 1.2 PUC — BORONDO TECH SAS
*(Prestador de servicios tecnológicos y TI — empresa nueva a constituir)*

#### CLASE 1 — ACTIVOS

```
11  DISPONIBLE
    1105  Caja menor
    1110  Bancos
          111005  Bancolombia — CTA operativa Borondo Tech

13  DEUDORES
    1305  Clientes — cuentas por cobrar
          130505  Borondo Tours SAS (intercompany — fee plataforma)
          130510  Operadores turísticos (fee acceso plataforma)
          130515  Otros clientes tecnología (futuros)
    1360  Cuentas por cobrar — partes relacionadas
          136005  Borondo Tours SAS
    1380  Deudas de difícil cobro
    1399  Provisión deudores (CR)

15  PROPIEDADES, PLANTA Y EQUIPO
    1504  Equipo de computación y comunicación
          150405  Servidores locales (si aplica)
          150410  Portátiles equipo técnico
    1592  Depreciación acumulada (CR)

16  INTANGIBLES
    1605  Software desarrollado internamente (si se capitaliza)
    1610  Activos de propiedad intelectual (código fuente BorondoTours)
    1698  Amortización acumulada (CR)

17  DIFERIDOS
    1705  Gastos pagados por anticipado
          170505  Créditos AWS prepagados
          170510  Subscripciones SaaS (GitHub, Datadog, etc.)
```

#### CLASE 2 — PASIVOS

```
22  PROVEEDORES
    2205  Proveedores tecnológicos
          220505  Amazon Web Services — factura mensual
          220510  GitHub / Atlassian / herramientas dev
          220515  Terceros desarrollo outsourcing

23  CUENTAS POR PAGAR
    2305  Honorarios por pagar (freelancers, contratistas)
    2315  Deudas con socios
    2365  Retención en la fuente por pagar
          236505  Retefuente honorarios (10%–11%)
          236510  Retefuente servicios
    2370  IVA por pagar
          237005  IVA generado (servicios tecnológicos 19%)
          237010  IVA descontable (AWS, compras)

24  IMPUESTOS
    2404  ICA por pagar
    2408  Impuesto de renta por pagar

25  OBLIGACIONES LABORALES
    2505-2550  [Misma estructura que Borondo Tours]

28  OTROS PASIVOS
    2805  Ingresos diferidos — contratos de licencia anuales prepagados
```

#### CLASE 3 — PATRIMONIO

```
31  CAPITAL SOCIAL
    3105  Capital suscrito y pagado — Borondo Tech SAS
33  RESERVAS
    3305  Reserva legal
36  RESULTADOS DEL EJERCICIO
    3605  Utilidad / pérdida del ejercicio
37  RESULTADOS ANTERIORES
    3705  Utilidades acumuladas
```

#### CLASE 4 — INGRESOS (Borondo Tech)

```
41  OPERACIONALES — SERVICIOS TECNOLÓGICOS

    4105  Ingresos por licencia de software
          410505  Licencia plataforma BorondoTours — Borondo Tours SAS
          410510  Licencia plataforma — operadores turísticos (fee mensual)
          410515  Licencia plataforma — operadores (fee por transacción)

    4110  Ingresos por servicios administrados (managed services)
          411005  Hosting y gestión de infraestructura AWS
          411010  Soporte técnico y mantenimiento
          411015  Desarrollo de features adicionales (por proyecto)

    4115  Ingresos por consultoría e implementación
          411505  Onboarding de operadores nuevos
          411510  Integraciones con sistemas externos

42  NO OPERACIONALES
    4210  Intereses ganados
    4295  Otros ingresos
```

#### CLASE 5 — GASTOS OPERACIONALES DE ADMINISTRACIÓN (Borondo Tech)

```
51  GASTOS DE PERSONAL
    5105  Sueldos desarrolladores y equipo técnico
    5120-5155  [Misma estructura prestaciones que Borondo Tours]

52  HONORARIOS
    5205  Auditoría y contabilidad
    5210  Asesoría legal

53  IMPUESTOS
    5305  ICA
    5310  GMF

56  SERVICIOS — INFRAESTRUCTURA TECNOLÓGICA (el corazón de los costos de Tech)
    5605  Amazon Web Services — cómputo (Lambda, ECS)
    5610  Amazon Web Services — base de datos (RDS, DynamoDB)
    5615  Amazon Web Services — almacenamiento (S3, CloudFront)
    5620  Amazon Web Services — networking y seguridad
    5625  Amazon Web Services — otros servicios (SES, SQS, EventBridge)
    5630  Herramientas de desarrollo (GitHub, CI/CD)
    5635  Herramientas de monitoreo (Datadog, CloudWatch)
    5640  Herramientas de diseño (Figma, etc.)
    5645  Dominio, certificados SSL
    5650  Plataforma pasarela de pagos — fees fijos Onepayla
    5655  Servicios SaaS terceros (Mapbox, Expo, etc.)

59  DEPRECIACIONES Y AMORTIZACIONES
    5905  Depreciación equipos técnicos
    5910  Amortización software / propiedad intelectual
```

#### CLASE 6 — COSTOS DE SERVICIOS TECNOLÓGICOS

```
61  COSTO DE SERVICIOS PRESTADOS
    6105  Costo variable de infraestructura AWS proporcional al servicio
          610505  Lambda — invocaciones por transacción (asignado por cliente)
          610510  RDS — costo proporcional consultas
          610515  S3 — almacenamiento documentos de clientes
    6110  Costo de desarrollo asignado a contratos específicos
    6115  Licencias de terceros incorporadas en el servicio
```

---

## 2. Centros de Costo

Aplican para ambas entidades. Permiten costear cada línea de negocio por separado.

### Borondo Tours SAS

| Código | Centro de Costo | Descripción |
|--------|----------------|-------------|
| CC-001 | B2C — Viajeros | Todo relacionado con la app pública y ventas directas |
| CC-002 | B2B — Operadores | Gestión y soporte a operadores turísticos |
| CC-003 | ERP — Agencia | Operaciones internas, agentes, COORD |
| CC-004 | Marketing y Ventas | Pauta digital, contenidos, eventos |
| CC-005 | Administración | Contabilidad, legal, gerencia |
| CC-006 | Coins / Lealtad | Programa de fidelización (aislado para análisis) |

### Borondo Tech SAS

| Código | Centro de Costo | Descripción |
|--------|----------------|-------------|
| CT-001 | Plataforma BorondoTours | Desarrollo y operación del producto principal |
| CT-002 | Infraestructura AWS | Costos de nube compartidos |
| CT-003 | Clientes externos | Otros operadores facturados directamente |
| CT-004 | I+D | Desarrollo de nuevas funcionalidades |
| CT-005 | Soporte y Operaciones | DevOps, monitoreo, incidentes |

---

## 3. Modelo de Facturación Intercompany

### Borondo Tech → Borondo Tours (mensual)

**Factura recomendada:**
```
CONCEPTO                                          VALOR
────────────────────────────────────────────────────────
Licencia plataforma BorondoTours — [mes/año]    $X.XXX.XXX
  • App web B2C (hosting + mantenimiento)
  • ERP agencia
  • Portal B2B operadores
  • Infraestructura AWS base (fija)
Fee variable por transacción procesada            $XX × N transacciones
  (N = bookings confirmados del mes)
────────────────────────────────────────────────────────
Subtotal                                          $X.XXX.XXX
IVA 19%                                           $XXX.XXX
TOTAL                                             $X.XXX.XXX
Retención en la fuente (3.5% servicios)          -$XX.XXX
NETO A PAGAR                                      $X.XXX.XXX
```

> IVA pagado por Borondo Tours es descontable (IVA descontable = recuperable en su declaración).

### Borondo Tech → Operadores turísticos (mensual)

**Opciones de modelo de precio (decidir con el equipo comercial):**

| Opción | Descripción | Ventaja | Riesgo |
|--------|-------------|---------|--------|
| A — Fee fijo | $80.000–$200.000/mes según tamaño del operador | Predecible, fácil de facturar | Operadores pequeños pueden resistir |
| B — % GMV | 0.5%–1% sobre ventas procesadas | Crece con el operador | Ingresos variables |
| C — Freemium + premium | Plan básico gratuito (hasta X bookings) + plan pro | Reduce barrera de entrada | Complejo de administrar |

**Recomendación Fase 1:** Opción A con escala por tamaño. Ejemplo:
- Operador Básico (< 10 tours/mes): $80.000/mes
- Operador Estándar (10–50 tours/mes): $150.000/mes
- Operador Premium (> 50 tours/mes): $300.000/mes + negociación

---

## 4. Tratamiento de Situaciones Específicas

### 4.1 Fase 1: Borondo Tours recibe el 100% del pago

Cuando el viajero paga y el Split Payment aún no está activo:

```
Al recibir pago del viajero (confirmar reserva):
  Db  1110 — Bancos (cuenta recaudo Onepayla)         $1.000.000
  Cr  2705 — Ingresos recibidos por anticipado         $1.000.000
  (El ingreso NO se reconoce hasta prestar el servicio)

Al realizar el tour (prestar el servicio):
  Db  2705 — Ingresos recibidos por anticipado         $1.000.000
  Cr  4105 — Ingresos por tours                          $840.336  (sin IVA)
  Cr  2370 — IVA generado 19%                            $159.664
  (Asumiendo que el viajero es residente colombiano)

Al liquidar al operador (pagar su parte):
  Db  6105 — Costo tours — pago operadores             $700.000
  Cr  1110 — Bancos (pago al operador)                  $700.000
  (La comisión de BT queda como margen: $840.336 - $700.000 = $140.336)
```

### 4.2 Fase 2: Split Payment activo

```
Al confirmar reserva (solo la comisión llega a BT):
  Db  1110 — Bancos (cuenta comisión Onepayla)          $200.000
  Cr  4110 — Ingresos por comisiones                    $168.067  (sin IVA)
  Cr  2370 — IVA generado                                $31.933
  (El operador ya recibió su parte directamente)
```

### 4.3 Cancelación con penalidad

```
Cancelación 60% penalidad (viajero cancela 7 días antes):
  Db  2705 — Ingreso diferido (reversa el anticipo)    $1.000.000
  Cr  4130 — Ingresos por penalidades                    $600.000
  Cr  2805 — Pasivo Coins (40% restante en Coins)        $400.000

  Si parte de la penalidad se transfiere al operador:
  Db  6115 — Costo penalidades / retenciones             $XXX.XXX
  Cr  2205 — Proveedores — operadores                    $XXX.XXX
```

### 4.4 Exención IVA extranjeros

```
Tour vendido a extranjero con pasaporte:
  Db  1110 — Bancos                                    $1.000.000
  Cr  2705 — Ingreso diferido                          $1.000.000

Al prestar servicio:
  Db  2705 — Ingreso diferido                         $1.000.000
  Cr  4105 — Ingresos tours (cuenta 410510 — exento)  $1.000.000
  (IVA = $0 — exento Decreto 297/2016)
  (Documentar con copia del pasaporte en expediente)
```

### 4.5 Otorgamiento de Borondo Coins

```
Al vender un tour con Coins (nivel Viajero = 1%):
  Valor del tour: $500.000 — Coins otorgados: $5.000 (1%)

  La asignación del precio de transacción separa:
  - Servicio de tour: $495.050 (precio relativo sin los Coins)
  - Coins: $4.950 (valor relativo de los Coins otorgados)

  Simplificación práctica inicial:
  Db  6110 — Costo programa lealtad — Coins otorgados    $5.000
  Cr  2805 — Pasivo Borondo Coins                         $5.000
```

---

## 5. Estados Financieros Requeridos (NIIF PYMES)

Ambas entidades deben preparar anualmente:

1. **Estado de Situación Financiera** (Balance General) — al 31 de diciembre.
2. **Estado de Resultados Integrales** — por el período enero-diciembre.
3. **Estado de Cambios en el Patrimonio** — movimientos del año.
4. **Estado de Flujos de Efectivo** — método directo o indirecto (recomendado: directo para operaciones turísticas, más claro para inversionistas).
5. **Notas a los Estados Financieros** — mínimo 20 notas requeridas por NIIF PYMES.

**Frecuencia recomendada para uso gerencial:**
- Balance de prueba: **mensual** (en el software contable).
- Estados financieros completos: **trimestral** (para seguimiento gerencial).
- Estados financieros auditados: **anual** (obligatorio si tiene revisor fiscal o para inversionistas).

---

## 6. Obligaciones Tributarias Calendario

### Borondo Tours SAS

| Obligación | Frecuencia | Plazo aprox. |
|-----------|-----------|-------------|
| IVA (bimestral) | Bimestral | 2ª quincena del mes siguiente al bimestre |
| Retención en la fuente | Mensual | 2ª quincena del mes siguiente |
| ICA Bogotá | Bimestral | Según calendario distrital |
| Renta personas jurídicas | Anual | Abril del año siguiente (AG anterior) |
| Información exógena (medios magnéticos) | Anual | Según resolución DIAN (abr–jun) |
| RUT actualización | Cuando cambie información | Inmediato |

### Borondo Tech SAS (mismas obligaciones cuando esté constituida)

---

## 7. Software Contable Recomendado

Dado que ya existe integración con **Siigo API** en la hoja de ruta (steering `02-tech-stack.md` — Fase 2):

**Recomendación: Siigo Nube para ambas entidades.**

- Nativo colombiano (PUC precargado, IVA bimestral, retenciones, exógena).
- Facturación electrónica habilitada (DIAN).
- La integración ya está planificada en el stack técnico.
- Permite manejar dos empresas (NIT) bajo el mismo plan empresarial.
- Costo aproximado: ~$150.000–$300.000/mes por empresa según plan.

**Alternativa:** Alegra (más simple, similar costo) — pero sin el nivel de integración con el sistema BorondoTours que tendrá Siigo.

---

## 8. Checklist de Acciones Inmediatas

### Prioridad ALTA (hacer en los próximos 30 días)
- [ ] Constituir **Borondo Tech SAS** en Cámara de Comercio.
- [ ] Abrir cuenta bancaria para Borondo Tech.
- [ ] Contratar contador externo (no solo declarante — que revise la estructura).
- [ ] Activar **facturación electrónica DIAN** en Borondo Tours (si no está activa).
- [ ] Definir el fee mensual de Borondo Tech → Borondo Tours y emitir primera factura.
- [ ] Registrar en software contable el **pasivo de Borondo Coins** existente (si ya se otorgaron).

### Prioridad MEDIA (próximos 60–90 días)
- [ ] Firmar contrato de servicios tecnológicos Borondo Tech ↔ Borondo Tours (por escrito, con abogado).
- [ ] Definir modelo de precio de Borondo Tech → Operadores.
- [ ] Implementar el módulo de Siigo API (alineado con Fase 2 del roadmap).
- [ ] Calcular el saldo inicial del pasivo por Borondo Coins con los datos históricos disponibles.
- [ ] Revisar si ya se requiere **Revisor Fiscal** (obligatorio cuando el patrimonio bruto supere 5.000 SMMLV o ingresos > 3.000 SMMLV en el año anterior — Art. 203 Código de Comercio).

### Prioridad BAJA (Fase 2+)
- [ ] Documentación formal de precios de transferencia (cuando ingresos del grupo > $5.000M COP).
- [ ] Evaluación de migración a Grupo 1 NIIF si hay ronda de inversión significativa.
- [ ] Política de dividendos intercompany.

---

## 9. Notas Importantes y Advertencias

> ⚠️ **Este documento es una guía técnica elaborada con criterios contables y fiscales colombianos vigentes. NO reemplaza la asesoría de un contador público titulado y/o revisor fiscal. Debe ser validado y firmado por el profesional contable responsable antes de su implementación.**

> 📌 **Actualización del steering:** La decisión D7 (Principal vs. Agente) y el tratamiento de los Coins deben quedar reflejados en `05-business-rules.md`.

> 🔄 **Versión viva:** Este documento debe actualizarse cuando:
> - Se constituya Borondo Tech SAS (agregar NIT).
> - Se active el Split Payment (cambiar registros Fase 1 → Fase 2).
> - Cambien las tarifas de IVA o retenciones.
> - Se incorporen nuevos productos o líneas de ingreso.

---

*Documento creado: Agosto 2026 | Próxima revisión recomendada: Diciembre 2026*
