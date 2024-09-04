import type { MessagePayload } from '../types/messageTypes';
import ApiError from '../utils/ApiError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createMessage = async ({ content, senderId, conversationId }: MessagePayload) => {
  if (!content || !senderId || !conversationId) {
    throw new ApiError(400, 'Invalid message payload');
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Create the new message
    const createdMessage = await tx.message.create({
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

    // 2. Fetch all conversation members except the sender
    const members = await tx.conversationMember.findMany({
      where: {
        conversationId,
        userId: { not: senderId },
      },
    });

    // 3. Create a MessageReceipt for each member (except sender)
    const messageReceipts = members.map((member) => ({
      messageId: createdMessage.id,
      userId: member.userId,
      readAt: null, // Not read initially
    }));

    await tx.messageReceipt.createMany({
      data: messageReceipts,
    });

    // 4. Update conversation with lastMessageContent and lastMessageAt
    await tx.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageContent: createdMessage.content,
        lastMessageAt: createdMessage.createdAt,
      },
    });

    return createdMessage;
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
