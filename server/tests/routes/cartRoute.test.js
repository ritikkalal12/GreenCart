/**
 * Tests for server/routes/cartRoute.js
 */
jest.mock('express', () => {
  return {
    Router: () => ({ post: jest.fn() }),
  };
});

describe('cartRoute wiring', () => {
  it('exports a router', () => {
    const cartRouter = require('../../routes/cartRoute.js').default;
    expect(cartRouter).toBeDefined();
  });
});
