import express from 'express';
import {
  isAuth,
  login,
  logout,
  register,
  sendRegisterOtp,
  googleAuth,
} from '../controllers/userController.js';
import authUser from '../middlewares/authUser.js';

const userRouter = express.Router();

// NEW: send OTP before registration
userRouter.post('/register/send-otp', sendRegisterOtp);

// After user enters OTP, this will VERIFY OTP + create user
userRouter.post('/register', register);

userRouter.post('/login', login);
userRouter.post('/google-auth', googleAuth);
userRouter.get('/is-auth', authUser, isAuth);
userRouter.get('/logout', authUser, logout);

export default userRouter;
