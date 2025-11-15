require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import cron jobs
const { startCronJobs } = require('./services/cronJobs');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Start cron jobs
startCronJobs();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5173'],
    credentials: true,
  })
); // CORS
app.use(morgan('dev')); // Logging
app.use(express.json({ limit: '10mb' })); // Body parser
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser()); // Cookie parser
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks

// Apply rate limiting
app.use('/api/', apiLimiter);

// Routes
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/referrals', require('./routes/referralRoutes'));
app.use('/api/test-recommendations', require('./routes/testRecommendationRoutes'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Medical Service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'HCL Healthcare - Medical Service API',
    version: '1.0.0',
    endpoints: {
      patients: '/api/patients',
      doctors: '/api/doctors',
      admin: '/api/admin',
      referrals: '/api/referrals',
      testRecommendations: '/api/test-recommendations',
      health: '/health',
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Start server
const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, () => {
  console.log(`🚀 Medical Service running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;

