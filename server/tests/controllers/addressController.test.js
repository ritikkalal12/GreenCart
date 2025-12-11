/**
 * Tests for server/controllers/addressController.js
 */
import { addAddress, getAddress } from '../../controllers/addressController.js';
import Address from '../../models/Address.js';

jest.mock('../../models/Address.js', () => ({
  create: jest.fn(),
  find: jest.fn(),
}));

const mockRes = () => {
  const res = {};
  res.json = jest.fn();
  return res;
};

describe('addressController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('addAddress', () => {
    it('should create an address and respond success', async () => {
      const req = { body: { address: { street: 'abc' }, userId: 'u1' } };
      const res = mockRes();

      Address.create.mockResolvedValueOnce({});

      await addAddress(req, res);

      expect(Address.create).toHaveBeenCalledWith({ ...req.body.address, userId: 'u1' });
      expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Address added successfully' });
    });

    it('should handle errors', async () => {
      const req = { body: { address: {}, userId: 'u1' } };
      const res = mockRes();

      Address.create.mockRejectedValueOnce(new Error('fail'));

      await addAddress(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'fail' });
    });
  });

  describe('getAddress', () => {
    it('should return addresses', async () => {
      const req = { body: { userId: 'u1' } };
      const res = mockRes();
      Address.find.mockResolvedValueOnce([{ street: 'x' }]);

      await getAddress(req, res);

      expect(Address.find).toHaveBeenCalledWith({ userId: 'u1' });
      expect(res.json).toHaveBeenCalledWith({ success: true, addresses: [{ street: 'x' }] });
    });

    it('should handle errors', async () => {
      const req = { body: { userId: 'u1' } };
      const res = mockRes();
      Address.find.mockRejectedValueOnce(new Error('err'));

      await getAddress(req, res);

      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'err' });
    });
  });
});
