const asyncHandler = require('../middleware/asyncHandler');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const TestResult = require('../models/TestResult');
const Referral = require('../models/Referral');
const TestRecommendation = require('../models/TestRecommendation');
const ErrorResponse = require('../utils/ErrorResponse');
const { getPatientProfileByUserId, getDoctorProfileByUserId } = require('../utils/profileHelpers');

// @desc    Get patient dashboard stats
// @route   GET /api/patients/dashboard/stats
// @access  Private/Patient
exports.getPatientStats = asyncHandler(async (req, res, next) => {
  const patientProfile = await getPatientProfileByUserId(req.user.id);
  if (!patientProfile) {
    return next(new ErrorResponse('Patient profile not found', 404));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = await Appointment.countDocuments({
    patientId: patientProfile._id,
    date: { $gte: today },
    status: { $in: ['scheduled', 'confirmed'] },
  });

  const testResults = await TestResult.countDocuments({
    patientId: patientProfile._id,
  });

  const activeReferrals = await Referral.countDocuments({
    patientId: patientProfile._id,
    status: { $in: ['pending', 'accepted'] },
  });

  const pendingTests = await TestRecommendation.countDocuments({
    patientId: patientProfile._id,
    testStatus: { $in: ['pending', 'scheduled'] },
  });

  // Get recent appointments
  const recentAppointments = await Appointment.find({
    patientId: patientProfile._id,
    date: { $gte: today },
    status: { $in: ['scheduled', 'confirmed'] },
  })
    .populate('doctorId', 'firstName lastName specialty')
    .sort({ date: 1, startTime: 1 })
    .limit(3);

  // Get recent test results
  const recentTestResults = await TestResult.find({
    patientId: patientProfile._id,
  })
    .populate('doctorId', 'firstName lastName specialty')
    .sort({ testDate: -1 })
    .limit(3);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        upcomingAppointments,
        testResults,
        activeReferrals,
        pendingTests,
      },
      recentAppointments,
      recentTestResults,
    },
  });
});

// @desc    Get doctor dashboard stats
// @route   GET /api/doctors/dashboard/stats
// @access  Private/Doctor
exports.getDoctorStats = asyncHandler(async (req, res, next) => {
  const doctorProfile = await getDoctorProfileByUserId(req.user.id);
  if (!doctorProfile) {
    return next(new ErrorResponse('Doctor profile not found', 404));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = await Appointment.countDocuments({
    doctorId: doctorProfile._id,
    date: { $gte: today, $lt: tomorrow },
    status: { $in: ['scheduled', 'confirmed'] },
  });

  // Get unique patient count
  const appointments = await Appointment.find({ doctorId: doctorProfile._id }).distinct('patientId');
  const totalPatients = appointments.length;

  const pendingReferrals = await Referral.countDocuments({
    referredDoctorId: doctorProfile._id,
    status: 'pending',
  });

  const pendingTests = await TestRecommendation.countDocuments({
    doctorId: doctorProfile._id,
    testStatus: { $in: ['pending', 'scheduled'] },
  });

  // Get today's schedule
  const todaySchedule = await Appointment.find({
    doctorId: doctorProfile._id,
    date: { $gte: today, $lt: tomorrow },
    status: { $in: ['scheduled', 'confirmed'] },
  })
    .populate('patientId', 'firstName lastName email phone')
    .sort({ startTime: 1 });

  res.status(200).json({
    success: true,
    data: {
      stats: {
        todayAppointments,
        totalPatients,
        pendingReferrals,
        pendingTests,
      },
      todaySchedule,
    },
  });
});
