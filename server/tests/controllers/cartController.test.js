/**
 * Tests for server/controllers/cartController.js
 */
import { updateCart } from '../../controllers/cartController.js';
import User from '../../models/User.js';

jest.mock('../../models/User.js', () => ({
  findByIdAndUpdate: jest.fn(),
}));

const mockRes = () => {
  return { json: jest.fn() };
};

describe('cartController.updateCart', () => {
  afterEach(() => jest.clearAllMocks());

  it('should update user cart and return success', async () => {
    const req = { body: { userId: 'u1', cartItems: [{ p: 1 }] } };
    const res = mockRes();

    User.findByIdAndUpdate.mockResolvedValueOnce({});

    await updateCart(req, res);

    expect(User.findByIdAndUpdate).toHaveBeenCalledWith('u1', { cartItems: [{ p: 1 }] });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Cart Updated' });
  });

  it('should handle errors', async () => {
    const req = { body: { userId: 'u1', cartItems: [] } };
    const res = mockRes();

    User.findByIdAndUpdate.mockRejectedValueOnce(new Error('fail'));

    await updateCart(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: false, message: 'fail' });
  });
});
