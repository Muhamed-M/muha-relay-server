import type { Request, Response, NextFunction } from 'express';
import { saveSubscription, removeSubscription } from '../services/pushService';
import ApiError from '../utils/ApiError';

interface AuthRequest extends Request {
  user?: { id: number };
}

export const subscribeController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      throw new ApiError(400, 'Invalid subscription data');
    }

    await saveSubscription(userId, { endpoint, keys });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const unsubscribeController = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
