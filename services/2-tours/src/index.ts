import { Hono } from 'hono';
// Service 2-tours: Catálogo, búsqueda pg_trgm, instancias, disponibilidad
// Ownership: tours, tourInstances, tourPriceRanges, tourAddOns
const app = new Hono();
app.get('/health', (c) => c.json({ data: { service: '2-tours', status: 'ok' }, error: null, meta: null }));
export default app;
