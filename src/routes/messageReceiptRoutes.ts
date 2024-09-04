import express from 'express';
import { markMessagesAsReadController } from '../controllers/messageReceiptController';
const router = express.Router();

router.route('/').put(markMessagesAsReadController);

export default router;
