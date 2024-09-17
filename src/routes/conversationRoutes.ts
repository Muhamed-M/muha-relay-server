import express from 'express';
import {
  createConversationController,
  getConversationsController,
  getConversationController,
  updateGroupConversationController,
  updateGroupMemebersController,
  deleteGroupMemebersController,
} from '../controllers/conversationController';
const router = express.Router();

router.route('/:conversationId/group-members').put(updateGroupMemebersController).delete(deleteGroupMemebersController);
router.route('/:conversationId').get(getConversationController).put(updateGroupConversationController);
router.route('/').post(createConversationController).get(getConversationsController);

export default router;
