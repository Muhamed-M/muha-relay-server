import type { Request, Response, NextFunction } from 'express';
import { markMessagesAsRead } from '../services/messageReceiptService';

export const markMessagesAsReadController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await markMessagesAsRead(req.body.conversationId, req.body.userId);
    res.status(204).end();
  } catch (error) {
    next(error); // Forward the error to the error handling middleware
  }
};
