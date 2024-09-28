import { serve, type ServerWebSocket } from 'bun';
import {
  handleMessage,
  broadcastNotification,
  handleConversationEnterLeave,
  handleUserActivity,
} from './messageHandler';
import { addClient, removeClient, getClients } from './clientManager';
import logger from '../utils/logger';
import { verifyJwtToken } from '../utils/auth';
import type { WebSocketData } from '../types/websocketTypes';

export function setupWebSocketServer(port: number = 8080) {
  const clients = getClients();

  serve<WebSocketData>({
    port,
    fetch(req, server) {
      const url = new URL(req.url);
      const token = url.searchParams.get('token');

      if (!token) {
        logger.error('Unauthorized: Token is required');
        return new Response('Unauthorized: Token is required', { status: 401 });
      }

      let decoded: any;
      try {
        // Verify JWT and extract user ID
        decoded = verifyJwtToken(token);
      } catch (err) {
        logger.error('Unauthorized: Invalid token', err);
        return new Response('Unauthorized: Invalid token', { status: 401 });
      }

      server.upgrade(req, {
        data: {
          userId: decoded.id,
        },
      });

      return undefined;
    },
    websocket: {
      open(ws: ServerWebSocket<WebSocketData>) {
        logger.info('New WebSocket connection established');
        addClient(ws);
        // Access the userId passed from the 'fetch' handler
        const userId = ws.data?.userId; // Retrieve userId from the WebSocket context
        handleUserActivity(ws, { userId, activityStatus: 'online' }, clients);
      },
      message(ws, message) {
        const parsedMessage = JSON.parse(message.toString());

        if (parsedMessage.type === 'join' || parsedMessage.type === 'left') {
          handleConversationEnterLeave(ws, parsedMessage, clients);
        } else {
          handleMessage(ws, parsedMessage, clients);
          broadcastNotification(ws, parsedMessage, clients);
        }
      },
      async close(ws: ServerWebSocket<WebSocketData>) {
        logger.info('WebSocket connection closed');
        await handleUserActivity(ws, { userId: clients.get(ws)!.userId, activityStatus: 'offline' }, clients);
        removeClient(ws);
      },
    },
  });

  logger.info(`WebSocket server is running on port: ${port}`);
}
