const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const TestResult = require('../models/TestResult');
const { sendAppointmentConfirmation } = require('../services/emailService');
const { getPatientProfileByUserId, ensurePatientProfile } = require('../utils/profileHelpers');

exports.getProfile = asyncHandler(async (req, res, next) => {
  const patient = await ensurePatientProfile(req.user);

  res.status(200).json({
    success: true,
    data: patient,
  });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = [
    'bloodType',
    'height',
    'weight',
    'allergies',
    'chronicConditions',
    'medications',
    'emergencyContact',
    'insuranceInfo',
    'medicalHistory',
  ];

  const updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  await ensurePatientProfile(req.user, req.body);

  const patient = await Patient.findOneAndUpdate(
    { userId: req.user.id },
    updateData,
    { new: true, runValidators: true, upsert: true }
  );

  if (req.body.firstName || req.body.lastName || req.body.phone || req.body.dateOfBirth || req.body.gender || req.body.address) {
    const userUpdateData = {};
    ['firstName', 'lastName', 'phone', 'dateOfBirth', 'gender', 'address'].forEach((field) => {
      if (req.body[field] !== undefined) {
        userUpdateData[field] = req.body[field];
      }
    });

    await User.findByIdAndUpdate(req.user.id, userUpdateData, { new: true, runValidators: true });
  }

  res.status(200).json({
    success: true,
    data: patient,
  });
});

exports.getAppointments = asyncHandler(async (req, res, next) => {
  const { status, page = 1, limit = 10 } = req.query;
  const patientProfile = await ensurePatientProfile(req.user);
  if (!patientProfile) {
    return next(new ErrorResponse('Patient profile not found', 404));
  }

  const query = { patientId: patientProfile._id };
  if (status) query.status = status;

  const appointments = await Appointment.find(query)
    .populate('doctorId', 'firstName lastName email avatar')
    .sort({ date: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await Appointment.countDocuments(query);

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: appointments,
  });
});

exports.createAppointment = asyncHandler(async (req, res, next) => {
  const { doctorId, date, startTime, reason, symptoms, notes } = req.body;
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(new ErrorResponse('Doctor not found', 404));
  }

  const patientProfile = await ensurePatientProfile(req.user.id);
  if (!patientProfile) {
    return next(new ErrorResponse('Patient profile not found', 404));
  }

  const existingAppointment = await Appointment.findOne({
    doctorId,
    date: new Date(date),
    startTime,
    status: { $in: ['scheduled', 'confirmed'] },
  });

  if (existingAppointment) {
    return next(new ErrorResponse('This time slot is already booked', 400));
  }

  const appointment = await Appointment.create({
    patientId: patientProfile._id,
    doctorId,
    date,
    startTime,
    reason,
    symptoms,
    notes,
  });

  const populatedAppointment = await Appointment.findById(appointment._id)
    .populate('patientId')
    .populate('doctorId');

  await sendAppointmentConfirmation(
    populatedAppointment,
    populatedAppointment.patientId,
    populatedAppointment.doctorId
  );

  res.status(201).json({
    success: true,
    data: appointment,
  });
});

exports.cancelAppointment = asyncHandler(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new ErrorResponse('Appointment not found', 404));
  }

  const patientProfile = await ensurePatientProfile(req.user);
  if (!patientProfile) {
    return next(new ErrorResponse('Patient profile not found', 404));
  }

  if (appointment.patientId.toString() !== patientProfile._id.toString()) {
    return next(new ErrorResponse('Not authorized to cancel this appointment', 403));
  }

  if (appointment.status === 'completed' || appointment.status === 'cancelled') {
    return next(new ErrorResponse('Cannot cancel this appointment', 400));
  }

  appointment.status = 'cancelled';
  appointment.cancelReason = req.body.cancelReason || 'Cancelled by patient';
  await appointment.save();

  res.status(200).json({
    success: true,
    data: appointment,
  });
});

exports.getTestResults = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const patientProfile = await ensurePatientProfile(req.user);
  if (!patientProfile) {
    return next(new ErrorResponse('Patient profile not found', 404));
  }

  const testResults = await TestResult.find({ patientId: patientProfile._id })
    .populate('doctorId', 'firstName lastName specialty')
    .sort({ testDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await TestResult.countDocuments({ patientId: patientProfile._id });

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: testResults,
  });
});

exports.getAvailableDoctors = asyncHandler(async (req, res, next) => {
  const Doctor = require('../models/Doctor');
  
  console.log('====================================');
  console.log("Fetching ALL doctors from database");
  console.log('====================================');

  // Fetch ALL doctors without any filters
  const doctors = await Doctor.find({})
    .select('firstName lastName specialty qualification experience consultationFee department bio rating userId')
    .sort({ experience: -1 });

  console.log('====================================');
  console.log(`📋 Found ${doctors.length} doctors`);
  console.log(doctors);
  console.log('====================================');

  res.status(200).json({
    success: true,
    count: doctors.length,
    data: doctors,
  });
});

