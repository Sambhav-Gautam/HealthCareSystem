const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
    testType: {
      type: String,
      required: [true, 'Please provide test type'],
    },
    testName: {
      type: String,
      required: [true, 'Please provide test name'],
    },
    testDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    results: {
      type: String,
      required: [true, 'Please provide test results'],
    },
    normalRange: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'abnormal'],
      default: 'completed',
    },
    unit: {
      type: String,
    },
    interpretation: {
      type: String,
    },
    notes: {
      type: String,
    },
    attachments: [
      {
        fileName: String,
        fileUrl: String,
        fileType: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

testResultSchema.index({ patientId: 1, testDate: -1 });
testResultSchema.index({ doctorId: 1 });
testResultSchema.index({ testDate: -1 });

module.exports = mongoose.model('TestResult', testResultSchema);




