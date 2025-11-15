const express = require('express');
const {
  createTestRecommendation,
  getDoctorTestRecommendations,
  getPatientTestRecommendations,
  updateTestStatus,
} = require('../controllers/testRecommendationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('doctor'), createTestRecommendation);
router.get('/doctor', authorize('doctor'), getDoctorTestRecommendations);
router.put('/:id/test-status', authorize('doctor'), updateTestStatus);

router.get('/patient', authorize('patient'), getPatientTestRecommendations);

module.exports = router;



