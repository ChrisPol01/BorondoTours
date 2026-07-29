// Dev server local — Bun sirve directamente
// En Lambda, LWA proxea al puerto 8080 automáticamente
import app from './index';

const port = Number(process.env.PORT) || 8080;

export default {
  port,
  fetch: app.fetch,
};

console.log(`🔥 1-core running on http://localhost:${port}`);
