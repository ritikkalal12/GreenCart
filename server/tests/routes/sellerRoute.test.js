/**
 * Tests for server/routes/sellerRoute.js
 */
jest.mock('express', () => {
  return {
    Router: () => ({
      post: jest.fn(),
      get: jest.fn(),
    }),
  };
});

describe('sellerRoute wiring', () => {
  it('exports a router', () => {
    const sellerRouter = require('../../routes/sellerRoute.js').default;
    expect(sellerRouter).toBeDefined();
  });
});
