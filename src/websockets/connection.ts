import { serve, type ServerWebSocket } from 'bun';

export function setupWebSocketServer(port: number = 8080) {
  const clients: Set<ServerWebSocket<undefined>> = new Set();

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
        clients.add(ws);
      },
      message(ws, message) {
        console.log('Received message:', message);

        // Broadcast the message to all connected clients
        for (const client of clients) {
          // Ensure the client is open and not the sender
          if (client !== ws && client.readyState === 1) {
            client.send(message);
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
