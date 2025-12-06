import { Resend } from 'resend';
import {ENV} from "./env.js";

// Only initialize Resend if API key is provided
let resendClient = null;
if (ENV.RESEND_API_KEY) {
    resendClient = new Resend(ENV.RESEND_API_KEY);
} else {
    console.log("⚠️  Resend API key not provided, email functionality disabled");
}

export { resendClient };

export const sender ={
    email: ENV.EMAIL_FROM,
    name: ENV.EMAIL_FROM_NAME || 'Chatify'    
}