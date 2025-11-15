const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    // Basic user info (synced from Auth Service)
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    avatar: String,
    bloodType: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    height: {
      value: Number,
      unit: {
        type: String,
        enum: ['cm', 'ft'],
        default: 'cm',
      },
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg', 'lbs'],
        default: 'kg',
      },
    },
    allergies: [
      {
        name: String,
        severity: {
          type: String,
          enum: ['mild', 'moderate', 'severe'],
        },
        reaction: String,
      },
    ],
    chronicConditions: [
      {
        name: String,
        diagnosedDate: Date,
        status: {
          type: String,
          enum: ['active', 'managed', 'resolved'],
          default: 'active',
        },
      },
    ],
    medications: [
      {
        name: String,
        dosage: String,
        frequency: String,
        startDate: Date,
        endDate: Date,
        prescribedBy: {
          type: mongoose.Schema.Types.ObjectId,
        },
      },
    ],
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String,
      email: String,
    },
    insuranceInfo: {
      provider: String,
      policyNumber: String,
      groupNumber: String,
      expiryDate: Date,
    },
    medicalHistory: [
      {
        condition: String,
        date: Date,
        notes: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Patient', patientSchema);




