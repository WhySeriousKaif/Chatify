import express from 'express';
import { generateStreamToken } from '../controller/video.controller.js';
import { protectedRoute } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Generate Stream token for video calling
router.post('/token', protectedRoute, generateStreamToken);

export default router;
