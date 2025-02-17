export const EmailTypes = {
  welcomeLoginEmail: {
    subject: 'Welcome to our platform',
    receiverName: '' as string,
  },
  loginEmail: {
    subject: 'Login to our platform',
    receiverName: '' as string,
  },
  otpEmail: {
    subject: 'One Time Password (OTP) for your login',
    receiverName: '' as string,
    otp: '' as string,
  },
  registerEmail: {
    subject: 'Registration successful',
    receiverName: '' as string,
    confirmationLink: '' as string,
  },
  resetPasswordEmail: {
    subject: 'Reset your password',
    receiverName: '' as string,
    resetLink: '' as string,
  },
} as const;

// Extract Email Type Keys
export type EmailType = keyof typeof EmailTypes;

// Extract Required Data for Each Email Type
export type EmailData<T extends EmailType> = Omit<(typeof EmailTypes)[T], 'subject'>;

// Base Email Job Type (Forcing Required Data)
export type BaseEmailJob<T extends EmailType> = {
  type: T;
  to: string;
  data: EmailData<T>;
};

// Unified Email Job Type (For Type-Safe Enforcing)
export type EmailJobData = {
  [T in EmailType]: BaseEmailJob<T>;
}[EmailType];
