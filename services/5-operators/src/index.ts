import { Hono } from 'hono';
// Service 5-operators: CRUD operadores, contratos, payouts, retenciones, vehículos
// Ownership: operators, operatorContracts, operatorPayouts, operatorChargebacks, vehicles, operatorDocuments
const app = new Hono();
app.get('/health', (c) => c.json({ data: { service: '5-operators', status: 'ok' }, error: null, meta: null }));
export default app;
