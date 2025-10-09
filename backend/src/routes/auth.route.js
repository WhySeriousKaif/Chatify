import express, { Router } from "express";
import dotenv from "dotenv";
import { signUp,logIn ,logOut, updateProfile} from "../controller/auth.controller.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";

dotenv.config();

const authRoute = express.Router();

authRoute.post("/login",logIn);

authRoute.post("/signup", signUp);
authRoute.post('/logout', logOut);  
authRoute.post('/update-profile',protectedRoute, updateProfile);
authRoute.get('/check',protectedRoute,(req,res)=>res.status(200).json(req.user))


export default authRoute;
