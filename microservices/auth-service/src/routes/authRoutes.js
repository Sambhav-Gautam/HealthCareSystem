const express = require('express');
const router = express.Router();
const {
  register,
  verifyEmail,
  resendCode,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  refreshToken,
  verifyToken,
  createUser,
  createDoctor,
  updateUser,
  updateUserRole,
  getAllUsers,
  getUserById,
  deleteUser,
  getUserStats,
  getBasicUsersInfo,
} = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const serviceAuth = require('../middleware/serviceAuth');
const { validate, schemas } = require('../middleware/validator');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes with rate limiting
router.post('/register', authLimiter, validate(schemas.register), register);
router.post('/verify-email', authLimiter, validate(schemas.verifyEmail), verifyEmail);
router.post('/resend-code', authLimiter, validate(schemas.resendCode), resendCode);
router.post('/login', authLimiter, validate(schemas.login), login);
router.post('/forgot-password', authLimiter, validate(schemas.forgotPassword), forgotPassword);
router.post('/reset-password', authLimiter, validate(schemas.resetPassword), resetPassword);
router.post('/refresh-token', refreshToken);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Admin routes
router.get('/admin/users/stats', protect, authorize('admin'), getUserStats);
router.get('/admin/users', protect, authorize('admin'), getAllUsers);
router.post('/admin/users', protect, authorize('admin'), createUser);
router.get('/admin/users/:id', protect, authorize('admin'), getUserById);
router.put('/admin/users/:id', protect, authorize('admin'), updateUser);
router.put('/admin/users/:id/role', protect, authorize('admin'), updateUserRole);
router.delete('/admin/users/:id', protect, authorize('admin'), deleteUser);
router.post('/admin/create-doctor', protect, authorize('admin'), createDoctor);

// Internal service routes
router.post('/internal/users/basic', serviceAuth, getBasicUsersInfo);

// Internal route for inter-service communication
router.post('/verify-token', verifyToken);

module.exports = router;

