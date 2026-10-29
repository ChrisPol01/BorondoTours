# Automatización de Recordatorios Tributarios — Borondo Tours SAS
**Versión:** 1.0
**Fecha:** Octubre 2026
**Propósito:** que ninguna obligación tributaria se venza por olvido. El riesgo que cubre es directo: la sanción mínima por declarar tarde es **10 UVT = $523.740 (2026)**, más intereses de mora.
**Complementa:** [[Manual-Operacion-Contable]] §2 (calendario) y §8 (automatización).

> NIT 902.080.308-**5** · último dígito para calendario DIAN = **8**. Todas las fechas abajo están calculadas para ese dígito. Son aproximadas: **confirmar el día exacto en el portal DIAN/Cali antes de cada vencimiento** (el Decreto 2229/2023 fija el calendario oficial).

---

## 1. Dos caminos (uno hoy, otro cuando el stack esté listo)

| Camino | Esfuerzo | Cuándo | Qué resuelve |
|---|---|---|---|
| **A. Google Calendar (archivo .ics)** | 2 minutos | **HOY** | Recordatorios con alarma por correo/push a toda persona suscrita. Sin código, sin AWS. |
| **B. AWS EventBridge Scheduler + SES** | Fase técnica | Cuando haya infra desplegada | Recordatorios automáticos, auditables, versionados en IaC. Integrables con el dashboard. |

Recomendación: **activar A hoy mismo** (cubre el riesgo de inmediato) y montar B cuando el equipo técnico despliegue la infraestructura. No son excluyentes.

---

## 2. Camino A — Importar el calendario a Google Calendar (hazlo hoy)

Archivo listo: **`calendario-tributario-2026-2027.ics`** (en esta misma carpeta).

Incluye estos eventos con alarmas:

| Evento | Frecuencia | Fecha base (dígito 8) | Alarma |
|---|---|---|---|
| Cierre contable mensual + PILA | Mensual (día ~3) | día 3 | 1 día antes |
| Retención en la Fuente (form. 350) | Mensual | día ~22 | 7 y 1 día antes |
| IVA bimestral | Cada 2 meses | 11 mar · 13 may · 9 jul · 9 sep · 11 nov · 15 ene | 7 días antes |
| FONTUR (2,5 × mil) | Trimestral | abr · jul · oct · ene (día ~15) | 10 días antes |
| Renovar RNT (crítico) | Anual | 15 ene (ventana ene–mar) | 15 días antes |
| Certificados de retención | Anual | 31 mar | 10 días antes |
| Información exógena | Anual | may (abr–jun) | 15 días antes |
| Renta AG 2026 — 1ª cuota | Anual | ~24 may 2027 | 30 y 7 días antes |
| Renta AG 2026 — 2ª cuota | Anual | ~23 jul 2027 | 7 días antes |
| ICA Cali (pendiente de confirmar) | — | 20 ene (placeholder) | 7 días antes |
| Cierre anual + inventario Coins | Anual | 15 dic | 7 días antes |

### Pasos para importarlo
1. Entra a Google Calendar con la cuenta **christopher.epe@borondotours.com**.
2. Crea (opcional) un calendario nuevo llamado **"Borondo Tours — Tributario"** para tenerlo separado.
   - Rueda de ajustes → *Configuración* → *Añadir calendario* → *Crear calendario nuevo*.
3. Ve a *Configuración* → *Importar y exportar* → *Importar*.
4. Selecciona el archivo `calendario-tributario-2026-2027.ics` y elige el calendario destino.
5. Confirma. Los eventos y sus alarmas quedan cargados.
6. Comparte el calendario con quien opere las finanzas (CEO + asesor) para que a todos les llegue la alarma.

> El archivo trae recordatorios de pantalla (`VALARM DISPLAY`). Para que lleguen por **correo**, en Google Calendar abre cada evento recurrente y añade una notificación de tipo *Correo electrónico*, o configura notificaciones por correo por defecto en los ajustes del calendario.

### Mantenimiento del .ics
- Las fechas son aproximadas por dígito 8. En diciembre de cada año, cuando la DIAN publica el calendario del año siguiente, **ajustar los días exactos** y volver a importar.
- Cuando se confirme el **calendario y la tarifa de ICA Cali** (pendiente), reemplazar el evento placeholder por las fechas reales.
- Si cambia el proveedor de facturación o se habilita el RUT, no afecta este calendario (son fechas legales, no de sistema).

---

## 3. Camino B — AWS EventBridge Scheduler + SES

Para cuando la infraestructura esté desplegada. Encaja con el stack del proyecto (Lambda, EventBridge, SES, SQS). La idea: un **Scheduler** por obligación dispara una **Lambda** que envía el aviso por **SES** (correo) y, si se quiere, deja un mensaje en el dashboard.

### 3.1 Expresiones de agenda (cron) por obligación

EventBridge Scheduler usa `cron(minutos horas día-del-mes mes día-de-semana año)` en UTC. Para Colombia (UTC-5), un aviso a las 8:00 a.m. hora local = **13:00 UTC**. Los crons abajo disparan el **aviso anticipado** (no el día del vencimiento), para dar margen de preparación.

| Obligación | Cron (UTC) | Dispara |
|---|---|---|
| Preparar retención (día 15) | `cron(0 13 15 * ? *)` | el 15 de cada mes, 8:00 a.m. |
| IVA bimestral (aviso 7 días antes, ~día 4 del mes impar) | `cron(0 13 4 1,3,5,7,9,11 ? *)` | día 4 de ene/mar/may/jul/sep/nov |
| FONTUR trimestral (aviso ~día 5) | `cron(0 13 5 1,4,7,10 ? *)` | día 5 de ene/abr/jul/oct |
| Renovar RNT (aviso 15 ene) | `cron(0 13 15 1 ? *)` | 15 de enero |
| Certificados de retención (aviso 21 mar) | `cron(0 13 21 3 ? *)` | 21 de marzo |
| Renta — aviso 30 días antes (~24 abr) | `cron(0 13 24 4 ? *)` | 24 de abril |
| Cierre anual (aviso 8 dic) | `cron(0 13 8 12 ? *)` | 8 de diciembre |

> Ajustar los días a los oficiales cuando la DIAN publique el calendario del año. ICA Cali se agrega cuando se confirme su calendario.

### 3.2 Esqueleto de infraestructura (SAM)

Añadir al `infra/template.yaml` (o como stack contable aparte). Ejemplo para una obligación; replicar cambiando `Name`, `ScheduleExpression` y el payload:

```yaml
Resources:
  TaxReminderFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: handler.main
      Runtime: nodejs22.x
      Environment:
        Variables:
          REMINDER_TO: "christopher.epe@borondotours.com"
          REMINDER_FROM: "no-reply@borondotours.com"
      Policies:
        - SESCrudPolicy:
            IdentityName: borondotours.com

  RetencionSchedule:
    Type: AWS::Scheduler::Schedule
    Properties:
      Name: bt-retencion-mensual
      ScheduleExpression: "cron(0 13 15 * ? *)"
      ScheduleExpressionTimezone: "America/Bogota"   # evita calcular UTC a mano
      FlexibleTimeWindow:
        Mode: "OFF"
      Target:
        Arn: !GetAtt TaxReminderFunction.Arn
        RoleArn: !GetAtt SchedulerInvokeRole.Arn
        Input: |
          {
            "obligacion": "Retencion en la Fuente (form. 350)",
            "frecuencia": "mensual",
            "nota": "Preparar la retencion del mes anterior. Vence ~dia 22 (digito NIT 8). Nosotros preparamos, el contador firma."
          }
```

> `ScheduleExpressionTimezone: America/Bogota` deja que AWS maneje el UTC-5; con eso los crons se escriben en hora local (8:00 → `cron(0 8 ...)`), más legible que convertir a UTC.

### 3.3 Lambda de aviso (Node.js, boceto)

```javascript
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const ses = new SESClient({});

export async function main(event) {
  const { obligacion, frecuencia, nota } = event;
  const subject = `[Borondo Tours] Recordatorio tributario: ${obligacion}`;
  const body =
    `Obligacion: ${obligacion}\n` +
    `Frecuencia: ${frecuencia}\n\n` +
    `${nota}\n\n` +
    `Confirmar el dia exacto en el portal DIAN/Cali antes de declarar.`;

  await ses.send(new SendEmailCommand({
    Source: process.env.REMINDER_FROM,
    Destination: { ToAddresses: [process.env.REMINDER_TO] },
    Message: {
      Subject: { Data: subject },
      Body: { Text: { Data: body } },
    },
  }));

  return { ok: true };
}
```

> Pre-requisito SES: verificar el dominio `borondotours.com` (o al menos el remitente) en SES y, si la cuenta está en sandbox, verificar también el destinatario o salir de sandbox.

### 3.4 Por qué EventBridge y no un cron en un servidor
- El proyecto es **serverless** (sin servidores que mantener encendidos).
- Scheduler es **gestionado, barato y auditable**: cada regla queda en IaC, versionada en git.
- Reutiliza SES, que ya está en el stack para los correos transaccionales.

---

## 4. Qué NO automatizar (igual que en el Manual §8.7)
- La **firma** de las declaraciones → la pone el contador (obligatorio por ley).
- El **pago efectivo** del impuesto → lo aprueba una persona.
- La **clasificación de IVA** de servicios nuevos (gravado/exento/excluido) → criterio humano.

Los recordatorios avisan y preparan; **nunca declaran ni pagan solos**.

---

## 5. Checklist de activación

### Hoy (Camino A)
- [ ] Importar `calendario-tributario-2026-2027.ics` a Google Calendar.
- [ ] Crear calendario "Borondo Tours — Tributario" y compartirlo con CEO + asesor.
- [ ] Añadir notificación por correo a los eventos recurrentes.

### Fase técnica (Camino B)
- [ ] Verificar dominio/remitente en SES (salir de sandbox si aplica).
- [ ] Añadir `TaxReminderFunction` + `AWS::Scheduler::Schedule` al `infra/template.yaml`.
- [ ] Crear una regla Scheduler por obligación (tabla §3.1).
- [ ] Probar con una regla a 5 minutos y confirmar que llega el correo.

### Datos a confirmar (afinan fechas)
- [ ] Calendario y tarifa de **ICA Cali** para CIIU 7911 → reemplazar placeholder.
- [ ] Confirmar inscripción en **FONTUR**.
- [ ] En diciembre: ajustar días exactos con el calendario DIAN del año siguiente.

---

*Versión 1.0 — Octubre 2026 | Operado por CEO + asesor contable | Cubre el riesgo de sanción por extemporaneidad.*
