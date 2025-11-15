const axios = require('axios');

// Auth Service base URL
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';

// Axios instance for Auth Service communication
const authServiceClient = axios.create({
  baseURL: AUTH_SERVICE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Verify JWT token with Auth Service
const verifyToken = async (token) => {
  try {
    const response = await authServiceClient.post('/api/auth/verify-token', {
      token,
    });

    if (response.data.success && response.data.valid) {
      return response.data.user;
    }

    return null;
  } catch (error) {
    console.error('Error verifying token with Auth Service:', error.message);
    return null;
  }
};

const SERVICE_KEY = process.env.SERVICE_API_KEY || 'microservices-dev-key';

const fetchBasicUsersInfo = async (userIds = []) => {
  if (!Array.isArray(userIds) || userIds.length === 0) {
    return [];
  }

  try {
    const response = await authServiceClient.post(
      '/api/auth/internal/users/basic',
      { userIds },
      {
        headers: {
          'x-service-key': SERVICE_KEY,
        },
      }
    );

    if (response.data.success) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.error('Error fetching user info from Auth Service:', error.message);
    return [];
  }
};

module.exports = {
  verifyToken,
  authServiceClient,
  fetchBasicUsersInfo,
};

