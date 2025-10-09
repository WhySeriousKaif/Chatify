import { Resend } from 'resend';
    import {ENV} from "./env.js";
// same as import dotenv from 'dotenv'; dotenv.config();

const resendClient = new Resend(ENV.RESEND_API_KEY);

export { resendClient };

export const sender ={
    email: ENV.EMAIL_FROM,
    name:ENV.EMAIL_FROM_NAME || 'Chatify'    
}