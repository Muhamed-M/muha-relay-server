import type { Request, Response, NextFunction } from 'express';
import { createMessage, getMessages } from '../services/messageService';

export const createMessageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const message = await createMessage(req.body);
    res.status(201).json(message);
  } catch (error) {
    next(error); // Forward the error to the error handling middleware
  }
};

export const getMessagesController = async (req: Request, res: Response, next: NextFunction) => {
  const conversationId = parseInt(req.query.conversationId?.toString() ?? '');
  const cursor = parseInt(req.query.cursor?.toString() ?? '');
  try {
    const messages = await getMessages(conversationId, cursor);
    res.status(200).json(messages);
  } catch (error) {
    next(error); // Forward the error to the error handling middleware
  }
};
