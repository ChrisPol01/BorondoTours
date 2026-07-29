/**
 * $disconnect handler — elimina la conexión de DynamoDB
 */
export async function handleDisconnect(event: {
  requestContext: { connectionId: string }
}) {
  const { connectionId } = event.requestContext

  // TODO: Eliminar de DynamoDB tabla Connections
  console.log(`[chat] $disconnect: ${connectionId}`)

  return { statusCode: 200, body: 'Disconnected' }
}
