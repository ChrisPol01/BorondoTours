import { Hono } from 'hono';
// Service 9-ads: Banners, rewarded ads, tracking de impresiones/clics
// Ownership: ads, adImpressions
const app = new Hono();
app.get('/health', (c) => c.json({ data: { service: '9-ads', status: 'ok' }, error: null, meta: null }));
export default app;
