import { createClient } from '@borondo/db';

// EventBridge cron: diario 2:00 AM — concilia pagos últimas 48h con OnePay
export async function handler(event: any) {
  const db = createClient();
  // TODO: consultar API OnePay últimas 48h → comparar con bookings → resolver discrepancias
  console.log('reconcile-payments executed');
}
