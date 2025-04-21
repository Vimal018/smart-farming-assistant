import { Request, Response } from "express";
import User, { IUser } from "../models/User";// Path to your User model
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Assuming you have environment variables set up (JWT_SECRET)
// If not, replace process.env.JWT_SECRET with your actual secret key (IN PRODUCTION, NEVER HARDCODE)

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 6);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: "5h", // Adjust as needed
    });

    // *** KEY CHANGE: Send the user object in the response ***
    const userToSend = user ? {  // Conditional creation
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      // ... other properties
    } : null; // Or undefined, if you prefer

  res.status(200).json({
    message: "Login successful",
    token: token,
    user: userToSend, // Use the conditionally created object
  });

  console.log("Response being sent:", {
    message: "Login successful",
    token: token,
    user: userToSend, // Log what is actually being sent
  });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Server error" });
  }
};
