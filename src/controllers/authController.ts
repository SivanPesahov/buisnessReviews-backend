import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User-model";

dotenv.config();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET as string;

interface RequestWithUserId extends Request {
  userId?: string | null;
}

async function register(req: Request, res: Response): Promise<void> {
  console.log("register");
  try {
    const { password, ...userData } = req.body;
    console.log(req.body);

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = new User({ ...userData, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "3h",
    });

    res.status(201).json({ token });
  } catch (error: any) {
    console.log("register", error);
    if (error.code === 11000) {
      console.log("username already exists");
      res.status(400).json({ error: "User already exists" });
      return;
    }
    res.status(500).json({ error: "Registration failed" });
    console.log(error.message);
  }
}

async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    console.log("Received login request:", { username, password });

    const user = await User.findOne({ username });
    console.log("Fetched user from database:", user);

    if (!user) {
      console.log("User not found");
      res.status(401).json({ error: "Authentication failed" });
      return;
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    console.log("Password match result:", isPasswordMatch);

    if (!isPasswordMatch) {
      console.log("Password does not match");
      res.status(401).json({ error: "Authentication failed" });
      return;
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "6h",
    });

    res.status(200).json({ token });
  } catch (error: any) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Login failed" });
  }
}

async function getLoggedInUser(
  req: RequestWithUserId,
  res: Response
): Promise<void> {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ error: "Error fetching user data" });
  }
}

export { register, login, getLoggedInUser };
