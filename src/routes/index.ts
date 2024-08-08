import express from 'express';
import authRoutes from './authRoutes';
const router = express.Router();

// Authentication
router.use('/api/auth', authRoutes);

export default router;
