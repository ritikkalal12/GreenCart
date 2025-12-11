import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// 👇 NEW: imports for OTP
import EmailVerification from '../models/EmailVerification.js';
import { sendOTPEmail } from '../configs/mailer.js';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ========== SEND OTP FOR REGISTRATION ==========
// Route: POST /api/user/register/send-otp
export const sendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: 'Email is required' });
    }

    // If user already exists, no need to send OTP
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove previous OTPs for this email
    await EmailVerification.deleteMany({ email });

    // Save new OTP with expiry (10 minutes)
    await EmailVerification.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send OTP via email
    await sendOTPEmail(email, otp);

    return res.json({
      success: true,
      message: 'OTP sent to your email',
    });
  } catch (error) {
    console.log('[sendRegisterOtp]', error.message);
    return res.json({ success: false, message: 'Something went wrong' });
  }
};

// ========== REGISTER USER WITH OTP VERIFICATION ==========
// Route: POST /api/user/register
export const register = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.json({
        success: false,
        message: 'Name, email, password and OTP are required',
      });
    }

    // Check OTP record
    const record = await EmailVerification.findOne({ email });

    if (!record) {
      return res.json({
        success: false,
        message: 'OTP not found or expired',
      });
    }

    if (record.otp !== otp) {
      return res.json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    if (record.expiresAt < new Date()) {
      await EmailVerification.deleteMany({ email });
      return res.json({
        success: false,
        message: 'OTP expired',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: 'User already exists' });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ name, email, password: hashedPassword });

    // OTP used -> delete it
    await EmailVerification.deleteMany({ email });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true, // Prevent JavaScript to access cookie
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time
    });

    return res.json({
      success: true,
      user: { email: user.email, name: user.name },
    });
  } catch (error) {
    console.log('[register]', error.message);
    res.json({ success: false, message: error.message });
  }
};

// ========== LOGIN USER ==========
// Route: /api/user/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.json({
        success: false,
        message: 'Email and password are required',
      });

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.json({ success: false, message: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user: { email: user.email, name: user.name },
    });
  } catch (error) {
    console.log('[login]', error.message);
    res.json({ success: false, message: error.message });
  }
};

// ========== CHECK AUTH ==========
// Route: /api/user/is-auth
export const isAuth = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId).select('-password');
    return res.json({ success: true, user });
  } catch (error) {
    console.log('[isAuth]', error.message);
    res.json({ success: false, message: error.message });
  }
};

// ========== LOGOUT USER ==========
// Route: /api/user/logout
export const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });
    return res.json({ success: true, message: 'Logged Out' });
  } catch (error) {
    console.log('[logout]', error.message);
    res.json({ success: false, message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.json({ success: false, message: 'No credential provided' });
    }

    // Verify token with Google
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub } = payload; // sub is Google user id

    if (!email) {
      return res.json({
        success: false,
        message: 'Email not found in Google account',
      });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email,
        password: '', // or some placeholder – you won't use it for Google users
      });
    }

    // Create JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      user: { email: user.email, name: user.name },
    });
  } catch (error) {
    console.log('[googleAuth]', error.message);
    return res.json({
      success: false,
      message: 'Google authentication failed',
    });
  }
};
