import api from './api'

export const adminService = {
  getDashboardStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/auth/admin/users', { params }),
  getUserDetails: (id) => api.get(`/auth/admin/users/${id}`),
  createUser: (data) => api.post('/auth/admin/users', data),
  createDoctor: (data) => api.post('/auth/admin/create-doctor', data),
  updateUser: (id, data) => api.put(`/auth/admin/users/${id}`, data),
  updateUserRole: (id, role) => api.put(`/auth/admin/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/auth/admin/users/${id}`),
  getAppointments: (params) => api.get('/admin/appointments', { params }),
}


