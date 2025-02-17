import OtpModel from '@/models/otp.model';
import Locals from '@/providers/Locals';
import crypto from 'crypto';

class OtpService {
  /**
   * Generates a new OTP and saves it in the database
   * @param email - User's email
   * @returns The generated OTP (only for development/debugging)
   */
  async generateOtp(email: string): Promise<string> {
    // 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = new Date(Date.now() + Locals.config().OTP_EXPIRATION_TIME * 60 * 1000);

    // Delete any previous unused OTPs for this email
    await OtpModel.deleteMany({ email, isUsed: false });

    // Save new OTP in the database
    await OtpModel.create({ email, otp: hashedOtp, expiresAt });

    return otp;
  }

  /**
   * Verifies an OTP
   * @param email - User's email
   * @param inputOtp - OTP entered by the user
   * @returns True if OTP is valid, false otherwise
   */
  async verifyOtp(email: string, inputOtp: string): Promise<boolean> {
    const otpRecord = await OtpModel.findOne({ email, isUsed: false }).sort({ expiresAt: -1 });

    if (!otpRecord) return false;

    const isValid = otpRecord.verifyOtp(inputOtp);
    if (isValid) {
      otpRecord.isUsed = true;
      await otpRecord.save();
    }

    return isValid;
  }

  /**
   * Resends OTP if the previous one is expired, otherwise asks to use the existing one
   * @param email - User's email
   * @returns New OTP if generated, otherwise a message
   */
  async resendOtp(email: string): Promise<string> {
    const existingOtp = await OtpModel.findOne({ email, isUsed: false }).sort({ expiresAt: -1 });

    if (existingOtp && existingOtp.expiresAt > new Date()) {
      return 'Your OTP is still valid. Please check your email.';
    }

    return this.generateOtp(email);
  }
}

export default OtpService;
