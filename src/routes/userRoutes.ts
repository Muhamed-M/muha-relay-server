import express from 'express';
import { findUsersBySearchController } from '../controllers/userController';
const router = express.Router();

router.get('/search', findUsersBySearchController);

export default router;
