import { resend } from "./config";
import { EMAIL_CONFIG } from "./config";
import { generateOTPEmailTemplate } from "./templates/otp";

export interface SendOTPEmailParams {
  email: string;
  otp: string;
  expiresIn?: number;
}

export async function sendOTPEmail({
  email,
  otp,
  expiresIn = 10,
}: SendOTPEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Generate HTML template
    const htmlContent = generateOTPEmailTemplate({
      otp,
      email,
      expiresIn,
    });

    const response = await resend.emails.send({
      from: EMAIL_CONFIG.from!,
      to: [email],
      subject: EMAIL_CONFIG.subject.otp,
      html: htmlContent,
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message || "Failed to send OTP email",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function sendVerificationEmail(params: SendOTPEmailParams) {
  return sendOTPEmail(params);
}

export async function sendWelcomeEmail({
  email,
}: {
  email: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to TrustinBox</title>
          <style>
              body { margin: 0; padding: 0; background-color: #f5f5f7; color: #1d1d1f; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08); overflow: hidden; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
              .logo { font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px; margin-bottom: 10px; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 24px; font-weight: 700; margin-bottom: 20px; color: #1d1d1f; }
              .message { font-size: 16px; line-height: 1.6; color: #3a3a3c; margin-bottom: 30px; }
              .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }
              .footer { padding: 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; }
              .footer-text { font-size: 12px; color: #64748b; line-height: 1.5; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">TrustinBox</div>
              </div>

              <div class="content">
                  <div class="greeting">Welcome aboard! 🎉</div>

                  <div class="message">
                      Your email has been successfully verified. You now have full access to all TrustinBox features.
                      <br><br>
                      Start exploring our platform and discover how we can help you achieve your goals.
                  </div>

                  <a href="#" class="cta-button">Get Started</a>
              </div>

              <div class="footer">
                  <div class="footer-text">
                      If you need assistance, contact our support team at
                      <a href="mailto:support@trustinbox.com" style="color: #667eea; text-decoration: none;">support@trustinbox.com</a>
                      <br>
                      © ${new Date().getFullYear()} TrustinBox. All rights reserved.
                  </div>
              </div>
          </div>
      </body>
      </html>
    `;

    const response = await resend.emails.send({
      from: EMAIL_CONFIG.from!,
      to: [email],
      subject: "Welcome to TrustinBox - Your Account is Verified!",
      html: htmlContent,
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message || "Failed to send welcome email",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export function generateOTP(length: number = 6): string {
  const digits = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }

  return otp;
}
