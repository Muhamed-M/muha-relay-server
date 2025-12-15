import type { ServerWebSocket } from 'bun';
import logger from '../utils/logger';
import { setConversationId, setUserId, getConnectedUserIds } from './clientManager';
import { updateUserActivityStatus } from '../services/userService';
import { sendPushToConversationMembers } from '../services/pushService';
import type { ClientData, WebSocketData } from '../types/websocketTypes';

export async function handleUserActivity(
  ws: ServerWebSocket<WebSocketData>,
  message: any,
  clients: Map<ServerWebSocket<WebSocketData>, ClientData>
) {
  setUserId(ws, message.userId);

  try {
    // update db
    await updateUserActivityStatus(message.userId, message.activityStatus);
  } catch (error) {
    logger.error('Failed to update user activity status', error);
  }

  // broadcast to all clients
  for (const clientData of clients.values()) {
    if (clientData.ws !== ws && clientData.ws.readyState === 1) {
      clientData.ws.send(
        JSON.stringify({
          type: 'user-activity',
          userId: message.userId,
          activityStatus: message.activityStatus,
        })
      );
    }
  }
}

export function handleConversationEnterLeave(
  ws: ServerWebSocket<WebSocketData>,
  message: any,
  clients: Map<ServerWebSocket<WebSocketData>, ClientData>
) {
  setConversationId(ws, message.conversationId);
}

export async function handleMessage(
  ws: ServerWebSocket<WebSocketData>,
  message: any,
  clients: Map<ServerWebSocket<WebSocketData>, ClientData>
) {
  // Send to connected WebSocket clients in the same conversation
  for (const clientData of clients.values()) {
    if (
      clientData.conversationId === message.conversationId &&
      clientData.ws !== ws &&
      clientData.ws.readyState === 1
    ) {
      clientData.ws.send(JSON.stringify({ type: 'message', ...message }));
    }
  }

  // Send push notifications to offline users
  try {
    const senderName = message.sender?.username || 'Someone';
    await sendPushToConversationMembers(
      message.conversationId,
      message.senderId,
      {
        title: `${senderName}`,
        body: message.content,
        data: {
          url: `/conversations/${message.conversationId}`,
          conversationId: message.conversationId,
        },
      }
    );
  } catch (error) {
    logger.error('Failed to send push notifications', error);
  }
}

export function broadcastNotification(
  ws: ServerWebSocket<WebSocketData>,
  message: any,
  clients: Map<ServerWebSocket<WebSocketData>, ClientData>
) {
  const notification = JSON.stringify({
    type: 'conversation-update',
    conversationId: message.conversationId,
    lastMessageContent: message.content,
    lastMessageAt: new Date(),
    senderId: message.senderId,
  });

  for (const clientData of clients.values()) {
    // Send to all clients NOT in this conversation AND not the sender
    if (
      clientData.conversationId !== message.conversationId &&
      clientData.ws !== ws &&
      clientData.ws.readyState === 1
    ) {
      clientData.ws.send(notification);
    }
  }
}

export function broadcastTypingToConversation(
  ws: ServerWebSocket<WebSocketData>,
  message: any,
  clients: Map<ServerWebSocket<WebSocketData>, ClientData>
) {
  for (const clientData of clients.values()) {
    if (
      clientData.conversationId === message.conversationId &&
      clientData.ws !== ws &&
      clientData.ws.readyState === 1
    ) {
      clientData.ws.send(JSON.stringify({ type: message.type, username: message.username }));
    }
  }
}
