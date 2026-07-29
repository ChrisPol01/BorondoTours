import { Hono } from 'hono';
// Service 4-payments: OnePay webhooks, split payment, dispersión, conciliación
// Ownership: webhookEvents, refundRequests
const app = new Hono();
app.get('/health', (c) => c.json({ data: { service: '4-payments', status: 'ok' }, error: null, meta: null }));
export default app;
