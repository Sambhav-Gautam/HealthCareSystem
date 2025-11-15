const mongoose = require('mongoose');

const testRecommendationSchema = new mongoose.Schema(
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
      required: true,
    },
    tests: [
      {
        testName: {
          type: String,
          required: true,
        },
        testType: {
          type: String,
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
        urgency: {
          type: String,
          enum: ['routine', 'urgent', 'stat'],
          default: 'routine',
        },
        instructions: {
          type: String,
        },
        status: {
          type: String,
          enum: ['pending', 'scheduled', 'completed', 'cancelled'],
          default: 'pending',
        },
        scheduledDate: Date,
        completedDate: Date,
        testResultId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'TestResult',
        },
      },
    ],
    overallNotes: {
      type: String,
    },
    followUpRequired: {
      type: Boolean,
      default: true,
    },
    followUpDate: {
      type: Date,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

testRecommendationSchema.index({ patientId: 1 });
testRecommendationSchema.index({ doctorId: 1 });
testRecommendationSchema.index({ appointmentId: 1 });

module.exports = mongoose.model('TestRecommendation', testRecommendationSchema);



