interface OTPEmailTemplateProps {
  otp: string;
  email: string;
  expiresIn?: number;
}

export function generateOTPEmailTemplate({
  otp,
  email,
  expiresIn = 10
}: OTPEmailTemplateProps): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP Code</title>
        <style>
            /* Reset styles */
            body, table, td, div, p, a {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            body {
                margin: 0;
                padding: 0;
                background-color: #f5f5f7;
                color: #1d1d1f;
            }
            
            /* Main container */
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
                overflow: hidden;
            }
            
            /* Header */
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 30px;
                text-align: center;
            }
            
            .logo {
                font-size: 28px;
                font-weight: 700;
                color: #ffffff;
                letter-spacing: -0.5px;
                margin-bottom: 10px;
            }
            
            .tagline {
                color: rgba(255, 255, 255, 0.9);
                font-size: 14px;
                font-weight: 500;
            }
            
            /* Content */
            .content {
                padding: 40px 30px;
            }
            
            .greeting {
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 20px;
                color: #1d1d1f;
            }
            
            .message {
                font-size: 16px;
                line-height: 1.6;
                color: #3a3a3c;
                margin-bottom: 30px;
            }
            
            /* OTP Code Box */
            .otp-container {
                background: #f8fafc;
                border: 2px dashed #e2e8f0;
                border-radius: 12px;
                padding: 25px;
                text-align: center;
                margin: 30px 0;
            }
            
            .otp-label {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 2px;
                color: #64748b;
                font-weight: 600;
                margin-bottom: 15px;
                display: block;
            }
            
            .otp-code {
                font-size: 36px;
                font-weight: 800;
                letter-spacing: 8px;
                color: #1e293b;
                background: #ffffff;
                padding: 15px 25px;
                border-radius: 8px;
                border: 1px solid #e2e8f0;
                display: inline-block;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            
            .expires-info {
                font-size: 12px;
                color: #64748b;
                margin-top: 15px;
                font-style: italic;
            }
            
            /* Security note */
            .security-note {
                background-color: #fff7ed;
                border: 1px solid #fed7aa;
                border-radius: 8px;
                padding: 15px;
                margin-top: 30px;
            }
            
            .security-title {
                font-size: 14px;
                font-weight: 600;
                color: #c2410c;
                margin-bottom: 5px;
            }
            
            .security-text {
                font-size: 12px;
                color: #7c2d12;
                line-height: 1.5;
            }
            
            /* Footer */
            .footer {
                padding: 30px;
                background-color: #f8fafc;
                border-top: 1px solid #e2e8f0;
                text-align: center;
            }
            
            .footer-text {
                font-size: 12px;
                color: #64748b;
                line-height: 1.5;
            }
            
            .support-link {
                color: #667eea;
                text-decoration: none;
                font-weight: 500;
            }
            
            /* Responsive */
            @media (max-width: 600px) {
                .container {
                    border-radius: 0;
                    box-shadow: none;
                }
                
                .header, .content, .footer {
                    padding: 25px 20px;
                }
                
                .otp-code {
                    font-size: 28px;
                    letter-spacing: 6px;
                    padding: 12px 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Header -->
            <div class="header">
                <div class="logo">TrustinBox</div>
                <div class="tagline">Secure. Simple. Trusted.</div>
            </div>
            
            <!-- Content -->
            <div class="content">
                <div class="greeting">Hello,</div>
                
                <div class="message">
                    We received a request to verify your email address. Use the one-time password (OTP) below to complete the verification process.
                </div>
                
                <!-- OTP Code -->
                <div class="otp-container">
                    <span class="otp-label">Your OTP Code</span>
                    <div class="otp-code">${otp}</div>
                    <div class="expires-info">This code expires in ${expiresIn} minutes</div>
                </div>
                
                <div class="message">
                    If you didn't request this code, please ignore this email. Your account remains secure.
                </div>
                
                <!-- Security Note -->
                <div class="security-note">
                    <div class="security-title">🔒 Security Reminder</div>
                    <div class="security-text">
                        For your security, never share this OTP with anyone. Our team will never ask for your verification code.
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-text">
                    If you need assistance, contact our support team at 
                    <a href="mailto:support@trustinbox.com" class="support-link">support@trustinbox.com</a>
                    <br>
                    © ${new Date().getFullYear()} TrustinBox. All rights reserved.
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}