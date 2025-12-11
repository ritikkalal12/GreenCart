/**
 * Tests for server/configs/mailer.js
 *
 * NOTE: we configure the nodemailer mock before importing the mailer module
 * because the mailer module creates a transporter at import-time.
 */

const sendMailMock = jest.fn().mockResolvedValue(true);

// Provide a mock implementation for nodemailer.createTransport
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

let sendOTPEmail;

describe('sendOTPEmail', () => {
  beforeAll(async () => {
    const nodemailer = await import('nodemailer');
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });

    process.env.SMTP_USER = 'noreply@example.com';
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_PASS = 'pass';

    // Import the mailer after configuring the nodemailer mock so module-level transporter uses it
    ({ sendOTPEmail } = await import('../../configs/mailer.js'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call transporter.sendMail with correct fields', async () => {
    await sendOTPEmail('user@example.com', '123456');

    const nodemailer = await import('nodemailer');
    expect(nodemailer.createTransport).toHaveBeenCalledWith({
      host: 'smtp.example.com',
      port: Number('587'),
      secure: false,
      auth: {
        user: 'noreply@example.com',
        pass: 'pass',
      },
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: `"Greencart" <${process.env.SMTP_USER}>`,
      to: 'user@example.com',
      subject: 'Your Greencart OTP',
      text: 'Your OTP is: 123456. It will expire in 10 minutes.',
    });
  });
});
