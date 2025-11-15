const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const TestResult = require('../models/TestResult');
const axios = require('axios');

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = asyncHandler(async (req, res, next) => {
  // Fetch user counts from Auth Service
  let totalUsers = 0;
  let totalPatients = 0;
  let totalDoctors = 0;
  
  try {
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
    const response = await axios.get(`${authServiceUrl}/api/auth/admin/users/stats`, {
      headers: {
        Authorization: req.headers.authorization,
      },
    });
    
    if (response.data.success) {
      totalUsers = response.data.data.totalUsers || 0;
      totalPatients = response.data.data.totalPatients || 0;
      totalDoctors = response.data.data.totalDoctors || 0;
    }
  } catch (error) {
    console.error('Failed to fetch user stats from Auth Service:', error.message);
    // Fallback to local counts
    totalPatients = await Patient.countDocuments();
    totalDoctors = await Doctor.countDocuments();
    totalUsers = totalPatients + totalDoctors;
  }

  const totalAppointments = await Appointment.countDocuments();
  const pendingAppointments = await Appointment.countDocuments({ status: 'scheduled' });
  const completedAppointments = await Appointment.countDocuments({ status: 'completed' });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayAppointments = await Appointment.countDocuments({
    date: { $gte: today },
  });

  const totalTestResults = await TestResult.countDocuments();

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalPatients,
      totalDoctors,
      totalAppointments,
      pendingAppointments,
      completedAppointments,
      todayAppointments,
      totalTestResults,
    },
  });
});

// @desc    Get all patients (medical records)
// @route   GET /api/admin/patients
// @access  Private/Admin
exports.getPatients = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const patients = await Patient.find()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Patient.countDocuments();

  res.status(200).json({
    success: true,
    count: patients.length,
    total: count,
    page,
    pages: Math.ceil(count / limit),
    data: patients,
  });
});

// @desc    Get all doctors (medical records)
// @route   GET /api/admin/doctors
// @access  Private/Admin
exports.getDoctors = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const doctors = await Doctor.find()
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await Doctor.countDocuments();

  res.status(200).json({
    success: true,
    count: doctors.length,
    total: count,
    page,
    pages: Math.ceil(count / limit),
    data: doctors,
  });
});

// @desc    Get all appointments with filters
// @route   GET /api/admin/appointments
// @access  Private/Admin
exports.getAllAppointments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { status, doctorId, patientId, date } = req.query;

  const query = {};
  if (status) query.status = status;
  if (doctorId) query.doctorId = doctorId;
  if (patientId) query.patientId = patientId;
  if (date) {
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);
    query.date = { $gte: searchDate, $lt: nextDay };
  }

  const appointments = await Appointment.find(query)
    .populate('patientId')
    .populate('doctorId')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ date: -1, startTime: -1 });

  const count = await Appointment.countDocuments(query);

  res.status(200).json({
    success: true,
    count: appointments.length,
    total: count,
    page,
    pages: Math.ceil(count / limit),
    data: appointments,
  });
});

// @desc    Get patient details
// @route   GET /api/admin/patients/:id
// @access  Private/Admin
exports.getPatientDetails = asyncHandler(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id);

  if (!patient) {
    return next(new ErrorResponse('Patient not found', 404));
  }

  const appointments = await Appointment.find({ patientId: req.params.id })
    .populate('doctorId')
    .sort({ date: -1 });

  const testResults = await TestResult.find({ patientId: req.params.id }).sort({ uploadDate: -1 });

  res.status(200).json({
    success: true,
    data: {
      patient,
      appointments,
      testResults,
    },
  });
});

// @desc    Get doctor details
// @route   GET /api/admin/doctors/:id
// @access  Private/Admin
exports.getDoctorDetails = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);

  if (!doctor) {
    return next(new ErrorResponse('Doctor not found', 404));
  }

  const appointments = await Appointment.find({ doctorId: req.params.id })
    .populate('patientId')
    .sort({ date: -1 });

  const testResults = await TestResult.find({ doctorId: req.params.id }).sort({ uploadDate: -1 });

  res.status(200).json({
    success: true,
    data: {
      doctor,
      appointments,
      testResults,
    },
  });
});

// NOTE: User management (create, update, delete users) should be handled by Auth Service
// These endpoints would need to call Auth Service API for user operations

// @desc    Sync user profile from Auth Service (Internal use)
// @route   POST /api/admin/sync-user
// @access  Internal (called by Auth Service)
exports.syncUserProfile = asyncHandler(async (req, res, next) => {
  const { userId, email, firstName, lastName, phone, role, avatar, specialty, licenseNumber, experience, qualifications, consultationFee, availability } = req.body;

  if (!userId || !email || !role) {
    return next(new ErrorResponse('userId, email, and role are required', 400));
  }

  if (role === 'doctor') {
    // Create or update doctor profile in Medical Service
    const existingDoctor = await Doctor.findOne({ userId });
    
    if (existingDoctor) {
      // Update existing doctor
      existingDoctor.firstName = firstName || existingDoctor.firstName;
      existingDoctor.lastName = lastName || existingDoctor.lastName;
      existingDoctor.email = email;
      existingDoctor.phone = phone || existingDoctor.phone;
      existingDoctor.avatar = avatar || existingDoctor.avatar;
      existingDoctor.specialty = specialty || existingDoctor.specialty;
      existingDoctor.licenseNumber = licenseNumber || existingDoctor.licenseNumber;
      existingDoctor.experience = experience || existingDoctor.experience;
      existingDoctor.qualifications = qualifications || existingDoctor.qualifications;
      existingDoctor.consultationFee = consultationFee || existingDoctor.consultationFee;
      existingDoctor.availability = availability || existingDoctor.availability;
      
      await existingDoctor.save();
      
      return res.status(200).json({
        success: true,
        message: 'Doctor profile updated',
        data: existingDoctor,
      });
    } else {
      // Create new doctor profile
      const doctor = await Doctor.create({
        userId,
        firstName: firstName || '',
        lastName: lastName || '',
        email,
        phone: phone || '',
        avatar: avatar || '',
        specialty: specialty || 'General Medicine',
        qualification: qualifications || 'MD',
        licenseNumber: licenseNumber || `LIC-${Date.now()}`,
        experience: experience || 0,
        consultationFee: consultationFee || 500,
        availability: availability || [],
        isAvailable: true,
      });
      
      return res.status(201).json({
        success: true,
        message: 'Doctor profile created',
        data: doctor,
      });
    }
  } else if (role === 'patient') {
    // Create or update patient profile in Medical Service
    const existingPatient = await Patient.findOne({ userId });
    
    if (existingPatient) {
      // Update existing patient
      existingPatient.firstName = firstName || existingPatient.firstName;
      existingPatient.lastName = lastName || existingPatient.lastName;
      existingPatient.email = email;
      existingPatient.phone = phone || existingPatient.phone;
      existingPatient.avatar = avatar || existingPatient.avatar;
      
      await existingPatient.save();
      
      return res.status(200).json({
        success: true,
        message: 'Patient profile updated',
        data: existingPatient,
      });
    } else {
      // Create new patient profile
      const patient = await Patient.create({
        userId,
        firstName: firstName || '',
        lastName: lastName || '',
        email,
        phone: phone || '',
        avatar: avatar || '',
        medicalHistory: [],
        allergies: [],
        medications: [],
        emergencyContact: {},
      });
      
      return res.status(201).json({
        success: true,
        message: 'Patient profile created',
        data: patient,
      });
    }
  } else {
    return res.status(200).json({
      success: true,
      message: 'No sync needed for this role',
    });
  }
});
