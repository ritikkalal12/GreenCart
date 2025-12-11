/**
 * Tests for server/controllers/orderStatusController.js
 */
import {
  updateOrderStatus,
  getUserOrders as statusGetUserOrders,
  getAllOrders as statusGetAllOrders,
  cancelOrder,
} from '../../controllers/orderStatusController.js';
import Order from '../../models/Order.js';

jest.mock('../../models/Order.js', () => ({
  findById: jest.fn(),
  find: jest.fn(),
}));

const resMock = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
});

describe('orderStatusController', () => {
  afterEach(() => jest.clearAllMocks());

  it('updateOrderStatus - missing fields -> 400', async () => {
    const req = { body: {} };
    const res = resMock();
    await updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('updateOrderStatus - order not found -> 404', async () => {
    Order.findById.mockResolvedValueOnce(null);
    const req = { body: { id: 'x', status: 'shipped' } };
    const res = resMock();
    await updateOrderStatus(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('updateOrderStatus - success', async () => {
    const save = jest.fn().mockResolvedValue(true);
    Order.findById.mockResolvedValueOnce({ save, orderStatus: 'old', status: 'old' });
    const req = { body: { id: 'x', status: 'shipped' } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await updateOrderStatus(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, order: expect.any(Object) }));
  });

  it('getUserOrders - missing userId -> 400', async () => {
    const req = { body: {} };
    const res = resMock();
    await statusGetUserOrders(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('getAllOrders - returns orders', async () => {
    // Mock chainable .populate().sort() -> resolves to array
    Order.find.mockReturnValueOnce({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([{ id: 1 }]),
    });

    const req = {};
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    await statusGetAllOrders(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true, orders: [{ id: 1 }] });
  });

  describe('cancelOrder', () => {
    it('missing id -> 400', async () => {
      const req = { body: {} };
      const res = resMock();
      await cancelOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('order not found -> 404', async () => {
      Order.findById.mockResolvedValueOnce(null);
      const req = { body: { id: 'o' } };
      const res = resMock();
      await cancelOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('not authorized owner -> 403', async () => {
      Order.findById.mockResolvedValueOnce({ userId: 'other', status: 'pending' });
      const req = { body: { id: 'o', userId: 'u' } };
      const res = resMock();
      await cancelOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('delivered cannot cancel -> 400', async () => {
      Order.findById.mockResolvedValueOnce({ userId: 'u', status: 'delivered', orderStatus: 'delivered', save: jest.fn() });
      const req = { body: { id: 'o', userId: 'u' } };
      const res = resMock();
      await cancelOrder(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('success cancels order', async () => {
      const save = jest.fn().mockResolvedValue(true);
      Order.findById.mockResolvedValueOnce({ userId: 'u', status: 'pending', orderStatus: 'pending', save });
      const req = { body: { id: 'o', userId: 'u' } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
      await cancelOrder(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Order cancelled successfully' }));
    });
  });
});
