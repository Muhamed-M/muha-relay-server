import express from 'express';
import { createMessageController, getMessagesController } from '../controllers/messageController';
const router = express.Router();

router.route('/').post(createMessageController).get(getMessagesController);

export default router;
