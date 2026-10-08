---
tags: [tech-design, concurrencia, cupos, overselling, locking, race-conditions]
created: 2026-07-14
updated: 2026-07-14
status: aprobado
---

# Concurrencia de Cupos — Prevención de Overselling

> Define cómo se bloquean, descuentan y liberan los cupos de una `TourInstance`
> bajo concurrencia (múltiples clientes reservando el mismo cupo). Acoplado a la
> máquina de estados del Booking (ver Maquina-Estados-Booking.md).

---

## 1. Principio: dos capas de protección

| Capa | Qué hace | Garantía |
|------|----------|----------|
| **Frontend (UX)** | Deshabilita el botón "Reservar" cuando el cupo se agota; muestra "agotado" | Experiencia, NO garantía |
| **Backend (DB)** | Bloqueo atómico (`SELECT ... FOR UPDATE`) al descontar el cupo | **Garantía real** anti-overselling |

> **Regla de oro:** el frontend NUNCA es la fuente de verdad de disponibilidad.
> El único punto que garantiza que no se venda de más es la transacción atómica en PostgreSQL.

---

## 2. Ciclo de vida del cupo (acoplado a payment_status)

```
Cliente inicia checkout
   │
   ▼
[SELECT FOR UPDATE sobre TourInstance]  ← bloqueo pesimista
   │
   ├─ available_slots - booked_slots >= pax?  ── NO ──▶ error SLOTS_UNAVAILABLE
   │                                                     (botón se deshabilita en front)
   └─ SÍ
      │
      ▼
   booked_slots += pax   +   Booking payment_status = IN_PAID  (bloqueo TEMPORAL)
      │
      ├── paga (webhook CONFIRMED) ──▶ cupo pasa a bloqueo ABSOLUTO (CONFIRMED/SETTLED)
      │
      ├── expira el link (cron pasado expires_at) ──▶ EXPIRED_PAID → booked_slots -= pax (LIBERA)
      │
      ├── cliente cancela antes de CONFIRMED ──▶ CANCELED → booked_slots -= pax (LIBERA)
      │
      └── reprogramación ──▶ libera cupo de la fecha vieja, descuenta en la nueva
```

### Regla de descuento/liberación (confirmado C1/C2)

| Evento | Efecto en `booked_slots` |
|--------|--------------------------|
| Booking entra a `IN_PAID` | **Descuenta** (bloqueo temporal) |
| Booking llega a `CONFIRMED` / `SETTLED` | Se mantiene descontado (bloqueo **absoluto**) |
| Booking `CANCELED` antes de CONFIRMED | **Libera** |
| Link vence (`expires_at`) → `EXPIRED_PAID` | **Libera** (cron) |
| Reprogramación | **Libera** en fecha vieja, **descuenta** en fecha nueva |
| No Show / cancelación post-CONFIRMED | NO libera (el cupo se consumió, penalidad aplica) |

---

## 3. Implementación: bloqueo atómico (SELECT FOR UPDATE)

```typescript
// Dentro de una transacción de Drizzle
async function reserveSlots(instanceId: string, pax: number, tx: Transaction) {
  // 1. Bloqueo pesimista: nadie más puede leer/modificar esta fila hasta commit
  const [instance] = await tx
    .select()
    .from(tourInstances)
    .where(eq(tourInstances.id, instanceId))
    .for('update');   // ← SELECT ... FOR UPDATE

  // 2. Validar disponibilidad DENTRO del lock
  const availableNow = instance.available_slots - instance.booked_slots;
  if (availableNow < pax) {
    throw new ConflictException('SLOTS_UNAVAILABLE');
  }

  // 3. Descontar atómicamente
  await tx
    .update(tourInstances)
    .set({ booked_slots: instance.booked_slots + pax })
    .where(eq(tourInstances.id, instanceId));

  // 4. Crear el booking en IN_PAID (dentro de la misma transacción)
  // ... el commit libera el lock
}
```

> **Por qué FOR UPDATE y no un simple UPDATE con WHERE:** necesitamos leer el valor,
> validar reglas de negocio (disponibilidad, cupos premium) y luego escribir, todo
> atómicamente. El lock pesimista serializa las reservas concurrentes sobre la misma instancia.

### Alternativa (optimista, para alta concurrencia — Fase 3)

```sql
-- UPDATE condicional atómico: solo descuenta si hay cupo
UPDATE tour_instances
SET booked_slots = booked_slots + :pax
WHERE id = :instanceId
  AND (available_slots - booked_slots) >= :pax
RETURNING *;
-- Si no retorna fila → no había cupo (sin lock explícito, más rápido)
```

En Fase 1 (Lambda, tráfico bajo): `FOR UPDATE` es suficiente y más claro.
En Fase 3 (alta concurrencia): evaluar el UPDATE condicional para evitar contención de locks.

---

## 4. El último cupo con N compradores simultáneos (C3)

**Escenario:** 10 personas ven el último cupo. Todas tienen la pantalla abierta.

**Comportamiento definido:**
1. **Frontend (UX):** todos pueden ver el cupo mientras esté disponible. Al agotarse (vía polling/WebSocket de disponibilidad), el botón se deshabilita para quienes no han hecho clic.
2. **Backend (garantía):** el **primero** cuyo request adquiere el `FOR UPDATE` lock descuenta el cupo y pasa a la pasarela. Los demás requests que llegan milisegundos después:
   - Esperan el lock (se serializan)
   - Al obtenerlo, ven `availableNow = 0` → reciben `SLOTS_UNAVAILABLE`
   - El frontend muestra "agotado" y ofrece lista de espera

> **Clave:** no importa cuántos hagan clic "al mismo tiempo" — el lock de PostgreSQL
> los ordena. Solo uno gana. Cero overselling garantizado a nivel de BD.

---

## 5. Split Fare y cupos (C4)

Dos modalidades válidas, ambas descuentan cupo al entrar a `IN_PAID`:
- **1 pago para todos:** el organizador paga → 1 booking con N pax → descuenta N cupos de una vez.
- **Links individuales por correo:** se genera un link por participante → cada participante que entra a `IN_PAID` ocupa su cupo individual.

En ambos casos el descuento es al `IN_PAID` (bloqueo temporal), absoluto al confirmar.

> **Edge (G8 relacionado):** en Split Fare con links individuales, si algunos pagan y otros no
> antes del `balance_due_date`, solo se liberan los cupos de los que no pagaron.

---

## 6. Cupos premium por agencia (C5)

**Fase 1:** pool general compartido (simple: `available_slots` - `booked_slots`).

**Reserva futura (Fase 2+):** un operador puede bloquear X cupos para una agencia externa específica.
Modelo previsto (no implementar en F1):
```
available_slots = pool_general + cupos_premium_reservados
Un cliente del pool general solo puede tomar de pool_general.
Los cupos premium no usados 3 días antes → vuelven al pool general (Spec-I RF-I07).
```
En Fase 1 la validación de concurrencia solo considera el pool general.

---

## 7. Race conditions críticas y su manejo

| Race condition | Riesgo | Mitigación |
|----------------|--------|------------|
| **2 checkouts al último cupo** | Overselling | `SELECT FOR UPDATE` serializa (sección 3) |
| **Webhook CONFIRMED llega mientras el cron de expiración corre** | Cupo liberado de un booking ya pagado | El cron valida `payment_status = IN_PAID` con `FOR UPDATE` antes de expirar; si ya es CONFIRMED, no libera |
| **Webhook duplicado (reintento OnePay)** | Doble descuento / doble confirmación | Idempotencia por `webhook_event_id` en tabla `WebhookEvents` (no procesa 2 veces) |
| **Cliente paga justo cuando expira el link** | Pago huérfano (cupo liberado pero cliente pagó) | El webhook re-valida disponibilidad con `FOR UPDATE`; si el cupo ya se dio a otro, se dispara reembolso automático + notificación |
| **Reprogramación concurrente a fecha con 1 cupo** | 2 reprogramaciones al mismo cupo nuevo | El descuento en la fecha nueva pasa por el mismo `FOR UPDATE` |

### Guard del cron de expiración (evita liberar un pago en curso)

```typescript
async function expireBooking(bookingId: string, tx: Transaction) {
  const [booking] = await tx.select().from(bookings)
    .where(eq(bookings.id, bookingId)).for('update');

  // Solo expira si SIGUE en IN_PAID (no si ya pagó en el último segundo)
  if (booking.payment_status !== 'IN_PAID') return; // no-op

  if (new Date() < booking.reservation_expires_at) return; // aún no vence

  await tx.update(bookings).set({
    payment_status: 'EXPIRED_PAID',
    lifecycle_status: 'CANCELED',
  }).where(eq(bookings.id, bookingId));

  // Liberar cupo (con FOR UPDATE sobre la instancia)
  await releaseSlots(booking.tour_instance_id, booking.pax_count, tx);
}
```

---

## 8. Overbooking (C6)

**Decisión: estricto, sin overbooking.** BorondoTours nunca vende más cupos que `available_slots`.
(A diferencia de aerolíneas, un tour no puede "reacomodar" pasajeros.)

BorondoTours SÍ puede aumentar el **precio comercial** por encima del precio del operador
(markup, ver Domain-Financiero), pero **nunca** la cantidad de cupos.

---

## 9. Tests obligatorios

```typescript
describe('reserveSlots (concurrencia)', () => {
  it('10 reservas concurrentes al último cupo → solo 1 tiene éxito, 9 reciben SLOTS_UNAVAILABLE');
  it('descuenta cupo al entrar a IN_PAID');
  it('libera cupo al CANCELED antes de CONFIRMED');
  it('libera cupo cuando el link expira (EXPIRED_PAID)');
  it('NO libera cupo si el booking ya está CONFIRMED cuando corre el cron de expiración');
  it('webhook duplicado no descuenta cupo dos veces (idempotencia)');
  it('Split Fare con 1 pago descuenta N cupos atómicamente');
  it('reprogramación libera cupo viejo y descuenta nuevo en una transacción');
  it('nunca permite booked_slots > available_slots (invariante)');
});
```

---

## 10. Índices y consideraciones de performance

- `TourInstances` ya tiene `INDEX(tour_id, instance_date)` — suficiente para el lookup.
- El `FOR UPDATE` bloquea solo la **fila de la instancia**, no toda la tabla → contención mínima.
- En Lambda: cada invocación abre su conexión vía **RDS Proxy** (evita agotar conexiones bajo picos).
- Si una instancia popular tiene contención alta (muchos reservando a la vez): el lock los serializa;
  la latencia sube levemente pero **nunca hay overselling**. Aceptable para el volumen de BorondoTours.

---

## Links relacionados
- [[Maquina-Estados-Booking]] — payment_status y transiciones
- [[Domain-Financiero]] — cálculo del booking
- [[../../03-Knowledge/Modelo-Datos-Core]] — TourInstances (available_slots, booked_slots)
- [[../../01-Specs/Spec-B-Tour-Detail]] — calendario semáforo (RF-B05)
- [[../../02-ADRs/ADR-011-Arquitectura-Consolidada]] — RDS Proxy
