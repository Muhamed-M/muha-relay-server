import webpush from 'web-push';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Configure VAPID
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:example@example.com',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: {
    url?: string;
    conversationId?: number;
  };
}

export const saveSubscription = async (userId: number, subscription: PushSubscriptionPayload) => {
  return prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userId,
      updatedAt: new Date(),
    },
    create: {
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      userId,
    },
  });
};

export const removeSubscription = async (endpoint: string) => {
  try {
    await prisma.pushSubscription.delete({
      where: { endpoint },
    });
    return true;
  } catch {
    return false;
  }
};

export const getUserSubscriptions = async (userId: number) => {
  return prisma.pushSubscription.findMany({
    where: { userId },
  });
};

export const sendPushToUser = async (userId: number, payload: PushNotificationPayload) => {
  const subscriptions = await getUserSubscriptions(userId);

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(payload)
        );
      } catch (err: any) {
        // Remove invalid subscriptions (expired or unsubscribed)
        if (err.statusCode === 410 || err.statusCode === 404) {
          await removeSubscription(sub.endpoint);
          logger.info(`Removed invalid push subscription: ${sub.endpoint}`);
        }
        throw err;
      }
    })
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return { sent, failed };
};

export const sendPushToUsers = async (userIds: number[], payload: PushNotificationPayload) => {
  const results = await Promise.allSettled(
    userIds.map((userId) => sendPushToUser(userId, payload))
  );

  const totals = results.reduce(
    (acc, result) => {
      if (result.status === 'fulfilled') {
        acc.sent += result.value.sent;
        acc.failed += result.value.failed;
      }
      return acc;
    },
    { sent: 0, failed: 0 }
  );

  return totals;
};

export const sendPushToConversationMembers = async (
  conversationId: number,
  excludeUserId: number,
  payload: PushNotificationPayload
) => {
  // Get all members of the conversation except the sender
  const members = await prisma.conversationMember.findMany({
    where: {
      conversationId,
      userId: { not: excludeUserId },
    },
    select: { userId: true },
  });

  const userIds = members.map((m) => m.userId);

  if (userIds.length === 0) return { sent: 0, failed: 0 };

  return sendPushToUsers(userIds, payload);
};
