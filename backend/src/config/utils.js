import jwt from "jsonwebtoken";
import {ENV} from "./env.js";

  

export const generateToken = (userId,res) => {
    const token = jwt.sign({ id: userId }, ENV.JWT_SECRET, {
        expiresIn: '1d', // Token expires in 1 day
    });
    // Set token in HTTP-only cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        
    });
    return token;
};
