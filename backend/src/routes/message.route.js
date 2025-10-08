import express from "express";
import dotenv from "dotenv";

dotenv.config();

const messageRoute = express.Router();

messageRoute.post("/send", (req, res) => {
  // Handle sending message logic here
  res.send("Send message endpoint");
});

messageRoute.get("/inbox", (req, res) => {
  // Handle fetching inbox messages logic here
  res.send("Inbox messages endpoint");
});

export default messageRoute;
