import type { ServerWebSocket } from 'bun';
import type { WebSocketData, ClientData } from '../types/websocketTypes';

const clients: Map<ServerWebSocket<WebSocketData>, ClientData> = new Map();

export function addClient(ws: ServerWebSocket<WebSocketData>) {
  clients.set(ws, { ws, conversationId: 0, userId: 0 });
}

export function removeClient(ws: ServerWebSocket<WebSocketData>) {
  clients.delete(ws);
}

export function getClients() {
  return clients;
}

export function setConversationId(ws: ServerWebSocket<WebSocketData>, conversationId: number) {
  if (clients.has(ws)) {
    clients.get(ws)!.conversationId = conversationId;
  }
}

export function setUserId(ws: ServerWebSocket<WebSocketData>, userId: number) {
  if (clients.has(ws)) {
    clients.get(ws)!.userId = userId;
  }
}
