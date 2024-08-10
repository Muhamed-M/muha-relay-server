import type { Request, Response, NextFunction } from 'express';
import { createConversation, getConversations } from '../services/conversationService';

export const createConversationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversation = await createConversation(req.body);
    res.status(201).json({
      message: 'Conversation created successfully!',
      data: conversation,
    });
  } catch (error) {
    next(error); // Forward the error to the error handling middleware
  }
};

export const getConversationsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = parseInt(req.query.userId?.toString() ?? '');
    const conversations = await getConversations(userId);
    res.status(201).json({
      data: conversations,
    });
  } catch (error) {
    next(error); // Forward the error to the error handling middleware
  }
};
