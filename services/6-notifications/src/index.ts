// Service 6-notifications: Email SES, Push Expo, WhatsApp, in-app WebSocket
// Event-driven (recibe de SQS, no expone rutas HTTP públicas)
// Ver: docs/04-Tech-Design/Services/Arquitectura-Notificaciones.md
export async function handler(event: any) {
  // TODO: procesar evento SQS → clasificar → enviar por canal correspondiente
  console.log('Notification event received', JSON.stringify(event));
}
