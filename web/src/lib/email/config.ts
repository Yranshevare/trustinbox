import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM,
  subject: {
    otp: 'Your TrustinBox OTP Code',
  },
};
