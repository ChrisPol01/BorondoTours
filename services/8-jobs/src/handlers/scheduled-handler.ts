/**
 * Handler para eventos programados (EventBridge Scheduler / cron).
 * Ej: conciliación 2AM, recordatorios 24h, limpieza TTL.
 */
interface ScheduledEvent {
  'detail-type': string
  detail: Record<string, unknown>
  time: string
}

export async function handleScheduledEvent(event: ScheduledEvent) {
  console.log(`[jobs] Scheduled event: ${event['detail-type']} at ${event.time}`)

  switch (event['detail-type']) {
    case 'DAILY_RECONCILIATION':
      // TODO: Conciliación de pagos a las 2AM COT
      break
    case 'TOUR_REMINDER_24H':
      // TODO: Enviar recordatorios de tour (24h antes)
      break
    case 'RELEASE_PREMIUM_SLOTS':
      // TODO: Cupos premium no usados 3 días antes → pool
      break
    default:
      console.warn(`[jobs] Unknown scheduled event: ${event['detail-type']}`)
  }

  return { statusCode: 200 }
}
