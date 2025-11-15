const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const { fetchBasicUsersInfo } = require('../config/authService');

const resolveUserId = (userOrId) => {
  if (!userOrId) return null;
  if (typeof userOrId === 'string') return userOrId;
  if (typeof userOrId === 'object') {
    return userOrId.id || userOrId._id || userOrId.userId || null;
  }
  return null;
};

const extractBasicInfo = (source = {}, overrides = {}) => {
  const info = {
    firstName: overrides.firstName ?? source.firstName,
    lastName: overrides.lastName ?? source.lastName,
    email: overrides.email ?? source.email,
    phone: overrides.phone ?? source.phone,
    avatar: overrides.avatar ?? source.avatar,
  };

  return Object.fromEntries(
    Object.entries(info).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
};

const fetchBasicInfoFromAuth = async (userId) => {
  try {
    const data = await fetchBasicUsersInfo([userId]);
    return data?.[0];
  } catch (error) {
    return null;
  }
};

const getPatientProfileByUserId = async (userId) => {
  if (!userId) return null;
  return Patient.findOne({ userId });
};

const ensurePatientProfile = async (userOrId, overrides = {}) => {
  const userId = resolveUserId(userOrId);
  if (!userId) return null;

  let basicInfo = extractBasicInfo(userOrId || {}, overrides);

  if ((!basicInfo.firstName || !basicInfo.lastName) && process.env.SERVICE_API_KEY) {
    const authInfo = await fetchBasicInfoFromAuth(userId);
    if (authInfo) {
      basicInfo = { ...extractBasicInfo(authInfo), ...basicInfo };
    }
  }
  let patient = await Patient.findOne({ userId });

  if (!patient) {
    patient = await Patient.create({
      userId,
      ...basicInfo,
    });
    return patient;
  }

  let modified = false;
  Object.entries(basicInfo).forEach(([key, value]) => {
    if (value && !patient[key]) {
      patient[key] = value;
      modified = true;
    }
  });

  if (modified) {
    await patient.save();
  }

  return patient;
};

const findPatientByIdOrUserId = async (idOrUser) => {
  if (!idOrUser) return null;

  if (mongoose.Types.ObjectId.isValid(idOrUser)) {
    const byObjectId = await Patient.findById(idOrUser);
    if (byObjectId) {
      return byObjectId;
    }
  }

  const userId = resolveUserId(idOrUser);
  if (!userId) return null;

  let patient = await Patient.findOne({ userId });

  if ((!patient || !patient.firstName) && process.env.SERVICE_API_KEY) {
    const authInfo = await fetchBasicInfoFromAuth(userId);
    if (authInfo) {
      patient = await ensurePatientProfile(userId, authInfo);
    }
  }

  return patient;
};

const getDoctorProfileByUserId = async (userId) => {
  if (!userId) return null;
  return Doctor.findOne({ userId });
};

module.exports = {
  getPatientProfileByUserId,
  ensurePatientProfile,
  findPatientByIdOrUserId,
  getDoctorProfileByUserId,
};

