import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/token.js";

// Register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Missing details" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    generateTokenAndSetCookie(res, user._id);

    return res.status(201).json({
      success: true,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    generateTokenAndSetCookie(res, user._id);

    return res.json({
      success: true,
      user: { id: user._id, email: user.email, name: user.name },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
