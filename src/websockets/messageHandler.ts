import type { ServerWebSocket } from 'bun';
import { setConversationId } from './clientManager';

interface ClientData {
  ws: ServerWebSocket<undefined>;
  conversationId: number;
}

export function handleConversationEnterLeave(
  ws: ServerWebSocket<undefined>,
  message: any,
  clients: Map<ServerWebSocket<undefined>, ClientData>
) {
  setConversationId(ws, message.conversationId);
}

export function handleMessage(
  ws: ServerWebSocket<undefined>,
  message: any,
  clients: Map<ServerWebSocket<undefined>, ClientData>
) {
  for (const clientData of clients.values()) {
    if (
      clientData.conversationId === message.conversationId &&
      clientData.ws !== ws &&
      clientData.ws.readyState === 1
    ) {
      clientData.ws.send(JSON.stringify(message));
    }
  }
}

export function broadcastNotification(
  ws: ServerWebSocket<undefined>,
  message: any,
  clients: Map<ServerWebSocket<undefined>, ClientData>
) {
  const notification = JSON.stringify({
    type: 'conversation-update',
    conversationId: message.conversationId,
    lastMessageContent: message.content,
    lastMessageAt: new Date(),
  });

  for (const clientData of clients.values()) {
    if (clientData.conversationId !== message.conversationId && clientData.ws.readyState === 1) {
      clientData.ws.send(notification);
    }
  }
}
