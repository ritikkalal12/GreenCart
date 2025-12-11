/**
 * Tests for server/configs/cloudinary.js
 */
import connectCloudinary from '../../configs/cloudinary.js';
import * as cloudinaryModule from 'cloudinary';

jest.mock('cloudinary', () => {
  return {
    v2: {
      config: jest.fn(),
    },
  };
});

describe('connectCloudinary', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call cloudinary.config with environment variables', async () => {
    process.env.CLOUDINARY_CLOUD_NAME = 'mycloud';
    process.env.CLOUDINARY_API_KEY = 'apikey';
    process.env.CLOUDINARY_API_SECRET = 'apisecret';

    await connectCloudinary();

    expect(cloudinaryModule.v2.config).toHaveBeenCalledWith({
      cloud_name: 'mycloud',
      api_key: 'apikey',
      api_secret: 'apisecret',
    });
  });
});
