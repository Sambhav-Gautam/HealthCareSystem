const Joi = require('joi');
const ErrorResponse = require('../utils/ErrorResponse');

// Validation middleware factory
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      return next(new ErrorResponse(errorMessage, 400));
    }

    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    role: Joi.string().valid('patient', 'doctor', 'admin').default('patient'),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  verifyEmail: Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().length(6).required(),
  }),

  resendCode: Joi.object({
    email: Joi.string().email().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required(),
    code: Joi.string().length(6).required(),
    newPassword: Joi.string().min(6).required(),
  }),
};

module.exports = {
  validate,
  schemas,
};

