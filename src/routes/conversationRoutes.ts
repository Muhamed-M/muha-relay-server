import express from 'express';
import { createConversationController, getConversationsController } from '../controllers/conversationController';
const router = express.Router();

router.route('/').post(createConversationController).get(getConversationsController);

export default router;
