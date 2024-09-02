import type { ConversationPayload } from '../types/conversationTypes';
import ApiError from '../utils/ApiError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createConversation = async ({ name, isGroup, usersIds }: ConversationPayload) => {
  if (usersIds.length !== 2 && !isGroup) {
    throw new ApiError(400, 'Direct conversation must have exactly two users');
  }

  // Start a transaction to ensure that the conversation and its members are created atomically
  const conversation = await prisma.$transaction(async (prisma) => {
    // Step 1: Create the conversation
    const newConversation = await prisma.conversation.create({
      data: {
        name: isGroup ? name : null, // Name is null for direct conversations
        isGroup: isGroup,
      },
    });

    // Step 2: Add the users to the conversation
    await prisma.conversationMember.createMany({
      data: usersIds.map((userId) => ({
        conversationId: newConversation.id,
        userId: userId,
      })),
    });

    return newConversation;
  });

  return conversation;
};

export const getConversations = async (userId: number) => {
  const conversations = await prisma.conversation.findMany({
    where: {
      members: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      members: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      messages: {
        select: {
          id: true,
          content: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 1,
      },
    },
  });

  return conversations;
};

export const getConversation = async (conversationId: number, userId: number) => {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      members: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      members: {
        select: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      messages: {
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
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });

  return conversation;
};
