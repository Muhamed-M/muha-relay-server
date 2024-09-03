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
    include: {
      sender: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
};

export const getMessages = async (conversationId: number, cursor?: number) => {
  const messages = await prisma.message.findMany({
    select: {
      id: true,
      content: true,
      senderId: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          username: true,
        },
      },
    },
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 30,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // Skip the cursor itself
    }),
  });

  // Reverse the order of messages to be chronological
  if (messages) {
    messages.reverse();
  }

  return messages;
};
