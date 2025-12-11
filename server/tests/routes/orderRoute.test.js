/**
 * Tests for server/routes/orderRoute.js
 */
jest.mock('express', () => {
  return {
    Router: () => ({
      post: jest.fn(),
      get: jest.fn(),
    }),
  };
});

describe('orderRoute wiring', () => {
  it('exports a router', () => {
    const orderRouter = require('../../routes/orderRoute.js').default;
    expect(orderRouter).toBeDefined();
  });
});
