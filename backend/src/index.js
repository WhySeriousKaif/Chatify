import express from "express";
import path from "path";
import http from "http";

import connectDB from "./config/db.js";
import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js";
import videoRoute from "./routes/video.route.js";
import {ENV} from "./config/env.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { initializeSocket } from "./config/socket.js";

const app = express();
const server = http.createServer(app);
const __dirname = path.resolve();



// Use process.env.PORT directly (many hosting platforms set this automatically)
const PORT = process.env.PORT || ENV.PORT || 3000;

// ✅ Connect to MongoDB BEFORE starting server
connectDB();

// Initialize socket.io
const io = initializeSocket(server);

// ZegoCloud doesn't require backend initialization

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

app.use(cors({
  origin: ENV.NODE_ENV === "production" 
    ? (ENV.FRONTEND_URL ? [ENV.FRONTEND_URL, ENV.CLIENT_URL].filter(Boolean) : true) // Allow production frontend URLs or all if not set
    : ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
}));

app.use("/api/auth", authRoute);

app.use("/api/messages", messageRoute);

app.use("/api/video", videoRoute);


// Start server - bind to 0.0.0.0 to accept connections from any network interface
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is running on port ${PORT}`);
  if (ENV.NODE_ENV === 'production') {
    console.log(`🌐 Production mode enabled`);
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`⚠️  Port ${PORT} is already in use. Please use a different port.`);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Promise Rejection:', error);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});