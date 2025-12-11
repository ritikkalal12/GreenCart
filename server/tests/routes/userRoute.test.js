/**
 * Tests for server/routes/userRoute.js
 */
jest.mock('express', () => {
  return {
    Router: () => ({
      post: jest.fn(),
      get: jest.fn(),
    }),
  };
});

describe('userRoute wiring', () => {
  it('exports a router', () => {
    const userRouter = require('../../routes/userRoute.js').default;
    expect(userRouter).toBeDefined();
  });
});
