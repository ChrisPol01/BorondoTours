/**
 * Handler para eventos de notificación.
 * Orquesta: Email (SES), Push (Expo), WhatsApp (Fase 2).
 */

interface NotificationEvent {
  type: 'email' | 'push' | 'whatsapp'
  to: string
  template: string
  data: Record<string, unknown>
}

export async function handleNotificationEvent(event: NotificationEvent) {
  switch (event.type) {
    case 'email':
      // TODO: Enviar via AWS SES
      console.log(`[notifications] Sending email to ${event.to}, template: ${event.template}`)
      return { sent: true, channel: 'email' }

    case 'push':
      // TODO: Enviar via Expo Push Notifications
      console.log(`[notifications] Sending push to ${event.to}`)
      return { sent: true, channel: 'push' }

    case 'whatsapp':
      // TODO: Fase 2
      console.log(`[notifications] WhatsApp not implemented`)
      return { sent: false, channel: 'whatsapp', reason: 'not_implemented' }

    default:
      throw new Error(`Unknown notification type: ${(event as NotificationEvent).type}`)
  }
}
