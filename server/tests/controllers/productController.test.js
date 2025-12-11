/**
 * Tests for server/controllers/productController.js
 */
import {
  addProduct,
  productList,
  productById,
  changeStock,
  updateProduct,
  deleteProduct,
} from '../../controllers/productController.js';

import Product from '../../models/Product.js';
import cloudinary from 'cloudinary';

jest.mock('../../models/Product.js', () => ({
  create: jest.fn(),
  find: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'https://img' }),
    },
  },
}));

const resMock = () => ({ json: jest.fn(), status: jest.fn().mockReturnThis() });

describe('productController', () => {
  afterEach(() => jest.clearAllMocks());

  it('addProduct - should upload images and create product', async () => {
    const req = { body: { productData: JSON.stringify({ name: 'p' }) }, files: [{ path: '/tmp/1' }] };
    const res = resMock();
    await addProduct(req, res);
    expect(cloudinary.v2.uploader.upload).toHaveBeenCalled();
    expect(Product.create).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Product Added' });
  });

  it('productList - returns products', async () => {
    Product.find.mockResolvedValueOnce([{ id: 1 }]);
    const res = resMock();
    await productList({}, res);
    expect(res.json).toHaveBeenCalledWith({ success: true, products: [{ id: 1 }] });
  });

  it('productById - returns product', async () => {
    Product.findById.mockResolvedValueOnce({ id: 'x' });
    const req = { body: { id: 'x' } };
    const res = resMock();
    await productById(req, res);
    expect(res.json).toHaveBeenCalledWith({ success: true, product: { id: 'x' } });
  });

  it('changeStock - updates stock', async () => {
    const req = { body: { id: 'p', inStock: true } };
    const res = resMock();
    await changeStock(req, res);
    expect(Product.findByIdAndUpdate).toHaveBeenCalledWith('p', { inStock: true });
    expect(res.json).toHaveBeenCalledWith({ success: true, message: 'Stock Updated' });
  });

  it('updateProduct - missing id returns 400', async () => {
    const req = { body: {} };
    const res = resMock();
    await updateProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('deleteProduct - missing id -> 400', async () => {
    const req = { body: {} };
    const res = resMock();
    await deleteProduct(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
