import type { Request, Response, NextFunction } from 'express';
import {
  createConversation,
  getConversations,
  getConversation,
  updateGroupConversation,
  updateGroupMembers,
  deleteGroupMembers,
} from '../services/conversationService';

export const createConversationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    req.body.usersIds.push(req.user.id); // Add the logged user to the conversation
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

export const getConversationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversationId = parseInt(req.params.conversationId);
    const userId = parseInt(req.query.userId?.toString() ?? '');

    const conversation = await getConversation(conversationId, userId);
    res.status(201).json(conversation);
  } catch (error) {
    next(error); // Forward the error to the error handling middleware
  }
};

export const updateGroupConversationController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversationId = parseInt(req.params.conversationId);

    const conversation = await updateGroupConversation({ conversationId, name: req.body.name });
    res.status(200).json(conversation);
  } catch (error) {
    next(error); // Forward the error to the error handling middleware
  }
};

export const updateGroupMemebersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversationId = parseInt(req.params.conversationId);

    const conversation = await updateGroupMembers({ conversationId, usersIds: req.body.usersIds });
    res.status(200).json(conversation);
  } catch (error) {
    next(error); // Forward the error to the error handling middleware
  }
};

export const deleteGroupMemebersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const conversationId = parseInt(req.params.conversationId);

    const conversation = await deleteGroupMembers({ conversationId, usersIds: req.body.usersIds });
    res.status(200).json(conversation);
  } catch (error) {
    next(error); // Forward the error to the error handling middleware
  }
};
