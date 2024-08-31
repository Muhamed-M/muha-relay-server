import express from 'express';
// Import routes
import authRoutes from './authRoutes';
import conversationRoutes from './conversationRoutes';
import messageRoutes from './messageRoutes';
import userRoutes from './userRoutes';
// Import middlewares
import { protect } from '../middlewares/auth';
const router = express.Router();

// Authentication
router.use('/api/auth', authRoutes);
// Conversations
router.use('/api/conversations', protect, conversationRoutes);
// Messages
router.use('/api/messages', protect, messageRoutes);
// Users
router.use('/api/users', protect, userRoutes);

export default router;
