import express from 'express';
// Import routes
import authRoutes from './authRoutes';
import conversationRoutes from './conversationRoutes';
// Import middlewares
import { protect } from '../middlewares/auth';
const router = express.Router();

// Authentication
router.use('/api/auth', authRoutes);
// Conversations
router.use('/api/conversations', protect, conversationRoutes);

export default router;
