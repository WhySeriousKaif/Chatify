import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ENV } from "../config/env.js";

export const socketAuthMiddleware = async (socket, next) => {
  try {
    console.log("Socket auth attempt - cookies:", socket.handshake.headers.cookie);
    
    // extract token from http-only cookies
    const token = socket.handshake.headers.cookie
      ?.split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      console.log("Socket connection rejected: No token provided");
      return next(new Error("Unauthorized - No Token Provided"));
    }

    console.log("Token found, verifying...");
    // verify the token
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    if (!decoded) {
      console.log("Socket connection rejected: Invalid token");
      return next(new Error("Unauthorized - Invalid Token"));
    }

    console.log("Token verified, decoded:", decoded);
    const userId = decoded.id || decoded.userId; // Handle both field names
    console.log("Using userId:", userId);

    // find the user fromdb
    const user = await User.findById(userId).select("-password");
    if (!user) {
      console.log("Socket connection rejected: User not found for userId:", userId);
      return next(new Error("User not found"));
    }

    // attach user info to socket
    socket.user = user;
    socket.userId = user._id.toString();

    console.log(`Socket authenticated for user: ${user.fullName} (${user._id})`);

    next();
  } catch (error) {
    console.log("Error in socket authentication:", error.message);
    next(new Error("Unauthorized - Authentication failed"));
  }
};