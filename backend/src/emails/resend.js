import { Resend } from 'resend';
import "dotenv/config";
// same as import dotenv from 'dotenv'; dotenv.config();

const resendClient = new Resend(process.env.RESEND_API_KEY);

export { resendClient };

export const sender ={
    email: process.env.EMAIL_FROM,
    name: process.env.EMAIL_FROM_NAME || 'Messenger'    
}