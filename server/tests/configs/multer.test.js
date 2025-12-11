/**
 * Tests for server/configs/multer.js
 */
import { upload } from '../../configs/multer.js';
import multer from 'multer';

jest.mock('multer', () => {
  const diskStorage = jest.fn(() => 'disk-storage-mock');
  const multerFn = jest.fn((opts) => {
    return { opts };
  });
  multerFn.diskStorage = diskStorage;
  return multerFn;
});

describe('multer upload', () => {
  it('should call multer with diskStorage', () => {
    // import module executed above; check multer was used to create upload
    expect(multer.diskStorage).toHaveBeenCalledWith({});
    expect(typeof upload).toBe('object');
    // ensure multer default factory was called with storage option
    expect(multer).toHaveBeenCalledWith({ storage: 'disk-storage-mock' });
  });
});
