import express from 'express';
import {
  createConversationController,
  getConversationsController,
  getConversationController,
} from '../controllers/conversationController';
const router = express.Router();

router.route('/:conversationId').get(getConversationController);
router.route('/').post(createConversationController).get(getConversationsController);

export default router;
