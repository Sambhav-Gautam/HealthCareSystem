const mongoose = require('mongoose');
const argon2 = require('argon2');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'Please provide first name'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide last name'],
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      default: 'patient',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: String,
    verificationCodeExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    refreshTokens: [
      {
        token: String,
        expiresAt: Date,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving using Argon2
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await argon2.hash(this.password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
  });
  next();
});

// Match password using Argon2
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await argon2.verify(this.password, enteredPassword);
  } catch (error) {
    return false;
  }
};

// Generate 6-digit verification code
userSchema.methods.generateVerificationCode = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.verificationCode = code;
  this.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return code;
};

// Generate password reset token
userSchema.methods.generateResetToken = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  this.resetPasswordToken = code;
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return code;
};

module.exports = mongoose.model('User', userSchema);

