import type { MessagePayload } from '../types/messageTypes';
import ApiError from '../utils/ApiError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createMessage = async ({ content, senderId, conversationId }: MessagePayload) => {
  if (!content || !senderId || !conversationId) {
    throw new ApiError(400, 'Invalid message payload');
  }

  return prisma.message.create({
    data: {
      content,
      senderId,
      conversationId,
    },
  });
};
