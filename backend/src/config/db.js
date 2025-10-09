import mongoose from "mongoose";
import {ENV} from "./env.js";

const connectDB = async () => {
  try {
    // For development, we'll skip database connection if no MongoDB URI is provided
    if (!ENV.MONGODB_URI) {
      console.log("⚠️  No MongoDB URI provided, running without database");
      return;
    }
    
    const conn = await mongoose.connect(ENV.MONGODB_URI);
    console.log("🚀 Database connected successfully");
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.log("⚠️  Continuing without database connection");
  }
};

export default connectDB;