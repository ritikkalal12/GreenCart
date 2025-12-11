process.env.NODE_ENV = 'test';
// add any default env vars tests rely on, e.g.:
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.SMTP_USER = process.env.SMTP_USER || 'noreply@example.com';
process.env.SMTP_PASS = process.env.SMTP_PASS || 'pass';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

jest.spyOn(console, 'log').mockImplementation(() => {});
jest.spyOn(console, 'error').mockImplementation(() => {});
jest.spyOn(console, 'warn').mockImplementation(() => {});