// server/models/EmailVerification.js
import mongoose from 'mongoose';

const emailVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// auto-remove docs after expiry
emailVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const EmailVerification = mongoose.model(
  'EmailVerification',
  emailVerificationSchema
);

export default EmailVerification;
