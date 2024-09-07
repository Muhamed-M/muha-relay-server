import type { ServerWebSocket } from 'bun';

interface ClientData {
  ws: ServerWebSocket<undefined>;
  conversationId: number;
}

const clients: Map<ServerWebSocket<undefined>, ClientData> = new Map();

export function addClient(ws: ServerWebSocket<undefined>) {
  clients.set(ws, { ws, conversationId: 0 });
}

export function removeClient(ws: ServerWebSocket<undefined>) {
  clients.delete(ws);
}

export function getClients() {
  return clients;
}

export function setConversationId(ws: ServerWebSocket<undefined>, conversationId: number) {
  if (clients.has(ws)) {
    clients.get(ws)!.conversationId = conversationId;
  }
}
