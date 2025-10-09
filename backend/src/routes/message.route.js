import express from "express";
import dotenv from "dotenv";
import { getAllContacts, getChatPartners, getMessagesByUserId, sendMessage } from "../controller/message.controller.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";

dotenv.config();

const messageRoute = express.Router();

messageRoute.use(arcjetProtection,protectedRoute)


messageRoute.get('/contacts',getAllContacts)
messageRoute.get('/chats',getChatPartners)
messageRoute.get('/:id',getMessagesByUserId)
messageRoute.post("/send/:id",sendMessage)

export default messageRoute;
// 3:00:36