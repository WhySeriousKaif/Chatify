import express, { Router } from "express";
import dotenv from "dotenv";
import { signUp,logIn ,logOut} from "../controller/auth.controller.js";

dotenv.config();

const authRoute = express.Router();

authRoute.post("/login",logIn);

authRoute.post("/signup", signUp);
authRoute.post('/logout', logOut);
export default authRoute;
