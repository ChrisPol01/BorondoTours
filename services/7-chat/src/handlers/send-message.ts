/**
 * sendMessage handler — persiste mensaje en DynamoDB, broadcast a participantes
 */
export async function handleSendMessage(event: {
  requestContext: { connectionId: string }
  body: string
}) {
  const { connectionId } = event.requestContext
  const body = JSON.parse(event.body)

  // TODO:
  // 1. Guardar mensaje en DynamoDB (ChatMessages, PK: chat_type#entity_id, SK: timestamp#msg_id)
  // 2. Buscar conexiones de los participantes del chat
  // 3. Broadcast via ApiGatewayManagementApi.postToConnection()
  console.log(`[chat] sendMessage from ${connectionId}:`, body)

  return { statusCode: 200, body: 'Message sent' }
}
