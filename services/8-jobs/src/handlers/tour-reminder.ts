import { createClient } from '@borondo/db';

// EventBridge cron: diario 8:00 AM — push + email recordatorio 24h antes del tour
export async function handler(event: any) {
  const db = createClient();
  // TODO: buscar bookings CONFIRMED/SETTLED con tour mañana → encolar notificación en SQS
  console.log('tour-reminder executed');
}
