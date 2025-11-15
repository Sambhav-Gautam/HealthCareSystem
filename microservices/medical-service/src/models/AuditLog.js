const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'USER_LOGIN',
        'USER_LOGOUT',
        'USER_REGISTER',
        'USER_UPDATE',
        'USER_DELETE',
        'APPOINTMENT_CREATE',
        'APPOINTMENT_UPDATE',
        'APPOINTMENT_CANCEL',
        'TEST_RESULT_CREATE',
        'TEST_RESULT_VIEW',
        'REFERRAL_CREATE',
        'REFERRAL_UPDATE',
        'TEST_RECOMMENDATION_CREATE',
        'TEST_RECOMMENDATION_UPDATE',
        'PATIENT_PROFILE_VIEW',
        'PATIENT_PROFILE_UPDATE',
        'DOCTOR_PROFILE_UPDATE',
        'ADMIN_ACTION',
        'FAILED_LOGIN',
        'PASSWORD_RESET',
        'EMAIL_VERIFICATION'
      ],
    },
    resourceType: {
      type: String,
      enum: ['User', 'Patient', 'Doctor', 'Appointment', 'TestResult', 'Referral', 'TestRecommendation'],
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success',
    },
    errorMessage: {
      type: String,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);


