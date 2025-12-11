/**
 * Tests for server/controllers/userController.js
 */
import {
  sendRegisterOtp,
  register,
  login,
  isAuth,
  logout,
  googleAuth,
} from '../../controllers/userController.js';

import User from '../../models/User.js';
import EmailVerification from '../../models/EmailVerification.js';
import { sendOTPEmail } from '../../configs/mailer.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../../models/User.js', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
}));
jest.mock('../../models/EmailVerification.js', () => ({
  deleteMany: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
}));
jest.mock('../../configs/mailer.js', () => ({ sendOTPEmail: jest.fn() }));
jest.mock('bcryptjs', () => ({ hash: jest.fn().mockResolvedValue('hashed'), compare: jest.fn() }));
jest.mock('jsonwebtoken', () => ({ sign: jest.fn().mockReturnValue('token') }));

const resMock = () => ({ json: jest.fn(), cookie: jest.fn(), clearCookie: jest.fn() });

describe('userController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('sendRegisterOtp', () => {
    it('should return error if no email', async () => {
      const res = resMock();
      await sendRegisterOtp({ body: {} }, res);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Email is required' });
    });

    it('should send otp when user does not exist', async () => {
      User.findOne.mockResolvedValue(null);
      EmailVerification.deleteMany.mockResolvedValue();
      EmailVerification.create.mockResolvedValue();
      sendOTPEmail.mockResolvedValue();

      const res = resMock();
      await sendRegisterOtp({ body: { email: 'u@example.com' } }, res);

      expect(EmailVerification.deleteMany).toHaveBeenCalledWith({ email: 'u@example.com' });
      expect(sendOTPEmail).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'OTP sent to your email' });
    });
  });

  describe('register', () => {
    it('should return error when missing fields', async () => {
      const res = resMock();
      await register({ body: {} }, res);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Name, email, password and OTP are required',
      });
    });

    it('should error when OTP not found', async () => {
      EmailVerification.findOne = jest.fn().mockResolvedValue(null);
      const res = resMock();
      const req = { body: { name: 'a', email: 'e', password: 'p', otp: '1' } };
      await register(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'OTP not found or expired' });
    });
  });

  describe('login, isAuth, logout', () => {
    it('login - missing fields', async () => {
      const res = resMock();
      await login({ body: {} }, res);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Email and password are required' });
    });

    it('logout - clears cookie', async () => {
      const r = resMock();
      await logout({}, r);
      expect(r.clearCookie).toHaveBeenCalled();
      expect(r.json).toHaveBeenCalledWith({ success: true, message: 'Logged Out' });
    });

    it('googleAuth - no credential provided', async () => {
      const r = resMock();
      await googleAuth({ body: {} }, r);
      expect(r.json).toHaveBeenCalledWith({ success: false, message: 'No credential provided' });
    });
  });
});
