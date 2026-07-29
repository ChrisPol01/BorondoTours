// Service 7-chat: API Gateway WebSocket handlers
// Recibe POST desde API Gateway WS ($connect, $disconnect, sendMessage)
// Stateless — DynamoDB guarda Connections y ChatMessages
// Ver: docs/02-ADRs/ADR-003-DynamoDB-Chat.md
export async function handler(event: any) {
  const { requestContext } = event;
  const routeKey = requestContext?.routeKey;

  switch (routeKey) {
    case '$connect':
      // TODO: guardar connectionId en DynamoDB Connections
      return { statusCode: 200 };
    case '$disconnect':
      // TODO: eliminar connectionId de DynamoDB
      return { statusCode: 200 };
    case 'sendMessage':
      // TODO: parsear body, guardar en ChatMessages, broadcast a room
      return { statusCode: 200 };
    default:
      return { statusCode: 400 };
  }
}
