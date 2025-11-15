const transporter = require('../config/email');

// Send verification email
const sendVerificationEmail = async (email, code, firstName) => {
  if (!transporter) {
    console.warn(`⚠️  Email not configured. Verification code for ${email}: ${code}`);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@healthcare.com',
    to: email,
    subject: 'Verify Your Email - HCL Healthcare Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Email Verification</h2>
        <p>Hello ${firstName},</p>
        <p>Thank you for registering with HCL Healthcare Portal. Please use the code below to verify your email:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't create an account, please ignore this email.</p>
        <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="color: #7f8c8d; font-size: 12px;">HCL Healthcare Portal - Your Health, Our Priority</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    throw new Error('Email could not be sent');
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, code, firstName) => {
  if (!transporter) {
    console.warn(`⚠️  Email not configured. Password reset code for ${email}: ${code}`);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@healthcare.com',
    to: email,
    subject: 'Reset Your Password - HCL Healthcare Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Password Reset</h2>
        <p>Hello ${firstName},</p>
        <p>We received a request to reset your password. Please use the code below:</p>
        <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${code}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email or contact support.</p>
        <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="color: #7f8c8d; font-size: 12px;">HCL Healthcare Portal - Your Health, Our Priority</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Email could not be sent');
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};

