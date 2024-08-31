import { serve, type ServerWebSocket } from 'bun';

interface ClientData {
  ws: ServerWebSocket<undefined>;
  conversationId: number;
}

export function setupWebSocketServer(port: number = 8080) {
  const clients: Map<ServerWebSocket<undefined>, ClientData> = new Map();

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
        console.log('New WebSocket connection established');
        clients.set(ws, { ws, conversationId: 0 });
      },
      message(ws, message) {
        const parsedMessage = JSON.parse(message.toString());
        console.log(parsedMessage);

        // conversation opened is "join"
        if (parsedMessage.type === 'join') {
          // Assign conversationId to the client
          clients.get(ws)!.conversationId = parsedMessage.conversationId;
        } else {
          // Broadcast the message to all clients in the same conversation
          for (const clientData of clients.values()) {
            if (
              clientData.conversationId == parsedMessage.conversationId &&
              clientData.ws !== ws &&
              clientData.ws.readyState === 1
            ) {
              console.log('mathced conversaiton');
              clientData.ws.send(message);
            }
          }
        }
      },
      close(ws: ServerWebSocket<undefined>) {
        console.log('WebSocket connection closed');
        clients.delete(ws); // Remove the client from the set when it disconnects
      },
    },
  });

  console.log(`WebSocket server is running on ws://localhost:${port}`);
}
