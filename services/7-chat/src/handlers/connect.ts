/**
 * $connect handler — registra la conexión en DynamoDB
 */
export async function handleConnect(event: {
  requestContext: { connectionId: string; authorizer?: { userId: string } }
}) {
  const { connectionId } = event.requestContext
  const userId = event.requestContext.authorizer?.userId

  // TODO: Guardar en DynamoDB tabla Connections
  console.log(`[chat] $connect: ${connectionId} (user: ${userId})`)

  return { statusCode: 200, body: 'Connected' }
}
