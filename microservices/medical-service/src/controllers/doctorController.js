const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const TestResult = require('../models/TestResult');
const Patient = require('../models/Patient');
const { sendTestResultNotification } = require('../services/emailService');
const {
  getDoctorProfileByUserId,
  findPatientByIdOrUserId,
  ensurePatientProfile,
} = require('../utils/profileHelpers');

const hydratePatientProfiles = async (appointments = []) => {
  await Promise.all(
    appointments.map(async (appointment) => {
      const patientDoc = appointment.patientId;
      if (!patientDoc) return;

      if (patientDoc.firstName && patientDoc.lastName && patientDoc.email) return;

      const userRef = patientDoc.userId || patientDoc._id;
      if (!userRef) return;

      const updated = await ensurePatientProfile(
        { id: userRef },
        {
          firstName: patientDoc.firstName,
          lastName: patientDoc.lastName,
          email: patientDoc.email,
          phone: patientDoc.phone,
          avatar: patientDoc.avatar,
        }
      );

      if (updated) {
        appointment.patientId = updated;
      }
    })
  );
};

exports.getProfile = asyncHandler(async (req, res, next) => {
  let doctor = await Doctor.findOne({ userId: req.user.id });

  if (!doctor) {
    return next(new ErrorResponse('Doctor profile not found. Please contact admin.', 404));
  }

  res.status(200).json({
    success: true,
    data: doctor,
  });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const allowedFields = [
    'specialty',
    'qualification',
    'experience',
    'availability',
    'consultationFee',
    'department',
    'bio',
  ];

  const updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  const doctor = await Doctor.findOneAndUpdate(
    { userId: req.user.id },
    updateData,
    { new: true, runValidators: true }
  );

  if (!doctor) {
    return next(new ErrorResponse('Doctor profile not found', 404));
  }

  res.status(200).json({
    success: true,
    data: doctor,
  });
});

exports.getAppointments = asyncHandler(async (req, res, next) => {
  const { date, status, page = 1, limit = 20 } = req.query;

  const doctorProfile = await getDoctorProfileByUserId(req.user.id);
  if (!doctorProfile) {
    return next(new ErrorResponse('Doctor profile not found', 404));
  }

  const query = { doctorId: doctorProfile._id };
  
  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    query.date = { $gte: startDate, $lte: endDate };
  }
  
  if (status) query.status = status;

  const appointments = await Appointment.find(query)
    .populate('patientId', 'firstName lastName email phone avatar dateOfBirth gender userId')
    .sort({ date: 1, startTime: 1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  await hydratePatientProfiles(appointments);

  const count = await Appointment.countDocuments(query);

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: appointments,
  });
});

exports.getTodayAppointments = asyncHandler(async (req, res, next) => {
  const doctorProfile = await getDoctorProfileByUserId(req.user.id);
  if (!doctorProfile) {
    return next(new ErrorResponse('Doctor profile not found', 404));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const appointments = await Appointment.find({
    doctorId: doctorProfile._id,
    date: { $gte: today, $lt: tomorrow },
  })
    .populate('patientId', 'firstName lastName email phone avatar userId')
    .sort({ startTime: 1 });

  await hydratePatientProfiles(appointments);

  res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

exports.updateAppointment = asyncHandler(async (req, res, next) => {
  let appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new ErrorResponse('Appointment not found', 404));
  }

  const doctorProfile = await getDoctorProfileByUserId(req.user.id);
  if (!doctorProfile) {
    return next(new ErrorResponse('Doctor profile not found', 404));
  }

  if (appointment.doctorId.toString() !== doctorProfile._id.toString()) {
    return next(new ErrorResponse('Not authorized to update this appointment', 403));
  }

  const updateData = {};

  if (req.body.status) {
    updateData.status = req.body.status;
  }

  if (req.body.diagnosis !== undefined) {
    updateData.diagnosis = req.body.diagnosis;
  }

  if (req.body.prescription !== undefined) {
    if (Array.isArray(req.body.prescription)) {
      updateData.prescription = req.body.prescription;
    } else if (typeof req.body.prescription === 'string' && req.body.prescription.trim() !== '') {
      updateData.prescription = [
        {
          medication: req.body.prescription.trim(),
        },
      ];
    }
  }

  if (req.body.notes !== undefined) {
    updateData.notes = req.body.notes;
  }

  if (req.body.followUpDate) {
    const followUpDate = new Date(req.body.followUpDate);
    if (!Number.isNaN(followUpDate.valueOf())) {
      updateData.followUp = {
        required: true,
        date: followUpDate,
      };

      if (req.body.followUpNotes) {
        updateData.followUp.notes = req.body.followUpNotes;
      }
    }
  }

  appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('patientId', 'firstName lastName email phone userId');

  res.status(200).json({
    success: true,
    data: appointment,
  });
});

exports.getPatients = asyncHandler(async (req, res, next) => {
  const { search, page = 1, limit = 10 } = req.query;

  const doctorProfile = await getDoctorProfileByUserId(req.user.id);
  if (!doctorProfile) {
    return next(new ErrorResponse('Doctor profile not found', 404));
  }

  const appointments = await Appointment.find({ doctorId: doctorProfile._id })
    .distinct('patientId');

  let query = { _id: { $in: appointments } };
  
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const patients = await Patient.find(query)
    .select('firstName lastName email phone avatar dateOfBirth gender userId updatedAt createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const enrichedPatients = await Promise.all(
    patients.map(async (patient) => {
      if (patient.firstName && patient.lastName && patient.email) {
        return patient;
      }
      const updated = await ensurePatientProfile(
        { id: patient.userId || patient._id },
        patient.toObject()
      );
      return updated || patient;
    })
  );

  const count = await Patient.countDocuments(query);

  res.status(200).json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: enrichedPatients,
  });
});

exports.getPatientDetails = asyncHandler(async (req, res, next) => {
  const doctorProfile = await getDoctorProfileByUserId(req.user.id);
  if (!doctorProfile) {
    return next(new ErrorResponse('Doctor profile not found', 404));
  }

  const hasAppointment = await Appointment.findOne({
    doctorId: doctorProfile._id,
    patientId: req.params.patientId,
  });

  if (!hasAppointment) {
    return next(new ErrorResponse('Not authorized to view this patient', 403));
  }

  const patient = await findPatientByIdOrUserId(req.params.patientId);
  if (!patient) {
    return next(new ErrorResponse('Patient not found', 404));
  }
  const appointments = await Appointment.find({
    doctorId: doctorProfile._id,
    patientId: req.params.patientId,
  }).sort({ date: -1 });

  const testResults = await TestResult.find({
    doctorId: doctorProfile._id,
    patientId: req.params.patientId,
  }).sort({ testDate: -1 });

  res.status(200).json({
    success: true,
    data: {
      patient,
      appointments,
      testResults,
    },
  });
});

exports.createTestResult = asyncHandler(async (req, res, next) => {
  const {
    patientId,
    appointmentId,
    testType,
    testName,
    testDate,
    results,
    normalRange,
    status,
    unit,
    interpretation,
    notes,
  } = req.body;

  const doctorProfile = await getDoctorProfileByUserId(req.user.id);
  if (!doctorProfile) {
    return next(new ErrorResponse('Doctor profile not found', 404));
  }

  const patientRecord = await findPatientByIdOrUserId(patientId);
  if (!patientRecord) {
    return next(new ErrorResponse('Patient not found', 404));
  }

  const resolvedPatientId = patientRecord._id;

  const hasAppointment = await Appointment.findOne({
    doctorId: doctorProfile._id,
    patientId: resolvedPatientId,
  });

  if (!hasAppointment) {
    return next(new ErrorResponse('Not authorized to create test results for this patient', 403));
  }

  const testResult = await TestResult.create({
    patientId: resolvedPatientId,
    doctorId: doctorProfile._id,
    appointmentId,
    testType,
    testName,
    testDate,
    results,
    normalRange,
    status,
    unit,
    interpretation,
    notes,
  });

  const populatedTestResult = await TestResult.findById(testResult._id)
    .populate('patientId')
    .populate('doctorId');

  await sendTestResultNotification(
    populatedTestResult,
    populatedTestResult.patientId,
    populatedTestResult.doctorId
  );

  testResult.notificationSent = true;
  await testResult.save();

  res.status(201).json({
    success: true,
    data: testResult,
  });
});

