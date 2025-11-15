import api from './api'

export const patientService = {
  getProfile: () => api.get('/patients/profile'),
  updateProfile: (data) => api.put('/patients/profile', data),
  getDashboardStats: () => api.get('/patients/dashboard/stats'),
  getAppointments: (params) => api.get('/patients/appointments', { params }),
  bookAppointment: (data) => api.post('/patients/appointments', data),
  cancelAppointment: (id) => api.put(`/patients/appointments/${id}/cancel`),
  getTestResults: (params) => api.get('/patients/test-results', { params }),
  getReferrals: () => api.get('/referrals/my-referrals'),
  getAvailableDoctors: (params) => api.get('/patients/doctors', { params }),
}


