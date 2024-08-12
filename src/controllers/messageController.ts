import type { Request, Response, NextFunction } from 'express';
import { createMessage } from '../services/messageService';

export const createMessageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await createMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    next(error); // Forward the error to the error handling middleware
  }
};
