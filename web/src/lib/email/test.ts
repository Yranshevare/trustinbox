import { sendOTPEmail, sendWelcomeEmail, generateOTP, isValidEmail } from './service';

export async function testEmailService() {
  // Example email address (replace with a real email for testing)
  const testEmail = 'test@example.com';
  
  // Validate email
  if (!isValidEmail(testEmail)) {
    console.error('Invalid email address');
    return;
  }

  // Generate OTP
  const otp = generateOTP(6);
  console.log('Generated OTP:', otp);

  try {
    // Send OTP email
    console.log('Sending OTP email...');
    const otpResult = await sendOTPEmail({
      email: testEmail,
      otp,
      expiresIn: 10
    });

    if (otpResult.success) {
      console.log('OTP email sent successfully!');
    } else {
      console.error('Failed to send OTP email:', otpResult.error);
    }

    // Send welcome email (example)
    console.log('Sending welcome email...');
    const welcomeResult = await sendWelcomeEmail({
      email: testEmail
    });

    if (welcomeResult.success) {
      console.log('Welcome email sent successfully!');
    } else {
      console.error('Failed to send welcome email:', welcomeResult.error);
    }

  } catch (error) {
    console.error('Error testing email service:', error);
  }
}

export function exampleUsage() {
  // In your authentication flow:
  
  // 1. Generate OTP
  const otp = generateOTP(6);
  
  // 2. Store OTP in database with expiration time
  // (You would implement this based on your database schema)
  
  // 3. Send OTP email
  sendOTPEmail({
    email: 'user@example.com',
    otp,
    expiresIn: 10
  }).then(result => {
    if (result.success) {
      console.log('OTP sent successfully');
    } else {
      console.error('Failed to send OTP:', result.error);
    }
  });

  // 4. After successful verification, send welcome email
  sendWelcomeEmail({
    email: 'user@example.com'
  }).then(result => {
    if (result.success) {
      console.log('Welcome email sent successfully');
    } else {
      console.error('Failed to send welcome email:', result.error);
    }
  });
}

// Export for use in your application
export { sendOTPEmail, sendWelcomeEmail, generateOTP, isValidEmail };