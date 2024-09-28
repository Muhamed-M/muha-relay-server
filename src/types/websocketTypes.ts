import type { ServerWebSocket } from 'bun';

export interface ClientData {
  ws: ServerWebSocket<WebSocketData>;
  conversationId: number;
  userId: number;
}

export type WebSocketData = {
  userId: number;
};
