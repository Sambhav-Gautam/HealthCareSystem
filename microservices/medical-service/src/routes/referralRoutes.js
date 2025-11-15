const express = require('express');
const {
  createReferral,
  getReferralsSent,
  getReferralsReceived,
  updateReferralStatus,
  getPatientReferrals,
} = require('../controllers/referralController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('doctor'), createReferral);
router.get('/sent', authorize('doctor'), getReferralsSent);
router.get('/received', authorize('doctor'), getReferralsReceived);
router.put('/:id/status', authorize('doctor'), updateReferralStatus);

router.get('/my-referrals', authorize('patient'), getPatientReferrals);

module.exports = router;



