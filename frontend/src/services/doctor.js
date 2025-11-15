import api from './api'

export const doctorService = {
  getProfile: () => api.get('/doctors/profile'),
  updateProfile: (data) => api.put('/doctors/profile', data),
  getDashboardStats: () => api.get('/doctors/dashboard/stats'),
  getAppointments: (params) => api.get('/doctors/appointments', { params }),
  getTodayAppointments: () => api.get('/doctors/appointments/today'),
  updateAppointment: (id, data) => api.put(`/doctors/appointments/${id}`, data),
  getPatients: (params) => api.get('/doctors/patients', { params }),
  getPatientDetails: (id) => api.get(`/doctors/patients/${id}`),
  uploadTestResult: (data) => api.post('/doctors/test-results', data),
  createReferral: (data) => api.post('/referrals', data),
  getSentReferrals: () => api.get('/referrals/sent'),
  getReceivedReferrals: () => api.get('/referrals/received'),
  updateReferralStatus: (id, status) => api.put(`/referrals/${id}/status`, { status }),
  createTestRecommendation: (data) => api.post('/test-recommendations', data),
  getTestRecommendations: () => api.get('/test-recommendations/doctor'),
}


