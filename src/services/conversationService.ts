import type { CreateConversationPayload, EditConversationPayload } from '../types/conversationTypes';
import ApiError from '../utils/ApiError';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createConversation = async ({ name, isGroup, usersIds }: CreateConversationPayload) => {
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
      _count: {
        select: {
          messages: {
            where: {
              receipts: {
                some: {
                  userId: userId,
                  readAt: null, // Only count messages that are unread by this user
                },
              },
            },
          },
        },
      },
    },
    orderBy: [
      {
        lastMessageAt: {
          sort: 'desc',
          nulls: 'last', // If null, put them at the end based on the next field
        },
      },
      {
        createdAt: 'desc', // Fallback to createdAt if lastMessageAt is null
      },
    ],
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
    },
  });

  return conversation;
};

export const updateGroupConversation = async ({ conversationId, name }: EditConversationPayload) => {
  if (!name) {
    throw new ApiError(400, 'Invalid payload for group edit');
  }

  const updateGroupConversation = await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      name: name,
    },
  });

  return updateGroupConversation;
};

export const updateGroupMembers = async ({ conversationId, usersIds }: EditConversationPayload) => {
  if (!usersIds || usersIds?.length === 0) {
    throw new ApiError(400, 'Invalid payload for group members update');
  }

  const updateGroupMembers = await prisma.conversationMember.createMany({
    data: usersIds.map((userId) => ({
      conversationId: conversationId,
      userId: userId,
    })),
  });

  return updateGroupMembers;
};

export const deleteGroupMembers = async ({ conversationId, usersIds }: EditConversationPayload) => {
  if (!usersIds) {
    throw new ApiError(400, 'Invalid payload for group members delete');
  }

  const updateGroupMembers = await prisma.conversationMember.deleteMany({
    where: {
      conversationId: conversationId,
      userId: {
        in: usersIds,
      },
    },
  });

  return updateGroupMembers;
};
