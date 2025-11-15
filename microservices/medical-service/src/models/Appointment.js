const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: [true, 'Please provide appointment date'],
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
    },
    status: {
      type: String,
      enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for appointment'],
    },
    symptoms: [String],
    notes: {
      type: String,
    },
    diagnosis: {
      type: String,
    },
    prescription: [
      {
        medication: String,
        dosage: String,
        frequency: String,
        duration: String,
        instructions: String,
      },
    ],
    followUp: {
      required: {
        type: Boolean,
        default: false,
      },
      date: Date,
      notes: String,
    },
    cancelReason: {
      type: String,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral',
    },
    testRecommendationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TestRecommendation',
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema);


