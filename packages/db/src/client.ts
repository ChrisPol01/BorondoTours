import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Singleton fuera del handler para reutilizar conexión entre invocaciones Lambda
let client: ReturnType<typeof drizzle> | null = null;

export function createClient(connectionString?: string) {
  if (client) return client;
  const url = connectionString ?? process.env.DATABASE_URL!;
  const sql = postgres(url, { max: 1 }); // RDS Proxy maneja el pooling
  client = drizzle(sql, { schema });
  return client;
}
