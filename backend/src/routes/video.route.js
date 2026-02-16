// Video calling routes
import express from 'express';
import { generateZegoToken, checkZegoConfig } from '../controller/video.controller.js';

const videoRoute = express.Router();

// Generate ZegoCloud token for video calling
videoRoute.post('/zego/token', generateZegoToken);

// Check ZegoCloud configuration
videoRoute.get('/zego/config', checkZegoConfig);

export default videoRoute;

