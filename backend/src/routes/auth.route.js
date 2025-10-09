import express, { Router } from "express";
import {
  signUp,
  logIn,
  logOut,
  updateProfile,
} from "../controller/auth.controller.js";
import { protectedRoute } from "../middlewares/auth.middleware.js";
import { arcjetProtection } from "../middlewares/arcjet.middleware.js";

const authRoute = express.Router();

authRoute.use(arcjetProtection);

authRoute.post("/login", logIn);

authRoute.post("/signup", signUp);
authRoute.post("/logout", logOut);
authRoute.post("/update-profile", protectedRoute, updateProfile);
authRoute.get("/check", protectedRoute, (req, res) =>
  res.status(200).json(req.user)
);

export default authRoute;
