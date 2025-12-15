import type { Request, Response, NextFunction } from 'express';
import { saveSubscription, removeSubscription } from '../services/pushService';
import ApiError from '../utils/ApiError';
import logger from '../utils/logger';

export const subscribeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    logger.info(`[Push] Subscribe request from user ${userId}`);

    if (!userId) {
      logger.error('[Push] No user ID found in request');
      throw new ApiError(401, 'Unauthorized');
    }

    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      logger.error('[Push] Invalid subscription data', {
        hasEndpoint: !!endpoint,
        hasP256dh: !!keys?.p256dh,
        hasAuth: !!keys?.auth,
      });
      throw new ApiError(400, 'Invalid subscription data');
    }

    await saveSubscription(userId, { endpoint, keys });
    logger.info(`[Push] Subscription saved for user ${userId}`);
    res.status(200).json({ success: true });
  } catch (error) {
    logger.error('[Push] Subscribe error:', error);
    next(error);
  }
};

export const unsubscribeController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      throw new ApiError(400, 'Endpoint is required');
    }

    const removed = await removeSubscription(endpoint);
    res.status(200).json({ success: removed });
  } catch (error) {
    next(error);
  }
};
