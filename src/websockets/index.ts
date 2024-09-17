import { serve, type ServerWebSocket } from 'bun';
import { handleMessage, broadcastNotification, handleConversationEnterLeave } from './messageHandler';
import { addClient, removeClient, getClients } from './clientManager';
import logger from '../utils/logger';

export function setupWebSocketServer(port: number = 8080) {
  const clients = getClients();
  serve({
    port,
    fetch(req, server) {
      if (server.upgrade(req)) {
        return;
      }
      return new Response('WebSocket connection only', { status: 400 });
    },
    websocket: {
      open(ws: ServerWebSocket<undefined>) {
        logger.info('New WebSocket connection established');
        addClient(ws);
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
      close(ws: ServerWebSocket<undefined>) {
        logger.info('WebSocket connection closed');
        removeClient(ws);
      },
    },
  });

  logger.info(`WebSocket server is running on port: ${port}`);
}
