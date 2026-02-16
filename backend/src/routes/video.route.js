// Video calling routes
import express from 'express';
import { generateStreamToken } from '../controller/stream.controller.js';

const videoRoute = express.Router();

// Generate Stream Video token
videoRoute.post('/token', generateStreamToken);

export default videoRoute;

