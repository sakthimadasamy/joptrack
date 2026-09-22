import api from './api'

export const jobService = {
  getAll: (params) => api.get('/jobs', { params }).then((r) => r.data),
  getById: (id) => api.get(`/jobs/${id}`).then((r) => r.data),
  create: (payload) => api.post('/jobs', payload).then((r) => r.data),
  update: (id, payload) => api.put(`/jobs/${id}`, payload).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/jobs/${id}/status`, { status }).then((r) => r.data),
  remove: (id) => api.delete(`/jobs/${id}`),
  getDashboardStats: () => api.get('/dashboard/stats').then((r) => r.data),
  getInterviews: () => api.get('/interviews').then((r) => r.data),
  getAnalytics: () => api.get('/analytics').then((r) => r.data),
}
