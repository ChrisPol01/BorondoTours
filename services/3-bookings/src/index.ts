import { Hono } from 'hono';
// Service 3-bookings: Checkout, estados multi-dimensional, cupos, pasajeros
// Ownership: bookings, bookingPassengers, bookingAddOns, splitFareParticipants
const app = new Hono();
app.get('/health', (c) => c.json({ data: { service: '3-bookings', status: 'ok' }, error: null, meta: null }));
export default app;
