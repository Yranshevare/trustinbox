import { Resend } from 'resend';
import 'dotenv/config';

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error('RESEND_API_KEY is not defined');
}

const resend = new Resend(resendApiKey);

export const sendEmail = async ({
  from,
  to,
  subject,
  html,
}: {
  from: string;
  to: string;
  subject: string;
  html: string;
}) => {
  const { data, error } = await resend.emails.send({
    from: from,
    to: to,
    subject: subject,
    html: html,
  });

  if (error) {
    return { success: false, error };
  }
  return { success: true, data: true };
};
