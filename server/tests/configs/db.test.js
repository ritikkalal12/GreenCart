/**
 * Tests for server/configs/db.js
 */
import connectDB from '../../configs/db.js';
import mongoose from 'mongoose';

jest.mock('mongoose', () => {
  return {
    connect: jest.fn().mockResolvedValue(true),
    connection: {
      on: jest.fn(),
    },
  };
});

describe('connectDB', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call mongoose.connect with MONGODB_URI/greencart', async () => {
    process.env.MONGODB_URI = 'mongodb://localhost:27017';
    await connectDB();
    expect(mongoose.connection.on).toHaveBeenCalledWith('connected', expect.any(Function));
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/greencart');
  });

  it('should catch and not throw if mongoose.connect rejects', async () => {
    mongoose.connect.mockRejectedValueOnce(new Error('fail'));
    // Should not throw
    await expect(connectDB()).resolves.not.toThrow();
  });
});
