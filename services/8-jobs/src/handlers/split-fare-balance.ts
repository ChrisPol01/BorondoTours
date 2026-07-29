import { createClient } from '@borondo/db';

// EventBridge cron: diario 8:00 AM — envía links de saldo 60% (5 días antes del tour)
export async function handler(event: any) {
  const db = createClient();
  // TODO: buscar bookings PARTIAL_PAID con balance_due_date próxima → generar links OnePay
  console.log('split-fare-balance executed');
}
