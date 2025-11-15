require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Initialize Express app
const app = express();

// Trust proxy
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: 'Too many requests, please try again later',
  },
});

app.use(limiter);

//
// Service URLs
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const MEDICAL_SERVICE_URL = process.env.MEDICAL_SERVICE_URL || 'http://localhost:5002';

// Simple proxy options
const createProxy = (target) => createProxyMiddleware({
  target,
  changeOrigin: true,
  onError: (err, req, res) => {
    console.error(`❌ Proxy error to ${target}:`, err.message);
    res.status(502).json({
      success: false,
      error: 'Service temporarily unavailable',
    });
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`→ Proxying ${req.method} ${req.path} to ${target}`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`← Response from ${target}: ${proxyRes.statusCode}`);
  },
});

// Route proxies
app.use('/api/auth', createProxy(AUTH_SERVICE_URL));
app.use('/api/patients', createProxy(MEDICAL_SERVICE_URL));
app.use('/api/doctors', createProxy(MEDICAL_SERVICE_URL));
app.use('/api/admin', createProxy(MEDICAL_SERVICE_URL));
app.use('/api/referrals', createProxy(MEDICAL_SERVICE_URL));
app.use('/api/test-recommendations', createProxy(MEDICAL_SERVICE_URL));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'API Gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      auth: AUTH_SERVICE_URL,
      medical: MEDICAL_SERVICE_URL,
    },
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'HCL Healthcare - API Gateway',
    version: '1.0.0',
    services: {
      auth: `${AUTH_SERVICE_URL}/api/auth`,
      medical: {
        patients: `${MEDICAL_SERVICE_URL}/api/patients`,
        doctors: `${MEDICAL_SERVICE_URL}/api/doctors`,
        admin: `${MEDICAL_SERVICE_URL}/api/admin`,
        referrals: `${MEDICAL_SERVICE_URL}/api/referrals`,
        testRecommendations: `${MEDICAL_SERVICE_URL}/api/test-recommendations`,
      },
    },
    routes: {
      auth: '/api/auth/*',
      patients: '/api/patients/*',
      doctors: '/api/doctors/*',
      admin: '/api/admin/*',
      referrals: '/api/referrals/*',
      testRecommendations: '/api/test-recommendations/*',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📡 Auth Service: ${AUTH_SERVICE_URL}`);
  console.log(`🏥 Medical Service: ${MEDICAL_SERVICE_URL}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
