export const EmailTypes = {
  loginEmail: {
    subject: 'Login to our platform',
    receiverName: '' as string,
  },
  registerVendorEmail: {
    subject: 'Your Vendor Account Has Been Created – Pending Approval',
    receiverName: '' as string,
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
