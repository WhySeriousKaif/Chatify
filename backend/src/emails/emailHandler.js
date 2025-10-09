import {resendClient,sender } from '../config/resend.js';
import { createWelcomeEmailTemplate } from './emailTemplat.js';


export const senderWelcomeEmail = async (email, name, clientURL) => {
    try{
        const {data,error} = await resendClient.emails.send({
            from: `${sender.name} <${sender.email}>`,
            to: [email],
            subject: "Welcome to Chatify! 🎉",
            html: createWelcomeEmailTemplate(name, clientURL)
        });
        if(error){
            console.log("Error sending welcome email:", error);
        }else{
            console.log("Welcome email sent successfully:", data);
        }   
    }
   catch(err){
    console.log("Error in sending welcome email:", err);
   }
}