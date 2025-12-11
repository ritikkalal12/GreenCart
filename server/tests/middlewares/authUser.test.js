/**
 * Tests for server/middlewares/authUser.js
 */
import authUser from '../../middlewares/authUser.js';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('authUser middleware', () => {
  afterEach(() => jest.clearAllMocks());

  it('returns not authorized when no token cookie', async () => {
    const req = { cookies: {} };
    const res = { json: jest.fn() };
    const next = jest.fn();
    await authUser(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not Authorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('sets req.body.userId when token valid and calls next', async () => {
    jwt.verify.mockReturnValue({ id: 'uid' });
    const req = { cookies: { token: 't' }, body: {} };
    const res = { json: jest.fn() };
    const next = jest.fn();
    await authUser(req, res, next);
    expect(req.body.userId).toBe('uid');
    expect(next).toHaveBeenCalled();
  });

  it('returns not authorized when token payload has no id', async () => {
    jwt.verify.mockReturnValue({});
    const req = { cookies: { token: 't' }, body: {} };
    const res = { json: jest.fn() };
    const next = jest.fn();
    await authUser(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'Not Authorized' });
  });

  it('returns error message when verify throws', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('bad') });
    const req = { cookies: { token: 't' }, body: {} };
    const res = { json: jest.fn() };
    const next = jest.fn();
    await authUser(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'bad' });
  });
});
