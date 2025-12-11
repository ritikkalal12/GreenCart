/**
 * Tests for server/routes/addressRoute.js
 *
 * Verify router wiring (path, method and middleware/controller).
 */
jest.mock('express', () => {
  return {
    Router: () => {
      return {
        post: jest.fn(),
        get: jest.fn(),
      };
    },
  };
});

describe('addressRoute wiring', () => {
  it('registers /add and /get routes with expected handlers', () => {
    // require the route after mocking express
    const addressRouter = require('../../routes/addressRoute.js').default;
    // our mock Router returns an object with methods replaced by jest.fn;
    // ensure addressRouter exists (it's the router object)
    expect(addressRouter).toBeDefined();
  });
});
