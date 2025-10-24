import { generateToken } from "../config/utils.js";
import { senderWelcomeEmail } from "../emails/emailHandler.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { ENV } from "../config/env.js";
import { cloudinary } from "../config/cloudinary.js";

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
      const savedUser = await newUser.save();
      res
        .status(201)
        .json({ message: "User registered successfully", savedUser });
      // send a welcome email to the user

      try {
        await senderWelcomeEmail(
          savedUser.email,
          savedUser.fullName,
          ENV.CLIENT_URL
        );
      } catch (err) {
        console.log("Error in sending welcome email:", err);
      }
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const logIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Compare password
    const isPassCorrect = await bcrypt.compare(password, user.password);
    if (!isPassCorrect) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    // Generate token and send response
    generateToken(user._id, res);
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
      },
    });
  } catch (err) {
    console.error("Error in login Controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const logOut = async (_, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.status(200).json({ message: "Logged Out successfully" });
};
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    if (!profilePic) {
      return res.status(400).json({ message: "Profile picture is required" });
    }
    const userId = req.user._id;
    const user = await User.findById(userId);
    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const uploadedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );
    //  equivalent to const user = await User.findOne({ _id: userId });
    // user.profilePic = uploadResponse.secure_url;
    // await user.save();
    // By default, findByIdAndUpdate() returns the old document (before the update).
    // When you pass { new: true }, Mongoose tells MongoDB to return the updated document instead.
    res.status(200).json(uploadedUser);
  } catch (err) {
    console.error("Error in updateProfile Controller:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
