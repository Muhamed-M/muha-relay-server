import ApiError from '../utils/ApiError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const markMessagesAsRead = async (conversationId: number, userId: number) => {
  // error
  if (!conversationId || !userId) {
    throw new ApiError(400, 'Invalid message receipt payload');
  }

  await prisma.messageReceipt.updateMany({
    where: {
      userId: userId,
      message: {
        conversationId: conversationId,
      },
      readAt: null, // Only update messages that are unread
    },
    data: {
      readAt: new Date(), // Mark as read
    },
  });
};
