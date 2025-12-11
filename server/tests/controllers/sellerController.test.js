/**
 * Tests for server/controllers/sellerController.js
 */
import { sellerLogin, isSellerAuth, sellerLogout } from '../../controllers/sellerController.js';

describe('sellerController', () => {
  const res = () => ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
    json: jest.fn(),
  });

  beforeEach(() => {
    process.env.SELLER_PASSWORD = 'pw';
    process.env.SELLER_EMAIL = 's@example.com';
    process.env.JWT_SECRET = 'secret';
    process.env.NODE_ENV = 'test';
  });

  afterEach(() => jest.clearAllMocks());

  it('sellerLogin - correct credentials sets cookie', async () => {
    const req = { body: { email: 's@example.com', password: 'pw' } };
    const r = res();
    await sellerLogin(req, r);
    expect(r.cookie).toHaveBeenCalled();
    expect(r.json).toHaveBeenCalledWith({ success: true, message: 'Logged In' });
  });

  it('sellerLogin - wrong credentials', async () => {
    const req = { body: { email: 'x', password: 'y' } };
    const r = res();
    await sellerLogin(req, r);
    expect(r.json).toHaveBeenCalledWith({ success: false, message: 'Invalid Credentials' });
  });

  it('isSellerAuth - returns success true', async () => {
    const r = res();
    await isSellerAuth({}, r);
    expect(r.json).toHaveBeenCalledWith({ success: true });
  });

  it('sellerLogout - clears cookie', async () => {
    const r = res();
    await sellerLogout({}, r);
    expect(r.clearCookie).toHaveBeenCalled();
    expect(r.json).toHaveBeenCalledWith({ success: true, message: 'Logged Out' });
  });
});
