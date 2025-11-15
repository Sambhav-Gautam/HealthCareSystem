const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const Referral = require('../models/Referral');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { sendReferralNotification } = require('../services/emailService');

exports.createReferral = asyncHandler(async (req, res, next) => {
  const {
    patientId,
    referredDoctorId,
    appointmentId,
    reason,
    specialtyNeeded,
    urgency,
    clinicalNotes,
    patientHistory,
    investigations,
  } = req.body;

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment || appointment.doctorId.toString() !== req.user.id) {
    return next(new ErrorResponse('Appointment not found or unauthorized', 403));
  }

  const referredDoctor = await User.findById(referredDoctorId);
  if (!referredDoctor || referredDoctor.role !== 'doctor') {
    return next(new ErrorResponse('Referred doctor not found', 404));
  }

  const referral = await Referral.create({
    patientId,
    referringDoctorId: req.user.id,
    referredDoctorId,
    originalAppointmentId: appointmentId,
    reason,
    specialtyNeeded,
    urgency,
    clinicalNotes,
    patientHistory,
    investigations,
  });

  const populatedReferral = await Referral.findById(referral._id)
    .populate('patientId', 'firstName lastName email')
    .populate('referringDoctorId', 'firstName lastName specialty')
    .populate('referredDoctorId', 'firstName lastName email specialty');

  await sendReferralNotification(populatedReferral);

  appointment.referralId = referral._id;
  await appointment.save();

  res.status(201).json({
    success: true,
    data: referral,
  });
});

exports.getReferralsSent = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { referringDoctorId: req.user.id };
  if (status) query.status = status;

  const referrals = await Referral.find(query)
    .populate('patientId', 'firstName lastName email')
    .populate('referredDoctorId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Referral.countDocuments(query);

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: referrals,
  });
});

exports.getReferralsReceived = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { referredDoctorId: req.user.id };
  if (status) query.status = status;

  const referrals = await Referral.find(query)
    .populate('patientId', 'firstName lastName email phone')
    .populate('referringDoctorId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Referral.countDocuments(query);

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: referrals,
  });
});

exports.updateReferralStatus = asyncHandler(async (req, res, next) => {
  const { status, responseNotes } = req.body;

  let referral = await Referral.findById(req.params.id);

  if (!referral) {
    return next(new ErrorResponse('Referral not found', 404));
  }

  if (referral.referredDoctorId.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this referral', 403));
  }

  referral.status = status;
  if (responseNotes) referral.responseNotes = responseNotes;
  await referral.save();

  res.status(200).json({
    success: true,
    data: referral,
  });
});

exports.getPatientReferrals = asyncHandler(async (req, res, next) => {
  const referrals = await Referral.find({ patientId: req.user.id })
    .populate('referringDoctorId', 'firstName lastName specialty')
    .populate('referredDoctorId', 'firstName lastName specialty')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: referrals.length,
    data: referrals,
  });
});



