import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Network error (no response)
    if (!error.response) {
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    const { status, data } = error.response

    // Handle different status codes
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        if (!originalRequest._retry) {
          originalRequest._retry = true
          localStorage.removeItem('token')
          window.location.href = '/login'
          toast.error('Session expired. Please login again.')
        }
        break

      case 403:
        // Forbidden
        toast.error(data?.error || 'You do not have permission to access this resource.')
        break

      case 404:
        // Not found
        toast.error(data?.error || 'Resource not found.')
        break

      case 400:
        // Bad request
        toast.error(data?.error || 'Invalid request. Please check your input.')
        break

      case 422:
        // Validation error
        if (data?.errors && Array.isArray(data.errors)) {
          data.errors.forEach(err => toast.error(err.message || err))
        } else {
          toast.error(data?.error || 'Validation error.')
        }
        break

      case 429:
        // Too many requests
        toast.error('Too many requests. Please try again later.')
        break

      case 500:
        // Server error
        toast.error('Server error. Please try again later.')
        break

      case 503:
        // Service unavailable
        toast.error('Service temporarily unavailable. Please try again later.')
        break

      default:
        // Other errors
        toast.error(data?.error || 'An unexpected error occurred.')
    }

    return Promise.reject(error)
  }
)

export default api


