import express from "express";
import path from "path";
import http from "http";

import connectDB from "./config/db.js";
import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js";
import {ENV} from "./config/env.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { initializeSocket } from "./config/socket.js";

const app = express();
const server = http.createServer(app);
const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

// ✅ Connect to MongoDB BEFORE starting server
connectDB();

// Initialize socket.io
const io = initializeSocket(server);





app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
// serve static files from frontend dist folder
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.use("/api/auth", authRoute);

app.use("/api/messages", messageRoute);

// make ready for deployment - serve frontend for all routes except API routes
if (ENV.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}


server.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});