---
tags: [tech-design, notificaciones, eventos, ses, expo-push, whatsapp, websocket]
created: 2026-07-14
updated: 2026-07-14
status: aprobado
---

# Arquitectura de Notificaciones

> Servicio centralizado, orientado a eventos, que distribuye notificaciones por
> 4 canales (email, push, WhatsApp/SMS, in-app) según el tipo y las preferencias
> del usuario. Evita spam y duplicados mediante deduplicación por evento.

---

## 1. Diseño: NotificationService central orientado a eventos (N1)

```
Evento de dominio (PaymentConfirmed, TourReminder, etc.)
   │
   ▼
EventBridge / SQS
   │
   ▼
NotificationService (Lambda central)
   │  1. Clasifica el tipo (transaccional | operativo | marketing | seguridad)
   │  2. Resuelve canales según tipo + preferencias del usuario
   │  3. Verifica deduplicación (notification_id)
   ▼
Distribuye a los canales:
   ├── AWS SES (email)
   ├── Expo Push (push móvil)
   ├── WhatsApp API / SMS (marketing)
   └── API Gateway WebSocket (in-app tiempo real)
```

> **Regla:** ningún módulo envía notificaciones directamente. TODO pasa por el
> NotificationService central → una sola fuente para clasificar, deduplicar y respetar preferencias.

---

## 2. Clasificación de notificaciones (N2/N3)

| Tipo | Canal(es) | ¿Configurable por el usuario? |
|------|-----------|-------------------------------|
| **Transaccional** (confirmación de pago, voucher, reembolso) | Email (SES) **siempre** + in-app | ❌ Obligatorias |
| **Seguridad** (login nuevo, cambio de contraseña, OTP) | Email **siempre** | ❌ Obligatorias |
| **Operativa** (recordatorio 24h, chat pre-tour, cambios de estado) | Push + in-app | ⚠️ Parcial (push opcional, in-app siempre) |
| **Marketing** (promos, ofertas, tours sugeridos) | WhatsApp / SMS | ✅ Opt-in (respeta preferencias + Ley 1581) |

---

## 3. Catálogo de notificaciones (N2 — análisis QA)

Como QA, estas son las notificaciones que identifico en el sistema y el canal recomendado:

| Evento | Tipo | Canal recomendado | Notas |
|--------|------|-------------------|-------|
| Registro / verificación email | Seguridad | Email | OTP de verificación |
| OTP (cambio password, cancelación) | Seguridad | Email (+ SMS Fase 2) | Obligatorio |
| Login desde nuevo dispositivo | Seguridad | Email | Alerta de seguridad |
| Pago confirmado (booking) | Transaccional | Email + in-app | Con voucher adjunto/link |
| Reserva 40% confirmada (Split Fare) | Transaccional | Email + in-app | — |
| Link de saldo 60% disponible | Operativa | Email + push + WhatsApp | 5 días antes (RF-C06b) |
| Recordatorio 24h antes del tour | Operativa | Push + email | Con detalles del punto de encuentro |
| Chat pre-tour activado (24h antes) | Operativa | Push + in-app | Abre el chat tripartito |
| Mensaje nuevo en chat | Operativa | Push + in-app (WebSocket) | Tiempo real |
| Cancelación confirmada | Transaccional | Email + in-app | Con detalle de penalidad/reembolso |
| Reembolso aprobado / completado | Transaccional | Email + in-app | Nº de referencia |
| Reprogramación confirmada | Transaccional | Email + in-app | Nueva fecha |
| Tour cancelado por operador | Transaccional (urgente) | Email + push + WhatsApp | Ofrece reprogramar |
| Incidente en tour (para COORD) | Operativa (urgente) | Push + in-app + email | Alerta prioritaria |
| Solicitud de reseña (24h post-tour) | Operativa | Push + email | Trigger automático |
| Comisión liquidada (agente/freelancer) | Transaccional | Email + in-app | — |
| Payout ejecutado (operador) | Transaccional | Email + in-app | Con desglose |
| Alerta SOAT por vencer (operador) | Operativa | Email + in-app | 30 días antes |
| Promos / ofertas anticipadas | Marketing | WhatsApp / SMS | Opt-in obligatorio |
| Cupo liberado (lista de espera) | Operativa | Push + email | Hold temporal para pagar |

---

## 4. WhatsApp: API oficial vs alternativa (N4)

**Preferencia:** API oficial de WhatsApp Business (plantillas aprobadas, confiable).

**Enfoque costo-eficiente recomendado:**
- Para **notificaciones automáticas al cliente** (marketing/operativas): API oficial de WhatsApp Business Cloud API vía webhook + API Gateway. Requiere plantillas pre-aprobadas por Meta y tiene costo por conversación.
- Si existe un **proveedor/MCP** que exponga WhatsApp con webhook manejable vía API Gateway a menor costo, se integra bajo el patrón Strategy (igual que la pasarela de pagos) para poder cambiar de proveedor sin reescribir.
- Para **agentes** (Spec-H): links `wa.me` pre-llenados (gratis, el agente hace clic) — esto se mantiene, es distinto de las notificaciones automáticas.

**Decisión de arquitectura:** `WhatsAppProvider` como interfaz (Strategy Pattern). Implementación inicial: la más costo-eficiente que cumpla; intercambiable después.

> **Pendiente validar:** costo por conversación de WhatsApp Business API vs proveedores alternativos.
> Evaluar en la misma línea que la decisión de pasarela (costo-eficiencia).

---

## 5. Deduplicación (N5) — orientado a eventos

- Cada notificación tiene un `notification_id` derivado de `(event_id + channel + user_id)`.
- El NotificationService verifica si ese `notification_id` ya se envió antes de despachar.
- **Regla (tu N5):** el evento se quita de la cola SQS **solo si se procesó exitosamente**. Si falla, permanece/reintenta.
- Esto evita que un reintento de SQS (mismo `event_id`) genere 2 emails al cliente.

```typescript
async function dispatch(event: DomainEvent) {
  for (const channel of resolveChannels(event)) {
    const notificationId = hash(event.id, channel, event.userId);
    if (await alreadySent(notificationId)) continue; // dedupe
    await send(channel, event);
    await markSent(notificationId);
  }
}
```

---

## 6. Reintentos y DLQ (N6)

- Si un envío falla (SES caído, push rechazado): el mensaje **reintenta** con backoff exponencial.
- Tras N reintentos fallidos: va a una **Dead-Letter Queue (DLQ)**.
- **Regla (tu N6):** las notificaciones críticas (transaccionales) se reintentan **las veces necesarias hasta que lleguen al cliente** (con backoff creciente; la DLQ permite reprocesar manualmente).
- Alarma CloudWatch si la DLQ supera un umbral → alerta al equipo.

| Canal | Reintentos | Fallback |
|-------|-----------|----------|
| Email (SES) | Sí, hasta entregar | DLQ + alerta |
| Push (Expo) | 3 reintentos | Si el token es inválido → marca `UserPushTokens.is_active=false`, cae a email |
| WhatsApp/SMS | 3 reintentos | Cae a email si es crítico |
| In-app (WebSocket) | Si no está conectado → se guarda y se muestra al reconectar | N/A |

---

## 7. Tests obligatorios

```typescript
describe('NotificationService', () => {
  it('clasifica correctamente transaccional vs marketing vs seguridad');
  it('transaccionales SIEMPRE se envían (ignoran preferencias)');
  it('marketing respeta el opt-in del usuario (Ley 1581)');
  it('deduplica: mismo event_id + channel + user no se envía 2 veces');
  it('evento se quita de SQS solo tras envío exitoso');
  it('falla de envío → reintenta con backoff → DLQ');
  it('push con token inválido → cae a email y desactiva el token');
  it('in-app sin conexión → se guarda y se entrega al reconectar');
});
```

---

## Links relacionados
- [[Maquina-Estados-Booking]] — eventos que disparan notificaciones
- [[../../02-ADRs/ADR-011-Arquitectura-Consolidada]] — EventBridge/SQS, API GW WebSocket, SES, Expo
- [[../../03-Knowledge/Politica-Datos-Personales]] — opt-in marketing, Ley 1581
- [[../../01-Specs/Spec-J-BorondoTours-App-Movil]] — RF-J11 (push por rol)
