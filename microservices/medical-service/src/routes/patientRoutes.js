const express = require('express');
const {
  getProfile,
  updateProfile,
  getAppointments,
  createAppointment,
  cancelAppointment,
  getTestResults,
  getAvailableDoctors,
} = require('../controllers/patientController');
const { getPatientStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validator');

const router = express.Router();

router.use(protect);
router.use(authorize('patient'));

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.get('/doctors', getAvailableDoctors);
router.get('/dashboard/stats', getPatientStats);

router.route('/appointments')
  .get(getAppointments)
  .post(validateRequest(schemas.appointmentCreate), createAppointment);

router.put('/appointments/:id/cancel', cancelAppointment);

router.get('/test-results', getTestResults);

module.exports = router;




