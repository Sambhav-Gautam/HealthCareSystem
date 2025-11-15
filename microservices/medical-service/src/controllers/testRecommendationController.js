const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const TestRecommendation = require('../models/TestRecommendation');
const Appointment = require('../models/Appointment');
const { sendTestRecommendationNotification } = require('../services/emailService');

exports.createTestRecommendation = asyncHandler(async (req, res, next) => {
  const {
    patientId,
    appointmentId,
    tests,
    overallNotes,
    followUpRequired,
    followUpDate,
  } = req.body;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment || appointment.doctorId.toString() !== req.user.id) {
    return next(new ErrorResponse('Appointment not found or unauthorized', 403));
  }

  const testRecommendation = await TestRecommendation.create({
    patientId,
    doctorId: req.user.id,
    appointmentId,
    tests,
    overallNotes,
    followUpRequired,
    followUpDate,
  });

  const populatedRecommendation = await TestRecommendation.findById(testRecommendation._id)
    .populate('patientId', 'firstName lastName email')
    .populate('doctorId', 'firstName lastName specialty');

  await sendTestRecommendationNotification(populatedRecommendation);

  appointment.testRecommendationId = testRecommendation._id;
  if (followUpRequired && followUpDate) {
    appointment.followUp = {
      required: true,
      date: followUpDate,
      notes: overallNotes,
    };
  }
  await appointment.save();

  testRecommendation.notificationSent = true;
  await testRecommendation.save();

  res.status(201).json({
    success: true,
    data: testRecommendation,
  });
});

exports.getDoctorTestRecommendations = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const recommendations = await TestRecommendation.find({ doctorId: req.user.id })
    .populate('patientId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await TestRecommendation.countDocuments({ doctorId: req.user.id });

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: recommendations,
  });
});

exports.getPatientTestRecommendations = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  const recommendations = await TestRecommendation.find({ patientId: req.user.id })
    .populate('doctorId', 'firstName lastName specialty')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await TestRecommendation.countDocuments({ patientId: req.user.id });

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: recommendations,
  });
});

exports.updateTestStatus = asyncHandler(async (req, res, next) => {
  const { testId, status, scheduledDate, completedDate, testResultId } = req.body;

  const recommendation = await TestRecommendation.findById(req.params.id);

  if (!recommendation) {
    return next(new ErrorResponse('Test recommendation not found', 404));
  }

  if (recommendation.doctorId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this recommendation', 403));
  }

  const testIndex = recommendation.tests.findIndex(
    (test) => test._id.toString() === testId
  );

  if (testIndex === -1) {
    return next(new ErrorResponse('Test not found in recommendation', 404));
  }

  if (status) recommendation.tests[testIndex].status = status;
  if (scheduledDate) recommendation.tests[testIndex].scheduledDate = scheduledDate;
  if (completedDate) recommendation.tests[testIndex].completedDate = completedDate;
  if (testResultId) recommendation.tests[testIndex].testResultId = testResultId;

  await recommendation.save();

  res.status(200).json({
    success: true,
    data: recommendation,
  });
});



