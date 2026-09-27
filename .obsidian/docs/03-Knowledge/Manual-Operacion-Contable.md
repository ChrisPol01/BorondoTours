# Manual de Operación Contable y Administrativa — Borondo Tours SAS
**Versión:** 1.0  
**Fecha:** Septiembre 2026  
**Operan:** CEO + Kiro (asesor contable/administrador). El contador externo **solo revisa y firma**.  
**Filosofía:** Nosotros dominamos y operamos las finanzas al 100%. El contador valida y pone la firma legal. Debemos saber más de nuestra operación que él.  
**Complementa:** [[Estructura-Contable]] · [[Pipeline-Facturacion-y-Declaracion]] · [[Guia-Tramites-DIAN]]

> Supuesto de trabajo: el RUT ya quedó habilitado (representación legal activa, código 33 retirado, código 52 facturador activo, código 48 IVA, 07 retención). Cuando se confirme, se levanta el pendiente.

---

## 0. Mapa Mental de la Operación

```
        INGRESA DINERO                         SALE DINERO
   ┌──────────────────────┐            ┌──────────────────────────┐
   │ Viajero paga (OnePayla)│           │ Pago a operadores        │
   │  → llega a Bold        │           │ Pago a proveedores       │
   │ Publicidad             │           │ Nómina / honorarios      │
   │ Penalidades            │           │ Impuestos (DIAN/Cali)    │
   └──────────┬───────────┘            │ FONTUR, RNT              │
              │                         └────────────┬─────────────┘
              ▼                                      ▼
        ┌─────────────────────────────────────────────────┐
        │        CONTABILIDAD (software: Siigo)            │
        │  Cada movimiento = un asiento. Todo con soporte. │
        └───────────────────────┬─────────────────────────┘
                                 ▼
        ┌─────────────────────────────────────────────────┐
        │   DECLARACIONES: IVA, Retención, Renta, ICA,     │
        │   FONTUR, Exógena  +  Estados Financieros        │
        └─────────────────────────────────────────────────┘
```

Regla de oro operativa: **ningún peso entra o sale sin: (1) un soporte documental y (2) un asiento contable.** Si no hay soporte, no se registra; si no se registra, no existe para la DIAN.

---

## 1. Obligaciones Tributarias COMPLETAS de Borondo Tours

> Consolidado real según tu actividad (CIIU 7911 agencia + 7912 operador + 7990 otros). Incluye **FONTUR y Avisos y Tableros**, que faltaban en versiones previas.

| # | Obligación | Autoridad | Frecuencia | Base | Notas |
|---|---|---|---|---|---|
| 1 | **IVA** | DIAN | Bimestral (1er año) | Servicios gravados 19% | Ojo: turismo tiene servicios gravados, exentos y excluidos (§4) |
| 2 | **Retención en la fuente** | DIAN | Mensual | Pagos a terceros | La más recurrente |
| 3 | **Renta** | DIAN | Anual (2 cuotas) | Utilidad | 1ª declaración en 2027 (AG 2026) |
| 4 | **ICA** | Alcaldía Cali | Bimestral/anual | Ingresos brutos en Cali | Tarifa por CIIU (§5) |
| 5 | **Avisos y Tableros** | Alcaldía Cali | Con el ICA | 15% del ICA | Solo si hay aviso/valla física |
| 6 | **FONTUR** (parafiscal turismo) | FONTUR | Trimestral | Ingresos operacionales turísticos | **2,5 por mil** (0,25%) — obligatorio para agencias/operadores |
| 7 | **RNT** (renovación) | MinCIT | Anual (ene–mar) | — | No renovar = suspensión de operación |
| 8 | **Exógena** (medios magnéticos) | DIAN | Anual | Terceros | Según topes |
| 9 | **Seguridad social** | UGPP/PILA | Mensual | Nómina | Si hay empleados |
| 10 | **Factura electrónica** | DIAN | Por venta | — | Tiempo real |

> ⚠️ **FONTUR es el que casi nadie recuerda y es obligatorio.** Como agencia de viajes Y operador turístico, Borondo Tours aporta el **2,5 por mil de sus ingresos operacionales turísticos**. Se liquida y paga trimestralmente en la plataforma de FONTUR. No pagarlo genera intereses y sanciones.

---

## 2. Calendario Operativo Anual Consolidado (dígito NIT = 8)

> Todas las fechas en un solo lugar. Marca aproximada; confirmar día exacto en portal DIAN/Cali antes de cada vencimiento.

### Rutina MENSUAL (todos los meses)
| Día | Acción | Responsable |
|---|---|---|
| 1–5 | Cierre contable del mes anterior (conciliar Bold, OnePayla, facturas) | Nosotros |
| 1–5 | Liquidar y pagar seguridad social (PILA) si hay nómina | Nosotros |
| ~22–24 | **Declarar y pagar Retención en la Fuente** (form. 350) del mes anterior | Nosotros preparamos → contador firma |
| Fin de mes | Revisar cartera (por cobrar) y cuentas por pagar a operadores | Nosotros |

### Rutina BIMESTRAL (IVA)
| Se declara en | Periodo IVA | 
|---|---|
| ~11 marzo | Ene–Feb |
| ~13 mayo | Mar–Abr |
| ~9 julio | May–Jun |
| ~9 septiembre | Jul–Ago |
| ~11 noviembre | Sep–Oct |
| ~15 enero (2027) | Nov–Dic |

### Rutina TRIMESTRAL (FONTUR)
| Se declara/paga | Periodo |
|---|---|
| Abril | Ene–Mar |
| Julio | Abr–Jun |
| Octubre | Jul–Sep |
| Enero (2027) | Oct–Dic |

### Rutina ANUAL
| Mes | Acción |
|---|---|
| **Enero–Marzo** | **Renovar RNT** (crítico) |
| Marzo | Expedir certificados de retención del año anterior (último día hábil) |
| Abril–Junio | Información exógena (según calendario) |
| **~22–25 Mayo** | Declaración de Renta (desde 2027, AG 2026) — 1ª cuota |
| Julio | 2ª cuota de renta |
| Diciembre | Cierre anual, provisiones, inventario de Coins |
| ICA Cali | Según calendario municipal (bimestral/anual) |

> **Acción inmediata:** montar estos recordatorios en Google Calendar de la cuenta institucional (se puede automatizar — §8).

---

## 3. Ciclo de Caja — Cómo Opera el Dinero

### 3.1 Entrada: venta de un tour (Fase 1, recibimos 100%)

```
1. Viajero paga en checkout → OnePayla procesa
2. OnePayla retiene su comisión y dispersa el neto a la cuenta Bold
3. Se emite factura electrónica (ver Pipeline)
4. Asiento:
   Db  1110 Bold                          (lo que llega neto)
   Db  6105.610510 Comisión OnePayla      (lo que retuvo la pasarela)
   Db  2370.237010 IVA descontable        (IVA de la comisión OnePayla)
       Cr  2705 Ingreso recibido por anticipado   (valor del tour sin IVA)
       Cr  2370.237005 IVA generado                (IVA 19% del tour)
5. Cuando se ejecuta el tour:
   Db  2705  →  Cr  4105 Ingresos por tours (se reconoce el ingreso real)
```

### 3.2 Salida: liquidación al operador

```
El operador presta el servicio y nos factura su parte:
   Db  6105.610505 Costo tours - operador
       Cr  2205.220505 Operadores por liquidar

Al pagarle (aplicando retención en la fuente):
   Db  2205.220505 Operadores por liquidar
       Cr  2365 Retención en la fuente por pagar   (le retenemos 4%/6%)
       Cr  1110 Bold                                (neto que se transfiere)
```

> **Margen bruto de cada venta = comisión que retiene Borondo (`borondo_amount`).** Ese es el número que importa vigilar.

### 3.3 Control diario de caja
- **Conciliar Bold** cada día/semana: lo que dice el banco = lo que dice la contabilidad.
- **Conciliar OnePayla**: cada pago del viajero debe tener su factura y su dispersión.
- **Dinero en tránsito**: lo que OnePayla aún no ha dispersado vive en `111010` hasta que llega a Bold.

---

## 4. IVA en Turismo — Los 3 Tratamientos (crítico)

Tu propia matriz CIIU lo confirma: no todo lleva IVA 19%. Hay que clasificar cada servicio:

| Tratamiento | Qué es | Ejemplos en Borondo Tours | Efecto |
|---|---|---|---|
| **Gravado 19%** | Lleva IVA normal | Comisiones, servicios de agencia, add-ons | Se cobra y se declara IVA |
| **Exento (0% con derecho a devolución)** | Tarifa 0 pero recupera IVA | Paquetes turísticos vendidos a **no residentes** (extranjeros) usados en Colombia | No cobra IVA, pero puede pedir devolución del IVA pagado |
| **Excluido** | No causa IVA, sin devolución | Tiquetes de transporte aéreo nacional de pasajeros | No cobra IVA ni recupera |

**Regla operativa:** al configurar cada tour/servicio en el sistema y en Siigo, hay que marcarle su tratamiento de IVA. Un error aquí = factura inválida o IVA mal liquidado.

> El caso "extranjero con pasaporte" del sistema (exención) corresponde a la fila **Exento**. Guardar el pasaporte como soporte 5 años.

---

## 5. ICA en Cali — Cómo Liquidarlo

- El ICA grava los **ingresos brutos** obtenidos por la actividad en Cali.
- La tarifa depende del CIIU (7911/7912/7990). En Cali las tarifas de servicios llegan hasta **10 por mil**; hay que consultar la tarifa exacta del CIIU en el Estatuto Tributario de Cali vigente.
- **Avisos y Tableros:** 15% adicional sobre el ICA, solo si hay aviso/valla física de la marca.
- Se declara y paga en la Alcaldía de Cali según su calendario (bimestral o anual).
- **ReteICA:** si un cliente que es agente retenedor nos paga, puede retenernos ICA; y nosotros retenemos ICA a proveedores en Cali.

> **Acción:** descargar del portal cali.gov.co la tarifa exacta de ICA para CIIU 7911 y confirmarla. Es lo único que falta para cerrar este punto.

---

## 6. Gestión de Proveedores y Operadores

### 6.1 Tipos de "proveedor" en Borondo Tours

| Tipo | Qué nos entrega | Cómo se les paga | Retención |
|---|---|---|---|
| **Operadores turísticos** | El servicio del tour | Liquidación por reserva/ciclo | Retefuente servicios 4%/6% |
| **Proveedores de servicios** | Marketing, legal, software | Factura | Según concepto |
| **OnePayla** | Pasarela de pago | Retiene su comisión automática | — (es un costo) |
| **Guías/conductores** (Fase 3) | Servicio en campo | Honorarios/nómina | Retefuente honorarios |

### 6.2 Reglas de oro para pagar a un proveedor/operador
1. **Que esté en el RUT** — pedir copia del RUT del proveedor (define si es declarante → tarifa de retención 4% o 6%).
2. **Que nos facture o expida documento equivalente** — si el proveedor no está obligado a facturar, NOSOTROS emitimos **Documento Soporte** (obligatorio para poder deducir el costo).
3. **Aplicar la retención correcta** antes de pagar.
4. **Guardar el soporte** (factura del proveedor + comprobante de pago).
5. **Registrar el asiento** el mismo día.

### 6.3 Documento Soporte (clave para operadores informales)
Muchos operadores turísticos pequeños **no están obligados a facturar electrónicamente**. Para poder **deducir ese costo** en renta y descontar IVA, Borondo Tours **debe emitir un Documento Soporte electrónico** por esa compra. Siigo/Factus lo generan. Sin este documento, la DIAN rechaza el costo.

---

## 7. Plan de Cuentas Operativo Rápido (las que más se usan)

| Cuenta | Nombre | Cuándo se usa |
|---|---|---|
| 1110.111005 | Bold | Todo el dinero real |
| 1110.111010 | Recaudo OnePayla | Dinero en tránsito de la pasarela |
| 2705 | Ingreso recibido por anticipado | Viajero pagó, tour no ejecutado |
| 4105 | Ingresos por tours | Tour ejecutado |
| 6105.610505 | Costo operador | Lo que le toca al operador |
| 6105.610510 | Comisión OnePayla | Costo de la pasarela |
| 2205.220505 | Operadores por liquidar | Lo que debemos a operadores |
| 2370.237005 | IVA generado | IVA que cobramos |
| 2370.237010 | IVA descontable | IVA que nos cobraron |
| 2365 | Retención por pagar | Lo que retuvimos a terceros |
| 2805 | Pasivo Borondo Coins | Coins en circulación |

> El PUC completo está en [[Estructura-Contable]] §1.

---

## 8. Automatización — Qué se Puede Automatizar y Cómo

Aprovechando el stack técnico del proyecto (Lambda, EventBridge, SES, Siigo/Factus API):

### 8.1 Facturación (ya diseñada en el Pipeline)
- **Webhook `PAYMENT_CONFIRMED` → Lambda → emite factura vía API → CUFE → correo al cliente.** Automático 100%.

### 8.2 Contabilización automática
- Si se usa **Siigo API**: cada factura emitida genera el asiento automáticamente en Siigo.
- Cada dispersión de OnePayla → asiento de costo de comisión automático (integración webhook OnePayla → Siigo).
- **Meta:** que el 90% de los asientos rutinarios (ventas, comisiones, IVA) se generen solos.

### 8.3 Recordatorios de obligaciones (fácil y de alto valor)
- **EventBridge Scheduler** o Google Calendar API → recordatorios automáticos:
  - Día 15 de cada mes: "Preparar retención en la fuente".
  - 5 días antes de cada vencimiento IVA/FONTUR/ICA.
  - Enero: "Renovar RNT".
- Notificación por email (SES) o WhatsApp al CEO + Kiro.

### 8.4 Conciliación bancaria semi-automática
- Descargar extracto Bold (API o CSV) → cruzar con asientos → marcar diferencias.
- Alerta si hay un pago sin factura o una factura sin pago.

### 8.5 Reporte de margen del programa Coins
- Mensual automático: ingreso por publicidad vs. costo de Coins otorgados. Si el costo supera el ingreso → alerta (regla de negocio).

### 8.6 Dashboard financiero
- KPIs en tiempo real: caja en Bold, por cobrar, por pagar a operadores, IVA por pagar, margen del mes.
- Se alimenta de la misma BD del sistema + Siigo.

### 8.7 Lo que NO se debe automatizar (requiere criterio humano)
- La **firma** de las declaraciones (contador, obligatorio por ley).
- La **clasificación de IVA** de servicios nuevos (gravado/exento/excluido).
- Decisiones sobre retenciones dudosas.
- El pago efectivo de impuestos (que lo apruebe una persona).

---

## 9. División de Trabajo: Nosotros vs. Contador

| Tarea | Nosotros (CEO + Kiro) | Contador |
|---|---|---|
| Registrar movimientos diarios | ✅ Operamos | Revisa |
| Emitir facturas | ✅ (automático) | Revisa |
| Preparar declaraciones | ✅ Preparamos todo | **Firma** (legal) |
| Conciliaciones | ✅ | Revisa |
| Clasificar IVA | ✅ Proponemos | Valida |
| Estados financieros | ✅ Armamos borrador | **Firma/dictamina** |
| Pagar impuestos | ✅ Ejecutamos | — |
| Estrategia fiscal | ✅ Decidimos con su input | Asesora |

> **Objetivo:** cuando el contador llegue, todo está hecho y ordenado. Él revisa, ajusta lo que deba, y firma. Nunca dependemos de que él "nos explique" — nosotros ya sabemos.

---

## 10. Checklist de Arranque Operativo

### Pre-requisitos (dependen del RUT — pendiente)
- [ ] RUT habilitado + facturador electrónico activo.
- [ ] Resolución de numeración DIAN.
- [ ] Proveedor de facturación activo (Siigo + Factus).

### Montaje contable (lo hacemos nosotros)
- [ ] Configurar PUC en Siigo (de [[Estructura-Contable]] §1).
- [ ] Crear los terceros: OnePayla, operadores conocidos, proveedores.
- [ ] Configurar tratamientos de IVA por tipo de servicio.
- [ ] Cargar cuenta Bold y cuenta de recaudo OnePayla.
- [ ] Registrar capital social (balance de apertura).
- [ ] Registrar pasivo inicial de Coins (si ya hay Coins otorgados).

### Registro de obligaciones nuevas
- [ ] Inscribirse/verificar aporte **FONTUR** (2,5 por mil).
- [ ] Confirmar tarifa ICA Cali para CIIU 7911.
- [ ] Verificar si hay aviso físico → Avisos y Tableros.

### Automatización (fase técnica)
- [ ] Recordatorios de calendario tributario (EventBridge/Google Calendar).
- [ ] Integración factura automática (webhook → Siigo/Factus).
- [ ] Reporte mensual de margen Coins.
- [ ] Dashboard financiero.

### Cierre
- [ ] Contratar contador para revisión y firma.
- [ ] Entregarle este paquete de documentos.

---

## 11. Documentos del Sistema Contable (paquete completo)

| Documento | Qué cubre |
|---|---|
| [[Estructura-Contable]] | PUC, régimen, NIIF, Coins, revisoría fiscal |
| [[Pipeline-Facturacion-y-Declaracion]] | Flujo factura + calendario DIAN detallado |
| [[Guia-Tramites-DIAN]] | Paso a paso habilitación DIAN |
| **[[Manual-Operacion-Contable]]** (este) | Operación diaria, proveedores, impuestos, automatización |

---

*Versión 1.0 — Septiembre 2026 | Operado por CEO + Kiro | Pendiente: confirmar tarifa ICA Cali CIIU 7911, inscripción FONTUR, y habilitación RUT.*
