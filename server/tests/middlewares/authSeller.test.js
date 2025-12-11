/**
 * Tests for server/middlewares/authSeller.js
 */
import authSeller from '../../middlewares/authSeller.js';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('authSeller middleware', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns not authorized when no cookie', async () => {
    const req = { cookies: {} };
    const res = { json: jest.fn() };
    const next = jest.fn();
    await authSeller(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not Authorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('calls next when valid seller token', async () => {
    process.env.SELLER_EMAIL = 's@e.com';
    jwt.verify.mockReturnValue({ email: 's@e.com' });
    const req = { cookies: { sellerToken: 't' } };
    const res = { json: jest.fn() };
    const next = jest.fn();
    await authSeller(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns not authorized on wrong seller email', async () => {
    jwt.verify.mockReturnValue({ email: 'x' });
    const req = { cookies: { sellerToken: 't' } };
    const res = { json: jest.fn() };
    const next = jest.fn();
    await authSeller(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not Authorized' });
  });

  it('returns error message when verify throws', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('bad') });
    const req = { cookies: { sellerToken: 't' } };
    const res = { json: jest.fn() };
    const next = jest.fn();
    await authSeller(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'bad' });
  });
});
