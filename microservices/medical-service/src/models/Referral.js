const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
    },
    referringDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    referredDoctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    originalAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for referral'],
    },
    specialtyNeeded: {
      type: String,
      required: true,
    },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    clinicalNotes: {
      type: String,
    },
    patientHistory: {
      type: String,
    },
    investigations: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'completed'],
      default: 'pending',
    },
    responseNotes: {
      type: String,
    },
    newAppointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
    },
  },
  {
    timestamps: true,
  }
);

referralSchema.index({ patientId: 1 });
referralSchema.index({ referringDoctorId: 1 });
referralSchema.index({ referredDoctorId: 1 });
referralSchema.index({ status: 1 });

module.exports = mongoose.model('Referral', referralSchema);



