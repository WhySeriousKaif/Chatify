import { generateToken } from "../config/utils.js";
import { senderWelcomeEmail } from "../emails/emailHandler.js";
import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import {ENV} from "../config/env.js";

export const signUp = async (req, res) => {
  // Handle signup logic here
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Further logic to save user to database can be added here
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!regex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    


    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ fullName, email, password: hashedPassword });

    if (newUser) {
      generateToken(newUser._id, res);
     const savedUser= await newUser.save();
      res.status(201).json({ message: "User registered successfully" , savedUser});
      // send a welcome email to the user


      try{
        await senderWelcomeEmail (savedUser.email, savedUser.fullName, ENV.CLIENT_URL);

      }
      catch(err){
        console.log("Error in sending welcome email:", err);
      }

    } 
    else {
      
      res.status(400).json({ message: "Invalid user data" });
    }
    
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};
