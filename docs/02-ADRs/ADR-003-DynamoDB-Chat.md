---
tags: [adr, chat, dynamodb, postgresql, tiempo-real, socket-io]
id: ADR-003
titulo: Almacenamiento de chat — DynamoDB vs PostgreSQL
estado: Aceptado
fecha: 2025-07-14
autores: [BorondoTours CTO]
---

# ADR-003 — Chat: DynamoDB vs PostgreSQL para historial de mensajes

## Estado
`Aceptado`

## Contexto

BorondoTours tiene planificado un **chat tripartito** para las 24 horas previas al tour, entre:
- El **cliente** (viajero con reserva confirmada)
- El **guía** asignado a la instancia del tour
- El **coordinador** de BorondoTours (monitoreo y soporte)

Características del sistema de chat:
- Se activa automáticamente 24h antes del tour y se cierra 2h después
- Los mensajes deben persistir para auditoría y resolución de incidentes
- Alta frecuencia de escritura (ráfagas de mensajes cortos en el periodo crítico pre-tour)
- Acceso por `booking_id` (patrón de acceso predecible y uniforme)
- Historial se consulta completo por booking (no hay queries de texto, ni búsqueda full-text)
- El volumen de mensajes por booking es bajo (< 200 mensajes en las 26h de ventana)

---

## Opciones evaluadas

### Opción A: Amazon DynamoDB (seleccionado)
**Pros:**
- Serverless: escala automáticamente sin gestión de capacidad
- Latencia de escritura < 5ms en p99 (crítico en periodo pre-tour con muchos usuarios simultáneos)
- Patrón de acceso perfecto para DynamoDB: PK = `booking_id`, SK = `timestamp#message_id`
- Sin JOINs necesarios: el historial completo de un chat se lee en 1 query
- Costo: se paga por operación, no por servidor encendido (el chat solo está activo ~26h)
- TTL nativo de DynamoDB: los mensajes se pueden archivar/eliminar automáticamente después de 90 días

**Contras:**
- Requiere AWS (pero BorondoTours ya usa AWS SES y S3 en Fase 1)
- Sin queries complejas (búsqueda de texto en mensajes no es posible nativamente)
- Modelo de datos diferente a PostgreSQL (curva de aprendizaje menor)

### Opción B: PostgreSQL (tabla `ChatMessages`)
**Pros:**
- Sin infraestructura adicional
- Queries SQL familiares
- JOIN natural con `Bookings`, `Users`

**Contras:**
- Escrituras de chat compiten con escrituras transaccionales (bookings, payouts)
- En periodo de alta concurrencia pre-tour: múltiples chats activos simultáneos pueden impactar el IOPS de la BD principal
- `SELECT * FROM chat_messages WHERE booking_id = :id ORDER BY created_at` funciona en bajo volumen pero no escala bien sin particionamiento
- Requiere índice en `(booking_id, created_at)` y gestión de particiones en Fase 3

### Opción C: Firebase Realtime Database / Firestore
**Pros:**
- Tiempo real nativo sin gestionar Socket.io

**Contras:**
- Vendor lock-in con Google (BorondoTours ya está en AWS)
- Requiere integración de SDK de Firebase en el frontend y backend
- El tiempo real ya está cubierto con Socket.io (NestJS Gateway)
- Descartado

---

## Decisión

> **Amazon DynamoDB para historial de mensajes. Socket.io (NestJS) para tiempo real. PostgreSQL NO se usa para mensajes de chat.**

### Arquitectura del chat:

```
[Cliente / Guía / Coordinador]
         ↓  WebSocket (Socket.io)
[NestJS ChatGateway]
         ↓  1. Emite el mensaje a los participantes (tiempo real)
         ↓  2. Persiste en DynamoDB (async — no bloquea la respuesta)
         ↓  3. Notifica al COORD si el mensaje contiene palabras clave de urgencia

[Historial de chat]
  GET /api/v1/chat/:booking_id/messages
  → DynamoDB: Query PK=booking_id, SK begins_with(timestamp)
  → Retorna mensajes paginados (cursor-based, no offset)
```

### Modelo de datos en DynamoDB:

```
Tabla: BorondoChat

PK: booking_id        (ej: "bkg_abc123")
SK: timestamp#msg_id  (ej: "2025-09-01T14:30:00Z#msg_xyz789")

Atributos:
  - sender_id: string      ← user_id del remitente
  - sender_role: string    ← CLIENT | OPERATOR_GUIDE | COORD
  - sender_nombre: string  ← denormalizado para evitar JOIN
  - content: string        ← texto del mensaje (max 1000 chars)
  - type: string           ← TEXT | SYSTEM | URGENCIA
  - read_by: string[]      ← user_ids que leyeron el mensaje
  - ttl: number            ← Unix timestamp: created_at + 90 días (DynamoDB TTL)

Índice secundario (GSI):
  GSI-1: sender_id (PK), timestamp (SK) ← para ver mensajes enviados por un usuario
```

### Ventana de activación del chat:

```
T - 24h: BullMQ job activa el room del chat para el booking_id
         → Notifica a cliente, guía y coordinador por email + push
         → Chat abierto en portal cliente y app móvil del guía
T + 2h:  BullMQ job cierra el room del chat (mensajes quedan en DynamoDB para auditoría)
         → Status del chat: CLOSED
         → Los mensajes siguen accesibles para COORD y SUPER_ADMIN
```

---

## Consecuencias

### Positivas
- La BD PostgreSQL no absorbe la carga de escrituras del chat
- DynamoDB TTL elimina mensajes automáticamente a los 90 días (sin cron job)
- El patrón PK=booking_id es ideal: todas las consultas son por booking
- Escalable sin cambios cuando haya cientos de tours simultáneos

### Negativas / Trade-offs
- Dos bases de datos que gestionar (PostgreSQL + DynamoDB)
- Búsqueda de texto en el historial de mensajes no es posible nativamente (sería necesario DynamoDB Streams → OpenSearch si se requiere en el futuro)
- Requiere configurar AWS credentials en el entorno de desarrollo local (LocalStack como alternativa)

### Acciones derivadas
- [ ] Crear tabla DynamoDB `BorondoChat` con PK/SK definidos y TTL habilitado
- [ ] Implementar `ChatGateway` en NestJS con Socket.io y rooms por `booking_id`
- [ ] Implementar BullMQ jobs: `activate-chat-room` y `close-chat-room`
- [ ] Para desarrollo local: configurar LocalStack con tabla DynamoDB equivalente
- [ ] Definir palabras clave de urgencia que notifican al COORD automáticamente (ej: "accidente", "cancelado", "perdido")

---

## Links relacionados
- [[ADR-Index]]
- [[../01-Specs/Spec-G-ERP-Operativo]]
- [[../00-Inicio/Stack-Tecnologico]]
