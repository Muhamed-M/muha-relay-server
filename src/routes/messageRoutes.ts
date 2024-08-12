import express from 'express';
import { createMessageController } from '../controllers/messageController';
const router = express.Router();

router.route('/').post(createMessageController);

export default router;
