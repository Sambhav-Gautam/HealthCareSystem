const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
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
    avatar: String,
    specialty: {
      type: String,
      required: [true, 'Please provide a specialty'],
    },
    qualification: {
      type: String,
      required: [true, 'Please provide qualification'],
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please provide license number'],
      unique: true,
    },
    experience: {
      type: Number,
      default: 0,
    },
    availability: [
      {
        day: {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      },
    ],
    consultationFee: {
      type: Number,
      default: 0,
    },
    department: {
      type: String,
    },
    bio: {
      type: String,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

doctorSchema.index({ specialty: 1 });
doctorSchema.index({ isAvailable: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);




