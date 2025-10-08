import express, { Router } from "express";
import dotenv from "dotenv";
import { signUp } from "../controller/auth.controller.js";

dotenv.config();

const authRoute = express.Router();

authRoute.post("/login", (req, res) => {
  // Handle login logic here
  res.send("Login endpoint");
});

authRoute.post("/signup", signUp);

export default authRoute;
