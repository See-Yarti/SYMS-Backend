import mongooseSchemaConfig from '@/config/db/basic-schema';
import { Schema, model, Model } from 'mongoose';
import crypto from 'crypto';

// OTP Type Definitions
export interface IOtp {
  email: string;
  otp: string;
  expiresAt: Date;
  isUsed: boolean;
}

interface IOtpMethods {
  verifyOtp(inputOtp: string): boolean;
}

type IOtpModel = Model<IOtp, {}, IOtpMethods>;

// Schema Definition
const OtpSchema = new Schema<IOtp, IOtpModel, IOtpMethods>({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  isUsed: { type: Boolean, default: false },
});

// Instance Methods
OtpSchema.methods.verifyOtp = function (inputOtp: string): boolean {
  const hashedInputOtp = crypto.createHash('sha256').update(inputOtp).digest('hex');
  return this.otp === hashedInputOtp && this.expiresAt > new Date() && !this.isUsed;
};

// Indexes
OtpSchema.index({ email: 1 });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs

// Plugins
OtpSchema.plugin(mongooseSchemaConfig);

// Model Export
const OtpModel = model<IOtp, IOtpModel>('Otp', OtpSchema);
export default OtpModel;
