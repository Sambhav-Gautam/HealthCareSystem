const ErrorResponse = require('../utils/ErrorResponse');

const SERVICE_KEY = process.env.SERVICE_API_KEY || 'microservices-dev-key';

module.exports = (req, res, next) => {
  const incomingKey = req.headers['x-service-key'] || req.headers['x-service-token'];

  if (!incomingKey || incomingKey !== SERVICE_KEY) {
    return next(new ErrorResponse('Unauthorized service access', 401));
  }

  next();
};

