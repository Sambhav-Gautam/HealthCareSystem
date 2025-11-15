const Joi = require('joi');
const ErrorResponse = require('../utils/ErrorResponse');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return next(new ErrorResponse(errors.join(', '), 400));
    }

    next();
  };
};

const schemas = {
  appointmentCreate: Joi.object({
    doctorId: Joi.string().required(),
    date: Joi.alternatives().try(
      Joi.date(),
      Joi.string().isoDate()
    ).required(),
    startTime: Joi.string().required(),
    endTime: Joi.string().optional(),
    reason: Joi.string().required(),
    notes: Joi.string().optional(),
  }),

  appointmentUpdate: Joi.object({
    status: Joi.string().valid('scheduled', 'completed', 'cancelled').required(),
    diagnosis: Joi.string().allow('', null),
    prescription: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.object().unknown(true))
    ).optional(),
    notes: Joi.string().allow('', null),
    followUpDate: Joi.alternatives().try(
      Joi.date(),
      Joi.string().isoDate()
    ).optional(),
    followUpNotes: Joi.string().allow('', null),
  }),

  testResultCreate: Joi.object({
    patientId: Joi.string().required(),
    testType: Joi.string().required(),
    results: Joi.string().required(),
    notes: Joi.string().optional(),
  }),

  userUpdate: Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phone: Joi.string().optional(),
    address: Joi.string().optional(),
    dateOfBirth: Joi.date().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
  }),

  doctorUpdate: Joi.object({
    specialty: Joi.string().optional(),
    qualification: Joi.string().optional(),
    experience: Joi.number().optional(),
    availability: Joi.array().items(Joi.object({
      day: Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').required(),
      startTime: Joi.string().required(),
      endTime: Joi.string().required(),
    })).optional(),
  }),
};

module.exports = { validateRequest, schemas };




