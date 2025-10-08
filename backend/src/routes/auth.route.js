import express, { Router } from "express";
import dotenv from "dotenv";

dotenv.config();

const authRoute = express.Router();

authRoute.post("/login", (req, res) => {
  // Handle login logic here
  res.send("Login endpoint");
});

authRoute.post("/register", (req, res) => {
  // Handle registration logic here
  res.send("Register endpoint");
});

export default authRoute;
