import jwt from "jsonwebtoken";
import {ENV} from "./env.js";

  

export const generateToken = (userId, res) => {
    if (!ENV.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured. Please set JWT_SECRET environment variable.");
    }

    if (!userId) {
        throw new Error("User ID is required to generate token.");
    }

    const token = jwt.sign({ id: userId }, ENV.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
    });
    
    // Set token in HTTP-only cookie
    const cookieOptions = {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        sameSite: ENV.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site in production
    };
    
    if (ENV.NODE_ENV === 'production') {
        cookieOptions.secure = true; // Required for HTTPS and sameSite: 'none'
    }
    
    res.cookie('token', token, cookieOptions);
    return token;
};
