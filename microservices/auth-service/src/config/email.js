const nodemailer = require('nodemailer');

// Create transporter only if email is configured
let transporter = null;

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  try {
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Verify transporter
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter error:', error);
      } else {
        console.log('✅ Email service is ready');
      }
    });
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error.message);
  }
} else {
  console.warn('⚠️  Email not configured. Email features will not work.');
  console.warn('   Set EMAIL_USER and EMAIL_PASSWORD in .env file');
}

module.exports = transporter;

