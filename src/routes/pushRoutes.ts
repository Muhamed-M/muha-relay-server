import express from 'express';
import { subscribeController, unsubscribeController } from '../controllers/pushController';

const router = express.Router();

router.post('/subscribe', subscribeController);
router.post('/unsubscribe', unsubscribeController);

export default router;
