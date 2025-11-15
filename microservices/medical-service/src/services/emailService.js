const transporter = require('../config/email');

const sendVerificationEmail = async (user, code, isReset = false) => {
  const subject = isReset ? 'Password Reset Code' : 'Email Verification Code';
  const title = isReset ? 'Reset Your Password' : 'Verify Your Email';
  const message = isReset 
    ? 'You requested to reset your password. Use the code below to reset your password:'
    : 'Thank you for registering! Use the code below to verify your email:';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .code-box { background-color: white; padding: 20px; text-align: center; border-radius: 6px; margin: 20px 0; border: 2px solid #4F46E5; }
        .code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.firstName}!</h2>
          <p>${message}</p>
          
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Healthcare Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

const sendEmail = async (options) => {
  if (!transporter) {
    console.warn(`⚠️  Email not configured. Would have sent email to: ${options.to}`);
    console.warn(`   Subject: ${options.subject}`);
    return { success: false, error: 'Email not configured' };
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || `Healthcare Portal <${process.env.EMAIL_USER || 'noreply@healthcare.com'}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
    return { success: false, error: error.message };
  }
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Healthcare Portal</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.firstName}!</h2>
          <p>Thank you for registering with Healthcare Portal. We're excited to have you on board!</p>
          <p>Your account has been successfully created. You can now access all our features including:</p>
          <ul>
            <li>Book appointments with healthcare professionals</li>
            <li>View your medical records and test results</li>
            <li>Manage your health profile</li>
            <li>Receive important health reminders</li>
          </ul>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Stay healthy!</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Healthcare Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: 'Welcome to Healthcare Portal',
    html,
  });
};

const sendAppointmentConfirmation = async (appointment, patient, doctor) => {
  const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .appointment-details { background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Appointment Confirmed</h1>
        </div>
        <div class="content">
          <h2>Hello ${patient.firstName}!</h2>
          <p>Your appointment has been successfully scheduled.</p>
          
          <div class="appointment-details">
            <h3>Appointment Details</h3>
            <div class="detail-row">
              <strong>Doctor:</strong>
              <span>Dr. ${doctor.firstName} ${doctor.lastName}</span>
            </div>
            <div class="detail-row">
              <strong>Date:</strong>
              <span>${appointmentDate}</span>
            </div>
            <div class="detail-row">
              <strong>Time:</strong>
              <span>${appointment.startTime}</span>
            </div>
            <div class="detail-row">
              <strong>Reason:</strong>
              <span>${appointment.reason}</span>
            </div>
          </div>
          
          <p><strong>Important:</strong> Please arrive 10 minutes before your scheduled time.</p>
          <p>If you need to cancel or reschedule, please do so at least 24 hours in advance.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Healthcare Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: patient.email,
    subject: 'Appointment Confirmation - Healthcare Portal',
    html,
  });
};

const sendAppointmentReminder = async (appointment, patient, doctor) => {
  const appointmentDate = new Date(appointment.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .reminder-box { background-color: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Appointment Reminder</h1>
        </div>
        <div class="content">
          <h2>Hello ${patient.firstName}!</h2>
          <div class="reminder-box">
            <strong>Reminder:</strong> You have an appointment tomorrow!
          </div>
          <p><strong>Doctor:</strong> Dr. ${doctor.firstName} ${doctor.lastName}</p>
          <p><strong>Date:</strong> ${appointmentDate}</p>
          <p><strong>Time:</strong> ${appointment.startTime}</p>
          <p>Please arrive 10 minutes early. If you need to cancel or reschedule, please contact us as soon as possible.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Healthcare Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: patient.email,
    subject: 'Appointment Reminder - Tomorrow',
    html,
  });
};

const sendTestResultNotification = async (testResult, patient, doctor) => {
  const testDate = new Date(testResult.testDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .test-box { background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border: 2px solid #3B82F6; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Test Results Available</h1>
        </div>
        <div class="content">
          <h2>Hello ${patient.firstName}!</h2>
          <p>Your test results are now available.</p>
          
          <div class="test-box">
            <h3>${testResult.testName}</h3>
            <p><strong>Test Type:</strong> ${testResult.testType}</p>
            <p><strong>Test Date:</strong> ${testDate}</p>
            <p><strong>Status:</strong> ${testResult.status}</p>
            <p><strong>Ordered by:</strong> Dr. ${doctor.firstName} ${doctor.lastName}</p>
          </div>
          
          <p>Please log in to your portal to view the complete results and any notes from your doctor.</p>
          <p>If you have any questions about your results, please contact your healthcare provider.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Healthcare Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: patient.email,
    subject: 'Your Test Results Are Ready',
    html,
  });
};

const sendDailyDoctorDigest = async (doctor, appointmentsToday) => {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const appointmentsList = appointmentsToday.map(apt => `
    <div style="background-color: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #4F46E5;">
      <p><strong>${apt.startTime}</strong> - ${apt.patientId.firstName} ${apt.patientId.lastName}</p>
      <p style="color: #6b7280; margin: 5px 0;">Reason: ${apt.reason}</p>
    </div>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .summary { background-color: #EEF2FF; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Your Daily Schedule</h1>
        </div>
        <div class="content">
          <h2>Good Morning, Dr. ${doctor.firstName}!</h2>
          <p>${today}</p>
          
          <div class="summary">
            <h2 style="margin: 0; color: #4F46E5;">${appointmentsToday.length}</h2>
            <p style="margin: 5px 0;">Appointments Today</p>
          </div>
          
          ${appointmentsToday.length > 0 ? `
            <h3>Today's Appointments:</h3>
            ${appointmentsList}
          ` : '<p>You have no appointments scheduled for today.</p>'}
          
          <p>Have a great day!</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Healthcare Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: doctor.email,
    subject: `Daily Schedule - ${appointmentsToday.length} Appointments Today`,
    html,
  });
};

const sendReferralNotification = async (referral) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #8B5CF6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .referral-box { background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #8B5CF6; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Patient Referral</h1>
        </div>
        <div class="content">
          <h2>Hello Dr. ${referral.referredDoctorId.firstName}!</h2>
          <p>You have received a new patient referral from Dr. ${referral.referringDoctorId.firstName} ${referral.referringDoctorId.lastName}.</p>
          
          <div class="referral-box">
            <h3>Referral Details</h3>
            <p><strong>Patient:</strong> ${referral.patientId.firstName} ${referral.patientId.lastName}</p>
            <p><strong>Specialty Needed:</strong> ${referral.specialtyNeeded}</p>
            <p><strong>Urgency:</strong> ${referral.urgency.toUpperCase()}</p>
            <p><strong>Reason:</strong> ${referral.reason}</p>
            ${referral.clinicalNotes ? `<p><strong>Clinical Notes:</strong> ${referral.clinicalNotes}</p>` : ''}
          </div>
          
          <p>Please log in to your portal to view complete details and accept or decline this referral.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Healthcare Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: referral.referredDoctorId.email,
    subject: 'New Patient Referral Received',
    html,
  });
};

const sendTestRecommendationNotification = async (recommendation) => {
  const testsList = recommendation.tests.map(test => `
    <li><strong>${test.testName}</strong> (${test.testType}) - ${test.urgency.toUpperCase()}</li>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #06B6D4; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .tests-box { background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Tests Recommended</h1>
        </div>
        <div class="content">
          <h2>Hello ${recommendation.patientId.firstName}!</h2>
          <p>Dr. ${recommendation.doctorId.firstName} ${recommendation.doctorId.lastName} has recommended the following tests for you:</p>
          
          <div class="tests-box">
            <h3>Recommended Tests</h3>
            <ul>
              ${testsList}
            </ul>
            ${recommendation.overallNotes ? `<p><strong>Notes:</strong> ${recommendation.overallNotes}</p>` : ''}
          </div>
          
          ${recommendation.followUpRequired ? `<p><strong>Follow-up Required:</strong> Please schedule a follow-up appointment after completing these tests.</p>` : ''}
          
          <p>Please log in to your portal to view complete details and schedule these tests.</p>
        </div>
        <div class="footer">
          <p>&copy; 2024 Healthcare Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: recommendation.patientId.email,
    subject: 'New Test Recommendations from Your Doctor',
    html,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendTestResultNotification,
  sendDailyDoctorDigest,
  sendReferralNotification,
  sendTestRecommendationNotification,
};


