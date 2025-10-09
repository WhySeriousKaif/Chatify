import express from "express";
import path from "path";

import connectDB from "./config/db.js";
import authRoute from "./routes/auth.route.js";
import messageRoute from "./routes/message.route.js";
import {ENV} from "./config/env.js";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express();
const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

// ✅ Connect to MongoDB BEFORE starting server
connectDB();





app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
  origin: ENV.CLIENT_URL,
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


app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});