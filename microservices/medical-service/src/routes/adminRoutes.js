const express = require('express');
const {
  getStats,
  getPatients,
  getDoctors,
  getAllAppointments,
  getPatientDetails,
  getDoctorDetails,
  syncUserProfile,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Internal sync endpoint (no auth required - for inter-service communication)
router.post('/sync-user', syncUserProfile);

// All routes below require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Statistics
router.get('/stats', getStats);

// Medical records management
router.get('/patients', getPatients);
router.get('/patients/:id', getPatientDetails);

router.get('/doctors', getDoctors);
router.get('/doctors/:id', getDoctorDetails);

// Appointments
router.get('/appointments', getAllAppointments);

// NOTE: User management (create, update, delete users) should be done through Auth Service
// If you need user management, call Auth Service API

module.exports = router;
