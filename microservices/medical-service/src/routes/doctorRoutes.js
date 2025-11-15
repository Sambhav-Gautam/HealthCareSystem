const express = require('express');
const {
  getProfile,
  updateProfile,
  getAppointments,
  getTodayAppointments,
  updateAppointment,
  getPatients,
  getPatientDetails,
  createTestResult,
} = require('../controllers/doctorController');
const { getDoctorStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest, schemas } = require('../middleware/validator');

const router = express.Router();

router.use(protect);
router.use(authorize('doctor'));

router.route('/profile')
  .get(getProfile)
  .put(validateRequest(schemas.doctorUpdate), updateProfile);

router.get('/dashboard/stats', getDoctorStats);
router.get('/appointments', getAppointments);
router.get('/appointments/today', getTodayAppointments);
router.put('/appointments/:id', validateRequest(schemas.appointmentUpdate), updateAppointment);

router.get('/patients', getPatients);
router.get('/patients/:patientId', getPatientDetails);

router.post('/test-results', validateRequest(schemas.testResultCreate), createTestResult);

module.exports = router;




