const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwtUtils');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const axios = require('axios');

// @desc    Register user and send verification email
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { email, password, firstName, lastName } = req.body;

  // Check if user already exists
  console.log('====================================');
  console.log("hit commes here\n\n\n\n\n\n\n");
  console.log('====================================');
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.isVerified) {
      return next(new ErrorResponse('User already exists', 400));
    } else {
      // User exists but not verified, resend verification code
      const code = existingUser.generateVerificationCode();
      await existingUser.save();
      await sendVerificationEmail(email, code, firstName);
      return res.status(200).json({
        success: true,
        message: 'Verification code resent to your email',
      });
    }
  }

  // Create user - always patient from public registration
  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    role: 'patient',
  });

  // Generate verification code
  const code = user.generateVerificationCode();
  await user.save();
  console.log('====================================');
  console.log(code);
  console.log('====================================');
  // Send verification email
  await sendVerificationEmail(email, code, firstName);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email for verification code.',
  });
});

// @desc    Verify email with code
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const { email, code } = req.body;

  const user = await User.findOne({
    email,
    verificationCode: code,
    verificationCodeExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired verification code', 400));
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  // Sync patient profile with Medical Service after verification
  if (user.role === 'patient') {
    try {
      const medicalServiceUrl = process.env.MEDICAL_SERVICE_URL || 'http://localhost:5002';
      await axios.post(`${medicalServiceUrl}/api/admin/sync-user`, {
        userId: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      });
      console.log(`✅ Synced patient profile with Medical Service`);
    } catch (error) {
      console.error(`❌ Failed to sync patient with Medical Service:`, error.message);
      // Don't fail the request if sync fails, just log it
    }
  }

  res.status(200).json({
    success: true,
    message: 'Email verified successfully. You can now login.',
  });
});

// @desc    Resend verification code
// @route   POST /api/auth/resend-code
// @access  Public
exports.resendCode = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (user.isVerified) {
    return next(new ErrorResponse('Email already verified', 400));
  }

  const code = user.generateVerificationCode();
  await user.save();

  await sendVerificationEmail(email, code, user.firstName);

  res.status(200).json({
    success: true,
    message: 'Verification code resent successfully',
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
console.log('====================================');
  console.log("hit commes here\n\n\n\n\n\n\n", email, password);
  console.log('====================================');
  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if email is verified
  if (!user.isVerified) {
    return next(new ErrorResponse('Please verify your email first', 401));
  }

  // Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Generate tokens
  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  // Store refresh token
  user.refreshTokens.push({
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  });

  // Keep only last 5 refresh tokens
  if (user.refreshTokens.length > 5) {
    user.refreshTokens = user.refreshTokens.slice(-5);
  }

  await user.save();

  // Set HTTP-only cookie
  res.cookie('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    success: true,
    token: accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isVerified: user.isVerified,
    },
  });
});

// @desc    Logout user (clear cookie)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    // Remove refresh token from user
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { refreshTokens: { token: refreshToken } },
    });
  }

  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
});

// @desc    Forgot password - send reset code
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (!user.isVerified) {
    return next(new ErrorResponse('Please verify your email first', 401));
  }

  const code = user.generateResetToken();
  await user.save();

  await sendPasswordResetEmail(email, code, user.firstName);

  res.status(200).json({
    success: true,
    message: 'Password reset code sent to your email',
  });
});

// @desc    Reset password with code
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { email, code, newPassword } = req.body;

  const user = await User.findOne({
    email,
    resetPasswordToken: code,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired reset code', 400));
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successful. You can now login.',
  });
});

// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(new ErrorResponse('No refresh token provided', 401));
  }

  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    return next(new ErrorResponse('Invalid refresh token', 401));
  }

  // Check if refresh token exists in user's tokens
  const user = await User.findOne({
    _id: decoded.id,
    'refreshTokens.token': refreshToken,
  });

  if (!user) {
    return next(new ErrorResponse('Invalid refresh token', 401));
  }

  // Generate new access token
  const newAccessToken = generateAccessToken(user._id, user.role);

  // Set new cookie
  res.cookie('token', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  });

  res.status(200).json({
    success: true,
    token: newAccessToken,
  });
});

// @desc    Verify token (for inter-service communication)
// @route   POST /api/auth/verify-token
// @access  Internal
exports.verifyToken = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new ErrorResponse('No token provided', 400));
  }

  const { verifyAccessToken } = require('../utils/jwtUtils');
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      valid: false,
      message: 'Invalid token',
    });
  }

  const user = await User.findById(decoded.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      valid: false,
      message: 'User not found',
    });
  }

  res.status(200).json({
    success: true,
    valid: true,
    user: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
});

// @desc    Create user account (Admin only)
// @route   POST /api/auth/admin/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const { email, password, firstName, lastName, phone, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  if (!['patient', 'doctor', 'admin'].includes(role)) {
    return next(new ErrorResponse('Invalid role', 400));
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
    role: role || 'patient',
    isVerified: true, // Auto-verify admin-created accounts
  });

  // Sync user profile with Medical Service (for doctors and patients)
  if (role === 'doctor' || role === 'patient') {
    try {
      const medicalServiceUrl = process.env.MEDICAL_SERVICE_URL || 'http://localhost:5002';
      await axios.post(`${medicalServiceUrl}/api/admin/sync-user`, {
        userId: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
      });
      console.log(`✅ Synced ${role} profile with Medical Service`);
    } catch (error) {
      console.error(`❌ Failed to sync ${role} with Medical Service:`, error.message);
      // Don't fail the request if sync fails, just log it
    }
  }

  res.status(201).json({
    success: true,
    message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully`,
    data: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
});

// @desc    Create doctor account (Admin only) - Deprecated, use createUser instead
// @route   POST /api/auth/admin/create-doctor
// @access  Private/Admin
exports.createDoctor = asyncHandler(async (req, res, next) => {
  const { email, password, firstName, lastName, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('Email already registered', 400));
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    phone,
    role: 'doctor',
    isVerified: true, // Auto-verify doctor accounts
  });

  res.status(201).json({
    success: true,
    message: 'Doctor account created successfully',
    data: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
});

// @desc    Update user (Admin only)
// @route   PUT /api/auth/admin/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const allowedFields = ['firstName', 'lastName', 'email', 'phone', 'role'];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  // Validate role if being updated
  if (updateData.role && !['patient', 'doctor', 'admin'].includes(updateData.role)) {
    return next(new ErrorResponse('Invalid role', 400));
  }

  // Check if email is being changed to an existing email
  if (updateData.email && updateData.email !== user.email) {
    const existingUser = await User.findOne({ email: updateData.email });
    if (existingUser) {
      return next(new ErrorResponse('Email already in use', 400));
    }
  }

  Object.assign(user, updateData);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      phone: user.phone,
    },
  });
});

// @desc    Update user role (Admin only)
// @route   PUT /api/auth/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  if (!['patient', 'doctor', 'admin'].includes(role)) {
    return next(new ErrorResponse('Invalid role', 400));
  }

  const user = await User.findById(req.params.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
  });
});

// @desc    Get all users (Admin only)
// @route   GET /api/auth/admin/users
// @access  Private/Admin
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const { role, search, page = 1, limit = 10 } = req.query;

  const query = {};
  
  if (role) {
    query.role = role;
  }
  
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(query)
    .select('-password -verificationCode -verificationCodeExpires -resetPasswordCode -resetPasswordCodeExpires -refreshTokens')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    count: users.length,
    total: count,
    page: parseInt(page),
    pages: Math.ceil(count / limit),
    data: users,
  });
});

// @desc    Get user by ID (Admin only)
// @route   GET /api/auth/admin/users/:id
// @access  Private/Admin
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('-password -verificationCode -verificationCodeExpires -resetPasswordCode -resetPasswordCodeExpires -refreshTokens');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/auth/admin/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Prevent deleting yourself
  if (user._id.toString() === req.user.id) {
    return next(new ErrorResponse('Cannot delete your own account', 400));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

// @desc    Get user statistics by role
// @route   GET /api/auth/admin/users/stats
// @access  Private/Admin
exports.getUserStats = asyncHandler(async (req, res, next) => {
  const totalUsers = await User.countDocuments();
  const totalPatients = await User.countDocuments({ role: 'patient' });
  const totalDoctors = await User.countDocuments({ role: 'doctor' });
  const totalAdmins = await User.countDocuments({ role: 'admin' });

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAdmins,
    },
  });
});

// @desc    Get basic info for multiple users (Internal)
// @route   POST /api/auth/internal/users/basic
// @access  Internal (service-to-service)
exports.getBasicUsersInfo = asyncHandler(async (req, res, next) => {
  const { userIds } = req.body;

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return next(new ErrorResponse('userIds array is required', 400));
  }

  const users = await User.find({ _id: { $in: userIds } })
    .select('firstName lastName email phone avatar role');

  res.status(200).json({
    success: true,
    data: users,
  });
});

