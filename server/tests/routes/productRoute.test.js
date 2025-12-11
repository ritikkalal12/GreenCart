/**
 * Tests for server/routes/productRoute.js
 */
jest.mock('express', () => {
  return {
    Router: () => ({
      post: jest.fn(),
      get: jest.fn(),
    }),
  };
});

jest.mock('../../configs/multer.js', () => ({
  upload: { array: jest.fn() },
}));

describe('productRoute wiring', () => {
  it('exports a router', () => {
    const productRouter = require('../../routes/productRoute.js').default;
    expect(productRouter).toBeDefined();
  });
});
